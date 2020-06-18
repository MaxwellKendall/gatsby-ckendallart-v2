export const getParsedVariants = (arr, title) => arr.map((variant) => ({
    ...variant,
    title: variant.title === 'Default Title' ? title : variant.title
}));

export const localStorageKey = `ckendallart-checkout`;

export const getCheckoutIdFromLocalStorage = (window) => {
    if (!window) return null
    return window.localStorage.getItem(localStorageKey);
};

export const parseRemoteCartLineItems = ({ node }) => ({
    variantId: node.variant.id,
    quantity: node.quantity
});
