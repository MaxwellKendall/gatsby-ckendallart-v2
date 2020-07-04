import React, { useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCopyright,
    faShoppingCart,
    faSpinner,
    faMinusCircle,
    faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import { Link } from 'gatsby';
import moment from 'moment';

import CartContext from "../../globalState";
import { localStorageKey } from '../helpers';
import { fetchCart } from '../../client';
import { useProducts } from '../graphql';

library.add(
    faCopyright,
    faShoppingCart,
    faSpinner,
    faMinusCircle,
    faPlusCircle
);

const isSSR = typeof window === 'undefined';

require('../../styles/index.scss');

export default ({ children, pageName = 'default' }) => {
    const { cart, dispatch } = useContext(CartContext);
    const products = useProducts();
;    useEffect(() => {
        const cartFromStorage = JSON.parse(window.localStorage.getItem(localStorageKey));
        if (cartFromStorage && !cart.id) {
            const ageOfCart = moment.duration(moment().diff(moment(cartFromStorage.timeStamp))).asHours();
            const isCartExpired = ageOfCart > 23.9;
            if (isCartExpired) {
                window.localStorage.removeItem(localStorageKey);
            }
            else {
                fetchCart(cartFromStorage.id)
                    .then((payload) => {
                        dispatch({ type: 'INIT_REMOTE_CART', payload, products })
                    })
            }
        }
        else if (!cartFromStorage && cart.id) {
            dispatch({ 'type': 'RESET_CART' });
        }
    }, []);

    return (
        <div className="global-container max-w-3xl m-auto flex justify-center flex-col min-h-full">
            <header className="py-10 px-5 align-center w-full flex justify-center">
                <Link to='/'>
                    <h1 className="text-2xl">Claire Kendall Art</h1>
                </Link>
                <Link to='/cart'>
                    <FontAwesomeIcon className="ml-auto" icon="shopping-cart" />
                </Link>
            </header>
            <main className={`${pageName} flex flex-col h-full flex-grow px-10`}>
                {children}
            </main>
            <footer className='flex-shrink-0 p-5 text-center'>
                {`Claire Kendall Art, ${new Date().getFullYear()}`}
                <FontAwesomeIcon className="ml-2" icon={['fas', 'copyright']}  />
            </footer>
        </div>
    );
};