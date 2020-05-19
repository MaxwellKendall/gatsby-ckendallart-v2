const { ApolloClient, HttpLink, InMemoryCache } = require('@apollo/client');
const fetch = require('axios');

const {
    BLOGS_QUERY,
    ARTICLES_QUERY,
    COLLECTIONS_QUERY,
    PAGES_QUERY,
    SHOP_POLICIES_QUERY,
    PRODUCTS_QUERY,
    TEST_QUERY
} = require('./queries');

const defaultOptions = {
    apiVersion: `04-2020`
}

exports.sourceNodes = async ({ actions: { createNode } }, options = defaultOptions) => {
    console.log("options", options);
    const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
            uri: `https://ckendallart.myshopify.com/api/2020-04/graphql.json`,
            fetch,
            headers: {
                Accept: 'application/json',
                'X-Shopify-Storefront-Access-Token': options.accessToken,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            credentials: 'include',
        })
    });
    client.query({
            query: TEST_QUERY
        })
        .then((data) => {
            console.log("data", data);
        })
        .catch((e) => {
            console.log(`heres an error, ${e}`)
        });
};