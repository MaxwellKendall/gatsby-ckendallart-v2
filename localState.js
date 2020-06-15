import { gql } from '@apollo/client';

export const getCart = gql`
  query GetCart {
    checkout @client {
      id
      cartId
      lineItems
      webUrl
      totalPrice
    }
  } 
`;

export const setCart = gql`
  mutation setCart(
    $id: String,
    $cartId: String,
    $lineItems:[CheckoutLineItemInput!],
    $webUrl: String,
    $totalPrice: String
  ) {
    setCart(id: $id, cartId: $cartId, lineItems: $lineItems, webUrl: $webUrl, totalPrice: $totalPrice) @client
  }
`;
