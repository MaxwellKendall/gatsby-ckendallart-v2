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
        <Layout pageName="product-page" flexDirection="row" classNames="flex-wrap" maxWidth="100rem">
            {selectedVariant.localFile && (
                <>
                    {remoteInventory === 0 && <span className="product-sold-out">Sold Out!</span>}
                    <Img className="w-full mx-auto md:mx-5" fixed={selectedVariant.localFile.childImageSharp.fixed} />
                </>
            )}
            <div className="product-desc flex flex-col items-center w-full lg:items-start my-5 lg:justify-start lg:w-1/4 xl:w-2/5 lg:mr-5 lg:my-0">
                <h2 className="text-4xl tracking-wide text-center lg:text-left">{title}</h2>
                <p className="text-2xl py-10 tracking-widest">{`$${selectedVariant.price}`}</p>
                {high !== low && <p className="text-sm italic">{`from $${low} to $${high}`}</p>}
                <div className="actions w-full flex flex-col my-5 justify-center items-center lg:justify-start">
                    <button
                        className="border text-white border-black w-64 py-5 px-2 text-xl uppercase mb-2"
                        style={{ background: "#C097D0" }}
                        disabled={isAddToCartDisabled}
                        onClick={handleAddToCart}>
                        {isLoading && <FontAwesomeIcon icon="spinner" spin />}
                        {!isLoading && 'Add to Cart'}
                    </button>
                    {parsedVariants.length > 1 && (
                        <select
                            className="border border-black w-1/2"
                            name="variants"
                            onChange={handleSelectVariant}
                            value={selectedVariant.title}>
                            {parsedVariants.map((variant) => (
                                <option key={uniqueId('')} value={variant.title}>{variant.title}</option>
                            ))}
                        </select>
                    )}
                    <p className="text-lg py-10 tracking-wide px-10 lg:px-0">{description}</p>
                </div>
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
                      fixed(width:700) {
                        ...GatsbyImageSharpFixed
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
                fixed(width:700) {
                  ...GatsbyImageSharpFixed
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
                fixed(width: 300) {
                  ...GatsbyImageSharpFixed
                }
              }
              parent {
                id
              }
            }
        }
    }
`;
