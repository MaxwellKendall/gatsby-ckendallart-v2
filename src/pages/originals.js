import React from 'react';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';

export default ({
    data: {
        allShopifyProduct: { nodes: originals }
    }
}) => {
    return (
        <Layout>
            <ShopGrid products={originals} />
        </Layout>
    );
}

export const query = graphql`
    query GetOnlyOriginals {
        allShopifyProduct(filter: {collection: {regex: "/^((?!Print|Commissions).)*$/"}}) {
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
