import React, { useState } from "react";
import { useStaticQuery, Link, graphql } from "gatsby";
import Img from "gatsby-image";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import { kebabCase, uniqueId, startCase, groupBy, flatten } from "lodash";

import Layout from "../components/Layout";
import Arrow from "../components/Arrow";
import ReferralCarousel from "../components/ReferralCarousel";
import SEO from "../components/SEO";

import 'pure-react-carousel/dist/react-carousel.es.css';
import { getPrettyPrice } from "../helpers/products";

const tagLine = [
  'Obsession with Quality',
  'Reverence for Beauty',
  'Fine art made for you, with love.'
];

const siteDescription = "Claire Kendall Art. Fine studio artist. We provide fine studio art. Custom art is available. Prints are available.";

const imgBreakPointsByViewPort = {
  mobile: `(min-width: 0px) and (max-width: 767px)`,
  tablet: `(min-width: 768px) and (max-width: 1199px)`,
  desktop: `(min-width: 1200px)`
};

const getFeaturedImgUrl = (imgName) => {
  const splitFileName = imgName.split('--');
  const url = splitFileName[3];
  const productSize = splitFileName[4];

  if (productSize) {
    return `products/${kebabCase(url)}-${productSize}/`;
  }
  return `products/${kebabCase(url)}/`;
}

// TODO: should be using getresponsiveImages via fluid
const parseImages = (images, section) => Object
  .keys(images)
  .filter((key) => key.includes(section))
  .map((key) => ({ viewPort: key.split(section)[1].toLowerCase(), ...images[key] }))
  .map((imgObj) => {
    if (imgObj.nodes.length === 1) {
      return {
        media: imgBreakPointsByViewPort[imgObj.viewPort],
        ...imgObj.nodes[0].childImageSharp.fluid
      };
    }
    return imgObj.nodes.map((img) => ({
      fileName: img.name,
      ...img.childImageSharp.fluid,
      media: imgBreakPointsByViewPort[imgObj.viewPort]
    }));
  });

export default (props) => {
  const homePageImages = useStaticQuery(graphql`
    query HomePage {
      heroMobile: allFile(filter: {name: {regex: "/hero/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 1500) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      },
      heroTablet: allFile(filter: {name: {regex: "/hero/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 2000) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      },
      heroDesktop: allFile(filter: {name: {regex: "/hero/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 3000) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      },
      featuredMobile: allShopifyProduct(filter: {tags: {in: "home-pg-featured"}}) {
        nodes {
          localFile {
            childImageSharp {
              fluid(maxWidth: 750) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          name: title
        }
      },
      featuredTablet: allShopifyProduct(filter: {tags: {in: "home-pg-featured"}}) {
        nodes {
          localFile {
            childImageSharp {
              fluid(maxWidth: 1000) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          name: title
        }
      },
      featuredDesktop: allShopifyProduct(filter: {tags: {in: "home-pg-featured"}}) {
        nodes {
          localFile {
            childImageSharp {
              fluid(maxWidth: 1500) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          name: title
        }
      },
      featuredImages: allShopifyProduct(filter: {tags: {in: "home-pg-featured"}}) {
        nodes {
          localFile {
            childImageSharp {
              fluid(maxWidth: 1500) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          priceRange {
            low
            high
          }
          handle
          name: title
        }
      },
      otherMobile: allFile(filter: {name: {regex: "/other/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 1000) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      },
      otherTablet: allFile(filter: {name: {regex: "/other/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 1500) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      },
      otherDesktop: allFile(filter: {name: {regex: "/other/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 2000) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      }
    }
`);
 
  const responsiveHeroImages = parseImages(homePageImages, 'hero');
  // const featuredImages = groupBy(flatten(parseImages(homePageImages, 'featured')), 'fileName');
  const otherImages = groupBy(flatten(parseImages(homePageImages, 'other')), 'fileName');
  console.log('featruedImages', homePageImages.featuredImages);

  return (
    <SEO title="Fine Art Made For You" description={siteDescription} pathname={"/"} image={responsiveHeroImages[0]}>
      <Layout pageName="home" location={props.location}>
        {/* I. HERO IMG */}
        <Img
          critical
          className="w-full hero-img"
          fluid={responsiveHeroImages}
          imgStyle={{ objectPosition: 'center 55%' }} />
        {/* TAG LINE */}
        <div className="flex-col-center py-10 md:py-12">
          {tagLine.map((str, i) => (
            <h2 className={`w-full p-2 text-center tracking-wide md:tracking-wider lg:tracking-widest text-xl md:text-2xl lg:text-3xl ${i === 1 ? 'my-2' : ''}`}>{str.toUpperCase()}</h2>
          ))}
          <Link to="/shop/" className="border mt-10 text-center mx-auto border-black py-5 px-10 md:text-xl tracking-wide md:tracking-wider lg:tracking-widest">
            SHOP NOW
        </Link>
        </div>
        {/* II. FEATURED WORK */}
        <div className="w-full relative pb-5 lg:pb-10">
          <h2 className="text-xl font-semibold text-center tracking-wide md:tracking-wider lg:text-2xl lg:tracking-widest">FEATURED WORK</h2>
          <CarouselProvider
            className="w-full pt-4 md:px-4 mx-auto max-w-screen-md xl:max-w-screen-lg"
            naturalSlideWidth={780}
            naturalSlideHeight={700}
            visibleSlides={1}
            totalSlides={homePageImages?.featuredImages?.nodes?.length}>
            <Slider>
              {homePageImages?.featuredImages?.nodes
                .map((img, i) => (
                  <Slide index={i}>
                    <Link to={`products/${img.handle}/`}>
                      <Img fluid={img.localFile.childImageSharp.fluid} />
                      <span className="flex opacity-70 product-info font-semibold text-base p-5 bottom-0 absolute flex-wrap items-center justify-center bg-gray-300 tracking-widest text-center w-full md:text-xl md:p-8 lg:p-12">
                          {img.name.toUpperCase()}
                          {img.priceRange.low !== img.priceRange.high && <span className="w-full text-center">from {getPrettyPrice(img.priceRange.low)}</span>}
                          {img.priceRange.low === img.priceRange.high && <span className="w-full text-center">{getPrettyPrice(img.priceRange.low)}</span>}
                      </span>
                    </Link>
                  </Slide>
                ))
              }
            </Slider>
            <div className="flex w-full justify-center">
              <ButtonBack className="p-2 absolute left-0 top-1/2"><Arrow direction="left" classNames="opacity-70 md:w-24 md:h-24" /></ButtonBack>
              <ButtonNext className="p-2 absolute top-1/2 right-arrow-carousel"tyle={{ left: 'calc(100% - 112px)' }}><Arrow direction="right" classNames="opacity-70 md:w-24 md:h-24" /></ButtonNext>
            </div>
          </CarouselProvider>
        </div>
        {/* III. REFERRALS */}
        <ReferralCarousel />
        {/* IV. REQUEST COMMISSION | MEET THE ARTIST */}
        <ul className="pb-10 flex flex-col md:flex-row w-full lg:px-10">
          {Object.keys(otherImages)
            .sort((a, b) => a.includes('commission') ? -1 : 1)
            .map((key, i) => {
              const arrayOfImages = otherImages[key];
              const splitFileName = key.split('--');
              const section = startCase(splitFileName[1]).toLowerCase() === 'request commission'
                ? { title: 'REQUEST COMMISSION', url: '/commission-request/' }
                : { title: 'MEET THE ARTIST', url: '/about/' };
              return (
                <li className={`w-full pb-4 md:pb-0 md:w-1/2 flex flex-col align-center mx-2`}>
                  <Link to={section.url} className="w-full cursor-pointer text-center mt-5 tracking-wide md:tracking-wider lg:tracking-widest lg:text-xl">
                    <Img className={`mb-4 xl:mb-8 ${i === 0 ? 'xl:mr-10' : 'xl:ml-10'}`} fluid={arrayOfImages} style={{ height: section.url === '/commission-request' ? '84%' : '80%' }} />
                    <span className={`${i === 0 ? 'xl:mr-10' : 'xl:ml-10'} flex w-full justify-center md:justify-start tracking-wide md:tracking-wider lg:tracking-widest`}>{`${startCase(section.title).toUpperCase()} >`}</span>
                  </Link>
                </li>
              )
            })
          }
        </ul>
      </Layout>
    </SEO>
  );
}
