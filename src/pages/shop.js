import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { graphql, navigate } from 'gatsby';
import { faTimesCircle, faSlidersH, faTimes } from '@fortawesome/free-solid-svg-icons'

import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';
import SEO from "../components/SEO";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { hasAvailableInventory } from '../helpers/cart';
import { getPrettyPrice } from '../helpers/products';

const description = `Original artwork by Claire Kendall.`

const facets = ['sortBy', 'type', 'price', 'sold', 'title'];

const FilterSidebar = ({
    criteria,
    setFilterCriteria
}) => {
    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const [isSticky, setIsSticky] = useState(false);
    const [showFacets, setShowFacets] = useState(false);

    useLayoutEffect(() => {
        const callback = (arr) => {
            arr.forEach((o) => {
                if (isSticky && o.intersectionRatio > 0) {
                    setIsSticky(false)
                }
            })
        }
        let options = {
            root: null,
            rootMargin: '0px',
            threshold: [0.01]
          }
        let observer = new IntersectionObserver(callback, options);
        Array.from(document.querySelectorAll('header')).forEach((el) => {
            observer.observe(el);
        })
    })

    useLayoutEffect(() => {
        const callback = (arr) => {
            arr.forEach((o) => {
                if (o.intersectionRatio > 0 && !isSticky) {
                    setIsSticky(true)
                }
            })
        }
        let options = {
            root: null,
            rootMargin: '0px',
            threshold: [0.75]
          }
        let observer = new IntersectionObserver(callback, options);
        if (buttonRef.current) {
            observer.observe(buttonRef.current);
        }
    }, [buttonRef])

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowFacets(false);
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef])

    const renderFacets = (facetType) => {
        const getHandler = (key) => (e) => {
            e.persist()
            const { value } = e.target;

            const previous = criteria[key];
            let newSelection;
            if (Array.isArray(previous)) {
                newSelection = previous.includes(value)
                    ? previous.filter((str) => str !== value)
                    : previous.concat([value]);
            } else if (key === 'excludeSold') {
                newSelection = previous === 'false' ? 'true' : 'false';
            } else {
                newSelection = value;
            }
            writeQueryStrings({
                ...criteria,
                [key]: newSelection
            });
        }
        switch(facetType) {
            case 'sortBy':
                const handler = getHandler('sortBy');
                return (
                    <div className='w-full py-5 flex flex-wrap items-center'>
                        <label className='w-full uppercase text-lg tracking-wide'>Sort By</label>
                        <div className='w-full p-2'>
                            <input name="sort-by" className="cursor-pointer" id="price-asc" value="price-asc" onChange={handler} type="radio" checked={criteria.sortBy === 'price-asc'} />
                            <label className='px-2 cursor-pointer' htmlFor="price-asc">Price Low to High</label>
                        </div>
                        <div className='w-full p-2'>
                            <input name="sort-by" className="cursor-pointer" id="price-desc" value="price-desc" onChange={handler} type="radio" checked={criteria.sortBy === 'price-desc'} />
                            <label className='px-2 cursor-pointer' htmlFor="price-desc">Price High to Low</label>
                        </div>
                    </div>
                )
            case 'sold':
                return (
                    <div className='w-full py-5 flex flex-wrap items-center'>
                        <input className='mx-2' id="exclude-sold" onInput={getHandler('excludeSold')} type="checkbox" value="excludeSold" checked={criteria.excludeSold === 'true'}/>
                        <label className='uppercase text-lg tracking-wide' htmlFor="exclude-sold">Exclude Sold</label>
                    </div>
                );
            case 'title':
                return (
                    <div className='w-full py-5 flex flex-wrap items-center'>
                        <label className='w-full uppercase text-lg tracking-wide' htmlFor="original">Title / Description / Size</label>
                        <input className='mx-2 p-2 w-full mt-2' id="original" onChange={getHandler('title')} type="text" value={criteria.title} placeholder='ie. size, subject, medium, etc...'/>
                    </div>
                );
            case 'type':
                const productTypeChangeHandler = getHandler('productTypes');
                return (
                    <div className='w-full py-5 flex flex-wrap items-center' cursor-pointer>
                        <span className='w-full uppercase text-lg tracking-wide'>Product Type</span>
                        <div className='w-full p-2'>
                            <input className="cursor-pointer" id="oil paintings" value="oil paintings" onInput={productTypeChangeHandler} type="checkbox" checked={criteria.productTypes.includes('oil paintings')} />
                            <label className='px-2 cursor-pointer' htmlFor="oil paintings">Originals</label>
                        </div>
                        <div className='w-full p-2'>
                            <input className="cursor-pointer" id="print" value="Print" onInput={productTypeChangeHandler} type="checkbox" checked={criteria.productTypes.includes('Print')} />
                            <label className='px-2 cursor-pointer' htmlFor="print">Prints</label>
                        </div>
                        <div className='w-full p-2'>
                            <input className='cursor-pointer' name="commission" id="commission" value="commission" onInput={productTypeChangeHandler} type="checkbox" checked={criteria.productTypes.includes('commission')} />
                            <label className='px-2 cursor-pointer' htmlFor="commission">Previous Commissions</label>
                        </div>
                    </div>
                );
            case 'price':
                return (
                    <div className='w-full py-5 flex flex-wrap'>
                        <label className='w-full uppercase text-lg tracking-wide' htmlFor="price">{`Price Range: ${getPrettyPrice(criteria.minPrice)} - ${getPrettyPrice(criteria.maxPrice)}`}</label>
                        <input className='price-range w-11/12 cursor-pointer' id="price" value={criteria.maxPrice} onInput={getHandler('maxPrice')} type="range" min={criteria.minPrice} max={criteria.absoluteMaxPrice} />
                    </div>
                );
            default:
                return null;
        }
    }
    if (showFacets) {
        return (
            <div className='filter-pop-out' ref={wrapperRef}>
                <button onClick={() => setShowFacets(false)} className='ml-auto p-2 focus:outline-none cursor-pointer'>
                    <FontAwesomeIcon icon={faTimesCircle} className='text-xl' />
                </button>
                <ul className='m-auto px-4 md:px-10'>
                    {facets.map(renderFacets)}
                </ul>
            </div>
        )
    }
    return (
        <div className={`top-0 left-50 ${isSticky ? 'fixed z-10 p-2 mt-2 bg-white rounded lg:p-5' : 'absolute'}`}>
            <button onClick={() => setShowFacets(true)} className='focus:outline-none cursor-pointer' ref={buttonRef}>
                <span className='tracking-wider text-xl'>FILTER </span><FontAwesomeIcon icon={faSlidersH} />
            </button>
        </div>
    )
}

const VALID_QUERY_PARAMS = ['maxPrice', 'productTypes', 'excludeSold', 'sortBy', 'title', 'excludeSold'];

const getDefaultCriteria = (arr) => {
    const defaultCriteria = arr.reduce((acc, product) => {
        const parsedMin =  parseInt(product.priceRange.low, 10)
        const parsedMax =  parseInt(product.priceRange.high, 10)
        return {
            ...acc,
            maxPrice: parsedMax > acc.maxPrice ? parsedMax : acc.maxPrice,
            absoluteMaxPrice: parsedMax > acc.maxPrice ? parsedMax : acc.maxPrice,
            minPrice: (parsedMin < acc.minPrice) && parsedMin ? parsedMin : acc.minPrice,
        };
    }, {
        absoluteMaxPrice: 100,
        maxPrice: 100,
        minPrice: 100,
        productTypes: ['oil paintings', 'Print', 'commission'],
        excludeSold: false,
        sortBy: 'price-desc',
        title: ''
    });
    return defaultCriteria;
};

const readQueryStrings = (queryStrings, products) => {
    const params = new URLSearchParams(queryStrings);
    const defaultCriteria = getDefaultCriteria(products);
    
    Array.from(params.keys()).forEach((key) => {
        if (VALID_QUERY_PARAMS.includes(key)) {
            const value = params.get(key);
            if (key === 'maxPrice') {
                defaultCriteria[key] = parseInt(value, 10);
            }
            else if (key === 'productTypes') {
                defaultCriteria[key] = value.split(',');
            }
            else {
                defaultCriteria[key] = value;
            }
        }
    });
    return defaultCriteria;
}

const writeQueryStrings = (obj) => {
    const newUrl = Object
        .entries(obj)
        .reduce((str, [key, value]) => {
            if (key === 'productTypes') {
                return `${str}productTypes=${value.join(',')}&`
            }
            return `${str}${key}=${value}&`
        }, '?');
    navigate(newUrl);
}

const userSelectedSortFn = (selection) => {
    return selection === 'price-asc'
        ? (a, b) => parseInt(a.priceRange.low, 10) - parseInt(b.priceRange.low, 10)
        : (a, b) => parseInt(b.priceRange.low, 10) - parseInt(a.priceRange.low, 10)
}

const filterProductsByCriteria = (products, filterCriteria) => {
    return products
        .filter((p) => {
            const lowestPrice = parseInt(p.priceRange.low, 10);
            const isForSale = hasAvailableInventory(p.variants);
            const shouldInclude = (
                (p.title.includes(filterCriteria.title) || p.description.includes(filterCriteria.title)) &&
                lowestPrice <= filterCriteria.maxPrice &&
                filterCriteria.productTypes.includes(p.productType) &&
                // this is so dumb
                ((!filterCriteria.excludeSold || filterCriteria.excludeSold === 'false') || (filterCriteria.excludeSold === 'true' && isForSale))
            );
            return shouldInclude;
        });
}

export default ({
    data: {
        allShopifyProduct: { nodes: products }
    },
    location
}) => {
    const filterCriteria = readQueryStrings(location.search, products);
    const filteredProducts = filterProductsByCriteria(products, filterCriteria);

    return (
        <SEO
            title="Shop"
            pathname={location.pathname}
            description={description}>
            <Layout classNames="relative" location={location}>
                <FilterSidebar criteria={filterCriteria} />
                {(filteredProducts.length > 0)
                    ? <ShopGrid products={filteredProducts} path={location.pathname} sortFn={userSelectedSortFn(filterCriteria.sortBy)}/>
                    : <p>No results. Please refine your search!</p>
                }
            </Layout>
        </SEO>
    );
}

export const query = graphql`
    query GetAllProducts {
        allShopifyProduct {
            nodes {
                id
                title
                collection
                slug
                productType
                totalInventory
                priceRange {
                    high
                    low
                }
                description
                variants {
                    image
                    availableForSale
                    localFile {
                        small: childImageSharp {
                            fixed(width: 300) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        medium: childImageSharp {
                            fixed(width: 500) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                        large: childImageSharp {
                            fixed(width: 700) {
                                ...GatsbyImageSharpFixed
                            }
                        }
                    }
                }
            }
        }
    }    
`
