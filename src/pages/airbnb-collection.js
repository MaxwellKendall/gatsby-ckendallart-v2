import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';

export default ({
    data: {
        allShopifyProduct: { nodes: originals }
    },
    location
}) => {
    return (
        <Layout classNames="sqrl-grey" location={location}>
            <ShopGrid products={originals} path={location.pathname} />
        </Layout>
    );
}

export const query = graphql`
    query GetAirbnbPrints {
        allShopifyProduct(filter: { tags: { in: ["airbnb"]} } ) {
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
