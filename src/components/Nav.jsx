import React from 'react';
import { Link  } from 'gatsby';
import Img from "gatsby-image";

import { usePages } from "../helpers/navigation";
import { ExpandableMenuIcon } from './MobileNav';

export const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fillRule="evenodd" clipRule="evenodd">
        <path d="M13.5 21c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5m0-2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5m-6 2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5m0-2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5m16.5-16h-2.964l-3.642 15h-13.321l-4.073-13.003h19.522l.728-2.997h3.75v1zm-22.581 2.997l3.393 11.003h11.794l2.674-11.003h-17.861z" />
    </svg>
);

export const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fillRule="evenodd" clipRule="evenodd">
        <path d="M15.853 16.56c-1.683 1.517-3.911 2.44-6.353 2.44-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5c0 2.442-.923 4.67-2.44 6.353l7.44 7.44-.707.707-7.44-7.44zm-6.353-15.56c4.691 0 8.5 3.809 8.5 8.5s-3.809 8.5-8.5 8.5-8.5-3.809-8.5-8.5 3.809-8.5 8.5-8.5z"/>
    </svg>
);

export default () => {
    const { pages, logo } = usePages();
    return (
        <header className="hidden p-5 w-full mb-12 md:pt-10 md:align-center md:flex md:flex-col md:justify-center">
            <Link to='/cart' className="ml-auto self-center order-2 pr-5 md:order-none md:self-start">
                <CartIcon />
            </Link>
            <Link to='/' className={`m-auto`}>
                <h1 className="text-2xl">CLAIRE KENDALL</h1>
            </Link>
            <ul className={`w-full flex-col items-center text-center justify-center md:flex md:flex-row`}>
                {[
                    <li className="flex items-center p-5 mt-10">
                        <SearchIcon />
                    </li>,
                    ...pages.slice(0, 2)
                        .map((page) => {
                            if (page.isExpandable) {
                                return (
                                    <ExpandableMenuIcon {...page} />
                                );
                            }
                            return  (
                                <li className="p-2 mt-10">
                                    <Link to={page.link}>
                                        {page.name.toUpperCase()}
                                    </Link>
                                </li>
                            )
                        }),
                        <li className="hidden md:flex p-2 mt-10 ml-5">
                            <Link to="/">
                                <Img fluid={logo} className="w-24 mx-auto h-12" />
                            </Link>
                        </li>,
                    ...pages.slice(2, 4)
                        .map((page) => (
                            <li className="p-5 mt-10">
                                <Link to={page.link}>
                                    {page.name.toUpperCase()}
                                </Link>
                            </li>
                        ))
                ]}
            </ul>
    </header>
    );
}