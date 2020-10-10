import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';

export default ({
    data: {
        allShopifyProduct: { nodes: portfolio }
    },
    location
}) => {
    return (
        <Layout classNames="sqrl-grey" location={location}>
            <ShopGrid products={portfolio} />
        </Layout>
    );
}

export const query = graphql`
    query GetPortfolio {
        allShopifyProduct(filter: {collection: {regex: "/^((?!Print).)*$/"}}) {
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
