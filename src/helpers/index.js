export const getParsedVariants = (arr, title) => arr.map((variant) => ({
    ...variant,
    title: variant.title === 'Default Title' ? title : variant.title
}));

export const localStorageKey = `ckendallart-checkout`;

export const getCheckoutIdFromLocalStorage = (window) => {
    if (!window) return null
    return window.localStorage.getItem(localStorageKey);
};

export const parseLineItemsFromCheckout = (cart) => cart.lineItems.map((item) => ({
    variantId: item.variant.id,
    quantity: item.quantity,
    customAttributes: [{ key: 'lineItemId', value: item.id }]
}));

export const getLineItemFromVariant = (variant, quantity = 1) => [{ variantId: variant.id, quantity }]

export const getLineItemIdByVariantId = (cart, id) => {
    return cart
        .lineItems
        .find((item) => item.variantId === id)
        .customAttributes
        .find((attr) => attr.key === 'lineItemId')
        .value;
}