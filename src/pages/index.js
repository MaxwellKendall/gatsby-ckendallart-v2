import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { kebabCase, uniqueId } from "lodash";

import Layout from "../components/Layout";

export default (props) => {
  const { allShopifyProduct: { nodes }} = useStaticQuery(graphql`
    query HomePageQuery {
      allShopifyProduct {
        nodes {
          productType
          handle
          totalInventory
          variants {
            availableForSale
            title
          }
          priceRange {
            high
            low
          }
          collection
          title
          slug
        }
      }
    }  
  `)
  return (
    <Layout pageName="home">
        <ul className="px-5">
          {nodes
            .filter((node) => node.totalInventory !== 0)
            .map((node) => (
              <li key={uniqueId('')}>
                <Link to={`${kebabCase(node.productType)}/${node.handle}`}>{node.title}</Link>
              </li>
            ))}
        </ul>
    </Layout>
  );
}
