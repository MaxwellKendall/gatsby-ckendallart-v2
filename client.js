import Client from 'shopify-buy';

export const client = Client.buildClient({
  domain: `${GATSBY_SHOP_NAME}.myshopify.com`,
  storefrontAccessToken: GATSBY_ACCESS_TOKEN
});