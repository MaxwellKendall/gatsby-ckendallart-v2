// https://iconmonstr.com/shopping-cart/ ICONS LOOK AMAZING

/* eslint-disable no-undef */
import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCopyright,
    faShoppingCart,
    faSpinner,
    faMinusCircle,
    faPlusCircle,
    faTimes,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'
import moment from 'moment';
import { delay } from 'lodash';

import CartContext from "../../globalState";
import { localStorageKey } from '../helpers';
import { fetchCart, subscribeToEmail, verifyCaptcha } from '../../client';
import { useProducts } from '../graphql';
import Nav from "./Nav";
import MobileNav from "./MobileNav";

library.add(
    faCopyright,
    faShoppingCart,
    faSpinner,
    faMinusCircle,
    faPlusCircle,
    faTimes,
    faSearch
);

require('../../styles/index.scss');

const defaultSubscribeStatus = {
    isLoading: false,
    subscribed: false,
    emailAddress: '',
    showConfirmation: false,
    showError: false,
    status: 'subscribed'
};

let confirmationToast;
// show toast for 2s
const toastDelay = 5000;

export const Layout = ({
    children,
    pageName = 'default',
    classNames = '',
    flexDirection = 'column',
    maxWidth = '100rem'
}) => {
    const products = useProducts();
    const [userEmail, setUserEmail] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState(defaultSubscribeStatus);
    const { cart, dispatch } = useContext(CartContext);

    useEffect(() => {
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

        return () => window.clearTimeout(confirmationToast)
    }, []);

    const updateUserEmail = (e) => {
        if (subscribeStatus.subscribed) {
            setSubscribeStatus({ ...subscribeStatus, subscribed: false });
        }
        setUserEmail(e.target.value);
    };

    const handleSubscribe = (status = 'subscribed') => {
        setSubscribeStatus({ isLoading: true, alreadyExists: false });
        return subscribeToEmail(userEmail, status)
            .then((data) => {
                if (data.title === 'Member Exists') {
                    throw(data);
                }
                setSubscribeStatus({
                    ...defaultSubscribeStatus,
                    showConfirmation: true,
                    subscribed: true,
                    emailAddress: data.email_address,
                    status
                })
                confirmationToast = delay(() => {
                    setSubscribeStatus({
                        ...subscribeStatus,
                        showConfirmation: false,
                        showError: false
                    })
                }, toastDelay);
            })
            .catch((e) => {
                console.log('e', e);
                if (e.title === 'Member Exists') {
                    setSubscribeStatus({
                        subscribed: true,
                        isLoading: false,
                        subscribed: true,
                        showError: true,
                        emailAddress: e.detail.split(' ')[0]
                    });
                    console.log('hello?');
                    confirmationToast = delay(() => {
                        console.log('yooo');
                        setSubscribeStatus({
                            ...subscribeStatus,
                            showConfirmation: false,
                            showError: false
                        });
                    }, toastDelay);
                }
                else {
                    setSubscribeStatus(defaultSubscribeStatus)
                }
            })
    };


    const handleSubmit = async (e) => {
        setSubscribeStatus({ ...subscribeStatus, isLoading: true });
        window.grecaptcha.ready(() => {
            window.grecaptcha.execute(GATSBY_SITE_KEY, { action: 'submit' })
                .then((token) => {
                    return verifyCaptcha(token)                    
                })
                .then((data) => {
                    if (data.success) {
                        handleSubscribe();
                    }
                    else if (!data.success) {
                        handleSubscribe('pending')
                    }
                })
        })
    };

    return (
        <div className="global-container m-auto flex justify-center flex-col min-h-full">
            <MobileNav />
            <Nav />
            <main
                style={{ maxWidth }}
                className={`default-page ${pageName} flex flex-wrap flex-${flexDirection} w-full h-full self-center justify-center flex-grow ${classNames}`}>
                {children}
            </main>
            <footer className='flex-shrink-0 p-5 text-center'>
                {subscribeStatus.showError && (
                    <p>Hey, {subscribeStatus.emailAddress} is already subscribed!</p>
                )}
                {subscribeStatus.showConfirmation && subscribeStatus.status === 'subscribed' && (
                    <p>Hey, {subscribeStatus.emailAddress} welcome to the family!</p>
                )}
                {subscribeStatus.showConfirmation && subscribeStatus.status === 'pending' && (
                    <>
                        <p>Hey, {subscribeStatus.emailAddress} welcome to the family!</p>
                        <strong>Please respond to our confirmation email and we'll keep you updated!</strong>
                    </>
                )}
                <>
                    <input type="hidden" name="u" value="ab3ec7367aea68f258236a7f3" />
                    <input type="hidden" name="id" value="2e064274d9" />
                    <div className="flex flex-col md:flex-row  items-center justify-center w-full">
                        <label className="pr-5 leading-7 tracking-widest">be the first to know</label>
                        <input className="leading-7 w-full px-10 md:px-0 md:w-auto border-solid border-black" type="email" name="MERGE0" value={userEmail} onChange={updateUserEmail} />
                        <button
                            disabled={subscribeStatus.subscribed}
                            type="submit"
                            className="leading-7 w-full px-10 md:px-5 md:w-auto md:ml-2"
                            onClick={handleSubmit}>
                            {subscribeStatus.isLoading && (
                                <FontAwesomeIcon className="ml-2" icon={['fas', 'spinner']} spin />
                            )}
                            {!subscribeStatus.isLoading && !subscribeStatus.subscribed && (
                                'SUBSCRIBE'
                            )}
                            {!subscribeStatus.isLoading && subscribeStatus.subscribed && (
                                'SUBSCRIBED' 
                            )}                        
                        </button>
                    </div>
                    <div className="text-xs mt-48">
                        <p>
                            {`Claire Kendall Art, ${new Date().getFullYear()}`}
                            <FontAwesomeIcon className="ml-2" icon={['fas', 'copyright']} />
                        </p>
                        <p>
                            This site is protected by reCAPTCHA and the Google
                            <a href="https://policies.google.com/privacy"> Privacy Policy </a>
                            and
                            <a href="https://policies.google.com/terms"> Terms of Service </a>
                            apply.
                        </p>
                        <span className="text-xs mt-5">{`Website Built w <3 by tKlBoI LLC`}</span>
                    </div>
                </>
            </footer>
        </div>
    );
};

Layout.displayName = "Layout";

export default Layout;
