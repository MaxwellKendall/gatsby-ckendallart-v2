import React from 'react';
import { kebabCase } from 'lodash';
import { Link } from 'gatsby';

import Layout from '../components/Layout';
import { useProducts } from "../graphql"

export default () => {
    const products = useProducts();
    return (
        <Layout>
            {products
                .map((product) => {
                    console.log('product', product);
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
