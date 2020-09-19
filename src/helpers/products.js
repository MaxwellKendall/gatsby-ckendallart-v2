import { useState } from 'react';
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

export const useAllOriginals = () => {
    return useProducts()
        .filter(({ productType }) => productType.toLowerCase() !== 'print');
};

export const useAllProducts = () => {
    return useProducts();
};

export const getDefaultProductImage = ({ variants }) => {
    // Considering the most expensive variant to be the default. 
    const defaultVariant = variants
        .filter(({ localFile }) => localFile)
        .reduce((acc, variant) => {
            if (!acc) return variant;
            if (parseInt(acc.price, 10) < parseInt(variant.price, 10)) return variant;
            return acc;
        }, null);
    if (defaultVariant && defaultVariant.localFile) {
        return defaultVariant.localFile.childImageSharp.fluid;
    }
    return null;
}
