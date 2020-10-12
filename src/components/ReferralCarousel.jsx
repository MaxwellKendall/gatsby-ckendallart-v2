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
        <div className="py-12 lg:py-24 flex align-center w-full">
            <Arrow onClick={previousReferral} direction="left"/>
            <p className="self-center text-center w-4/6 script-font tracking-wide text-4xl opacity-75 md:text-left">
                {referrals[activeReferral]}
            </p>
            <Arrow onClick={previousReferral} direction="right" onClick={nextReferral} />
        </div>
    );
};
