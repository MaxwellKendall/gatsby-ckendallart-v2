import React from 'react';

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';

import { useAllOriginals } from "../helpers/products"

export default ({

}) => {
    const products = useAllOriginals();
    return (
        <Layout>
            <ShopGrid products={products} />
        </Layout>
    );
}
