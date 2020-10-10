import React, { useState } from "react";
import { useStaticQuery, Link, graphql } from "gatsby";
import Img from "gatsby-image";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import { kebabCase, uniqueId, startCase, groupBy, flatten } from "lodash";

import Layout from "../components/Layout";
import Arrow from "../components/Arrow";
import ReferralCarousel from "../components/ReferralCarousel";

import 'pure-react-carousel/dist/react-carousel.es.css';

const tagLine = [
  'Obsession with Quality',
  'Reverence for Beauty',
  'Fine art made for you, with love.'
];

const imgBreakPointsByViewPort = {
  mobile: `(min-width: 0px) and (max-width: 767px)`,
  tablet: `(min-width: 768px) and (max-width: 1199px)`,
  desktop: `(min-width: 1200px)`
};

const getFeaturedImgUrl = (imgName) => {
  const splitFileName = imgName.split('--');
  const productType = splitFileName[2].toLowerCase() === 'print'
    ? 'prints'
    : 'originals';
  const url = splitFileName[3];
  const productSize = splitFileName[4];

  if (productSize) {
    return `${productType}/${kebabCase(url)}-${productSize}`;
  }
  return `${productType}/${kebabCase(url)}`;
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
      featuredMobile: allFile(filter: {name: {regex: "/featured/"}}) {
        nodes {
          id
          childImageSharp {
            fluid(maxWidth: 750) {
              ...GatsbyImageSharpFluid
            }
          }
          name
        }
      },
      featuredTablet: allFile(filter: {name: {regex: "/featured/"}}) {
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
      featuredDesktop: allFile(filter: {name: {regex: "/featured/"}}) {
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
  const featuredImages = groupBy(flatten(parseImages(homePageImages, 'featured')), 'fileName');
  const otherImages = groupBy(flatten(parseImages(homePageImages, 'other')), 'fileName');

  return (
    <Layout pageName="home" location={props.location}>
      {/* I. HERO IMG */}
      <Img
        className="w-full hero-img"
        fluid={responsiveHeroImages}
        imgStyle={{ objectPosition: 'center 55%'}} />
      {/* TAG LINE */}
      <div className="flex-col-center py-10 md:py-24">
        {tagLine.map((str) => (
          <h2 className="w-full py-2 text-center tracking-widest my-5 text-3xl">{str.toUpperCase()}</h2>
        ))}
        <Link to="/portfolio" className="w-5/6 md:w-3/5 tracking-wider border mt-10 text-center mx-auto border-black py-5 text-2xl">
          EXPLORE PORTFOLIO
        </Link>
      </div>
      {/* II. FEATURED WORK */}
      <div className="w-full featured-work pb-5 lg:pb-10">
        <h3 className="text-2xl tracking-widest text-center py-4 md:text-left md:px-10 md:pt-10">FEATURED WORK</h3>
        <div className="flex lg:hidden">
          <CarouselProvider
            className="w-full"
            naturalSlideWidth={780}
            naturalSlideHeight={700}
            totalSlides={3}>
            <Slider>
              {Object.keys(featuredImages)
                .map((key, i) => (
                    <Slide index={i}>
                      <Link to={getFeaturedImgUrl(key)}>
                        <Img fluid={featuredImages[key]} />
                      </Link>
                    </Slide>
                ))
              }
            </Slider>
            <div className="flex w-full justify-center">
              <ButtonBack className="p-2"><Arrow direction="left" /></ButtonBack>
              <ButtonNext className="p-2"><Arrow direction="right" /></ButtonNext>
            </div>
          </CarouselProvider>
        </div>
        <ul className="hidden lg:flex p-10 flex w-full">
          {Object.keys(featuredImages)
            .map((key, i) => {
              const arrayOfImages = featuredImages[key];
              const margin = i === 1;
              const name = key.split('--')[1];
              return (
                <li className={`w-1/3 flex flex-col align-center ${margin ? 'mx-2' : ''}`}>
                  <Link className="w-full text-center h-full text-lg tracking-wide" to={getFeaturedImgUrl(key)}>
                    <Img fluid={arrayOfImages} style={{ height: '80%' }} />
                    <p className="w-full text-center mt-5 text-xl tracking-wide">
                      {startCase(name).toUpperCase()}
                    </p>
                      shop now {`>`}
                  </Link>
                </li>
              );
            })
          }
        </ul>
      </div>
      {/* III. REFERRALS */}
      <ReferralCarousel />
      {/* IV. REQUEST COMMISSION | MEET THE ARTIST */}
      <ul className="pt-10 flex flex-col md:flex-row w-full">
        {Object.keys(otherImages)
          .sort((a, b) => a.includes('commission') ? -1 : 1)
          .map((key) => {
            const arrayOfImages = otherImages[key];
            const splitFileName = key.split('--');
            const section = startCase(splitFileName[1]).toLowerCase() === 'request commission'
              ? { title: 'REQUEST COMMISSION', url: '/commissions'}
              : { title: 'MEET THE ARTIST', url: '/about' };
            return (
              <li className={`w-full pb-4 md:pb-0 md:w-1/2 flex flex-col align-center mx-2`}>
                <Link to={section.url} className="w-full cursor-pointer text-center mt-5 text-xl tracking-widest">
                  <Img fluid={arrayOfImages} style={{ height: section.url === '/commissions' ? '84%' : '80%' }}/>
                    {`${startCase(section.title).toUpperCase()} >`}
                </Link>
              </li>
            )
          })
        }
      </ul>
    </Layout>
  );
}
