import React, { useState, useEffect } from 'react'
import ShopifyBuyClient from 'shopify-buy'

import Context from '~/context/StoreContext'

const shopifyBuyClient = ShopifyBuyClient.buildClient({
  // eslint-disable-next-line
  storefrontAccessToken: GATSBY_ACCESS_TOKEN,
  // eslint-disable-next-line
  domain: `${GATSBY_SHOP_NAME}.myshopify.com`,
});

const ContextProvider = ({ children }) => {
  let initialStoreState = {
    shopifyBuyClient,
    adding: false,
    checkout: { lineItems: [] },
    products: [],
    shop: {},
  }

  const [store, updateStore] = useState(initialStoreState)

  useEffect(() => {
    const initializeCheckout = async () => {
      // Check for an existing cart.
      const isBrowser = typeof window !== 'undefined'
      const existingCheckoutID = isBrowser
        ? localStorage.getItem('shopify_checkout_id')
        : null

      const setCheckoutInState = checkout => {
        if (isBrowser) {
          localStorage.setItem('shopify_checkout_id', checkout.id)
        }

        updateStore(prevState => {
          return { ...prevState, checkout }
        })
      }

      const createNewCheckout = () => store.shopifyBuyClient.checkout.create()
      const fetchCheckout = id => store.shopifyBuyClient.checkout.fetch(id)

      if (existingCheckoutID) {
        try {
          const checkout = await fetchCheckout(existingCheckoutID)
          // Make sure this cart hasn’t already been purchased.
          if (!checkout.completedAt) {
            setCheckoutInState(checkout)
            return
          }
        } catch (e) {
          localStorage.setItem('shopify_checkout_id', null)
        }
      }

      const newCheckout = await createNewCheckout()
      setCheckoutInState(newCheckout)
    }

    initializeCheckout()
  }, [store.shopifyBuyClient.checkout])

  return (
    <Context.Provider
      value={{
        store,
        addVariantToCart: (variantId, quantity) => {
          if (variantId === '' || !quantity) {
            console.error('Both a size and quantity are required.')
            return
          }

          updateStore(prevState => {
            return { ...prevState, adding: true }
          })

          const { checkout, shopifyBuyClient } = store

          const checkoutId = checkout.id
          const lineItemsToUpdate = [
            { variantId, quantity: parseInt(quantity, 10) },
          ]

          return shopifyBuyClient.checkout
            .addLineItems(checkoutId, lineItemsToUpdate)
            .then(checkout => {
              updateStore(prevState => {
                return { ...prevState, checkout, adding: false }
              })
            })
        },
        removeLineItem: (shopifyBuyClient, checkoutID, lineItemID) => {
          return shopifyBuyClient.checkout
            .removeLineItems(checkoutID, [lineItemID])
            .then(res => {
              updateStore(prevState => {
                return { ...prevState, checkout: res }
              })
            })
        },
        updateLineItem: (shopifyBuyClient, checkoutID, lineItemID, quantity) => {
          const lineItemsToUpdate = [
            { id: lineItemID, quantity: parseInt(quantity, 10) },
          ]

          return shopifyBuyClient.checkout
            .updateLineItems(checkoutID, lineItemsToUpdate)
            .then(res => {
              updateStore(prevState => {
                return { ...prevState, checkout: res }
              })
            })
        },
      }}
    >
      {children}
    </Context.Provider>
  )
}
export default ContextProvider
