import React, { useState, useContext } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CartContext from "../../globalState";
import Layout from "../components/Layout";
import { getParsedVariants, localStorageKey } from '../helpers';

export default ({
    pathContext: {
        id,
        title,
        description,
        collection,
        priceRange: { high, low },
        totalCount
    },
    data: { shopifyProduct },
    path
}) => {
    const { cart, dispatch } = useContext(CartContext);
    console.log('cart on product page', cart, dispatch);
    const { variants, handle } = shopifyProduct;
    // Available & Selected Inventory
    const [parsedVariants] = useState(getParsedVariants(variants, title))
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);

    const handleSelectVariant = (e) => {
        setSelectedVariant(parsedVariants.find((node) => node.title === e.target.value));
    }

    const handleAddToCart = () => console.log('yo');

    const isBuyButtonDisabled = (
        false
    );
    return (
        <Layout pageName="product-page">
            <h2>{title}</h2>
            {high !== low && <p>{`Price Ranging from $${low} to $${high}`}</p>}
            {selectedVariant.localFile && <Img className="w-3/4" fluid={selectedVariant.localFile.childImageSharp.fluid} />}
            <p>{description}</p>
            <p>{`Price $${selectedVariant.price}`}</p>
            <div className="actions w-full flex flex-col justify-center items-center my-5">
                <select
                    className="border border-black w-1/2"
                    name="variants"
                    onChange={handleSelectVariant}
                    value={selectedVariant.title}>
                    {parsedVariants.map((variant) => (
                        <option value={variant.title}>{variant.title}</option>
                    ))}
                </select>
                <button
                    className="border border-black w-1/2"
                    disabled={isBuyButtonDisabled}
                    onClick={handleAddToCart}>
                    {isBuyButtonDisabled
                        ? <FontAwesomeIcon icon="spinner" spin />
                        : 'Buy'
                    }
                </button>
            </div>
        </Layout>
    );
};

export const query = graphql`
    query GetProduct($id: String) {
        shopifyProduct(id: {eq: $id}) {
            id
            handle
            variants {
                price
                title
                id
                sku
                localFile {
                    childImageSharp {
                      fluid(maxWidth:700) {
                        ...GatsbyImageSharpFluid
                      }
                    }
                  }
                weight
                weightUnit
            }
        }
    }
`;
