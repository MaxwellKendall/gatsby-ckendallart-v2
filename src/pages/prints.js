import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';
import SEO from "../components/SEO";

export default ({
    data: {
        allShopifyProduct: { nodes: prints }
    },
    location
}) => {
    return (
        <SEO
            title="Prints"
            pathname={location.pathname}
            description="Prints of original artwork by Claire Kendall.">
            <Layout classNames="sqrl-grey" location={location}>
                <ShopGrid products={prints} path={location.pathname} />
            </Layout>
        </SEO>
    );
}

export const query = graphql`
    query GetOnlyPrints {
        allShopifyProduct(filter: {collection: {eq: "Prints Shop"}}) {
            nodes {
                title
                collection
                slug
                productType
                priceRange {
                    high
                    low
                }
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
                variants {
                    image
                    title
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
