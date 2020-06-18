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

export const persistCart = gql`
  mutation persistCart(
    $id: String,
    $cartId: String,
    $lineItems:[CheckoutLineItemInput!],
    $webUrl: String,
    $totalPrice: String
  ) {
    persistCart(id: $id, cartId: $cartId, lineItems: $lineItems, webUrl: $webUrl, totalPrice: $totalPrice) @client
  }
`;
