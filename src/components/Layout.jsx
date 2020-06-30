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
    useEffect(() => {
        const existingCart = JSON.parse(window.localStorage.getItem(localStorageKey));
        if (existingCart && !cart.id) {
            const ageOfCart = moment.duration(moment().diff(moment(existingCart.timeStamp))).asHours();
            const isCartExpired = ageOfCart > 23.9;
            if (isCartExpired) {
                window.localStorage.removeItem(localStorageKey);
            }
            else {
                fetchCart(existingCart.id)
                    .then((resp) => {
                        dispatch({ type: 'INIT_REMOTE_CART', payload: resp })
                    })
            }
        }
    }, []);
    return (
        <div className="global-container max-w-3xl m-auto flex justify-center flex-col min-h-full">
            <header className="py-10 px-5 align-center w-full flex justify-center">
                <h1 className="text-2xl">Claire Kendall Art</h1>
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