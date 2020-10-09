import React, { useState, useRef, useEffect } from 'react';
import Img from "gatsby-image";
import { graphql } from 'gatsby';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, WithStore } from 'pure-react-carousel';

import { getResponsiveImages, getServerSideMediaQueries } from '../helpers/img';
import Layout from '../components/Layout';
import CommissionForm from '../components/CommissionForm';
import { kebabCase } from 'lodash';

const getActiveImgDimensions = (commissions, activeIndex) => {
    const { ref } = commissions[activeIndex];
    console.log('ref', ref,  activeIndex);
    if (ref.current && ref.current.imageRef.current) {
        const { width, height } = ref.current.imageRef.current.getBoundingClientRect();
        console.log('dimensions', width, height);
        return {
            width: `${width}px`,
            // height: `${height}px`
        };
    }
    return {};
};

const CarouselContainer = ({ slide, onSlideChange }) => {
    useEffect(() => {
        console.log('slide', slide);
        onSlideChange(slide);
    }, [slide]);

    return null;
}

const CarouselHOC = WithStore(CarouselContainer, (state) => ({ slide: state.currentSlide }));

export default ({
    data: {
        commissions: {
            nodes: commissions
        }
    }
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [imgDimensions, setImgDimensions] = useState({});
    const commissionsWithRef = commissions.map((obj) => ({ ...obj, ref: useRef() }));

    useEffect(() => {
        setImgDimensions(getActiveImgDimensions(commissionsWithRef, activeSlideIndex));
    }, [commissionsWithRef[0].ref.current]);

    useEffect(() => {
        setImgDimensions(getActiveImgDimensions(commissionsWithRef, activeSlideIndex));
    }, [activeSlideIndex])

    return (
        <Layout>
            <h2 className="w-full text-center tracking-widest text-3xl pt-12 md:pt-0 pb-12">YOUR DREAM CONCEPT MADE REALITY.</h2>
            <div className="w-full">
                <CarouselProvider
                    className="w-full flex justify-center items-center"
                    naturalSlideWidth={700}
                    naturalSlideHeight={700}
                    totalSlides={commissions.length}>
                    <>
                        <CarouselHOC onSlideChange={setActiveSlideIndex} />
                        <Slider
                            className="order-2 w-full my-auto"
                            style={imgDimensions}>
                            {commissionsWithRef
                                .map(({ title, variants, ref }, i) => {
                                    const imgs = getResponsiveImages(variants[0]).responsiveImgs;
                                    const cssSelector = `.${kebabCase(title)}, .${kebabCase(title)} img`;
                                    return (
                                        <Slide index={i}>
                                            <div className="flex h-full">
                                                <style>{getServerSideMediaQueries(imgs, cssSelector)}</style>
                                                <Img
                                                    className={kebabCase(title)}
                                                    ref={ref}
                                                    fixed={imgs}
                                                    style={{ margin: 'auto', display: 'flex', alignSelf: 'center' }} />
                                            </div>
                                        </Slide>
                                    );
                                })
                            }
                        </Slider>
                    </>
                    <ButtonBack className="hidden md:flex items-center order-1 p-2 text-2xl mx-4">
                        <span value='back'>{`<`}</span>
                    </ButtonBack>
                    <ButtonNext className="hidden md:flex items-center order-3 p-2 text-2xl mx-4">
                        <span value='next'>{`>`}</span>
                    </ButtonNext>
                </CarouselProvider>
            </div>
            <h2 className="w-full text-center tracking-widest text-3xl py-12">LET'S GET STARTED:</h2>
            <CommissionForm />
        </Layout>
    );
}

export const query = graphql`
    query GetPreviousCommissions {
        commissions: allShopifyProduct(filter: {collection: {eq: "Commissions v2"}}) {
            nodes {
                productType
                handle
                totalInventory
                variants {
                    id
                    img: localFile {
                        small: childImageSharp {
                            fixed(width: 320) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        medium: childImageSharp {
                            fixed(width: 700) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        large: childImageSharp {
                            fixed(width: 1000) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                    }
                    price
                    availableForSale
                    title
                }
                priceRange {
                    high
                    low
                }
                collection
                title
                slug
            }
        }
    }
`
