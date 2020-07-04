/* eslint-disable no-undef */
import Client from 'shopify-buy';
import fetch from 'isomorphic-fetch';

const client = Client.buildClient({
  domain: `${GATSBY_SHOP_NAME}.myshopify.com`,
  storefrontAccessToken: GATSBY_ACCESS_TOKEN
});

const adminAPIBaseUrl = `https://emrik8wwe3.execute-api.us-east-1.amazonaws.com/TEST/inventory`;

export const fetchProductInventory = (variantId, quantity = 1) => {
  const parsedVariantId = window.atob(variantId).split('/').pop();
  // remove hard code later.
  return fetch(`${adminAPIBaseUrl}?variantId=${parsedVariantId}`, {
    method: 'get',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(async (data) => {
    const { body } = await data.json();
    console.log('number of variants remaining', body.variant.inventory_quantity);
    return body.variant.inventory_quantity >= quantity;
  })
  .catch((e) => {
    console.log('Error fetching inventory', e);
  });
}

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

export const addLineItemsToCart = (checkoutId, lineItemsToAdd) => {
  // Add an item to the checkout
  return client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
    // Returns only updated line items
    return checkout;
  });
};

export const removeLineItemsFromCart = (checkoutId, lineItemIdsToRemove) => {
  return client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
    // Do something with the updated checkout
    return checkout; // Checkout with line item 'xyz' removed
  });
};

export const updateLineItemsInCart = (checkoutId, updatedLineItems) => {
  // Update the line item on the checkout (change the quantity or variant)
  return client.checkout.updateLineItems(checkoutId, updatedLineItems).then((checkout) => {
   return checkout;
  });
};
