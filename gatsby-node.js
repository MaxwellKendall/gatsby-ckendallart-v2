const path = require(`path`);
const image = require('gatsby-image');
// need to do this in the template ☝
exports.onCreateWebpackConfig = ({
    stage,
    rules,
    loaders,
    plugins,
    actions,
  }) => {
    actions.setWebpackConfig({
      plugins: [
        plugins.define({
            GATSBY_SHOP_NAME: JSON.stringify(process.env.SHOP_NAME),
            GATSBY_ACCESS_TOKEN: JSON.stringify(process.env.SHOPIFY_ACCESS_TOKEN)
        })
      ]
    })
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const productTemplate = path.resolve(`src/templates/Product.jsx`)
  return graphql(`
    query GetProducts {
      allShopifyProduct {
        nodes {
          id
          title
          handle
          description
          collection
          priceRange {
            high
            low
          }
          productType
          totalInventory
        }
      }
    }  
  `).then((result) => {
    if (result.errors) {
      throw result.errors
    }

    console.log(`********* RESULT ${result}`);

    // Create product pages.
    result.data.allShopifyProduct.nodes.forEach((node) => {
      createPage({
        // Path for this page — required
        path: `${node.productType.toLowerCase()}/${node.handle}`,
        component: productTemplate,
        context: {
          // Add optional context data to be inserted
          // as props into the page component..
          //
          // The context data can also be used as
          // arguments to the page GraphQL query.
          //
          // The page "path" is always available as a GraphQL
          // argument.
          ...node
        },
      })
    })
  })
};
