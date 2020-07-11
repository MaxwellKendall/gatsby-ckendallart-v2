/* eslint-disable no-undef */
import React from 'react';
import CartContext, { useCart } from './globalState';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const Wrapper = ({ children }) => {
    const [cartState, dispatch] = useCart();
    return (
        <CartContext.Provider value={{cart: cartState, dispatch }}>
            <GoogleReCaptchaProvider
                reCaptchaKey={"6LdTV7AZAAAAAFUaM70A6L9-oMJuzQ2SklXXXUBU"}>
                {children}
            </GoogleReCaptchaProvider>
        </CartContext.Provider>
    );
}

export const wrapRootElement = ({ element }) => {
    return <Wrapper children={element} />;
};
