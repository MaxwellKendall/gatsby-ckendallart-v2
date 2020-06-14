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
        setCart: (_root, variables, { cache }) => {
          cache.modify({
            id: cache.identify({
              __typename: 'Checkout',
              id: variables.id,
            }),
            fields: {
              cartId: () => variables.cartId,
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
        }
      }
    `,
    data: {
      checkout: {
        id: '1',
        cartId: '',
        __typename: 'Checkout',
      },
    },
  });
};

initCache();
client.onResetStore(initCache);

export const modifyCheckout = gql`
  mutation checkoutAttributesUpdateV2($checkoutId: ID!, $input: CheckoutAttributesUpdateV2Input!) {
    checkoutAttributesUpdateV2(checkoutId: $checkoutId, input: $input) {
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

export const getShopDetails = gql`
    query test {
        shop {
            name
        }
    }
`;

export const productFragment = gql`
fragment productFragment on Product {
    createdAt
    id
    title
    handle
    description
    productType
    availablePublicationCount
    id
    tracksInventory
    totalInventory
    seo {
      description
      title
    }
    featuredImage {
      id
      originalSrc
      transformedSrc
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;
  
// export const collectionFragment = graphql`
// fragment collectionFragment on Collection {
//     productsCount
//     publicationCount
//     handle
//     description
//     image {
//       id
//     }
//     seo {
//       description
//       title
//     }
//     products(first: $first) {
//       edges {
//         node {
//                ...productFragment   
//         }
//       }
//     }
//   }
// `;

// export const variantFragment = graphql`
//  fragment variantFragment on ProductVariant {
//     defaultCursor
//     displayName
//     presentmentPrices(first: $first) {
//       edges {
//         node {
//           price {
//             amount
//             currencyCode
//           }
//         }
//       }
//     }
//     weight
//     weightUnit
//     sku
//     taxCode
//     taxable
//     selectedOptions {
//       name
//       value
//     }
//     id
//     availableForSale
//     image {
//       id
//       originalSrc
//       transformedSrc
//       altText
//     }
//   }
// `;
  
// export const getAllProducts = graphql`
//     query GetProducts($first: Int!) {
//         products(first: $first) {
//         edges {
//             cursor
//             node {
//                 ...productFragment
//             }
//         }
//         }
//     }
// `;

// export const getVariantsById = graphql`
//   query GetVariantsById($id: ID!, $first: Int) {
//     productVariant(id: $id) {
//       ...variantFragment
//   }
// `;

// export const GetProductsByCollection = graphql`
//     query GetAllProductsInCollection($first: Int!, $handle: String!) {
//         collectionByHandle(handle: $handle) {
//             productsCount
//             handle
//             description
//             image {
//                 id
//             }
//             publicationCount
//             seo {
//                 description
//                 title
//             }
//             products(first: $first) {
//                 edges {
//                 cursor
//                 node {
//                     ...productFragment
//                 }
//             }
//         }
//     }
// `
// export const GetAllCollections = graphql`
//     query GetAllCollections($first: Int!) {
//         collections(first: $first) {
//             pageInfo {
//             hasNextPage
//             hasPreviousPage
//             }
//             edges {
//             node {
//                 handle
//             }
//             }
//         }
//     }
// `;

// export const getAllCollectionsAndAllProducts = graphql`
//     query GetAllCollectionsAndProducts($first: Int!) {
//         collections(first: $first) {
//             pageInfo {
//                 hasNextPage
//                 hasPreviousPage
//             }
//             edges {
//                 node {
//                 ...collectionFragment
//                 products(first: $first) {
//                     pageInfo {
//                     hasNextPage
//                     hasPreviousPage
//                     }
//                     edges {
//                     node {
//                         ...productFragment
//                     }
//                     }
//                 }
//                 }
//             }
//         }
//     }
// `;