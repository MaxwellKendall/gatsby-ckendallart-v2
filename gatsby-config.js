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
    title: `Ckendall Art V2`,
    description: `Claire Kendall Art; V2.`,
    author: `Maxwell Kendall`,
    pages: [
      {
        name: 'Portfolio',
        link: '/portfolio'
      },
      {
        name: 'Shop',
        isExpandable: true,
        childPages: [
          {
            name: 'Prints',
            link: '/prints'
          },
          {
            name: 'Originals',
            link: '/originals'
          }
        ]
      },
      {
        name: 'Commissions',
        link: '/commissions'
      },
      {
        name: 'About',
        link: '/about' 
      },
    ],
    tagLine: [
      'Obsession with Quality',
      'Reverence for Beauty',
      'Fine art made for you, with love.'
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
          // require("./tailwind.config.js"),
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

