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

  console.log('imgs', homePageImages);

  return (
    <Layout pageName="home">
        {/* Hero Img */}
          <Img
            className="w-full hero-img"
            fluid={responsiveHeroImages}
            imgStyle={{ objectPosition: 'center 55%'}} />
        {/* Tag Line */}
        <div className="flex flex-col mx-auto py-10 md:pt-48 md:pb-24">
          {tagLine.map((str) => (
            <p className="w-full py-2 text-center">{str.toUpperCase()}</p>
          ))}
          <Link to="/portfolio" className="w-full border mt-10 text-center mx-auto border-black py-5">
            EXPLORE PORTFOLIO
          </Link>
        </div>
        {/* Featured Work */}
        <ul>
          {featuredImages
            .map((arr, i) => arr[i])
            .map((arr) => {
              const splitFileName = arr.fileName.split('--');
              const name = splitFileName[1];
              const productType = splitFileName[2];
              const url = splitFileName[3];
              return (
                <li>
                  <Img fluid={arr} />
                  <p className="w-full text-center">
                    {startCase(name).toUpperCase()}
                  </p>
                  <Link
                    className="w-full text-center"
                    to={`${productType}/${kebabCase(url)}`}>
                      Shop Now
                  </Link>
                </li>
              );
            })
          }
        </ul>
        {/* Referrals */}
        {/* Request Commission | Meet the Artist */}
    </Layout>
  );
}
