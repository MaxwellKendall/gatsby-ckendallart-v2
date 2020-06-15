import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { useMutation, useQuery } from "@apollo/client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from "../components/Layout";
import { createCheckout, applyDiscountCode, checkInventory, modifyCheckout } from "../../graphql";
import { getCart, setCart } from '../../localState';

const getParsedVariants = (arr, title) => arr.map((variant) => ({
    ...variant,
    title: variant.title === 'Default Title' ? title : variant.title
}))

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
    const { data: cart } = useQuery(getCart);
    const [parsedVariants] = useState(getParsedVariants(variants, title))
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);

    const [persistCart] = useMutation(setCart);
    const [applyDiscount, discount] = useMutation(applyDiscountCode);
    const [discountCode, updateDiscountCode] = useState('');
    const [updateCart, { loading: isModifyCheckoutLoading }] = useMutation(
        modifyCheckout,
        {
            onCompleted: ({ checkoutLineItemsReplace: existingCart }) => {
                console.log('new items added to cart: ', existingCart);
                persistCart({
                    variables: {
                        id: '1',
                        cartId: cart.checkout.cartId,
                        lineItems: cart.checkout.lineItems.concat([{ variantId: selectedVariant.id, quantity: 1 }]),
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
                console.log('new cart was created: ', newCart);
                persistCart({
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
    const { error: fetchInventoryError, loading: isInventoryLoading, data: freshInventory, refetch: fetchFreshInventory } = useQuery(checkInventory, { variables: { handle } });
    
    const handleSelectVariant = (e) => {
        setSelectedVariant(parsedVariants.find((node) => node.title === e.target.value));
    }

    const handleUpdateDiscountCode = (e) => updateDiscountCode(e.target.value);

    const modifyCart = () => {
        console.log('modify Cart', cart);
        updateCart({
            variables: {
                lineItems: cart.checkout.lineItems.concat({ variantId: selectedVariant.id, quantity: 1 }),
                checkoutId: cart.checkout.cartId
            }
        })
    }

    const handleAddToCart = async () => {
        try {
            await fetchFreshInventory();
            const isSelectedVariantAvailable = freshInventory.productByHandle
                .variants.edges
                .find(({ node }) => node.id === selectedVariant.id)
                .node.availableForSale
            if (!cart.checkout.cartId && isSelectedVariantAvailable) {
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

    const handleApplyDiscount = async () => {
        const checkoutId = cart.checkout.id;
        if (checkoutId) {
           try {
                await applyDiscount({
                    variables: {
                        discountCode,
                        checkoutId: cart.checkout.id
                    }
                })
                console.log(`success applying code: ${discount}`);
           }
           catch(e) {
               console.log(`Error applying discount code: ${e}`);
               throw e;
           }
        }
    }
    const isBuyButtonDisabled = (isInventoryLoading || fetchInventoryError || isCheckoutLoading || isModifyCheckoutLoading);
    console.log(`cart`, cart)
    return (
        <Layout pageName="product-page">
            <h2>{title}</h2>
            {high !== low && <p>{`Price Ranging from $${low} to $${high}`}</p>}
            <Img className="w-3/4" fluid={selectedVariant.localFile.childImageSharp.fluid} />
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
                <label onClick={handleApplyDiscount}>Apply Discount Code</label>
                <input
                    type="text"
                    className="border border-black w-1/2"
                    value={discountCode}
                    onChange={handleUpdateDiscountCode} />
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
