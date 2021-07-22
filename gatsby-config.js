/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

require('dotenv').config({
  path: `.env`
});

const caroleHarrisonReview = `"My family commissioned Claire to paint a portrait of our precious Boykin Spaniel. The finished piece is excellent.  Claire took the original portrait photos of our pup (she is such a dog lover) and then captured the dog's likeness (especially) and the overall composition to our complete satisfaction.  Claire was timely and very open to suggestions or critique.  She wanted us to be completely satisfied with the final product and we could not be happier. Highly recommend!"
Carol H., Asheville, NC`;
const debbieCharlesReview = `“Claire listens - she was able to take my vision and duplicate it on canvas. She is a true talent - easy to work with and my finished masterpiece is a joy to sit and admire.” Debbie C., Charleston, SC`;
const pudIveyReview = `"I reached out to Claire to paint a portrait of my wife’s wedding bouquet as a gift for our 3rd anniversary. She delivered above and beyond expectation! She patiently worked with me and used her expertise to help me decide on the right background color. She was insightful, kind, and helpful. The painting is exquisite and one of our favorite pieces in our home!" Pud I., Jacksonville, FL`
const lynnReview = `"We recently commissioned Claire to create a painting of our grandsons and the result is stunning!  Claire truly captured the essence of our grandchildren and created an heirloom.  Claire regularly and thoughtfully involved us throughout the process, making the experience that much more special. How we loved the look of joy on the faces of our daughter and son-in-law on Christmas morning when they opened this delightful gift! Lynn T., VA Beach, VA"`;

module.exports = {
  siteMetadata: {
    title: `Claire Kendall | Fine Studio Artist`,
    description: `Claire Kendall Art is a fine studio artist from Charleston South Carolina.`,
    siteUrl: 'https://www.ckendallart.com',
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
          },
          {
            name: 'AirBnB collection',
            link: '/airbnb-collection/'
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
      lynnReview,
      debbieCharlesReview,
      pudIveyReview,
      caroleHarrisonReview
    ]    
  },
  plugins: [
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        sitemap: null,
        policy: [{ userAgent: '*', allow: '/' }]
      }
    },
    // {
    //   resolve: "gatsby-plugin-webpack-bundle-analyser-v2",
    //   options: {
    //     analyzerMode: "server",
    //     analyzerPort: "8888",
    //     analyzerHost: "localhost",
    //     defaultSizes: "gzip"
    //   }
    // },
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
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "Claire Kendall Art",
        short_name: "Ckendall Art",
        start_url: "/",
        background_color: "#6b37bf",
        theme_color: "#6b37bf",
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: "standalone",
        icon: "src/images/logo.jpg", // This path is relative to the root of the site.
        // An optional attribute which provides support for CORS check.
        // If you do not provide a crossOrigin option, it will skip CORS for manifest.
        // Any invalid keyword or empty string defaults to `anonymous`
        crossOrigin: `use-credentials`,
      }
    },
  ]
};

