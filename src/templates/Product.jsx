import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { useMutation } from "@apollo/react-hooks";

import Layout from "../components/Layout";
import { createCheckout, applyDiscountCode } from "../../graphql";

export default ({
    pathContext: {
        id,
        title,
        description,
        collection,
        priceRange: { high, low },
        totalCount
    },
    data: { shopifyProduct: { variants } },
    path
}) => {
    console.log("variants", variants);
    const [initCheckout, checkout] = useMutation(createCheckout);
    const [applyDiscount, discount] = useMutation(applyDiscountCode);
    const [discountCode, updateDiscountCode] = useState('');
    const [parsedVariants, setParsedVariants] = useState(variants
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
    const handleCreateCheckout = () => {
        initCheckout({
            variables: {
                input: {
                    lineItems: [{ variantId: selectedVariant.id, quantity: 1 }]
                }
            }
        });
    };

    const handleUpdateDiscountCode = (e) => updateDiscountCode(e.target.value);
    const handleApplyDiscount = () => {
        const checkoutId = checkout.data.checkoutCreate.checkout.id;
        if (checkoutId) {
            applyDiscount({
                variables: {
                    discountCode,
                    checkoutId: checkout.data.checkoutCreate.checkout.id
                }
            })
        }
    }

    console.log("data", checkout);

    return (
        <Layout>
            <div className="product-page">
                <h2>{title}</h2>
                <p>{description}</p>
                {high !== low && <p>{`Price Ranging from $${low} to $${high}`}</p>}
                <p>{`Price $${selectedVariant.price}`}</p>
                <Img fluid={selectedVariant.localFile.childImageSharp.fluid} />
                <select name="variants" onChange={handleSelectVariant} value={selectedVariant.title}>
                    {parsedVariants.map((variant) => (
                        <option value={variant.title}>{variant.title}</option>
                    ))}
                </select>
                <input type="text" value={discountCode} onChange={handleUpdateDiscountCode} />
                <button onClick={handleApplyDiscount}>Apply Discount Code</button>
                <button onClick={handleCreateCheckout}>Buy</button>
            </div>
        </Layout>
    );
};

export const query = graphql`
    query GetProduct($id: String) {
        shopifyProduct(id: {eq: $id}) {
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
