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
            console.log('action', action)
            return parseDataFromRemoteCart(action.payload, action.products)
        };
        case 'ADD_TO_CART': {
            const dataForNewLineItem = parseDataFromRemoteCart(action.payload, action.products);
            return {
                ...dataForNewLineItem,
                imagesByVariantId: {
                    ...state.imagesByVariantId,
                    ...dataForNewLineItem.imagesByVariantId
                },
                lineItems: parseLineItemsFromRemoteCart(action.payload, [{
                    key: 'collection',
                    value: action.collection
                }])
            };
        };
        case 'UPDATE_CART': {
            console.log('action.payload for remove from cart', action.payload)
            const dataForNewLineItem = parseDataFromRemoteCart(action.payload, action.products);
            return {
                ...dataForNewLineItem,
                imagesByVariantId: state.imagesByVariantId,
                lineItems: state.lineItems
                    .map((item) => {
                        if (item.variantId === action.payload.variantId) {
                            return parseLineItemsFromRemoteCart(action.payload)[0];
                        }
                        return item
                    })
            };
        };
        case 'REMOVE_FROM_CART': {
            console.log('action.payload for remove from cart', action.payload)
            const dataForNewLineItem = parseDataFromRemoteCart(action.payload, action.products);
            return {
                ...dataForNewLineItem,
                imagesByVariantId: {
                    ...Object.keys(state.imagesByVariantId)
                        .filter((key) => key !== action.payload.variantId)
                        .reduce((acc, key) => ({ [key]: state.imagesByVariantId[key] }))
                },
                lineItems: parseLineItemsFromRemoteCart(action.payload)
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
