import React from 'react';
import { Link } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';
import { useAllPrints } from "../helpers/products"

export default ({

}) => {
    const products = useAllPrints();
    return (
        <Layout>
             <ShopGrid products={products} />
        </Layout>
    );
}