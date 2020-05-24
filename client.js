import ApolloClient from 'apollo-boost';
import fetch from 'isomorphic-fetch';

export const client = new ApolloClient({
  uri: 'https://ckendallart.myshopify.com/api/2020-04/graphql',
  fetch,
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
  }
});