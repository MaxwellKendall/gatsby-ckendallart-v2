/* eslint-disable no-undef */
import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: `${GATSBY_SHOP_NAME}.myshopify.com`,
  storefrontAccessToken: GATSBY_ACCESS_TOKEN
});

export const initCheckout = () => {
  // eslint-disable
  return client.checkout.create().then((checkout) => {
    // Do something with the checkout
    return checkout;
  });
};

export const fetchCart = (checkoutId) => {
  return client.checkout.fetch(checkoutId).then((checkout) => {
    // Do something with the checkout
    return checkout;
  });
};

export const addNewLineItemsToCart = (checkoutId, lineItemsToAdd) => {
  // Add an item to the checkout
  return client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
    // Returns only updated line items
    return checkout;
  });
};

export const updateExistingLineItemsInCart = (checkoutId, updatedLineItems) => {
  // Update the line item on the checkout (change the quantity or variant)
  return client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then((checkout) => {
   return checkout;
  });
};

export const removeFromCart = (checkoutId, lineItemIdsToRemove) => {
  return client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
    // Do something with the updated checkout
    return checkout; // Checkout with line item 'xyz' removed
  });
};
