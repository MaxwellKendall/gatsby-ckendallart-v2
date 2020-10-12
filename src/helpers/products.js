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

export const getPrettyPrice = (num) => {
    if (!num) return `$0.00`;
    const cleanNumber = typeof num === 'number'
        ? `${num.toFixed(2)}`
        : `${parseInt(num, 10).toFixed(2)}`;
    if (cleanNumber.split('.')[0].length <= 3) return `$${cleanNumber}`;
    if (cleanNumber.split('.')[0].length <= 4) return `$${cleanNumber.substring(0,1)},${cleanNumber.substr(1)}`;
    if (cleanNumber.split('.')[0].length <= 5) return `$${cleanNumber.substring(0,2)},${cleanNumber.substr(2)}`;
    // selling paintings for 100K? Noice.
    return cleanNumber;
}