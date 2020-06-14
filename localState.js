import { gql } from '@apollo/client';

export const getCart = gql`
  query GetCart {
    checkout @client {
      id
      cartId
    }
  } 
`;

export const setCart = gql`
  mutation setCart($id: String, $cartId: String) {
    setCart(id: $id, cartId: $cartId) @client
  }
`;
