/* eslint-disable no-undef */
import React from 'react';
import { Helmet } from 'react-helmet';
import CartContext, { useCart } from './globalState';

const Wrapper = ({ children }) => {
    const [cartState, dispatch] = useCart();
    return (
        <>
            <Helmet>
                <script src={`https://www.google.com/recaptcha/api.js?render=${GATSBY_SITE_KEY}`}></script>
            </Helmet>
            <CartContext.Provider value={{cart: cartState, dispatch }}>
                {children}
            </CartContext.Provider>
        </>
    );
};

export const wrapRootElement = ({ element }) => {
    return <Wrapper children={element} />;
};
