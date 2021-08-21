const { ApolloClient, HttpLink, InMemoryCache, gql } = require('@apollo/client');
const fetch = require('isomorphic-fetch');
const { createRemoteFileNode } = require("gatsby-source-filesystem")
const {
    GetAllProducts,
    GetAllCollections,
    GetAllProductsInCollection,
    GetAllCollectionsAndAllProducts
} = require('./queries');
const { kebabCase } = require('lodash');

const PRODUCT_SLUG_PREFIX = 'products';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: `https://${process.env.SHOP_NAME}.myshopify.com/api/2020-04/graphql.json`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
    },
    fetch
  })
});

const fetchData = async (query, vars) => {
    return client.query({ query, variables: vars });
};

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, options = {}) => {
    const { createNode } = actions;
    // Data can come from anywhere, but for now create it manually
    const createNodeWithMeta = (id, content, name) => ({
        ...content,
        id: createNodeId(`${id}`),
        parent: null,
        children: [],
        internal: {
            type: name,
            mediaType: `applicaton/json`,
            content: JSON.stringify(content),
            content: '',
            contentDigest: createContentDigest([])
        },
    });
    
    const { data: { collections: { edges: allCollections }}} = await fetchData(GetAllCollections, {
        first: 250
    });

    const parseProductsFromCollection = async ({ data: { collectionByHandle } }) => {
        // create CollectionNodes
        const { title, description, id, handle, products: { edges: allProducts} } = collectionByHandle;
        const collectionNode = createNodeWithMeta(id, { title, description, id, handle, count: allProducts.length }, 'ShopifyCollection');
    
        await createNode(collectionNode);
        const parsedProducts = allProducts.map((product) => {
            const {
                createdAt,
                description,
                images,
                handle,
                title,
                productType,
                totalInventory,
                priceRange,
                id,
                variants,
                tags
            } = product.node;
            const productImgs = images.edges.length
                ? images.edges.map(({ node }, i) => ({ id, url: node.originalSrc, variantTitle: null, isFirst: i === 0 }))
                : [];
            return {
                id,
                productId: id,
                createdAt,
                description,
                tags,
                images: images.edges.map((image) => image.node.originalSrc),
                allImages: productImgs
                    .concat(variants.edges
                        .map(({ node }) => ({ id: node.id, url: node.image.originalSrc, variantTitle: node.title }))
                    )
                    .filter(({ url, variantTitle }) => {
                        // in this case, the same image will be used for both the product image (shop grid page) and the product page (one of the variants)
                        // so the array  is like [imgXForProduct, imgXForVariant]
                        if (!variantTitle) {
                            const isProductImgAVariantImg = variants.edges.some(({ node }) => node.image.originalSrc === url)
                            if (isProductImgAVariantImg) return false;
                        }
                        return true;
                    }),
                variants: variants.edges.map(({ node }) => {
                    return {
                        ...node,
                        image: node.image.originalSrc
                    };
                }),
                hasOnlyDefaultVariant: (variants.edges.length === 1),
                title,
                collection: collectionByHandle.title,
                handle,
                productType,
                slug: `${PRODUCT_SLUG_PREFIX}/${handle}`,
                totalInventory,
                priceRange: {
                    high: priceRange.maxVariantPrice.amount,
                    low: priceRange.minVariantPrice.amount
                }
            };
        })
        return parsedProducts
            .reduce((prevPromise, product) => prevPromise
                .then((resp) => {
                    return createNode(createNodeWithMeta(product.id, product, 'ShopifyProduct'));
                })
            , Promise.resolve(null))
            .then(() => {
                console.info(`Products for ${title} added 🙌 `);
            });
    };

    return allCollections
        .reduce((prevPromise, { node: { handle } }) => prevPromise
        .then((resp) => {
            if (!resp) {
                return fetchData(GetAllProductsInCollection, { first: 250, handle });
            }
            return parseProductsFromCollection(resp)
                .then(() => fetchData(GetAllProductsInCollection, { first: 250, handle }))
            }), Promise.resolve(null))
            .then((resp) => {
                return parseProductsFromCollection(resp);
            })
            .catch((e) => {
                console.error(`Error fetching data 😭 : ${e}`);
            })
}

const imagesAddedByProductTitle = {};

const processFileNode = (fileNode, previousImage, node) => {
    if (fileNode && previousImage.variantTitle) {
        node.variants = node.variants.map((variant) => {
            if (variant.id === previousImage.id) {
                imagesAddedByProductTitle[node.title]
                    ? imagesAddedByProductTitle[node.title] = { ...imagesAddedByProductTitle[node.title], count: imagesAddedByProductTitle[node.title].count++ }
                    : imagesAddedByProductTitle[node.title] = { count: 1, slug: node.slug };

                return {
                    ...variant,
                    localFile___NODE: fileNode.id
                };
            }
            return variant;
        });
    }
    if (fileNode) {
        imagesAddedByProductTitle[node.title]
            ? imagesAddedByProductTitle[node.title] = { ...imagesAddedByProductTitle[node.title], count: imagesAddedByProductTitle[node.title].count++ }
            : imagesAddedByProductTitle[node.title] = { count: 1, slug: node.slug };
        node.localFile___NODE = fileNode.id;
        node.optimizedImages = node.optimizedImages
            ? node.optimizedImages.concat([fileNode.relativePath])
            : [fileNode.relativePath]
    }
}
// https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
exports.onCreateNode = async ({
    node,
    actions: { createNode },
    store,
    cache,
    createNodeId,
}) => {
    const type = node.internal.type;
    
    // For all product nodes, call createRemoteFileNode
    if (type === "ShopifyProduct") {
        return node.allImages
            .reduce((prevPromise, img, i, arr) => {
                return prevPromise
                    .then ((fileNode) => {
                        // the previous image is the one associated with the current fileNode.
                        const previousImage = i === 0
                            ? img
                            : arr[i - 1];
                        if (i > 0) {
                            processFileNode(fileNode, previousImage, node);
                        }
                        return createRemoteFileNode({
                            url: img.url, // string that points to the URL of the image
                            // parentNodeId: image.id, // id of the parent node of the fileNode you are going to create
                            parentNodeId: node.id,
                            createNode, // helper function in gatsby-node to generate the node
                            createNodeId, // helper function in gatsby-node to generate the node id
                            cache, // Gatsby's cache
                            store, // Gatsby's redux store
                        })
                        .then((resp) => {
                            if (i === arr.length - 1) {
                                processFileNode(resp, arr[arr.length - 1], node);

                                const totalImagesAdded = Object
                                    .values(imagesAddedByProductTitle)
                                    .reduce((acc, { count: int }) => acc + int, 0);
                                    
                                console.info(`Total images added: 📸 ✨ ${totalImagesAdded} 📸 ✨`)
                            }
                            return resp;
                        });
                    })
                    .catch((e) => {
                        console.error("error onCreateNode: ", e);
                    })
            }, Promise.resolve(null))
    }
};
