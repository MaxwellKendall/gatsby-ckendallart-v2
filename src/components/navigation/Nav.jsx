import React, { useState } from 'react';
import { Link  } from 'gatsby';
import Img from "gatsby-image";

import { usePages } from "../../helpers/navigation";

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

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 25 25" fillRule="evenodd" clipRule="evenodd">
        <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z"/>
    </svg>
);

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fillRule="evenodd" clipRule="evenodd">
        <path d="M0 12v1h23v-1h-23z"/>
    </svg>
);

export const ExpandableMenuIcon = ({
    name,
    link,
    childPages
}) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => {
        setExpanded(!expanded);
    };
    if (expanded) {
        return (
            <li className="p-2 md:relative text-xl mt-10 md:mt-2 md:text-lg md:mx-4">
                <button onClick={toggleExpand} className="focus:outline-none flex items-start w-full justify-center md:justify-evenly">
                    <span className="mr-2">{name.toUpperCase()}</span>
                    <MinusIcon />
                </button>
                <ul className="md:absolute md:bg-white md:z-10 md:rounded md:shadow">
                    {childPages.map((childPage, i) => (
                        <li className={`p-2 mt-2 text-sm md:m-0 md:text-lg md:px-4 ${i === 1 ? 'test': ''}`}>
                            <Link to={`/${childPage.name.toLowerCase()}`}>
                                {childPage.name.toUpperCase()}
                            </Link>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }
    return (
        <li className="p-2 mt-10 text-xl md:mt-2 md:text-lg md:mx-4">
            <button onClick={toggleExpand} className="focus:outline-none flex items-center w-full justify-center md:items-center md:justify-evenly">
                <span className="mr-2">{name.toUpperCase()}</span>
                <PlusIcon />
            </button>
        </li>
    );
};

export default () => {
    const { pages, logo } = usePages();
    return (
        <header className="hidden p-5 w-full mb-4 md:pt-4 md:align-center md:flex md:flex-col md:justify-center">
            <Link to='/cart' className="ml-auto self-center order-2 pr-5 md:order-none md:self-start">
                <CartIcon />
            </Link>
            <Link to='/' className={`mx-auto`}>
                <h1 className="text-2xl">CLAIRE KENDALL</h1>
            </Link>
            <ul className={`w-full flex-col items-center text-center justify-center md:flex md:flex-row`}>
                {[
                    // <li className="flex items-center p-5 mt-10 text-xl md:text-lg">
                    //     <SearchIcon />
                    // </li>,
                    ...pages.slice(0, 2)
                        .map((page) => {
                            if (page.isExpandable) {
                                return (
                                    <ExpandableMenuIcon {...page} />
                                );
                            }
                            return  (
                                <li className="p-2 mt-2 text-xl md:text-lg mx-4">
                                    <Link to={page.link}>
                                        {page.name.toUpperCase()}
                                    </Link>
                                </li>
                            )
                        }),
                        <li className="hidden md:flex p-2 mt-2 ml-5 text-xl md:text-lg mx-4">
                            <Link to="/">
                                <Img fluid={logo} className="w-24 mx-auto h-12" />
                            </Link>
                        </li>,
                    ...pages.slice(2, 4)
                        .map((page) => (
                            <li className="p-5 mt-2 text-xl md:text-lg mx-4">
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