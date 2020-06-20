import React, { useReducer } from 'react';

const initialState = {
    cartId: null,
    lineItems: []
};

export const reducer = (state, action) => {
    switch (action.type) {
        case 'INIT_CART': {
            return {
                ...action.payload
            }
        };
        case 'ADD_TO_CART': {
            return {
                ...state,
                lineItems: state.lineItems.concat(action.payload)
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
                ...state,
                lineItems: state.lineItems.filter((item) => item.variantId !== action.payload.variantId)
            };
        };
    }
};

export const useCart = () => useReducer(reducer, initialState);

const CartContext = React.createContext({ cart: initialState, dispatch: () => {}});

export default CartContext;
