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

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: `https://${process.env.SHOP_NAME}.com/api/2020-04/graphql.json`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
    },
    fetch
  })
});

const fetchData = async (query, vars) => {
    return client.query({ query, variables: vars })
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
            contentDigest: createContentDigest([])
        },
    });

    const { data: { collections: { edges }}} = await fetchData(GetAllCollections, {
        first: 250
    });

    return edges
        .reduce((prevPromise, collection) => prevPromise
        .then(async (resp) => {
            if (!resp) {
                return fetchData(GetAllProductsInCollection, { first: 250, handle: collection.node.handle });
            }

            // create CollectionNodes
            const { data: { collectionByHandle }} = resp;
            const { title, description, id, handle } = collectionByHandle;
            const collectionNode = createNodeWithMeta(id, { title, description, id, handle, count: collectionByHandle.products.length }, 'ShopifyCollection');

            await createNode(collectionNode);

            // create ProductNodes
            const products = collectionByHandle.products.edges.map((product) => {
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
                    variants
                } = product.node;
                return {
                    id,
                    productId: id,
                    createdAt,
                    description,
                    images: images.edges.map((image) => image.node.originalSrc),
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
                    slug: productType.toLowerCase() === 'print'
                        ? `prints/${handle}`
                        : `originals/${handle}`,
                    totalInventory,
                    priceRange: {
                        high: priceRange.maxVariantPrice.amount,
                        low: priceRange.minVariantPrice.amount
                    }
                };
            });
            return products.reduce((prevPromise, product) => prevPromise
                .then((resp) => {
                    return createNode(createNodeWithMeta(product.id, product, 'ShopifyProduct'));
                }), Promise.resolve(null))
            })
            .then(() => fetchData(GetAllProductsInCollection, { first: 250, handle: collection.node.handle }))
            .catch((e) => {
                console.log(`error fetching data ${e}`);
            }), Promise.resolve(null));
};

const processFileNode = (fileNode, previousImage, node) => {
    const isFileNodeDefined = (fileNode)
    if (isFileNodeDefined && previousImage.isVariantImage) {
        node.variants = node.variants.map((variant) => {
            if (variant.id === previousImage.id) {
                return {
                    ...variant,
                    localFile___NODE: fileNode.id
                };
            }
            return variant;
        });
    }
    if (isFileNodeDefined) {
        node.optimizedImages = node.optimizedImages
            ? node.optimizedImages.concat([fileNode.base])
            : [fileNode.base]
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
        return node.variants
            .filter((variant) => variant.image && variant.id)
            .map((variant) => ({ isVariantImage: true, url: variant.image, id: variant.id }))
            .concat(node.images
                .filter((image) => {
                    // if a product image is also a variant, don't use it.
                    const imageIsVariant = node.variants.some((variant) => variant.image === image);
                    if (imageIsVariant) return false;
                    return true;
                })
                .map((image) => ({ url: image, id: node.id, isVariantImage: false })))
            .reduce((prevPromise, image, i, arr) => {
                return prevPromise
                    .then ((fileNode) => {
                        // the previous image is the one associated with the current fileNode.
                        const previousImage = i === 0
                            ? null
                            : arr[i - 1];
                        processFileNode(fileNode, previousImage, node);
                        return createRemoteFileNode({
                            url: image.url, // string that points to the URL of the image
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
                            }
                            return resp;
                        });
                    })
                    .catch((e) => {
                        console.log("error onCreateNode: ", e);
                    })
            }, Promise.resolve(null))
    }
};