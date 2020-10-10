import React, { useContext, useState } from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import CartContext from "../../globalState"
import Layout from "../components/Layout"
import { getCustomAttributeFromCartByVariantId, getInventoryDetails } from "../helpers"
import {
  removeLineItemsFromCart,
  updateLineItemsInCart,
} from "../../client"
import { uniqueId, delay } from "lodash"
import { getPrettyPrice, useAllProducts } from "../helpers/products";

const AddOrRemoveInventoryIcon = ({ isLoading, icon, handler }) => {
  if (isLoading) {
    return <FontAwesomeIcon icon="spinner" spin className="mx-5" />;
  }
  return <FontAwesomeIcon icon={icon} onClick={handler} className="mx-5" />;
}

const CartPage = ({
  location
}) => {
  const products = useAllProducts();
  const { cart, dispatch } = useContext(CartContext);
  const [loadingState, setLoadingState] = useState('');
  const [isUnavailable, setIsUnavailable] = useState(false);

  const removeVariant = (lineItemId, quantity, variantId) => {
    setLoadingState('decrement');
    if (quantity > 1) {
      // decrement the quantity
      return updateLineItemsInCart(cart.id, [{ id: lineItemId, quantity: quantity - 1 }])
        .then((payload) => {
          dispatch({ type: "UPDATE_CART", payload: { ...payload, variantId: variantId }, products })
          setLoadingState('');
        })
    }
    // remove the variant altogether
    return removeLineItemsFromCart(cart.id, [lineItemId])
      .then((payload) => {
        dispatch({ type: "REMOVE_FROM_CART", payload, products })
        setLoadingState('');
      })
  };

  const addVariant = async (lineItemId, quantity, variantId) => {
    setLoadingState('increment')
    const [, remainingInventory] = await getInventoryDetails(variantId, cart)
    if (remainingInventory === 0) {
      setIsUnavailable(true);
      setLoadingState('');
      delay(() => {
        setIsUnavailable(false);
      }, 2000);
      return;
    }
    return updateLineItemsInCart(cart.id, [{ id: lineItemId, quantity: quantity + 1 }])
    .then(payload => {
      dispatch({ type: "UPDATE_CART", payload: { ...payload, variantId: variantId }, products })
    })
    .then(() => {
      setLoadingState('');
    })
  };

  const goToCheckout = () => {
    setLoadingState('checkout')
  }

  return (
    <Layout pageName="order-summary" location={location} isCheckoutLoading={loadingState === 'checkout'}>
      {isUnavailable && <span>Out of stock! You got the last one! :)</span>}
      {cart.loading && <h2>Loading ... </h2>}
      {!cart.loading && (
        <ul>
          {cart.lineItems
            .filter((item) => item.variantId)
            .map(lineItem => {
              const { variantId, quantity } = lineItem;
              const { responsiveImgs } = cart.imagesByVariantId[variantId];
              const lineItemId = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'lineItemId');
              const pricePerItem = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'pricePerUnit');
              const productTitle = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'productTitle');
              const variantTitle = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'variantTitle');
              const productId = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'productId');
              const collection = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'collection');
              const handle = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'handle');
              const slug = collection.toLowerCase() === 'print'
                ? `/prints/${handle}`
                : `/originals/${handle}`;
              return (
                <li key={uniqueId('')} className="flex flex-col">
                  <FontAwesomeIcon icon='times' size="lg" className="self-end cursor-pointer" onClick={() => removeVariant(lineItemId, 0, variantId)} />
                  <Link to={slug}>
                    <Img fixed={responsiveImgs} />
                  </Link>
                  <div className="flex justify-center w-full mb-5">
                    <AddOrRemoveInventoryIcon isLoading={loadingState === 'decrement'} icon='minus-circle' handler={(e) => removeVariant(lineItemId, quantity, variantId)} />
                    <AddOrRemoveInventoryIcon isLoading={loadingState === 'increment'} icon='plus-circle' handler={(e) => addVariant(lineItemId, quantity, variantId)} />
                  </div>
                  <strong className="text-center w-full">{`${productTitle} (${variantTitle})`}</strong>
                    <span className="text-center w-full">
                      {` ${quantity}(x) at ${getPrettyPrice(pricePerItem)} each.`}
                    </span>
                </li>
              )
            })}
        </ul>
      )}
      <span className="text-center w-full">{`Total: ${cart.totalPrice ? getPrettyPrice(cart.totalPrice) : "$0.00"}`}</span>
      <span className="text-center w-full">{`Total Tax Applied: ${cart.totalTax ? getPrettyPrice(cart.totalTax) : "$0.00"}`}</span>
      <button className="border border-black p-2 my-5" onClick={goToCheckout}><a href={cart.webUrl}>Checkout</a></button>
    </Layout>
  )
}

export default CartPage
