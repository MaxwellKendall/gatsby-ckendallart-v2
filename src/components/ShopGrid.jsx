import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'gatsby';
import { kebabCase } from 'lodash';

import { getDefaultProductImage, getPrettyPrice } from "../helpers/products"
import Img from './Img';

const defaultSort = ({ variants: variantsA, priceRange: { low: lowestPriceA } }, { variants: variantsB, priceRange: { low: lowestPriceB } }) => {
    const a = variantsA.some((({ availableForSale }) => availableForSale));
    const b = variantsB.some((({ availableForSale }) => availableForSale));
    if (a && !b) return -1;
    if (!a && b) return 1;
    if (parseInt(lowestPriceB, 10) > parseInt(lowestPriceA, 10)) return -1;
    if (parseInt(lowestPriceA, 10) > parseInt(lowestPriceB, 10)) return 1;
    return 0;
};

export default ({
    products,
    sortFn = defaultSort,
    ctx = "forSale"
}) => {
    const imgRef = useRef(null);
    const [titleDimensions, setTitleDimensions] = useState({ width: 300 });

    const handleResize = () => {
        if (imgRef.current.imageRef && imgRef.current.imageRef.current) {
            const { width } = imgRef.current.imageRef.current.getBoundingClientRect();
            setTitleDimensions({ width });
        }
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        handleResize();
    }, [imgRef.current]);

    const sortedProducts = products
        .sort(sortFn);

    return (
        <>
            <ul className="flex flex-col w-full lg:w-1/2">
                {sortedProducts
                    .filter((_, i) => i % 2 === 0)
                    .map((product) => ({ ...product, img: getDefaultProductImage(product)}))
                    .filter(({ img }) => img)
                    .map(({ slug, img, title, variants, priceRange: { low: lowestPrice } }) => {
                        const hasVariantForSale = variants.some((({ availableForSale }) => availableForSale));
                        return (
                            <li className="my-2 mx-4">
                                <Link to={slug} className="grid-product-img flex flex-col items-end w-full">
                                    <div className="relative">
                                        <Img imgRef={imgRef} responsiveImgs={img} imgName={kebabCase(title)} />
                                        {!hasVariantForSale && ctx === "forSale" && (
                                            <span
                                                className="absolute top-0 mt-4 md:mt-12 text-white font-semibold text-center w-24 md:w-40 text-2xl md:text-3xl py-2 left-0 tracking-widest"
                                                style={{ backgroundColor: "#C097D0", border: "3px solid #8D647A", left: '-.5rem' }}>
                                                SOLD
                                            </span>
                                        )}
                                        <span
                                            className="hidden md:flex opacity-0 product-info font-semibold text-base md:text-xl py-5 mb-5 bottom-0 absolute flex-wrap items-center justify-center bg-gray-300 tracking-widest text-center w-full"
                                            style={{ ...titleDimensions, marginBottom: '7px' }}>
                                                {title.toUpperCase()}
                                                {hasVariantForSale && variants.length > 1 && <span className="w-full text-center">from {getPrettyPrice(lowestPrice)}</span>}
                                                {hasVariantForSale && variants.length === 1 && <span className="w-full text-center">{getPrettyPrice(lowestPrice)}</span>}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
            </ul>
            <ul className="flex flex-col w-full lg:w-1/2">
                {sortedProducts
                    .filter((_, i) => i % 2 !== 0)
                    .map((product) => ({ ...product, img: getDefaultProductImage(product)}))
                    .filter(({ img }) => img)
                    .map(({ slug, img, title, variants, priceRange: { low: lowestPrice } }) => {
                        const hasVariantForSale = variants.some((({ availableForSale }) => availableForSale));
                        return (
                            <li className="my-2 mx-4">
                                <Link to={slug} className="grid-product-img flex flex-col items-start w-full">
                                    <div className="relative">
                                        <Img imgRef={imgRef} responsiveImgs={img} imgName={kebabCase(title)} />
                                        {!hasVariantForSale && ctx === "forSale" && (
                                            <span
                                                className="absolute top-0 mt-4 md:mt-12 text-white font-semibold text-center w-24 md:w-40 text-2xl md:text-3xl py-2 left-0 tracking-widest"
                                                style={{ backgroundColor: "#C097D0", border: "3px solid #8D647A", left: '-.5rem' }}>
                                                SOLD
                                            </span>
                                        )}
                                        <span
                                            className="hidden md:flex opacity-0 product-info font-semibold text-base md:text-xl py-5 mb-5 bottom-0 absolute flex-wrap items-center justify-center bg-gray-300 tracking-widest text-center w-full"
                                            style={{ ...titleDimensions, marginBottom: '7px' }}>
                                                {title.toUpperCase()}
                                                {hasVariantForSale && variants.length > 1 && <span className="w-full text-center">from {getPrettyPrice(lowestPrice)}</span>}
                                                {hasVariantForSale && variants.length === 1 && <span className="w-full text-center">{getPrettyPrice(lowestPrice)}</span>}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
            </ul>
        </>
    );
}