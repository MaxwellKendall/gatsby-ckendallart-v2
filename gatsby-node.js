const path = require(`path`);

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
    query GetProducts($first: Int!) {
      shopifyCollection {
        products(first: $first) {
          edges {
            cursor
            node {
              availableForSale
              createdAt
              description
              handle
              id
              variants(first: 100) {
                edges {
                  node {
                    id
                  }
                }
              }
              images(first: 10) {
                edges {
                  node {
                    originalSrc
                    src
                    transformedSrc
                    altText
                  }
                }
                pageInfo {
                  hasNextPage
                }
              }
              priceRange {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              productType
              tags
              title
              totalInventory
              vendor
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }  
  `, { first: 250 }).then(result => {
    if (result.errors) {
      throw result.errors
    }

    console.log(`********* RESULT ${result}`);

    // Create product pages.
    result.data.shopifyCollection.products.edges.forEach(edge => {
      createPage({
        // Path for this page — required
        path: `${edge.node.productType.toLowerCase()}/${edge.node.handle}`,
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
          ...edge.node
        },
      })
    })
  })
};
