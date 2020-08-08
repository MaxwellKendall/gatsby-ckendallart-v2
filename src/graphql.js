import { useStaticQuery, graphql } from 'gatsby';

export const useProducts = () => {
    const { allShopifyProduct: { nodes: products } } = useStaticQuery(
        graphql`
            query getAllProducts {
                allShopifyProduct {
                    nodes {
                        productType
                        handle
                        totalInventory
                        variants {
                            id
                            localFile {
                                childImageSharp {
                                    fluid(maxWidth: 300) {
                                        ...GatsbyImageSharpFluid
                                    }
                                }
                            }
                            availableForSale
                            title
                        }
                        priceRange {
                            high
                            low
                        }
                        collection
                        title
                        slug
                    }
                }
            }  
        `
    );

    return products;
};


const getAllProducts = graphql`
    query HomePageQuery {
        allShopifyProduct {
            nodes { 
                productType
                handle
                totalInventory
                variants {
                    availableForSale
                    title
                }
                priceRange {
                    high
                    low
                }
                collection
                title
                slug
            }
        }
}`;

export const clientSideQueries = {
    // This doesn't actually work :(
    getAllProducts
};
