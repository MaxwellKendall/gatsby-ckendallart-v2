import React, { useState, useContext, useEffect, useCallback } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import CartContext from "../../globalState";
import Layout from "../components/Layout";
import { getParsedVariants, localStorageKey, getLineItemForAddToCart, isVariantInCart, getLineItemForUpdateToCart, getInventoryDetails } from '../helpers';
import { initCheckout, addLineItemsToCart, fetchProductInventory, updateLineItemsInCart } from '../../client';
import { useProducts } from '../graphql';
import { uniqueId, kebabCase } from 'lodash';

export default ({
    pathContext: {
        title,
        description,
        priceRange: { high, low },
    },
    data: { shopifyProduct: product },
    path
}) => {
    const { cart, dispatch } = useContext(CartContext);
    const products = useProducts();
    const { variants, productType } = product;
    const parsedVariants = getParsedVariants(variants, title);
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);
    const [remoteInventory, setRemoteInventory] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [remainingInventory, setRemainingInventory] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const checkInventory = useCallback(async () => {
        setIsLoading(true);
        const [
            remoteQuantity,
            remainingQuantity
        ] = await getInventoryDetails(selectedVariant.id, cart);
        setRemoteInventory(remoteQuantity);
        setRemainingInventory(remainingQuantity);
        setIsLoading(false);
    }, [selectedVariant, setRemainingInventory, setRemoteInventory, setIsLoading, cart.lineItems]);

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
            return updateLineItemsInCart(cartId, [{ ...lineItemToUpdate, quantity }])
                .then((payload) => {
                    dispatch({ type: 'UPDATE_CART', payload: { ...payload, variantId: selectedVariant.id }, products });
                })
                .then(() => {
                    setIsLoading(false);
                });
        }
        return addLineItemsToCart(cartId, getLineItemForAddToCart({ ...product, selectedVariant }, quantity))
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

    const isAddToCartDisabled = (
        isLoading ||
        remoteInventory === 0 ||
        remainingInventory === 0
    );

    const handleChangeQuantity = (e) => {
        e.preventDefault();
        const newQuantity = parseInt(e.target.value, 10);
        if (newQuantity <= remainingInventory && newQuantity >= 1) {
            setQuantity(parseInt(e.target.value, 10));
        }
    }

    return (
        <Layout pageName="product-page">
            <h2 className="text-center">{title}</h2>
            {high !== low && <p className="text-center">{`Price Ranging from $${low} to $${high}`}</p>}
            {selectedVariant.localFile && (
                <>
                    {remoteInventory === 0 && <span className="product-sold-out">Sold Out!</span>}
                    <Img className="w-3/4 mx-auto" fluid={selectedVariant.localFile.childImageSharp.fluid} />
                </>
            )}
            <p className="text-center">{description}</p>
            <p className="text-center">{`Price $${selectedVariant.price}`}</p>
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
                    {remainingInventory > 1 && (
                        <>
                            <input className="border border-black px-2 text-center" type="number" value={quantity} onChange={handleChangeQuantity} />
                        </>
                    )}
                <button
                    className="border border-black w-1/2"
                    disabled={isAddToCartDisabled}
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
        productImages: allFile(filter: {parent: {id: {eq: $id}}}) {
            nodes {
              name
              base
              childImageSharp {
                fluid(maxWidth:700) {
                  ...GatsbyImageSharpFluid
                }
              }
              parent {
                id
              }
            }
        }
        productImageThumbnails: allFile(filter: {parent: {id: {eq: $id}}}) {
            nodes {
              name
              base
              childImageSharp {
                fluid(maxWidth: 300) {
                  ...GatsbyImageSharpFluid
                }
              }
              parent {
                id
              }
            }
        }
    }
`;
