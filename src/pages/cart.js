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
import { uniqueId, kebabCase, delay } from "lodash"
import { useAllProducts } from "../helpers/products";

const AddOrRemoveInventoryIcon = ({ isLoading, icon, handler }) => {
  if (isLoading) {
    return <FontAwesomeIcon icon="spinner" spin className="mx-5" />;
  }
  return <FontAwesomeIcon icon={icon} onClick={handler} className="mx-5" />;
}

const CartPage = () => {
  const products = useAllProducts();
  const { cart, dispatch } = useContext(CartContext);
  const [isIncrementLoading, setIncrementIsLoading] = useState(false)
  const [isDecrementLoading, setDecrementIsLoading] = useState(false)

  const [isUnavailable, setIsUnavailable] = useState(false);

  const removeVariant = (lineItemId, quantity, variantId) => {
    setDecrementIsLoading(true);
    if (quantity > 1) {
      // decrement the quantity
      return updateLineItemsInCart(cart.id, [{ id: lineItemId, quantity: quantity - 1 }])
        .then((payload) => {
          dispatch({ type: "UPDATE_CART", payload: { ...payload, variantId: variantId }, products })
          setDecrementIsLoading(false);
        })
    }
    // remove the variant altogether
    return removeLineItemsFromCart(cart.id, [lineItemId])
      .then((payload) => {
        dispatch({ type: "REMOVE_FROM_CART", payload, products })
        setDecrementIsLoading(false);
      })
  };

  const addVariant = async (lineItemId, quantity, variantId) => {
    setIncrementIsLoading(true)
    const [, remainingInventory] = await getInventoryDetails(variantId, cart)
    if (remainingInventory === 0) {
      setIsUnavailable(true);
      setIncrementIsLoading(false);
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
      setIncrementIsLoading(false);
    })
  };

  console.log('cart', cart);

  return (
    <Layout pageName="order-summary">
      {isUnavailable && <span>Out of stock! You got the last one! :)</span>}
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
            const handle = `${kebabCase(getCustomAttributeFromCartByVariantId([lineItem], variantId, 'collection'))}/${getCustomAttributeFromCartByVariantId([lineItem], variantId, 'handle')}`;
            return (
              <li key={uniqueId('')} className="flex flex-col">
                <FontAwesomeIcon icon='times' size="lg" className="self-end cursor-pointer" onClick={() => removeVariant(lineItemId, 0, variantId)} />
                <Link to={handle}>
                  <Img fixed={responsiveImgs} />
                </Link>
                <div className="flex justify-center w-full mb-5">
                  <AddOrRemoveInventoryIcon isLoading={isDecrementLoading} icon='minus-circle' handler={(e) => removeVariant(lineItemId, quantity, variantId)} />
                  <AddOrRemoveInventoryIcon isLoading={isIncrementLoading} icon='plus-circle' handler={(e) => addVariant(lineItemId, quantity, variantId)} />
                </div>
                <strong className="text-center w-full">{`${productTitle} (${variantTitle})`}</strong>
                  <span className="text-center w-full">
                    {` ${quantity}(x) at ${pricePerItem} each.`}
                  </span>
              </li>
            )
          })}
      </ul>
      <span className="text-center w-full">{`Total: ${cart.totalPrice ? cart.totalPrice : "$0.00"}`}</span>
      <span className="text-center w-full">{`Total Tax Applied: ${cart.totalTax ? cart.totalTax : "$0.00"}`}</span>
      <button className="border border-black p-2 my-5"><a href={cart.webUrl}>Checkout</a></button>
    </Layout>
  )
}

export default CartPage
