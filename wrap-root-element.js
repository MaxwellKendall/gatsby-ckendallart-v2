import React from 'react';
// import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloProvider } from '@apollo/client';

import { client } from './graphql';

export const wrapRootElement = ({ element }) => (
    <ApolloProvider connectToDevTools={true} client={client}>
        {element}
    </ApolloProvider>
);