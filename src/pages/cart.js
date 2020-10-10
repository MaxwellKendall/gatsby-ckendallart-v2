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

  const getPriceForCartItem = (price, quantity) => {
    const cleanPrice = typeof price === 'number'
      ? price
      : parseInt(price, 10);
    return getPrettyPrice(cleanPrice * quantity);
  };
  return (
    <Layout pageName="order-summary" location={location} isCheckoutLoading={loadingState === 'checkout'}>
      {isUnavailable && <span>Out of stock! You got the last one! :)</span>}
      {cart.loading && <h2>Loading ... </h2>}
      {!cart.loading && cart.lineItems.length > 0 && (
        <table className="w-full sqrl-font-1">
          <thead className="flex w-full">
            <tr className="w-2/5"></tr>
            <tr className="w-1/5">
              <th className="w-full text-center">Price</th>
            </tr>
            <tr className="w-1/5">
              <th className="w-full text-center">Quantity</th>
            </tr>
            <tr className="w-1/5">
              <th className="w-full text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.lineItems
                .filter((item) => item.variantId && item.quantity > 0)
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
                    <tr key={uniqueId('')} className="flex w-full py-5">
                      <td className="w-2/5 flex">
                        <>
                          <FontAwesomeIcon icon='times' size="lg" className="self-center cursor-pointer" onClick={() => removeVariant(lineItemId, 0, variantId)} />
                          <Link to={slug} className="flex">
                            <Img fixed={responsiveImgs.find(({ imgSize }) => imgSize === 'small' )} />
                            <strong className="text-center self-center">{`${productTitle} (${variantTitle})`}</strong>
                          </Link>
                        </>
                      </td>
                      <td className="w-1/5 flex justify-start items-center">
                        <span className="w-full">
                            {`${getPrettyPrice(pricePerItem)} each.`}
                          </span>
                      </td>
                      <td className="w-1/5 flex justify-start items-center">
                        <>
                          <span className="text-lg text-center">{quantity}</span>
                          <div className="flex justify-center">
                            <AddOrRemoveInventoryIcon isLoading={loadingState === 'decrement'} icon='minus-circle' handler={(e) => removeVariant(lineItemId, quantity, variantId)} />
                            <AddOrRemoveInventoryIcon isLoading={loadingState === 'increment'} icon='plus-circle' handler={(e) => addVariant(lineItemId, quantity, variantId)} />
                          </div>
                        </>
                      </td>
                      <td className="w-1/5 flex justify-end items-center">
                        <span className="text-lg text-right">{getPriceForCartItem(pricePerItem, quantity)}</span>
                      </td>
                    </tr>
                  )
            })}
          </tbody>
        </table>
      )}
      {!cart.loading && (
        <>
          {cart.lineItems.length > 0 && <span className="text-right text-2xl font-semibold w-full">{`SUB TOTAL: ${cart.totalPrice ? getPrettyPrice(cart.totalPrice) : "$0.00"}`}</span>}
          {/* <span className="text-center w-full">{`Tax Applied: ${cart.totalTax ? getPrettyPrice(cart.totalTax) : "$0.00"}`}</span> */}
          <div className="w-1/2 flex-col-center">
            {cart.lineItems.length > 0 &&<a className="w-full md:w-1/2 text-center checkout-button font-bold tracking-widest p-10" href={cart.webUrl}>CHECKOUT</a>}
            <Link to="/originals/" className="w-full md:w-1/2 text-center sqrl-purple mt-5 text-white p-10 tracking-widest">
              CONTINUE SHOPPING
            </Link>
          </div>
        </>
      )}
    </Layout>
  )
}

export default CartPage
