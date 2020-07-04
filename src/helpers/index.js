export const getParsedVariants = (arr, title) => arr.map((variant) => ({
    ...variant,
    title: variant.title === 'Default Title' ? title : variant.title
}));

export const localStorageKey = `ckendallart-checkout`;

export const getCheckoutIdFromLocalStorage = (window) => {
    if (!window) return null
    return window.localStorage.getItem(localStorageKey);
};

export const getImages = (selectedVariantIds, products) => {
    debugger;
    return products
        .filter((product) => {
            return product.variants.some((variant) => selectedVariantIds.includes(variant.id))
        })
        .reduce((acc, product) => {
            const selectedVariant = product.variants.find((variant) => selectedVariantIds.includes(variant.id));
            return {
                ...acc,
                [selectedVariant.id]: selectedVariant.localFile.childImageSharp.fluid
            }
        }, {});
}

const keysAndPathsForCustomAttributes = [
    ['productId', 'productId'],
    ['pricePerUnit', 'variant.price'],
    ['productTitle', 'title'],
    ['variantTitle', 'variant.title'],
    ['handle', 'handle'],
    ['collection', 'productType']
];
/**
 * @param data { ...shopifyProduct, variant: shopifyVariant }
 * @returns an array of objects { key: nameOfKey, value: valueForKey }
*/
export const addCustomAttributesToLineItem = (data) => {
    return keysAndPathsForCustomAttributes.reduce((acc, [key, path]) => {
        const value = path.split('.').reduce((acc, prop) => {
            return acc[prop];
        }, data);
        return acc.concat([{
            key,
            value
        }]);
    }, []);
};

export const parseLineItemsFromRemoteCart = (cart, additionalCustomAttributes = []) => {
    return cart.lineItems.map((item) => ({
        variantId: item.variant.id,
        quantity: item.quantity,
        customAttributes: item.customAttributes.some((attr) => attr.key === 'lineItemId')
            ? item.customAttributes
            : item.customAttributes.concat([{ key: 'lineItemId', value: item.id }])
        // customAttributes: item.customAttributes.length > 0 ? item.customAttributes : [
        //     { key: 'lineItemId', value: item.id },
        //     { key: 'productId', value: item.variant.product.id },
        //     { key: 'pricePerUnit', value: `$${item.variant.price}` },
        //     { key: 'productTitle', value: `${item.title}` },
        //     { key: 'variantTitle', value: item.variant.title === 'Default Title' ? item.title : item.variant.title },
        //     { key: 'handle', value: item.variant.product.handle },
        //     ...additionalCustomAttributes.reduce((acc, attr) => acc.concat([{ key: attr.key, value: attr.value }]), [])
        // ]
    }))
};

export const parseDataFromRemoteCart = (cart, products) => {
    const {
        id,
        totalPrice,
        totalTax,
        webUrl
    } = cart;

    const lineItems = parseLineItemsFromRemoteCart(cart);

    return {
        id,
        lineItems,
        totalPrice,
        totalTax,
        webUrl,
        imagesByVariantId: getImages(lineItems.map((item) => item.variantId), products)
    };
};

export const getLineItemForAddToCart = (product) => [{
    variantId: product.variant.id,
    quantity: 1,
    customAttributes: addCustomAttributesToLineItem(product)
}];

export const getCustomAttributeFromCartByVariantId = (lineItems, variantId, key) => {
    debugger;
    return lineItems
        .find((item) => item.variantId === variantId)
        .customAttributes
        .find((attr) => attr.key === key)
        .value;
}

export const isVariantInCart = (cart, variantId) => cart.lineItems.some((item) => item.variantId === variantId);

export const getLineItemForUpdateToCart = (lineItems, variantId) => {
    const lineItem = lineItems.find((item) => item.variantId === variantId);
    const lineItemId = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'lineItemId');
    return { quantity: lineItem.quantity, id: lineItemId };
};
