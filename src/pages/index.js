import React from "react";
import { useQuery } from "@apollo/react-hooks";

import { getShopDetails } from '../../graphql';

export default (props) => {
  const { loading, error, data } = useQuery(getShopDetails);
  console.log("props", loading, error, data);
  return <div>Hello world!</div>
}
