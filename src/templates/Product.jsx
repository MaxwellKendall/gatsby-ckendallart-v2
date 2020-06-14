import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { useMutation, useQuery } from "@apollo/client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from "../components/Layout";
import { createCheckout, applyDiscountCode, checkInventory } from "../../graphql";
import { getCart, setCart } from '../../localState';

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
    const [persistCart] = useMutation(setCart);
    const [initCheckout, { data: checkout, loading: isCheckoutLoading }] = useMutation(
        createCheckout,
        {
            onCompleted: ({ checkoutCreate: newCart }) => {
                console.log('new cart was created: ', newCart);
                persistCart({ variables: { id: '1', cartId: 'newCart.checkout.id' }});
            }
        }
    );
    const [applyDiscount, discount] = useMutation(applyDiscountCode);
    const {
        error: fetchInventoryError,
        loading: isInventoryLoading,
        data: freshInventory,
        refetch: fetchFreshInventory
    } = useQuery(checkInventory, { variables: { handle } });
    const { data: cart, refetch: checkCart } = useQuery(getCart);
    console.log('render!', cart);

    const [discountCode, updateDiscountCode] = useState('');
    const [parsedVariants] = useState(variants
        .map((variant) => ({
            ...variant,
            title: variant.title === 'Default Title' ? title : variant.title
        }))
    );
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);
    
    const handleSelectVariant = (e) => {
        const newVariant = parsedVariants.find((node) => node.title === e.target.value);
        setSelectedVariant(newVariant);
    }

    const handleAddToCart = async () => {
        console.log('heres the cart!', cart);
        await checkCart();
        if (!cart.checkout.cartId) {
            try {
                await fetchFreshInventory();
                const isSelectedVariantAvailable = freshInventory.productByHandle
                    .variants.edges
                    .find(({ node }) => node.id === selectedVariant.id)
                    .node.availableForSale
                if (isSelectedVariantAvailable) {
                    await initCheckout({
                        variables: {
                            input: {
                                lineItems: [{ variantId: selectedVariant.id, quantity: 1 }]
                            }
                        }
                    })
                }
            }
            catch(e) {
                console.log(`Error creating checkout: ${e}`);
                throw e;
            }
        }
        else {
            // woohoo we persisted the cart
            // handle modify rather than init cart
            console.log(`cart ${cart.id} needs to be modified, not initialized`);
        }
    };

    const handleUpdateDiscountCode = (e) => updateDiscountCode(e.target.value);
    const handleApplyDiscount = async () => {
        const checkoutId = checkout.data.checkoutCreate.checkout.id;
        if (checkoutId) {
           try {
                await applyDiscount({
                    variables: {
                        discountCode,
                        checkoutId: checkout.data.checkoutCreate.checkout.id
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
    const isBuyButtonDisabled = (
        isInventoryLoading ||
        fetchInventoryError ||
        isCheckoutLoading
    );
    return (
        <Layout pageName="product-page">
            <h2>{title}</h2>
            <p>{description}</p>
            <span>{`Variant Id: ${selectedVariant.id}`}</span>
            <span>{`Product Id: ${shopifyProduct.id}`}</span>
            {high !== low && <p>{`Price Ranging from $${low} to $${high}`}</p>}
            <p>{`Price $${selectedVariant.price}`}</p>
            <Img fluid={selectedVariant.localFile.childImageSharp.fluid} />
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
