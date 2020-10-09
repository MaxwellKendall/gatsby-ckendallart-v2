import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';

export default ({
    data: {
        allShopifyProduct: { nodes: prints }
    }
}) => {
    return (
        <Layout>
             <ShopGrid products={prints} />
        </Layout>
    );
}

export const query = graphql`
    query GetOnlyPrints {
        allShopifyProduct(filter: {collection: {eq: "Print Shop"}}) {
            nodes {
                optimizedImages
                title
                collection
                slug
                productType
                priceRange {
                    high
                    low
                }
                variants {
                    image
                    availableForSale
                    localFile {
                        small: childImageSharp {
                            fixed(width: 300) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        medium: childImageSharp {
                            fixed(width: 500) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        large: childImageSharp {
                            fixed(width: 700) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                    }
                }
            }
        }
    }    
`
