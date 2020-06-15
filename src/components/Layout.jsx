import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright, faShoppingCart, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(
    faCopyright,
    faShoppingCart,
    faSpinner
)

require('../../styles/index.scss');

export default ({ children, pageName = 'default' }) => (
    <div className="global-container max-w-3xl m-auto flex justify-center flex-col min-h-full">
        <header className="py-10 px-5 align-center w-full flex justify-center">
            <h1 className="text-2xl">Claire Kendall Art</h1>
            <FontAwesomeIcon className="ml-auto" icon="shopping-cart"  />
        </header>
        <main className={`${pageName} flex flex-col h-full flex-grow px-10`}>
            {children}
        </main>
        <footer className='flex-shrink-0 p-5 text-center'>
            {`Claire Kendall Art, ${new Date().getFullYear()}`}
            <FontAwesomeIcon className="ml-2" icon={['fas', 'copyright']}  />
        </footer>
    </div>
)