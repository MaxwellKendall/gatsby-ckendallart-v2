import React, { useContext, useState } from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Modal from 'react-modal';

import CartContext from "../../globalState"
import Layout from "../components/Layout"
import { getCustomAttributeFromCartByVariantId, getInventoryDetails } from "../helpers"
import {
  removeLineItemsFromCart,
  updateLineItemsInCart,
} from "../../client"
import { uniqueId, delay } from "lodash"
import { getPrettyPrice, useAllProducts, getAfterPaySingleInstallment } from "../helpers/products";

const AddOrRemoveInventoryIcon = ({ isLoading, icon, handler, classNames = '' }) => {
  if (isLoading) {
    return <FontAwesomeIcon className={classNames} icon="spinner" spin style={{ color: "#cdbdbd" }} />;
  }
  return <FontAwesomeIcon className={classNames} icon={icon} onClick={handler} style={{ color: "#cdbdbd" }} />;
}

const modalStyles = {
  content: {
      display: 'flex',
      'justifyContent': 'center',
      'alignItems': 'center',
      background: 'rgba(0,0,0, 0.05)',
      height: '100%',
      width: '100%',
      border: 'none',
      top: '0',
      bottom: '0',
      right: '0',
      left: '0',
  }
};

Modal.setAppElement('#___gatsby');

const CartPage = ({
  location,
  data: {
    afterPayImg: { img: afterPayLogo },
    afterPayPopup: { img: afterPayPopup }
  }
}) => {
  const products = useAllProducts();
  const { cart, dispatch } = useContext(CartContext);
  const [loadingState, setLoadingState] = useState('');
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <Layout pageName="order-summary" location={location} isCheckoutLoading={loadingState === 'checkout'} maxWidth="72rem">
      {isUnavailable && <span>Out of stock! You got the last one! :)</span>}
      {cart.loading && <h2>Loading ... </h2>}
      {!cart.loading && cart.lineItems.length > 0 && (
        <table className="w-full sqrl-font-1 mx-5">
          <thead className="flex w-full">
            <tr className="w-full lg:w-1/2"></tr>
            <tr className="w-1/6 hidden lg:flex justify-center">
              <th className="w-full text-center tracking-wider sqrl-font-1">PRICE</th>
            </tr>
            <tr className="w-1/6 hidden lg:flex justify-center">
              <th className="w-full text-center tracking-wider sqrl-font-1">QUANTITY</th>
            </tr>
            <tr className="w-1/6 hidden lg:flex">
              <th className="w-full text-right tracking-wider sqrl-font-1">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {cart.lineItems
                .filter((item) => item.variantId && item.quantity > 0)
                .map((lineItem, i, src) => {
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
                    <tr key={uniqueId('')} className={`flex w-full py-5 border-b-2`} style={{ borderColor: "#cdbdbd" }}>
                      <td className="w-full flex flex-col items-center lg:w-1/2 lg:flex-row">
                        <>
                          <Link to={slug} className="flex">
                            <Img fixed={responsiveImgs.find(({ imgSize }) => imgSize === 'small' )} />
                          </Link>
                          <div className="flex-col-center mt-2 lg:m-0">
                            <strong className="text-center self-center w-full lg:mx-2">{variantTitle}</strong>
                            <button className="self-center cursor-pointer p-2 lg:p-5 tracking-wider sqrl-pink m-10 text-white rounded-full" onClick={() => removeVariant(lineItemId, 0, variantId)}>REMOVE</button>
                          </div>
                          <div className="flex-col-center lg:hidden">
                            <span>{`${getPrettyPrice(pricePerItem)} each.`}</span>
                            <div className="flex justify-center items-center pt-2">
                              <span>{quantity}</span>
                              <AddOrRemoveInventoryIcon classNames="ml-2" isLoading={loadingState === 'decrement'} icon='minus-circle' handler={(e) => removeVariant(lineItemId, quantity, variantId)} />
                              <AddOrRemoveInventoryIcon classNames="ml-1"  isLoading={loadingState === 'increment'} icon='plus-circle' handler={(e) => addVariant(lineItemId, quantity, variantId)} />
                            </div>
                            <span className="pt-2">{`TOTAL: ${getPriceForCartItem(pricePerItem, quantity)}`}</span>
                          </div>
                        </>
                      </td>
                      <td className="w-1/6 hidden lg:flex justify-center items-center">
                        <span className="w-full text-center tracking-wider">
                            {`${getPrettyPrice(pricePerItem)} each`}
                          </span>
                      </td>
                      <td className="w-1/6 hidden lg:flex justify-center items-center">
                        <>
                          <span className="text-lg text-center">{quantity}</span>
                          <div className="flex justify-center">
                            <AddOrRemoveInventoryIcon classNames="ml-2" isLoading={loadingState === 'decrement'} icon='minus-circle' handler={(e) => removeVariant(lineItemId, quantity, variantId)} />
                            <AddOrRemoveInventoryIcon classNames="ml-1"  isLoading={loadingState === 'increment'} icon='plus-circle' handler={(e) => addVariant(lineItemId, quantity, variantId)} />
                          </div>
                        </>
                      </td>
                      <td className="w-1/6 hidden lg:flex justify-end items-center tracking-wider">
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
          {cart.lineItems.length > 0 && (
            <>
              <span className="text-center text-2xl w-full pt-10 mr-5 lg:text-right tracking-wider">
                SUB TOTAL: {cart.totalPrice && <strong>{getPrettyPrice(cart.totalPrice)}</strong>}
              </span>
              {cart.totalPrice < 1000 && cart.totalPrice >= 35 && (
                <p className="w-full items-center justify-end pb-10 tracking-wider flex">
                    or 4 interest-free installments of <strong className="mx-1">{` ${getAfterPaySingleInstallment(cart.totalPrice)} `}</strong> by 
                    <button className="mx-1 flex-col-center" onClick={() => setIsModalOpen(true)}>
                        <Img fixed={afterPayLogo.fixed} />
                    </button>
                </p>
              )}
              {(cart.totalPrice >= 1000 || cart.totalPrice < 35) && (
                <p className="w-full items-center justify-end pb-10 tracking-wider flex">
                  Interest free installments by 
                  <button className="mx-1 flex-col-center" onClick={() => setIsModalOpen(true)}>
                      <Img fixed={afterPayLogo.fixed} />
                  </button>
                  available between <strong className="mx-1">{getPrettyPrice(35)}</strong> and <strong className="mx-1">{getPrettyPrice(1000)}</strong>.
              </p>
              )}
            </>
          )}
          {/* <span className="text-center w-full">{`Tax Applied: ${cart.totalTax ? getPrettyPrice(cart.totalTax) : "$0.00"}`}</span> */}
          <div className="w-full m-5 lg:w-3/4 xl:w-1/2 flex-col-center">
            {cart.lineItems.length > 0 &&<a className="w-full md:w-3/4 lg:w-1/2 text-center checkout-button font-bold tracking-widest p-10" href={cart.webUrl}>CHECKOUT</a>}
            <Link to="/originals/" className="w-full md:w-3/4 lg:w-1/2 text-center sqrl-purple mt-5 text-white p-10 tracking-widest">
              CONTINUE SHOPPING
            </Link>
          </div>
        </>
      )}
      <Modal onRequestClose={() => setIsModalOpen(false)} isOpen={isModalOpen} style={modalStyles}>
        <div className="w-full flex-col-center h-full" onClick={() => setIsModalOpen(false)}>
          <Img fixed={afterPayPopup.fixed} />
        </div>
      </Modal>
    </Layout>
  )
}

export default CartPage

export const query = graphql`
    query GetCart {
        afterPayImg: file(name: {eq: "afterpay"}) {
            img: childImageSharp {
                fixed(width:75) {
                    ...GatsbyImageSharpFixed
                }
            }
        }
        afterPayPopup: file(name: {eq: "afterpay-popup"}) {
            img: childImageSharp {
                fixed(width:500) {
                    ...GatsbyImageSharpFixed
                }
            }
        }
    }
`;
