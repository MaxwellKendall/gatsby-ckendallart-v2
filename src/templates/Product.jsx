import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { useMutation, useQuery } from "@apollo/client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from "../components/Layout";
import {
    createCheckout,
    checkInventory,
    modifyCheckout
} from "../../graphql";
import {
    getCart,
    persistCart
} from '../../localState';
import {
    getParsedVariants,
    localStorageKey
} from '../helpers';

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
    const { variants, handle } = shopifyProduct;
    
    // Fresh Inventory
    const {
        error: fetchInventoryError,
        loading:
        isInventoryLoading,
        data: freshInventory,
        refetch: fetchFreshInventory
    } = useQuery(checkInventory, { variables: { handle } });

    // Available & Selected Inventory
    const [parsedVariants] = useState(getParsedVariants(variants, title))
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);

    // Creating, and Updating Cart
    const [setCart] = useMutation(persistCart);
    const { data: { checkout: cart} } = useQuery(getCart);
    const [updateCart, { loading: isModifyCheckoutLoading }] = useMutation(
        modifyCheckout,
        {
            onCompleted: ({ checkoutLineItemsReplace: existingCart }) => {
                console.log('new items added to cart: ', existingCart);
                setCart({
                    variables: {
                        id: '1',
                        cartId: cart.cartId,
                        lineItems: cart.lineItems.concat([{ variantId: selectedVariant.id, quantity: 1 }]),
                        totalPrice: existingCart.checkout.totalPriceV2.amount
                    }
                });
            }
        }
    );
    const [initCheckout, { loading: isCheckoutLoading }] = useMutation(
        createCheckout,
        {
            onCompleted: ({ checkoutCreate: newCart }) => {
                window.localStorage.setItem(localStorageKey, newCart.checkout.id);
                setCart({
                    variables: {
                        id: '1',
                        cartId: newCart.checkout.id,
                        lineItems: [{ variantId: selectedVariant.id, quantity: 1 }],
                        webUrl: newCart.checkout.webUrl,
                        totalPrice: newCart.checkout.totalPriceV2.amount
                    }
                });
            }
        }
    );
    
    const handleSelectVariant = (e) => {
        setSelectedVariant(parsedVariants.find((node) => node.title === e.target.value));
    }

    const modifyCart = () => {
        console.log('modify Cart', cart);
        updateCart({
            variables: {
                lineItems: cart.lineItems.concat({ variantId: selectedVariant.id, quantity: 1 }),
                checkoutId: cart.cartId
            }
        })
    }

    console.log('cart', cart);

    const handleAddToCart = async () => {
        try {
            await fetchFreshInventory();
            const isSelectedVariantAvailable = freshInventory.productByHandle
                .variants.edges
                .find(({ node }) => node.id === selectedVariant.id)
                .node.availableForSale
            if (!cart.cartId && isSelectedVariantAvailable) {
                await initCheckout({
                    variables: {
                        input: {
                            lineItems: [{ variantId: selectedVariant.id, quantity: 1 }]
                        }
                    }
                })
            }
            else {
                modifyCart();
                console.log(`cart ${cart.id} needs to be modified, not initialized`);
            }
        }
        catch(e) {
            console.log(`Error creating checkout: ${e}`);
            throw e;
        }
    };

    const isBuyButtonDisabled = (
        isInventoryLoading ||
        fetchInventoryError ||
        isCheckoutLoading ||
        isModifyCheckoutLoading
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
