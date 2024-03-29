import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';
import SEO from "../components/SEO";

const description = `Original artwork by Claire Kendall.`

export default ({
    data: {
        allShopifyProduct: { nodes: originals }
    },
    location
}) => {
    return (
        <SEO
            title="Originals"
            pathname={location.pathname}
            description={description}>
            <Layout classNames="sqrl-grey" location={location}>
                <ShopGrid products={originals} path={location.pathname} />
            </Layout>
        </SEO>
    );
}

export const query = graphql`
    query GetOnlyOriginals {
        allShopifyProduct(filter: {collection: {eq: "Originals Shop"}}) {
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
