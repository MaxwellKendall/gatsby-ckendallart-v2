import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { graphql } from 'gatsby';
import Img from "gatsby-image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import CartContext from "../../globalState";
import Layout from "../components/Layout";
import { getParsedVariants, localStorageKey, getLineItemForAddToCart, isVariantInCart, getLineItemForUpdateToCart, getInventoryDetails } from '../helpers';
import { initCheckout, addLineItemsToCart, fetchProductInventory, updateLineItemsInCart } from '../../client';
import { useProducts } from '../graphql';
import { uniqueId, kebabCase, debounce } from 'lodash';

const imgBreakPointsByTShirtSize = {
    small: `(min-width: 300px) and (max-width: 767px)`,
    medium: `(min-width: 768px) and (max-width: 1199px)`,
    large: `(min-width: 1200px)`,
    hoverImg: {
        small: `(min-width: 300px) and (max-width: 767px)`,
        medium: `(min-width: 768px) and (max-width: 1199px)`,
        large: `(min-width: 1200px)  and (max-width: 1799px)`,
        xl: `(min-width: 1800px)`
    }
};

const responsiveProductImages = graphql`
    fragment responsiveProductImages on ImageSharp {
        small: fixed(width:300) {
            ...GatsbyImageSharpFixed
          }
          medium: fixed(width:500) {
            ...GatsbyImageSharpFixed
          }
          large: fixed(width:700) {
            ...GatsbyImageSharpFixed
          }
    }
`;

const getResponsiveImages = (selectedVariant, hoverImgs = false) => {
    if (!selectedVariant.localFile) return null;
    if (hoverImgs) {
        return Object.keys(selectedVariant.localFile.hoverImgs)
            .map((key) => ({
                imgSize: key,
                ...selectedVariant.localFile.hoverImgs[key],
                media: imgBreakPointsByTShirtSize.hoverImg[key]
            }));
    }
    return Object
        .keys(selectedVariant.localFile.childImageSharp)
        .map((key) => ({
            imgSize: key,
            ...selectedVariant.localFile.childImageSharp[key],
            media: imgBreakPointsByTShirtSize[key]
        }));
};

const initialDimensionsState = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
};

export default ({
    pathContext: {
        title,
        description,
        priceRange: { high, low },
    },
    data: { shopifyProduct: product },
    path
}) => {
    console.log('product', product)
    const { cart, dispatch } = useContext(CartContext);
    const products = useProducts();
    const { variants, productType } = product;
    const parsedVariants = getParsedVariants(variants, title);
    const [selectedVariant, setSelectedVariant] = useState(parsedVariants[0]);
    const [remoteInventory, setRemoteInventory] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [remainingInventory, setRemainingInventory] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showZoom, setZoom] = useState(false);
    const [hoverImageDimensions, setHoverImageDimensions] = useState(initialDimensionsState);
    const [magnifyDimensions, setMagnifyDimensions] = useState(initialDimensionsState);
    const imgRef = useRef(null);
    const magnifyImg = useRef(null);

    useEffect(() => {
        if (imgRef.current) {
            setHoverImageDimensions(imgRef.current.imageRef.current.getBoundingClientRect());
        }
    }, [imgRef.current])

    const checkInventory = useCallback(async () => {
        setIsLoading(true);
        const [
            remoteQuantity,
            remainingQuantity
        ] = await getInventoryDetails(selectedVariant.id, cart);
        setRemoteInventory(remoteQuantity);
        setRemainingInventory(remainingQuantity);
        setIsLoading(false);
    }, [selectedVariant, setRemainingInventory, setRemoteInventory, setIsLoading, cart.lineItems]);

    useEffect(() => {
        console.log('checking the inventory.... 👍👍👍👍');
        checkInventory();
    }, [checkInventory]);

    const handleSelectVariant = (e) => {
        setSelectedVariant(parsedVariants.find((node) => node.title === e.target.value));
    }

    const modifyCart = (cartId) => {
        const isExistingLineItem = isVariantInCart(cart, selectedVariant.id);
        if (isExistingLineItem) {
            const lineItemToUpdate = getLineItemForUpdateToCart(cart.lineItems, selectedVariant.id);
            return updateLineItemsInCart(cartId, [{ ...lineItemToUpdate, quantity }])
                .then((payload) => {
                    dispatch({ type: 'UPDATE_CART', payload: { ...payload, variantId: selectedVariant.id }, products });
                })
                .then(() => {
                    setIsLoading(false);
                });
        }
        return addLineItemsToCart(cartId, getLineItemForAddToCart({ ...product, selectedVariant }, quantity))
            .then((payload) => {
                dispatch({
                    type: 'ADD_TO_CART',
                    payload,
                    products: products,
                    collection: kebabCase(productType)
                });
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    const handleAddToCart = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (cart.id) {
            return modifyCart(cart.id);
        }
        return initCheckout()
            .then((resp) => {
                const timeStamp = moment.now('DD MM YYYY hh:mm:ss');
                window.localStorage.setItem(localStorageKey, JSON.stringify({'id': resp.id, timeStamp }))
                dispatch({ type: 'INIT_CART', payload: resp });
                return resp
            })
            .then((newCart) => {
                modifyCart(newCart.id)
            })
            .catch((e) => {
                console.log('error initCheckout', e);
            })
    };

    const isAddToCartDisabled = (
        isLoading ||
        remoteInventory === 0 ||
        remainingInventory === 0
    );

    const responsiveVariantImages = getResponsiveImages(selectedVariant);

    const setImgZoom = (bool = !showZoom) => {
        if (showZoom === bool) return
        setZoom(bool);
        setMagnifyDimensions({ left: 0, top: 0 });
    }

    const responsiveHoverImgs = getResponsiveImages(selectedVariant, true);
    
    const debouncedMouseHandler = debounce(({ clientY, clientX, pageY }) => {
        const {
            height: magnifyImgHeight,
            width: magnifyImgWidth
        } = magnifyImg.current.imageRef.current.getBoundingClientRect();
        const {
            top: hoverImgTop,
            width: hoverImgWidth,
            height: hoverImgHeight,
            left: hoverImgLeft
        } = hoverImageDimensions;
        const horizontalDiff = magnifyImgWidth - hoverImgWidth;
        const verticalDiff = magnifyImgHeight - hoverImgHeight;
        const horizontalMax = (horizontalDiff / magnifyImgWidth) * 100;
        const verticalMax = (verticalDiff / magnifyImgHeight) * 100;
        const horizontalPosition = ((clientX - hoverImgLeft) / magnifyImgWidth) - (horizontalDiff / magnifyImgWidth);
        const verticalPosition = (((clientY + pageY) - hoverImgTop) / magnifyImgHeight) - (verticalDiff / magnifyImgHeight);
        const horizontalPositionAsPercentage = horizontalPosition * 100;
        const verticalPositionAsPercentage = verticalPosition * 100;
        setMagnifyDimensions({
            left: horizontalPositionAsPercentage > horizontalMax ? horizontalMax : horizontalPositionAsPercentage,
            top: verticalPositionAsPercentage > verticalMax ? verticalMax : verticalPositionAsPercentage
        });
    }, 5)

    const getCursorPosition = (event) => {
        event.persist();
        debouncedMouseHandler(event);
    }

    return (
        <>
            {<p>{hoverImgDimensions}</p>}
            <Layout pageName="product-page" flexDirection="row" classNames="flex-wrap" maxWidth="100rem">
                {selectedVariant.localFile && (
                    <div className="mx-auto md:mx-5">
                        {remoteInventory === 0 && <span className="product-sold-out">Sold Out!</span>}
                        {/* <div
                            onMouseOver={() => setImgZoom(true)}
                            onMouseEnter={() => setImgZoom(true)}>
                            <Img
                                ref={imgRef}
                                className="w-full"
                                fixed={responsiveVariantImages} />
                        </div> */}
                        <div
                            className={`${showZoom ? '' : ' hidden'} hover-img absolute overflow-hidden`}
                            onMouseLeave={() => setImgZoom(false)}
                            onMouseMove={getCursorPosition}
                            onTouchMove={getCursorPosition}
                            style={{
                                width: `${hoverImageDimensions.width}px`,
                                top: `${hoverImageDimensions.top}px`,
                                height: `${hoverImageDimensions.height}px`,
                                left: `${hoverImageDimensions.left}px`
                            }}>
                            <Img
                                ref={magnifyImg}
                                className="w-full"
                                fixed={responsiveHoverImgs}
                                imgStyle={{
                                    top: `${magnifyDimensions.top > 0 ? -magnifyDimensions.top : 0}%`,
                                    left: `${magnifyDimensions.left > 0 ? -magnifyDimensions.left : 0}%`,
                                }}
                                style={{
                                    transform: 'transition all ease-in'
                                }} />
                        </div>
                    </div>
                )}
                <div className="product-desc flex flex-col items-center w-full lg:w-2/5 lg:items-start my-5 lg:justify-start lg:w-1/4 xl:w-2/5 lg:mr-5 lg:my-0">
                    <h2 className="text-4xl tracking-wide text-center lg:text-left">{title}</h2>
                    <p className="text-2xl py-10 tracking-widest">{`$${selectedVariant.price}`}</p>
                    {high !== low && <p className="text-sm italic">{`from $${low} to $${high}`}</p>}
                    <div className="actions w-full flex flex-col my-5 justify-start items-start lg:justify-start">
                        <button
                            className="border text-white border-black w-64 py-5 px-2 text-xl uppercase mb-2 self-center lg:self-start"
                            style={{ background: "#C097D0" }}
                            disabled={isAddToCartDisabled}
                            onClick={handleAddToCart}>
                            {isLoading && <FontAwesomeIcon icon="spinner" spin />}
                            {!isLoading && 'Add to Cart'}
                        </button>
                        {parsedVariants.length > 1 && (
                            <select
                                className="border border-black w-1/2"
                                name="variants"
                                onChange={handleSelectVariant}
                                value={selectedVariant.title}>
                                {parsedVariants.map((variant) => (
                                    <option key={uniqueId('')} value={variant.title}>{variant.title}</option>
                                ))}
                            </select>
                        )}
                        <p className="text-lg py-10 tracking-wide px-10 lg:px-0">{description}</p>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export const query = graphql`
    query GetProduct($id: String) {
        shopifyProduct(id: {eq: $id}) {
            id
            handle
            productId
            productType
            title
            variants {
                price
                title
                id
                sku
                localFile {
                    childImageSharp {
                        small: fixed(width:300) {
                            ...GatsbyImageSharpFixed
                          }
                        medium: fixed(width:500) {
                            ...GatsbyImageSharpFixed
                        }
                        large: fixed(width:700) {
                            ...GatsbyImageSharpFixed
                        }
                    }
                    hoverImgs: childImageSharp {
                        small: fixed(width:500) {
                            ...GatsbyImageSharpFixed
                        }
                        medium: fixed(width:1000) {
                            ...GatsbyImageSharpFixed
                        }
                    }
                }
                weight
                weightUnit
            }
        }
        productImages: allFile(filter: {parent: {id: {eq: $id}}}) {
            nodes {
              name
              base
              childImageSharp {
                fixed(width:500) {
                  ...GatsbyImageSharpFixed
                }
              }
              parent {
                id
              }
            }
        }
        productImageThumbnails: allFile(filter: {parent: {id: {eq: $id}}}) {
            nodes {
              name
              base
              childImageSharp {
                fixed(width: 300) {
                  ...GatsbyImageSharpFixed
                }
              }
              parent {
                id
              }
            }
        }
    }
`;
