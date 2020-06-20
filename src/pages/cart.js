import React, { useContext } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CartContext from "../../globalState";
import Layout from "../components/Layout";
import { getParsedVariants, getLineItemIdByVariantId } from '../helpers';
import { removeFromCart } from '../../client';

export default ({
    data: {
      allShopifyProduct: { edges: products }
    }
}) => {
  const { cart, dispatch } = useContext(CartContext);
  console.log('cart on cart page', cart);
  const selectedVariants = products
      .filter(({ node }) => {
        return node.variants
          .some((variant) => {
            return cart.lineItems.some((lineItem) => lineItem.variantId === variant.id)
          })
      })
      .map(({ node }) => ({
        ...node,
        variants: getParsedVariants(node.variants, node.title)
      }))
      .reduce((acc, product) => {
        const parsedProduct = product
          .variants
          .filter((variant) => cart.lineItems.some((item) => item.variantId === variant.id))

        return acc.concat(
          parsedProduct.map((variant) => ({
            ...variant,
            quantity: cart.lineItems.find((item) => item.variantId === variant.id).quantity,
            productTitle: product.title
          })))
      }, []);

  const removeVariant = (id) => {
    const lineItemId = getLineItemIdByVariantId(cart, id);
    removeFromCart(cart.id, [lineItemId])
      .then((resp) => {
        console.log('resp', resp)
        dispatch({ type: 'REMOVE_FROM_CART', payload: resp })
      });
  };

  return (
    <Layout pageName='order-summary'>
      <ul>
        {selectedVariants.map((variant) => {
          return (
            <li>
              <strong>{`${variant.id}`}</strong>
              <strong>{`${variant.productTitle} (${variant.title})`}</strong>
              <span> {`${variant.quantity}(x) at $${variant.price} each.`}</span>
              <Img fluid={variant.localFile.childImageSharp.fluid} style={{ width: '300px' }} />
              <FontAwesomeIcon icon="minus-circle" onClick={() => removeVariant(variant.id)} />
            </li>
          );
        })}
      </ul>
      <span>{`Total: ${cart.totalPrice}`}</span>
    </Layout>
  );
}

export const query = graphql`
  query OrderSummary {
    allShopifyProduct {
      edges {
        node {
          title
          productType
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
`;
