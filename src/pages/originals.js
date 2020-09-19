import React from 'react';
import { Link } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/Layout';
import { useAllOriginals, getDefaultProductImage } from "../helpers/products"

export default ({

}) => {
    const products = useAllOriginals();
    return (
        <Layout>
            {products
                .map((product) => ({ ...product, img: getDefaultProductImage(product)}))
                .filter(({ img }) => img)
                .map((product) => {
                    return (
                        <Link to={product.slug} className="p-5">
                            {product.title}
                            <Img fluid={product.img} />
                        </Link>
                    );
                })
            }
        </Layout>
    );
}
