import React from 'react';
import Img from "gatsby-image";

import { getServerSideMediaQueries } from '../helpers/img';

export default ({
    classNames = '',
    responsiveImgs,
    imgRef,
    imgName
}) => {
    return (
        <>
            <style>{getServerSideMediaQueries(responsiveImgs, imgName)}</style>
            <Img
                ref={imgRef}
                className={`${classNames} ${imgName}`}
                fixed={responsiveImgs} />
        </>
    );
};
