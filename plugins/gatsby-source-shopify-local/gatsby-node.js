const clientConstructor = require('graphql-request').GraphQLClient;
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

const url = `https://ckendallart.myshopify.com/api/2020-04/graphql`;

const header = 'X-Shopify-Storefront-Access-Token';

exports.sourceNodes = async ({ actions: { createNode } }, options = defaultOptions) => {
    const client = new clientConstructor(url, {
        headers: {
            [header]: options.accessToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    
    client.request(TEST_QUERY)
        .then((data) => {
            console.log("data", data);
        })
        .catch((e) => {
            console.log(`heres an error, ${e}`)
        });
};