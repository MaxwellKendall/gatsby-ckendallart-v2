// For the default version
const algoliasearch = require('algoliasearch');
const { ApolloClient, HttpLink, InMemoryCache, gql } = require('@apollo/client');
const fetch = require('isomorphic-fetch');
require('dotenv').config({
    path: `../.env`
});
  
const {
    GetAllCollections,
    GetAllProductsInCollection
} = require('./queries');

const client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_API_SECRET);
const productIndex = client.initIndex('Products');
const variantIndex = client.initIndex('Product Variants');
const aggregateIndex = client.initIndex('Aggregate');

const graphqlClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `https://${process.env.SHOP_NAME}.com/api/2020-04/graphql.json`,
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      },
      fetch
    })
});

const isItemInIndex = (index, id) => {
    return index.search(id)
        .then((data) => {
            return data.hits.length > 0;
        })
        .catch((e) => console.log('error from isItemInIndex',  e));
}

const fetchData = async (query, vars) => {
    return graphqlClient.query({ query, variables: vars })
};

const createVariantRecord = (variant, product, collection) => ({
    objectID: variant.id,
    collectionTitle: collection.title,
    collectionDesc: collection.description,
    title: `${product.title}, ${variant.title === 'Default Title' ? '' : variant.title}`,
    productType: variant.title === 'Default Title' ? 'Original' : `Variant of ${product.title}`,
    tags: product.tags,
    description: product.description,
    weight: variant.weight,
    availableForSale: variant.availableForSale,
    price: variant.price,
    image: variant.image.originalSrc
});

const createProductRecord = (product, collection) => ({
    collection: collection.title,
    collectionDesc: collection.description,
    objectID: product.id,
    images: product.images.edges.map(({ node: image}) => image.originalSrc),
    maxPrice: product.priceRange.maxVariantPrice.amount,
    minPrice: product.priceRange.minVariantPrice.amount,
    description: product.description,
    productType: product.productType,
    tags: product.tags,
    title: product.title
});

const addProductVariantsToSearchIndex = (variants, product, collection) => {
    return variants
        .reduce((prevPromise, { node: variant }) => prevPromise
            .then(async (data) => {
                const isAdded = await isItemInIndex(variantIndex, variant.id);
                if (isAdded) return Promise.resolve();
                console.log("************************* ADDING Variant *************************", product.title, variant.title)
                return variantIndex
                    .saveObject(createVariantRecord(variant, product, collection))
                    .then(() => aggregateIndex.saveObject(createVariantRecord(variant, product, collection)));
            })
            .catch((e) => console.log('Error from variants', e)), Promise.resolve())
};

const addProductsToSearchIndex = (collection, products) => {
    const parsedProducts = products.map((product) => ({
        ...product.node,
        collection: collection.title
    }));
    
    return parsedProducts
        .reduce((prevPromise, product) => {
            return prevPromise
                .then(async (data) => {
                    const isAdded = await isItemInIndex(productIndex, product.id);
                    return addProductVariantsToSearchIndex(product.variants.edges, product, collection)
                        .then(() => {
                            if (!isAdded) {
                                console.log("************************* ADDING PRODUCT *************************", product.images.edges)
                                return productIndex
                                    .saveObject(createProductRecord(product, collection))
                                    .then(() => aggregateIndex.saveObject(createProductRecord(product, collection)));
                            }
                        })
                        .catch((e) => console.log('Some Error: ', e));
                })
        }, Promise.resolve());
};

fetchData(GetAllCollections, { first: 250 })
    .then(({ data: { collections: { edges: artCollections } } }) => {
        artCollections
            .reduce((prevPromise, collection) => {
                return prevPromise
                    .then((data) => {
                        if (!data) return fetchData(GetAllProductsInCollection, { first: 250, handle: collection.node.handle });
                        return prevPromise
                            .then(({ data: { collectionByHandle: collection } }) => {
                                return addProductsToSearchIndex(collection, collection.products.edges);
                            })
                            .then(() => fetchData(GetAllProductsInCollection, { first: 250, handle: collection.node.handle }))
                    })
            }, Promise.resolve())
            .then(({ data: { collectionByHandle: collection } }) => {
                return addProductsToSearchIndex(collection, collection.products.edges);
            })
            .then(() => {
                console.log('ALL DONE BREH');
            })
    });
