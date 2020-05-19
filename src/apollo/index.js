import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import fetch from 'isomorphic-fetch';

const client = new ApolloClient({
  uri: `https://ckendallart.com/api/2020-04/graphql`,
  fetch,
  headers: {
    // eslint-disable-next-line
    'X-Shopify-Storefront-Access-Token': GATSBY_ACCESS_TOKEN
  }
});

const CREATE_CUSTOMER = gql`
    mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
        customer {
            id
        }
        customerUserErrors {
            code
            field
            message
        }
        }
    }
`;

export const GET_SHOP = gql`
    query {
        shop {
        name
        }
    }
`;

// export const createCustomer = (email, password) => {
//     const input = { input: { email, password } };
// };

export default client;
