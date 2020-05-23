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
  },
  plugins: [
    // SEO
    `gatsby-plugin-react-helmet`,
    // Image Processing
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // for exposing the shopify storefront api
    {
      resolve: "gatsby-source-graphql",
      options: {
        // Arbitrary name for the remote schema Query type
        typeName: "SHOPIFY",
        // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
        fieldName: "shopify",
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

