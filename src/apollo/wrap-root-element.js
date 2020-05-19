import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import client from './index';
import CheckoutProvider from '../provider/ContextProvider';

export const wrapRootElement = ({ element }) => (
    <ApolloProvider client={client}>
        <CheckoutProvider>
            {element}
        </CheckoutProvider>
    </ApolloProvider>
);
