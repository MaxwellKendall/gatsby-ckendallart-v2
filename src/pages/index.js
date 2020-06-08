import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { useStaticQuery, graphql, Link } from "gatsby"

import { getShopDetails } from '../../graphql';

import Layout from "../components/Layout";

export default (props) => {
  const { loading, error, data } = useQuery(getShopDetails);
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
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error...</p>;
  console.log(nodes.map((node) => node.totalInventory))
  return (
    <Layout>
      <div className="home">
        {data.shop.shopName}
        <ul>
          {nodes
            .filter((node) => node.totalInventory !== 0)
            .map((node) => (
              <li>
                <Link to={`${node.productType.toLowerCase()}/${node.handle}`}>{node.title}</Link>
              </li>
            ))}
        </ul>
      </div>
    </Layout>
  );
}
