/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

require('dotenv').config({
  path: `.env`
});

module.exports = {
  siteMetadata: {
    title: `Claire Kendall | Fine Studio Artist`,
    description: `Claire Kendall Art is a fine studio artist from Charleston South Carolina.`,
    siteUrl: 'https://clairekendallartv2.gtsb.io',
    author: `Claire Kendall Art`,
    keywords: [
      'studio artist',
      'charleston',
      'oil paintings',
      'oil painting',
      'flower painting',
      'art',
      'floral painting',
      'fine artist',
      'art commissions'
    ],
    email: 'info@ckendallart.com',
    pages: [
      {
        name: 'Portfolio',
        link: '/portfolio/'
      },
      {
        name: 'Shop',
        isExpandable: true,
        childPages: [
          {
            name: 'Prints',
            link: '/prints/'
          },
          {
            name: 'Originals',
            link: '/originals/'
          }
        ]
      },
      {
        name: 'Commissions',
        link: '/commissions/'
      },
      {
        name: 'About',
        link: '/about/' 
      },
    ],
    tagLine: [
      'Obsession with Quality',
      'Reverence for Beauty',
      'Fine art made for you, with love.'
    ],
    referrals: [
      `“Claire listens - she was able to take my vision and duplicate it on canvas. She is a true talent - easy to work with and my finished masterpiece is a joy to sit and admire.” Debbie C. Charleston, S.C.`,
      `"SQRLE is a real good painter. She paints real good." TKL BOI TKLVILLE, USA`
    ]    
  },
  plugins: [
    // re-captcha
    `gatsby-plugin-recaptcha`,
    // styles
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        postCssPlugins: [
          require("tailwindcss"),
          // Optional: Load custom Tailwind CSS configuration
          require("./tailwind.config.js")
        ],
      },
    },
    // SEO
    `gatsby-plugin-react-helmet`,
    // Image Processing
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images/`,
      },
    },
    // for exposing the shopify storefront api
    {
      resolve: "gatsby-source-shopify-local",
      options: {
        url: `https://${process.env.SHOP_NAME}.com/api/2020-04/graphql`,
        headers: {
          'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      },
    },
  ]
};

