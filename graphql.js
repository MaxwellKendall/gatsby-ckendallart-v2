import ApolloClient, { InMemoryCache, gql } from 'apollo-boost';
import fetch from 'isomorphic-fetch';

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    // eslint-disable-next-line
    uri: `https://${GATSBY_SHOP_NAME}.com/api/2020-04/graphql.json`,
    fetch,
    headers: {
      // eslint-disable-next-line
      'X-Shopify-Storefront-Access-Token': GATSBY_ACCESS_TOKEN
    }
});

// const createCustomer = gql`
//     mutation customerCreate($input: CustomerCreateInput!) {
//         customerCreate(input: $input) {
//         customer {
//             id
//         }
//         customerUserErrors {
//             code
//             field
//             message
//         }
//         }
//     }
// `;

export const getShopDetails = gql`
    query test {
        shop {
            name
        }
    }
`;

// export const productFragment = graphql`
// fragment productFragment on Product {
//     createdAt
//     id
//     title
//     handle
//     description
//     productType
//     availablePublicationCount
//     id
//     tracksInventory
//     totalInventory
//     seo {
//       description
//       title
//     }
//     featuredImage {
//       id
//       originalSrc
//       transformedSrc
//     }
//     priceRange {
//       maxVariantPrice {
//         amount
//         currencyCode
//       }
//       minVariantPrice {
//         amount
//         currencyCode
//       }
//     }
//   }
// `;
  
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