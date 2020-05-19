const gql = require('graphql-tag');

const ARTICLES_QUERY = gql`
  query GetArticles($first: Int!, $after: String) {
    articles(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          author {
            bio
            email
            firstName
            lastName
            name
          }
          blog {
            id
          }
          comments(first: 250) {
            edges {
              node {
                author {
                  email
                  name
                }
                content
                contentHtml
                id
              }
            }
          }
          content
          contentHtml
          excerpt
          excerptHtml
          id
          image {
            altText
            id
            src
          }
          publishedAt
          tags
          title
          url
          seo {
            title
            description
          }
        }
      }
    }
  }
`;
exports.ARTICLES_QUERY = ARTICLES_QUERY;
const BLOGS_QUERY = gql`
  query GetBlogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          title
          url
        }
      }
    }
  }
`;
exports.BLOGS_QUERY = BLOGS_QUERY;
const COLLECTIONS_QUERY = gql`
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          description
          descriptionHtml
          handle
          id
          image {
            altText
            id
            src
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
          }
          title
          updatedAt
        }
      }
    }
  }
`;

exports.TEST_QUERY = gql`
    {
        shop {
            name
        }
    }
`;

exports.COLLECTIONS_QUERY = COLLECTIONS_QUERY;
const PRODUCTS_QUERY = gql`
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          availableForSale
          createdAt
          description
          descriptionHtml
          handle
          id
          images(first: 250) {
            edges {
              node {
                id
                altText
                originalSrc
              }
            }
          }
          metafields(first: 250) {
            edges {
              node {
                description
                id
                key
                namespace
                value
                valueType
              }
            }
          }
          onlineStoreUrl
          options {
            id
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          productType
          publishedAt
          tags
          title
          updatedAt
          variants(first: 250) {
            edges {
              node {
                availableForSale
                compareAtPrice
                compareAtPriceV2 {
                  amount
                  currencyCode
                }
                id
                image {
                  altText
                  id
                  originalSrc
                }
                metafields(first: 250) {
                  edges {
                    node {
                      description
                      id
                      key
                      namespace
                      value
                      valueType
                    }
                  }
                }
                price
                priceV2 {
                  amount
                  currencyCode
                }
                requiresShipping
                selectedOptions {
                  name
                  value
                }
                sku
                title
                weight
                weightUnit
                presentmentPrices(first: 250) {
                  edges {
                    node {
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
          vendor
        }
      }
    }
  }
`;
exports.PRODUCTS_QUERY = PRODUCTS_QUERY;
const SHOP_POLICIES_QUERY = gql`
  query GetPolicies {
    shop {
      privacyPolicy {
        body
        id
        title
        url
      }
      refundPolicy {
        body
        id
        title
        url
      }
      termsOfService {
        body
        id
        title
        url
      }
    }
  }
`;
exports.SHOP_POLICIES_QUERY = SHOP_POLICIES_QUERY;
const PAGES_QUERY = gql`
  query GetPages($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          handle
          title
          body
          bodySummary
          updatedAt
          url
        }
      }
    }
  }
`;
exports.PAGES_QUERY = PAGES_QUERY;