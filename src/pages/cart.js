import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { useMutation, useQuery } from "@apollo/client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from "../components/Layout";
import { createCheckout, applyDiscountCode, checkInventory, modifyCheckout } from "../../graphql";
import { getCart, setCart } from '../../localState';
import { getParsedVariants } from '../helpers';

export default ({
    data: {
      allShopifyProduct: { edges: products }
    }
}) => {
  const { data: { checkout: cart } } = useQuery(getCart);
  const selectedProducts = products
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

        return acc.concat(parsedProduct.map((variant) => ({ ...variant, productTitle: product.title })))
      }, []);

  return (
    <Layout pageName='order-summary'>
      <ul>
        {selectedProducts.map((product) => {
          return (
            <li>
              {`${product.productTitle} (${product.title})`}
            </li>
          );
        })}
      </ul>
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
                fixed {
                  base64
                }
              }
            }
          }
        }
      }
    }
  }
`;
