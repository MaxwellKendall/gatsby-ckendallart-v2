import React, { useReducer } from 'react';

import { parseLineItemsFromCheckout } from './src/helpers';

const initialState = {
    id: null,
    lineItems: []
};

export const reducer = (state, action) => {
    switch (action.type) {
        case 'INIT_CART': {
            return action.payload;
        };
        case 'INIT_REMOTE_CART': {
            return {
                ...action.payload,
                lineItems: parseLineItemsFromCheckout(action.payload)
            };
        };
        case 'ADD_TO_CART': {
            return {
                ...action.payload,
                lineItems: state.lineItems.concat(parseLineItemsFromCheckout(action.payload))
            };
        };
        case 'UPDATE_CART': {
            return {
                ...state,
                lineItems: state.lineItems
                    .map((item) => {
                        if (item.variantId === action.payload.variantId) {
                            return action.payload;
                        }
                        return item
                    })
            };
        };
        case 'REMOVE_FROM_CART': {
            return {
                ...action.payload,
                lineItems: parseLineItemsFromCheckout(action.payload)
            };
        };
    }
};

export const useCart = () => useReducer(reducer, initialState);

const CartContext = React.createContext({ cart: initialState, dispatch: () => {}});

export default CartContext;
