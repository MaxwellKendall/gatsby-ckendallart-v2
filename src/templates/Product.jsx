import React, { useState, useContext } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import CartContext from "../../globalState";
import Layout from "../components/Layout";
import { getParsedVariants, localStorageKey, getLineItemFromVariant } from '../helpers';
import { initCheckout, addNewLineItemsToCart } from '../../client';

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
    const [isLoading, setIsLoading] = useState(false);
    console.log('cart on product page', cart);
    const { variants, handle } = shopifyProduct;
    // Available & Selected Inventory
    const [parsedVariants] = useState(getParsedVariants(variants, title))
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);

    const handleSelectVariant = (e) => {
        setSelectedVariant(parsedVariants.find((node) => node.title === e.target.value));
    }

    const modifyCart = (cartId) => {
        console.log('cartId', cartId);
        return addNewLineItemsToCart(cartId, getLineItemFromVariant(selectedVariant))
            .then((resp) => {
                console.log('modifyCart', resp)
                dispatch({ type: 'ADD_TO_CART', payload: resp });
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    const handleAddToCart = () => {
        setIsLoading(true);
        if (cart.id) {
            modifyCart(cart.id)
        }
        else {
            initCheckout()
                .then((resp) => {
                    const timeStamp = moment.now('DD MM YYYY hh:mm:ss');
                    window.localStorage.setItem(localStorageKey, JSON.stringify({'id': resp.id, timeStamp }))
                    dispatch({ type: 'INIT_CART', payload: resp });
                    return resp
                })
                .then((newCart) => {
                    modifyCart(newCart.id)
                })
                .catch((e) => {
                    console.log('error initCheckout', e);
                })
        }
    };

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
