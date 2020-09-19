import React from 'react';
import { Link } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';

import { useAllOriginals, getDefaultProductImage } from "../helpers/products"

export default ({

}) => {
    const products = useAllOriginals();
    return (
        <Layout>
            <ShopGrid products={products} />
        </Layout>
    );
}
