/* eslint-disable no-undef */
import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Img from "gatsby-image";
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
import { Link, useStaticQuery, graphql } from 'gatsby';
import moment from 'moment';
import { delay } from 'lodash';

import CartContext from "../../globalState";
import { localStorageKey } from '../helpers';
import { fetchCart, subscribeToEmail, verifyCaptcha } from '../../client';
import { useProducts, usePages, useNavigation } from '../graphql';

library.add(
    faCopyright,
    faShoppingCart,
    faSpinner,
    faMinusCircle,
    faPlusCircle,
    faTimes,
    faSearch
);

const isSSR = typeof window === 'undefined';

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

export const Layout = ({ children, pageName = 'default' }) => {
    const [userEmail, setUserEmail] = useState('');
    const [token, setToken] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState(defaultSubscribeStatus);
    const { cart, dispatch } = useContext(CartContext);
    const products = useProducts();
    const {
        site: { siteMetadata: { pages } },
        imageSharp: { fluid: logo }
    } = useStaticQuery(graphql`
        query getPages {
            site {
                siteMetadata {
                    pages {
                        name
                        link
                    }
                }
            }
            imageSharp(id: {eq: "cfb82677-496a-5987-8a95-22d7dc5de000"}) {
                fluid(maxWidth: 300) {
                    ...GatsbyImageSharpFluid
                }
            }
        }
    `);

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
            <header className="py-10 px-5 align-center w-full flex flex-col justify-center">
                <Link to='/cart' className="ml-auto self-start">
                    <FontAwesomeIcon icon="shopping-cart" />
                </Link>
                <Link to='/' className="m-auto">
                    <h1 className="text-2xl">CLAIRE KENDALL</h1>
                </Link>
                <ul className="flex align-center justify-center">
                    {[
                        <li className="p-5 mt-10">
                            <FontAwesomeIcon icon="search" />
                        </li>,
                        ...pages.slice(0, 2)
                            .map((page) => (
                                <li className="p-5 mt-10">
                                    <Link to={page.link}>
                                        {page.name.toUpperCase()}
                                    </Link>
                                </li>
                            )),
                            <li className="p-5 my-8">
                                <Img fluid={logo} className="w-40 h-12" />
                            </li>,
                        ...pages.slice(2, 4)
                            .map((page) => (
                                <li className="p-5 mt-10">
                                    <Link to={page.link}>
                                        {page.name.toUpperCase()}
                                    </Link>
                                </li>
                            ))
                    ]}
                </ul>
            </header>
            <main className={`${pageName} flex flex-col h-full self-center flex-grow px-10 max-w-3xl`}>
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
                    <input className="py-2 border border-black-500" type="email" name="MERGE0" value={userEmail} onChange={updateUserEmail} />
                    <button
                        disabled={subscribeStatus.subscribed}
                        type="submit"
                        className="border border-black-500 py-2 px-5"
                        onClick={handleSubmit}>
                        {subscribeStatus.isLoading && (
                            <FontAwesomeIcon className="ml-2" icon={['fas', 'spinner']} spin />
                        )}
                        {!subscribeStatus.isLoading && !subscribeStatus.subscribed && (
                            'Subscribe'
                        )}
                        {!subscribeStatus.isLoading && subscribeStatus.subscribed && (
                            'Subscribed' 
                        )}                        
                    </button>
                    {`Claire Kendall Art, ${new Date().getFullYear()}`}
                    <FontAwesomeIcon className="ml-2" icon={['fas', 'copyright']} />
                    <p className="pt-10">
                        This site is protected by reCAPTCHA and the Google
                        <a href="https://policies.google.com/privacy"> Privacy Policy </a>
                        and
                        <a href="https://policies.google.com/terms"> Terms of Service </a>
                        apply.
                    </p>
                </>
            </footer>
        </div>
    );
};

Layout.displayName = "Layout";

export default Layout;
