import React from 'react';
import { Link } from 'gatsby';

import Layout from '../components/Layout';
import { useAllPrints } from "../helpers/products"

export default ({

}) => {
    const products = useAllPrints();
    return (
        <Layout>
            {products
                .map((product) => {
                    return (
                        <Link to={product.slug} className="p-5">
                            {product.title}
                        </Link>
                    );
                })
            }
        </Layout>
    );
}