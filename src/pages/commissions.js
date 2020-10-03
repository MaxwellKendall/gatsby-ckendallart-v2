import React, { useState, useRef } from 'react';
import Img from "gatsby-image";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';

import Layout from '../components/Layout';

import ShopGrid from '../components/ShopGrid';
import CommissionForm from '../components/CommissionForm';
import { useAllProducts } from '../helpers/products';
import { graphql } from 'gatsby';
import { getResponsiveImages } from '../helpers/img';

export default ({
    data: {
        commissions: {
            nodes: commissions
        }
    }
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const handleOnClick = (e) => {
        e.persist();
        if (e.target.value === 'next' && commissions.length - 1 !== activeSlideIndex) {
            setActiveSlideIndex(activeSlideIndex + 1);
        }
        else {
            setActiveSlideIndex(activeSlideIndex - 1);
        }
    }
    return (
        <Layout>
            <h2 className="w-full text-center tracking-widest font-semibold text-3xl pb-12">YOUR DREAM CONCEPT MADE REALITY.</h2>
            <div className="w-full" style={{ maxHeight: '800px'}}>
                <CarouselProvider
                    className="w-full flex"
                    naturalSlideWidth={700}
                    naturalSlideHeight={700}
                    totalSlides={commissions.length}>
                    <Slider className="order-2 w-full" style={{ maxHeight: '700px' }}>
                        {commissions
                            .map(({ variants }, i) => {
                                const imgs = getResponsiveImages(variants[0]).responsiveImgs;
                                return (
                                    <Slide index={i}>
                                        <Img fixed={imgs} style={{ margin: 'auto', display: 'flex' }} />
                                    </Slide>
                                );
                            })
                        }
                    </Slider>
                    <ButtonBack className="order-1 p-2 text-2xl ml-4" onClick={handleOnClick} value='back'>
                        <span> {`<`} </span>
                    </ButtonBack>
                    <ButtonNext className="order-3 p-2 text-2xl mr-4" onClick={handleOnClick} value='next'>
                        <span> {`>`} </span>
                    </ButtonNext>
                </CarouselProvider>
            </div>
            <h2 className="w-full text-center tracking-widest font-semibold text-3xl py-12">LET'S GET STARTED:</h2>
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
                            fixed(height: 300) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        medium: childImageSharp {
                            fixed(height: 500) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        large: childImageSharp {
                            fixed(height: 700) {
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

// export const query = graphql`
//     query GetPreviousCommissions {
//         commissions: allShopifyProduct(filter: {collection: {eq: "Commissions v2"}}) {
//             nodes {
//                 productType
//                 handle
//                 totalInventory
//                 variants {
//                     id
//                     localFile {
//                         childImageSharp {
//                             fluid(maxHeight: 500) {
//                                 ...GatsbyImageSharpFluid
//                             }
//                         }
//                     }
//                     price
//                     availableForSale
//                     title
//                 }
//                 priceRange {
//                     high
//                     low
//                 }
//                 collection
//                 title
//                 slug
//             }
//         }
//     }
// `