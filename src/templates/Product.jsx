import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image"

import Layout from "../components/Layout";

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
    console.log("data", variants);
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
