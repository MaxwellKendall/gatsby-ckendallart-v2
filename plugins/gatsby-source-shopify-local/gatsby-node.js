const { ApolloClient, HttpLink, InMemoryCache, gql } = require('@apollo/client');
const fetch = require('isomorphic-fetch');

const query = gql`
    query GetShopName {
        shop {
            name
        }
    }
`;

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: `https://${process.env.SHOP_NAME}.com/api/2020-04/graphql`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
    },
    fetch
  })
});

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, options = {}) => {
    console.log("options", options)
    const { createNode } = actions;
    // Data can come from anywhere, but for now create it manually

    const myData = await client
        .query({
            query
        });
    
    console.log("my data", myData)

    const nodeContent = JSON.stringify(myData)

    const nodeMeta = {
        id: createNodeId(`my-data-${123}`),
        parent: null,
        children: [],
        internal: {
            type: `MyNodeType`,
            mediaType: `text/html`,
            content: nodeContent,
            contentDigest: createContentDigest(myData)
        }
    };

    const node = Object.assign({}, myData, nodeMeta)
    createNode(node);
};