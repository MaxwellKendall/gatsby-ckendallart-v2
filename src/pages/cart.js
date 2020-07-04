import React, { useContext, useState } from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import CartContext from "../../globalState"
import Layout from "../components/Layout"
import { getCustomAttributeFromCartByVariantId } from "../helpers"
import {
  removeLineItemsFromCart,
  fetchProductInventory,
  updateLineItemsInCart,
} from "../../client"
import { debounce, uniqueId, kebabCase } from "lodash"
import { useProducts } from "../graphql"

const AddOrRemoveInventoryIcon = ({ isLoading, icon, handler }) => {
  if (isLoading) {
    return <FontAwesomeIcon icon="spinner" spin />;
  }
  return <FontAwesomeIcon icon={icon} onClick={handler} />;
}

const CartPage = ({
  data: {
    allShopifyProduct: { nodes }
  }
}) => {
  const products = useProducts();
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

  const addVariant = async (lineItemId, productId, quantity, variantId) => {
    setIncrementIsLoading(true)
    const isAvailable = await fetchProductInventory(productId)
    if (!isAvailable) {
      setIsUnavailable(true);
      debounce(() => setIsUnavailable(false), 2000);
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

  return (
    <Layout pageName="order-summary">
      {isUnavailable && <span>Out of stock! You got the last one! :)</span>}
      <ul>
        {cart.lineItems
          .filter((item) => item.variantId)
          .map(lineItem => {
            const { variantId, quantity } = lineItem;
            const image = cart.imagesByVariantId[variantId];
            const lineItemId = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'lineItemId');
            const pricePerItem = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'pricePerUnit');
            const productTitle = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'productTitle');
            const variantTitle = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'variantTitle');
            const productId = getCustomAttributeFromCartByVariantId([lineItem], variantId, 'productId');
            const handle = `${kebabCase(getCustomAttributeFromCartByVariantId([lineItem], variantId, 'collection'))}/${getCustomAttributeFromCartByVariantId([lineItem], variantId, 'handle')}`;
            return (
              <li key={uniqueId('')}>
                <Link to={handle}>
                  <Img
                    fluid={image}
                    style={{ width: "300px" }} />
                  <strong>{`${productTitle} (${variantTitle})`}</strong>
                  <span>
                    {` ${quantity}(x) at ${pricePerItem} each.`}
                  </span>
                </Link>
                <AddOrRemoveInventoryIcon isLoading={isDecrementLoading} icon='minus-circle' handler={(e) => removeVariant(lineItemId, quantity, variantId)} />
                <AddOrRemoveInventoryIcon isLoading={isIncrementLoading} icon='plus-circle' handler={(e) => addVariant(lineItemId, productId, quantity, variantId)} />
              </li>
            )
          })}
      </ul>
      <span>{`Total: ${cart.totalPrice ? cart.totalPrice : "$0.00"}`}</span>
      <span>{`Total Tax Applied: ${cart.totalTax ? cart.totalTax : "$0.00"}`}</span>
      <button><a href={cart.webUrl}>Checkout</a></button>
    </Layout>
  )
}

export const query = graphql`
  query OrderSummary {
    allShopifyProduct {
      nodes {
        title
        productType
        productId
        variants {
          price
          title
          id
          localFile {
            childImageSharp {
              fluid(maxWidth: 300) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`

export default CartPage
