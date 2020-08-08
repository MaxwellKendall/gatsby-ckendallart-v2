import React from "react";
import { useStaticQuery, Link, graphql } from "gatsby";
import Img from "gatsby-image";
import { kebabCase, uniqueId, startCase } from "lodash";

import Layout from "../components/Layout";

const imgBreakPointsByViewPort = {
  mobile: `(min-width: 0px)`,
  tablet: `(min-width: 768px)`,
  desktop: `(min-width: 1200px)`
};

const tagLine = [
  'Obsession with Quality',
  'Reverence for Beauty',
  'Fine art made for you, with love.'
];

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
      otherMobile: allFile(filter: {name: {regex: "/commission|profile-pic/"}}) {
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
      otherTablet: allFile(filter: {name: {regex: "/commission|profile-pic/"}}) {
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
      otherDesktop: allFile(filter: {name: {regex: "/commission|profile-pic/"}}) {
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
  const featuredImages = parseImages(homePageImages, 'featured');

  return (
    <Layout pageName="home">
          <Img
            className="w-full hero-img"
            fluid={responsiveHeroImages}
            imgStyle={{ objectPosition: 'center 55%'}} />
        <div className="flex flex-col mx-auto py-10 md:py-24">
          {tagLine.map((str) => (
            <h2 className="w-full py-2 text-center tracking-widest my-5 text-3xl">{str.toUpperCase()}</h2>
          ))}
          <Link to="/portfolio" className="w-3/5 tracking-wider border mt-10 text-center mx-auto border-black py-5 text-2xl">
            EXPLORE PORTFOLIO
          </Link>
        </div>
        <div className="w-full bg-gray-100 pb-10">
          <h3 className="m-10 text-2xl tracking-widest">FEATURED WORK</h3>
          <ul className="flex w-full">
            {featuredImages
              .map((arr, i) => arr[i])
              .map((arr, i, srcArr) => {
                const splitFileName = arr.fileName.split('--');
                const name = splitFileName[1];
                const productType = splitFileName[2];
                const url = splitFileName[3];
                const margin = i === 1;
                return (
                  <li className={`w-1/3 flex flex-col align-center ${margin ? 'mx-2' : ''}`}>
                    <Img fluid={arr} style={{ height: '80%' }}/>
                    <p className="w-full text-center mt-5 text-xl tracking-wide">
                      {startCase(name).toUpperCase()}
                    </p>
                    <Link className="w-full text-center text-lg tracking-wide" to={`${productType}/${kebabCase(url)}`}>
                        shop now >
                    </Link>
                  </li>
                );
              })
            }
          </ul>
        </div>
        {/* Referrals */}
        {/* Request Commission | Meet the Artist */}
    </Layout>
  );
}
