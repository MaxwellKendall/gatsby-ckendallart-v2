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
    // imgs for a product are coupled to the variant. The "Default Title" variant has the main image for the product.
    const defaultVariant = variants
        .filter(({ localFile }) => localFile)
        .find(({ title }) => title === 'Default Title');
    if (defaultVariant && defaultVariant.localFile) {
        return defaultVariant.localFile.childImageSharp.fluid;
    }
    return null;
}
