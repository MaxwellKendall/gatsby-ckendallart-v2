import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright, faShoppingCart, faSpinner, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import { Link } from 'gatsby';
import { useMutation, useQuery } from "@apollo/client";

import {
    getCheckoutIdFromLocalStorage,
    parseRemoteCartLineItems
} from '../helpers';
import { getCheckoutById } from "../../graphql";
import {
    persistCart
} from '../../localState';

library.add(
    faCopyright,
    faShoppingCart,
    faSpinner,
    faMinusCircle
);

const isSSR = typeof window === 'undefined';

require('../../styles/index.scss');

export default ({ children, pageName = 'default' }) => {
    const [setCart] = useMutation(persistCart);
    // using data truthy/falsy state for loading until this bug is fixed: https://github.com/apollographql/apollo-client/issues/6334#issuecomment-638981822
    const { data: existingCart, error: isFetchExistingCartErrored, loading } = useQuery(getCheckoutById, {
        onCompleted: ({ node: remoteCart}) => {
            // set cart to whatever the remote cart is.
            setCart({
                variables: {
                    id: '1',
                    cartId: remoteCart.id,
                    lineItems: remoteCart.lineItems.edges.map(parseRemoteCartLineItems),
                    totalPrice: remoteCart.totalPriceV2.amount,
                    webUrl: remoteCart.webUrl
                }
            })
        },
        variables: {
            id: isSSR ? null : getCheckoutIdFromLocalStorage(window)
        }
    });

    const showLoading = (
        !isFetchExistingCartErrored ||
        !existingCart
    );
        
    // console.log('testteest', isFetchExistingCartErrored, existingCart, loading)
    return (
        <div className="global-container max-w-3xl m-auto flex justify-center flex-col min-h-full">
            <header className="py-10 px-5 align-center w-full flex justify-center">
                <h1 className="text-2xl">Claire Kendall Art</h1>
                <Link to='/cart'>
                    <FontAwesomeIcon className="ml-auto" icon="shopping-cart" />
                </Link>
            </header>
            <main className={`${pageName} flex flex-col h-full flex-grow px-10`}>
                {/* {showLoading && <FontAwesomeIcon icon="spinner" spin size="6x" />}
                {!showLoading && children} */}
                {children}
            </main>
            <footer className='flex-shrink-0 p-5 text-center'>
                {`Claire Kendall Art, ${new Date().getFullYear()}`}
                <FontAwesomeIcon className="ml-2" icon={['fas', 'copyright']}  />
            </footer>
        </div>
    );
};