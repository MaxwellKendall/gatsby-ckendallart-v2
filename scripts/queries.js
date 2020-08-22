const { gql } = require('@apollo/client');

exports.GetAllProductsInCollection = gql`
    query GetAllProductsInCollection($first: Int!, $handle: String!) {
        collectionByHandle(handle: $handle) {
            handle
            description
            id
            title
            image {
                id
                originalSrc
            }
            products(first: $first) {
                edges {
                    cursor
                    node {
                        createdAt
                        id
                        title
                        handle
                        tags
                        description
                        productType
                        id
                        totalInventory
                        images(first: $first) {
                            edges {
                                node {
                                    originalSrc
                                }
                            }
                        }
                        variants(first:$first) {
                      	  edges {
                      	    node {
                              price
                              sku
                              weight
                              weightUnit
                              title
                      	      id
                              availableForSale
                              image {
                                altText
                                originalSrc
                              }
                      	    }
                      	  }
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
                }
            }
        }
    }   
`;

exports.GetAllCollections = gql`
    query GetAllCollections($first: Int!) {
        collections(first: $first) {
            pageInfo {
                hasNextPage
                hasPreviousPage
            }
            edges {
                node {
                    handle
                }
            }
        }
    }
`;
