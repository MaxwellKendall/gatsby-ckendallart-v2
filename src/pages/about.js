import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/Layout"

import { getResponsiveImages } from "../helpers/img"

export default ({
  data: {
    allFile: { nodes: imgs },
  },
  location
}) => {
  const { responsiveImgs: profilePic } = getResponsiveImages(
    { img: imgs.find(({ name }) => name === "about-profile") },
    "fluid"
  )
  const { responsiveImgs: brushImg } = getResponsiveImages(
    { img: imgs.find(({ name }) => name === "about-paint") },
    "fluid"
  )
  const { responsiveImgs: paintImg } = getResponsiveImages(
    {
      img: imgs.find(
        ({ name }) => name === "home_pg_other--request_commission"
      ),
    },
    "fluid"
  );

  return (
    <Layout classNames="bg-white" maxWidth="75rem" location={location}>
      <div className="w-full flex flex-wrap justify-center mx-5">
        <div className="hidden md:flex flex-wrap w-1/2 pr-5">
          <Img className="w-full mb-2" fluid={paintImg} />
          <Img className="w-full" fluid={brushImg} />
        </div>
        <Img className="w-full md:w-1/2" fluid={profilePic} />
      </div>
      <div className="text w-full flex flex-col m-5">
        <p className="tracking-wider sqrl-font-1">
          Claire Kendall is a contemporary realist painter and private
          instructor in Charleston, SC. Trained from the age of thirteen by
          Susan Burgoyne, BFA, Claire received comprehensive instruction in
          pastel, acrylic, and oil painting. She continued her painting and art
          history education at the College of Charleston, graduating in 2013 and
          became an independent artist in 2017.
        </p>
        <p className="my-5 tracking-wider sqrl-font-1">
          Claire is most inspired by the beauty of the natural world, especially
          the intricate varieties of flowers and flowing fabrics that she used
          to admire while working in the floral and wedding design industry of
          Charleston. Ever a lover of the classical portrait, the old masters
          are a strong point of reference for Claire in every piece. Her
          particular for mof expression is always striving to achieve the
          elusive balance of timelessness and freshness in her paintings.
        </p>
        <p className="my-5 tracking-wider sqrl-font-1">psalm 92:4-5</p>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query GetAboutPageImages {
    allFile(
      filter: { name: { regex: "/about|home_pg_other--request_commission/" } }
    ) {
      nodes {
        name
        small: childImageSharp {
          fluid(maxWidth: 300, quality: 100) {
            ...GatsbyImageSharpFluid
          }
        }
        medium: childImageSharp {
          fluid(maxWidth: 400, quality: 100) {
            ...GatsbyImageSharpFluid
          }
        }
        large: childImageSharp {
          fluid(maxWidth: 500, quality: 100) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`
