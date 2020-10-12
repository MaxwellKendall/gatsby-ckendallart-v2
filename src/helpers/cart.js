export const totalItemsInCart = ({ lineItems }) => {
    debugger;
    return lineItems.reduce((acc, { quantity }) => {
        return acc + quantity;
    }, 0);
}