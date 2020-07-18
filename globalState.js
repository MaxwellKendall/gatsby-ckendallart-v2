import React, { useReducer } from 'react';
import { parseDataFromRemoteCart, parseLineItemsFromRemoteCart } from './src/helpers';

const initialState = {
    id: null,
    totalPrice: null,
    totalTax: null,
    webUrl: null,
    lineItems: [],
    imagesByVariantId: {}
};

export const reducer = (state, action) => {
    switch (action.type) {
        case 'INIT_CART': {
            return action.payload;
        };
        case 'INIT_REMOTE_CART': {
            return parseDataFromRemoteCart(action.payload, action.products)
        };
        case 'ADD_TO_CART': {
            return parseDataFromRemoteCart(action.payload, action.products);
        };
        case 'UPDATE_CART': {
            return {
                ...parseDataFromRemoteCart(action.payload, action.products),
                imagesByVariantId: state.imagesByVariantId
            };
        };
        case 'REMOVE_FROM_CART': {
            const dataForNewLineItem = parseDataFromRemoteCart(action.payload, action.products);
            return {
                ...dataForNewLineItem,
                imagesByVariantId: {
                    ...Object.keys(state.imagesByVariantId)
                        .filter((key) => key !== action.payload.variantId)
                        .reduce((acc, key) => ({ [key]: state.imagesByVariantId[key] }))
                }
            };
        };
        case 'RESET_CART': {
            return initialState;
        };
        default: {
            return state;
        }
    }
};

export const useCart = () => useReducer(reducer, initialState);

const CartContext = React.createContext({ cart: initialState, dispatch: () => {}});

export default CartContext;