const { ApolloClient, HttpLink, InMemoryCache, gql } = require('@apollo/client');
const fetch = require('isomorphic-fetch');
const { createRemoteFileNode } = require("gatsby-source-filesystem")
const {
    GetAllProducts,
    GetAllCollections,
    GetAllProductsInCollection,
    GetAllCollectionsAndAllProducts
} = require('./queries');

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
        id: createNodeId(`my-data-${id}`),
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
                    createdAt,
                    description,
                    images: images.edges.map((image) => image.node.originalSrc),
                    variants: variants.edges.map(({ node }) => {
                        return {
                            ...node,
                            image: node.image.originalSrc
                        };
                    }),
                    title,
                    collection: collectionByHandle.title,
                    handle,
                    productType,
                    slug: `${productType.toLowerCase()}/${collectionByHandle.handle}/${handle}`,
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
        return node.variants.reduce((prevPromise, variant) => {
            return prevPromise
                .then ((fileNode) => {
                    if (fileNode === 'first') {
                        return createRemoteFileNode({
                            url: variant.image, // string that points to the URL of the image
                            parentNodeId: variant.id, // id of the parent node of the fileNode you are going to create
                            createNode, // helper function in gatsby-node to generate the node
                            createNodeId, // helper function in gatsby-node to generate the node id
                            cache, // Gatsby's cache
                            store, // Gatsby's redux store
                        })
                        .then((resp) => {
                            variant.localFile___NODE = resp.id;
                            variant.optimizedImages = variant.optimizedImages
                                ? variant.optimizedImages.concat([resp.base])
                                : [resp.base]
                            return resp;
                        });
                    }
                    if (fileNode && variant.localFile___NODE !== fileNode.id) {
                        variant.localFile___NODE = fileNode.id
                        variant.optimizedImages = variant.optimizedImages
                            ? variant.optimizedImages.concat([fileNode.base])
                            : [fileNode.base]
                    }
                    return createRemoteFileNode({
                        url: variant.image, // string that points to the URL of the image
                        parentNodeId: variant.id, // id of the parent node of the fileNode you are going to create
                        createNode, // helper function in gatsby-node to generate the node
                        createNodeId, // helper function in gatsby-node to generate the node id
                        cache, // Gatsby's cache
                        store, // Gatsby's redux store
                    });
                })
                .catch((e) => {
                    console.log("error onCreateNode: ", e);
                })
        }, Promise.resolve('first'));
    }
};