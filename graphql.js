// import ApolloClient, { InMemoryCache, gql } from 'apollo-boost';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import fetch from 'isomorphic-fetch';

const cache = new InMemoryCache();

export const client = new ApolloClient({
    cache,
    // eslint-disable-next-line
    uri: `https://${GATSBY_SHOP_NAME}.com/api/2020-04/graphql.json`,
    fetch,
    headers: {
      // eslint-disable-next-line
      'X-Shopify-Storefront-Access-Token': GATSBY_ACCESS_TOKEN
    },
    resolvers: {
      Mutation: {
        persistCart: (_root, variables, { cache }) => {
          cache.modify({
            id: cache.identify({
              __typename: 'Checkout',
              id: variables.id,
            }),
            fields: {
              cartId: () => variables.cartId,
              lineItems: () => variables.lineItems,
              webUrl: (existing) => variables.webUrl ? variables.webUrl : existing,
              totalPrice: () => variables.totalPrice
            },
          });
          return null;
        },
      }
    }
});

const initCache = () => {
  cache.writeQuery({
    query: gql`
      query GetCart {
        checkout {
          id
          cartId
          lineItems
          webUrl
          totalPrice
        }
      }
    `,
    data: {
      checkout: {
        id: '1',
        cartId: '',
        lineItems: [],
        webUrl: '',
        totalPrice: 0,
        __typename: 'Checkout',
      },
    },
  });
};

initCache();
client.onResetStore(initCache);

export const modifyCheckout = gql`
  mutation checkoutLineItemsReplace($lineItems: [CheckoutLineItemInput!]!, $checkoutId: ID!) {
    checkoutLineItemsReplace(lineItems: $lineItems, checkoutId: $checkoutId) {
      checkout {
        id
        ready
        taxExempt
        lineItemsSubtotalPrice {
          amount
          currencyCode
        }
        totalPriceV2 {
          amount
          currencyCode
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const createCheckout = gql`
  mutation initCheckout($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        ready
        taxExempt
        lineItemsSubtotalPrice {
          amount
          currencyCode
        }
        totalPriceV2 {
          amount
          currencyCode
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const applyDiscountCode = gql`
  mutation checkoutDiscountCodeApplyV2($discountCode: String!, $checkoutId: ID!) {
    checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
      checkout {
        id
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`

export const checkInventory = gql`
  query getInvetoryForProductVariantsByProductHandle($handle:String!) {
    productByHandle(handle: $handle) {
      variants(first: 250) {
        edges {
          node {
            id
            availableForSale
            quantityAvailable
          }
        }
      }
    } 
  }
`

export const getCheckoutById = gql`
  query getCheckoutById ($id: ID!) {
    node(id: $id) {
      id
      ... on Checkout {
          ready
          webUrl
          totalPriceV2 {
            amount
          }
          lineItems(first: 250) {
              edges {
                  node {
                      unitPrice {
                          amount
                      }
                      variant {
                          title
                          id
                      }
                      quantity
                  }
              }
          }
      }
    }
  }
`;