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

    const { data: { collections: { edges }}} = await fetchData(GetAllCollections, {
        first: 250
    });

    return edges
        .reduce((prevPromise, collection) => prevPromise
        .then((resp) => {
            if (!resp) {
                return fetchData(GetAllProductsInCollection, { first: 250, handle: collection.node.handle });
            }
            const { data: { collectionByHandle }} = resp;
            const { title, description, id } = collectionByHandle;
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
                    id
                } = product.node;
                return {
                    id,
                    createdAt,
                    description,
                    images: images.edges.map((image) => {
                        console.log(" images", image)
                        return image.node.originalSrc
                    }),
                    title,
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
            const nodeContent = {
                title,
                totalProducts: products.length,
                description,
                products
            };

            const nodeMeta = {
                id: createNodeId(`my-data-${id}`),
                parent: null,
                children: [],
                internal: {
                    type: `ShopifyCollection`,
                    mediaType: `applicaton/json`,
                    content: JSON.stringify(nodeContent),
                    contentDigest: createContentDigest(edges)
                }
            };

            const node = Object.assign({}, nodeContent, nodeMeta);
            createNode(node);
            return fetchData(GetAllProductsInCollection, { first: 250, handle: collection.node.handle })
        })
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
    // For all MarkdownRemark nodes that have a featured image url, call createRemoteFileNode
    if (node.internal.type === "ShopifyCollection") {
        return node.products.reduce((prevPromise, product) => prevPromise
            .then(() => {
                return product.images.reduce(async (prevPromise, url) => {
                    return prevPromise
                        .then ((fileNode) => {
                            if (fileNode) {
                                node.featuredImg___NODE = fileNode.id
                            }
                            return createRemoteFileNode({
                                url, // string that points to the URL of the image
                                parentNodeId: product.id, // id of the parent node of the fileNode you are going to create
                                createNode, // helper function in gatsby-node to generate the node
                                createNodeId, // helper function in gatsby-node to generate the node id
                                cache, // Gatsby's cache
                                store, // Gatsby's redux store
                            });
                        })
                }, Promise.resolve(null));
            })
            .catch((e) => {
                console.log("error onCreateNode: ",e);
            })
        , Promise.resolve());
    }
};