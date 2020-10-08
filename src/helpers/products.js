import { useStaticQuery, graphql } from 'gatsby';
import { getResponsiveImages } from './img';

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
                            price
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

export const useAllPrints = () => {
    return useProducts()
        .filter(({ productType }) => productType.toLowerCase() === 'print');
}

export const useAllProducts = () => {
    return useProducts();
};

export const getDefaultProductImage = (product) => {
    // Considering the most expensive variant to be the default. 
    const defaultVariant = product.variants
        .filter(({ localFile }) => localFile)
        .reduce((acc, variant) => {
            if (!acc) return variant;
            if (parseInt(acc.price, 10) < parseInt(variant.price, 10)) return variant;
            return acc;
        }, null);
    if (defaultVariant && defaultVariant.localFile) {
        return getResponsiveImages({
            img: defaultVariant.localFile
        })
        .responsiveImgs;
    }
    return null;
}
