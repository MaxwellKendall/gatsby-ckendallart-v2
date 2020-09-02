// https://iconmonstr.com/shopping-cart/ ICONS LOOK AMAZING

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
import { useProducts } from '../graphql';

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

export const Layout = ({
    children,
    pageName = 'default',
    classNames = '',
    flexDirection = 'column',
    maxWidth = '100rem'
}) => {
    const [userEmail, setUserEmail] = useState('');
    const [token, setToken] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState(defaultSubscribeStatus);
    const [showMobileNav,  setShowMobileNav] = useState(false);
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
            imageSharp(original: {src: {regex: "/logo/"}}) {
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

    const handleMenuToggle = () => {
        console.log('showMobileNav', showMobileNav);
        setShowMobileNav(!showMobileNav);
    };

    return (
        <div className="global-container m-auto flex justify-center flex-col min-h-full">
            <header className="p-5 md:pt-10 align-center w-full flex md:flex-col justify-center mb-12">
                <button className="m-auto pl-5 md:hidden" onClick={handleMenuToggle}>
                    {showMobileNav && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill-rule="evenodd" clip-rule="evenodd">
                            <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z"/>
                        </svg>
                    )}
                    {!showMobileNav && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill-rule="evenodd" clip-rule="evenodd">
                            <path d="M24 18v1h-24v-1h24zm0-6v1h-24v-1h24zm0-6v1h-24v-1h24z" fill="#1040e2"/>
                            <path d="M24 19h-24v-1h24v1zm0-6h-24v-1h24v1zm0-6h-24v-1h24v1z"/>
                        </svg>
                    )}
                </button>
                <Link to='/cart' className="ml-auto self-center order-2 pr-5 md:order-none md:self-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill-rule="evenodd" clip-rule="evenodd">
                        <path d="M13.5 21c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5m0-2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5m-6 2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5m0-2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5m16.5-16h-2.964l-3.642 15h-13.321l-4.073-13.003h19.522l.728-2.997h3.75v1zm-22.581 2.997l3.393 11.003h11.794l2.674-11.003h-17.861z" />
                    </svg>
                </Link>
                <Link to='/' className={`m-auto ${showMobileNav ? 'hidden' : ''}`}>
                    <h1 className="text-2xl">CLAIRE KENDALL</h1>
                </Link>
                <ul className={`${showMobileNav ? 'show-mobile-nav' : 'hide-mobile-nav'} nav w-full flex-col items-center text-center justify-center md:flex md:flex-row`}>
                    {[
                        <li className="flex items-center p-5 mt-10">
                            <FontAwesomeIcon icon="search" />
                        </li>,
                        ...pages.slice(0, 2)
                            .map((page) => (
                                <li className="p-2 mt-10">
                                    <Link to={page.link}>
                                        {page.name.toUpperCase()}
                                    </Link>
                                </li>
                            )),
                            <li className="hidden md:flex p-2 mt-10 ml-5">
                                <Link to="/">
                                    <Img fluid={logo} className="w-24 mx-auto h-12" />
                                </Link>
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
                    <div className="flex items-center justify-center w-full">
                        <label className="pr-5 leading-7 tracking-widest">be the first to know</label>
                        <input className="leading-7 border-solid border-black" type="email" name="MERGE0" value={userEmail} onChange={updateUserEmail} />
                        <button
                            disabled={subscribeStatus.subscribed}
                            type="submit"
                            className="ml-2 leading-7 px-5"
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
