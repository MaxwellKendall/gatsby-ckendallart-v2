import React, { useContext, useState, useEffect } from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import CartContext from "../../globalState"
import Layout from "../components/Layout"
import {
  getParsedVariants,
  getLineItemIdByVariantId,
  getLineItemFromVariant,
} from "../helpers"
import {
  removeFromCart,
  fetchProductInventory,
  updateExistingLineItemsInCart,
} from "../../client"

const getSelectedVariantsFromCart = (cart, products) => {
	console.log('getSelectedVariantsFromCart called');
	return products
		.filter(({ node }) => {
			return node.variants.some(variant => {
				return cart.lineItems.some(
					lineItem => lineItem.variantId === variant.id
				)
			})
		})
		.map(({ node }) => ({
			...node,
			variants: getParsedVariants(node.variants, node.title),
		}))
		.reduce((acc, product) => {
			const parsedProduct = product.variants.filter(variant =>
			cart.lineItems.some(item => item.variantId === variant.id)
			)

			return acc.concat(
				parsedProduct.map(variant => ({
					...variant,
					quantity: cart.lineItems.find(item => item.variantId === variant.id)
					.quantity,
					productTitle: product.title,
					productId: product.productId,
				}))
			)
		}, [])
}

const CartPage = ({
  data: {
    allShopifyProduct: { edges: products },
  }
}) => {
  const { cart, dispatch } = useContext(CartContext)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState(
    getSelectedVariantsFromCart(cart, products)
  );

  const updateSelectedVariants = () => {
    setSelectedVariants(getSelectedVariantsFromCart(cart, products))
  };

  useEffect(() => {
    updateSelectedVariants()
  }, [cart]);

  const removeVariant = (variantId) => {
    const lineItemId = getLineItemIdByVariantId(cart, variantId)
    return removeFromCart(cart.id, [lineItemId])
      .then(resp => {
        console.log("resp", resp)
        dispatch({ type: "REMOVE_FROM_CART", payload: resp })
      })
      .then(() => {
        updateSelectedVariants()
      })
  };

  const addVariant = async (id) => {
    setIsLoading(true)
    const variant = selectedVariants.find(variant => variant.id === id)
    const isAvailable = await fetchProductInventory(variant.productId)
    if (!isAvailable) return Promise.resolve()
    const existingLineItem = cart.lineItems.find((item) => item.variantId === id);
    const lineItemId = getLineItemIdByVariantId(cart, id);
      return updateExistingLineItemsInCart(cart.id, [{ id: lineItemId, quantity: existingLineItem.quantity++ }])
      .then(resp => {
        console.log('updateExistingLineItemsInCart', resp)
        dispatch({ type: "UPDATE_CART", payload: resp })
      })
      .then(() => {
        setIsLoading(false)
      })
      .then(() => {
        updateSelectedVariants()
      })
  };

  return (
    <Layout pageName="order-summary">
      <ul>
        {selectedVariants.map(variant => {
          return (
            <li>
              <strong>{`${variant.id}`}</strong>
              <strong>{`${variant.productTitle} (${variant.title})`}</strong>
              <span>
                {" "}
                {`${variant.quantity}(x) at $${variant.price} each.`}
              </span>
              <Img
                fluid={variant.localFile.childImageSharp.fluid}
                style={{ width: "300px" }}
              />
              <FontAwesomeIcon
                icon="minus-circle"
                onClick={e => removeVariant(variant.id)}
              />
              <FontAwesomeIcon
                icon="plus-circle"
                onClick={e => addVariant(variant.id)}
              />
            </li>
          )
        })}
      </ul>
      <span>{`Total: ${cart.totalPrice ? cart.totalPrice : "$0.00"}`}</span>
    </Layout>
  )
}

export const query = graphql`
  query OrderSummary {
    allShopifyProduct {
      edges {
        node {
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
  }
`

export default CartPage
