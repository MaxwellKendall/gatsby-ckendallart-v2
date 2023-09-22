import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';
import SEO from "../components/SEO";

const description = `Claire Kendall's Artist Portfolio.`

export default ({
    data: {
        allShopifyProduct: { nodes: portfolio }
    },
    location
}) => {
    return (
        <SEO
            title={"Portfolio"}
            pathname={location.pathname}
            description={description}>
        <Layout classNames="sqrl-grey" location={location}>
            <ShopGrid products={portfolio} ctx="notForSale" path={location.pathname} />
        </Layout>
        </SEO>
    );
}

export const query = graphql`
    query GetPortfolio {
        allShopifyProduct(filter: {productType: {regex: "/^((?!Print).)*$/"}}) {
            nodes {
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
