import React, { useState } from 'react';

export default ({
    pathContext: {
        title,
        description,
        collection,
        variants,
        priceRange: { high, low }
    },
    path
}) => {
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
        <div className="product-page">
            <h2>{title}</h2>
            <p>{description}</p>
            {high !== low && <p>{`Price Ranging from $${low} to $${high}`}</p>}
            {high === low && <p>{`Price $${selectedVariant.price}`}</p>}
            
            <select name="variants" onChange={handleSelectVariant} value={selectedVariant.title}>
                {parsedVariants.map((variant) => (
                    <option value={variant.title}>{variant.title}</option>
                ))}
            </select>
        </div>
    );
};
