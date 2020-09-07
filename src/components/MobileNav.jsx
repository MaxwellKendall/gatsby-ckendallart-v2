import React, { useState } from 'react';
import { Link } from 'gatsby';
import Img from "gatsby-image";

import { usePages } from "../helpers/navigation";
import { SearchIcon, CartIcon } from './Nav';

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fillRule="evenodd" clipRule="evenodd">
        <path d="M24 18v1h-24v-1h24zm0-6v1h-24v-1h24zm0-6v1h-24v-1h24z" fill="#1040e2"/>
        <path d="M24 19h-24v-1h24v1zm0-6h-24v-1h24v1zm0-6h-24v-1h24v1z"/>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fillRule="evenodd" clipRule="evenodd">
        <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z"/>
    </svg>
)

const NavIcon = ({ classNames = '', isOpen, onClick }) => (
    <button
        onClick={onClick}
        className={`${classNames}`} >
        {isOpen && <CloseIcon />}
        {!isOpen && <MenuIcon />}
    </button>
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

const ExpandableMenuIcon = ({
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
            <li className="p-2 mt-10 text-xl">
                <Link to={link}>
                    {name.toUpperCase()}
                </Link>
                <button onClick={toggleExpand} className="focus:outline-none ml-5">
                    <MinusIcon />
                </button>
                <ul>
                    {childPages.map((childPage) => (
                        <li className="p-2 mt-2 text-sm">
                            <Link to={`${name}/${childPage.name}`}>
                                {childPage.name.toUpperCase()}
                            </Link>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }
    return (
        <li className="p-2 mt-10 text-xl">
            <Link to={link}>
                {name.toUpperCase()}
            </Link>
            <button onClick={toggleExpand} className="focus:outline-none ml-5">
                <PlusIcon />
            </button>
        </li>
    );
};

export default () => {
    const { pages, logo } = usePages();
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        if (isOpen) {
            setIsOpen(false);
        }
        else {
            setIsOpen(true);
        }
    };
    return (
        <header className="flex  py-5 md:hidden">
            <NavIcon isOpen={isOpen} onClick={toggleMenu} classNames={`pl-5 ${isOpen ? 'hidden ': ''}`} />      
            <Link to='/' className={`mx-auto ${isOpen ? 'hidden ': ''}`}>
                <h1 className="text-2xl">CLAIRE KENDALL</h1>
            </Link>
            <Link to='/cart' className={`self-center pr-5 ${isOpen ? 'hidden ': ''}`}>
                <CartIcon />
            </Link>
            {isOpen && (
                <div className="w-full bg-white p-5 fixed z-10 top-0 bottom-0">
                    <div className="flex">
                        <Img fluid={logo} className="w-20 h-8 mr-auto self-start" />
                        <NavIcon isOpen={isOpen} onClick={toggleMenu} classNames="ml-auto" />
                    </div>
                    <ul className={`w-full flex-col items-center text-center justify-center`}>
                        {pages.map((page) => {
                            console.log('page', page)
                            if (page.isExpandable) {
                                return <ExpandableMenuIcon {...page} />
                            } 
                            return (
                                <li className="p-2 mt-10 text-xl">
                                    <Link to={page.link}>
                                        {page.name.toUpperCase()}
                                    </Link>
                                </li>
                            );
                        }
                        )}
                    </ul>
                </div>
            )}
        </header>
    );
}