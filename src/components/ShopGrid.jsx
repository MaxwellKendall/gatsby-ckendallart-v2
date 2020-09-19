import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'gatsby';
import Img from 'gatsby-image';

import { getDefaultProductImage } from "../helpers/products"

export default ({
    products
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
    }, [imgRef.current])

    return (
        <ul className="flex justify-center md:justify-start align-center items-start flex-wrap">
            {products
                .map((product) => ({ ...product, img: getDefaultProductImage(product)}))
                .filter(({ img }) => img)
                .map(({ slug, img, title, variants, priceRange: { low: lowestPrice } }) => {
                    const hasVariantForSale = variants.some((({ availableForSale }) => availableForSale));
                    return (
                        <Link to={slug} className="p-5 flex flex-col items-center w-full lg:w-1/2">
                            <div className="relative">
                                <Img ref={imgRef} fixed={img} />
                                {!hasVariantForSale && (
                                    <span
                                        className="absolute top-0 mt-4 md:mt-12 text-white font-semibold text-center w-24 md:w-48 text-2xl md:text-3xl py-2 left-0 tracking-widest"
                                        style={{ backgroundColor: "#C097D0", border: "3px solid #8D647A", left: '-.5rem' }}>
                                        SOLD
                                    </span>
                                )}
                                <span
                                    className="opacity-75 font-semibold text-base md:text-xl py-5 mb-5 bottom-0 absolute flex flex-wrap items-center justify-center bg-gray-300 tracking-widest text-center w-full"
                                    style={{ ...titleDimensions, marginBottom: '7px' }}>
                                        {title.toUpperCase()}{titleDimensions.width}
                                        {variants.length > 1 && <span className="w-full text-center">from ${parseInt(lowestPrice, 10).toFixed(2)}</span>}
                                        {variants.length === 1 && <span className="w-full text-center">${parseInt(lowestPrice, 10).toFixed(2)}</span>}
                                </span>
                            </div>
                        </Link>
                    );
                })}
        </ul>
    );
}