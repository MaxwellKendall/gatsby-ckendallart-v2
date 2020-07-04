import React, { useState, useContext, useEffect, useCallback } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import CartContext from "../../globalState";
import Layout from "../components/Layout";
import { getParsedVariants, localStorageKey, getLineItemForAddToCart, isVariantInCart, getLineItemForUpdateToCart } from '../helpers';
import { initCheckout, addLineItemsToCart, fetchProductInventory, updateLineItemsInCart } from '../../client';
import { useProducts } from '../graphql';
import { uniqueId, kebabCase } from 'lodash';

export default ({
    pathContext: {
        title,
        description,
        priceRange: { high, low },
    },
    data: { shopifyProduct },
    path
}) => {
    const { variants, productType } = shopifyProduct;
    const products = useProducts();
    const { cart, dispatch } = useContext(CartContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isSoldOut, setIsSoldOut] = useState(false);
    // Available & Selected Inventory
    const [parsedVariants] = useState(getParsedVariants(variants, title))
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);

    const checkInventory = useCallback(async () => {
        setIsLoading(true);
        const inventoryExists = await fetchProductInventory(selectedVariant.id);
        if (!inventoryExists) {
            setIsSoldOut(true);
        }
        else {
            setIsSoldOut(false);
        }
        setIsLoading(false);
    }, [selectedVariant, setIsSoldOut, setIsLoading, cart.lineItems]);

    useEffect(() => {
        console.log('checking the inventory.... 👍👍👍👍');
        checkInventory();
    }, [checkInventory]);

    const handleSelectVariant = (e) => {
        setSelectedVariant(parsedVariants.find((node) => node.title === e.target.value));
    }

    const modifyCart = (cartId) => {
        const isExistingLineItem = isVariantInCart(cart, selectedVariant.id);
        if (isExistingLineItem) {
            const lineItemToUpdate = getLineItemForUpdateToCart(cart.lineItems, selectedVariant.id);
            return updateLineItemsInCart(cartId, [{ ...lineItemToUpdate, quantity: lineItemToUpdate.quantity + 1 }])
                .then((payload) => {
                    dispatch({ type: 'UPDATE_CART', payload: { ...payload, variantId: selectedVariant.id }, products });
                })
                .then(() => {
                    setIsLoading(false);
                });
        }
        return addLineItemsToCart(cartId, getLineItemForAddToCart({ ...shopifyProduct, selectedVariant }))
            .then((payload) => {
                dispatch({
                    type: 'ADD_TO_CART',
                    payload,
                    products: products,
                    collection: kebabCase(productType)
                });
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    const handleAddToCart = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (cart.id) {
            return modifyCart(cart.id);
        }
        return initCheckout()
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
    };

    return (
        <Layout pageName="product-page">
            <h2>{title}</h2>
            {high !== low && <p>{`Price Ranging from $${low} to $${high}`}</p>}
            {selectedVariant.localFile && (
                <>
                    {isSoldOut && <span className="product-sold-out">Sold Out!</span>}
                    <Img className="w-3/4" fluid={selectedVariant.localFile.childImageSharp.fluid} />
                </>
            )}
            <p>{description}</p>
            <p>{`Price $${selectedVariant.price}`}</p>
            <div className="actions w-full flex flex-col justify-center items-center my-5">
                <select
                    className="border border-black w-1/2"
                    name="variants"
                    onChange={handleSelectVariant}
                    value={selectedVariant.title}>
                    {parsedVariants.map((variant) => (
                        <option key={uniqueId('')} value={variant.title}>{variant.title}</option>
                    ))}
                </select>
                <button
                    className="border border-black w-1/2"
                    disabled={(isLoading || isSoldOut)}
                    onClick={handleAddToCart}>
                    {isLoading && <FontAwesomeIcon icon="spinner" spin />}
                    {!isLoading && 'Add to Cart'}
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
            productId
            productType
            title
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
