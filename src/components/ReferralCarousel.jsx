import React, { useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Arrow from './Arrow';

export default () => {
    const [activeReferral, setActiveReferral] = useState(0);
    const nextReferral = (e) => {
        e.preventDefault();
        if (activeReferral === referrals.length - 1) {
          return;
        }
        setActiveReferral(activeReferral + 1);
      }
    
    const previousReferral = (e) => {
    e.preventDefault();
    if (activeReferral === 0) {
        return;
    }
    setActiveReferral(activeReferral - 1);
    }

    const { site: { siteMetadata: { referrals }}} = useStaticQuery(
        graphql`
            query GetReferrals {
                site {
                    siteMetadata {
                        referrals
                    }
                }
            }
        `
    )
    return (
        <div className="py-12 lg:py-24 flex flex-col md:flex-row align-center w-full">
            <Arrow onClick={previousReferral} direction="left" classNames="hidden md:flex" />
            <p className="self-center text-center w-full text-xl md:text-2xl lg:text-3xl xl:text-4xl px-2 md:px-auto md:w-4/6 script-font tracking-wide opacity-75">
                {referrals[activeReferral]}
            </p>
            <div className="flex md:hidden">
                <Arrow onClick={previousReferral} direction="left" classNames="mr-2" />
                <Arrow onClick={previousReferral} direction="right" onClick={nextReferral} classNames="ml-2" />
            </div>
            <Arrow onClick={previousReferral} direction="right" onClick={nextReferral} classNames="hidden md:flex" />
        </div>
    );
};
