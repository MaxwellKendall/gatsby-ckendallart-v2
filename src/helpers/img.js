
/**
 * 
 * @param {Array} fixed return from ...GatsbyImgFixed fragment in graphql
 * @returns {Object} w/ properties srcSet and sizes. Object values are strings like this:
 * {
 *      srcSet: "two.png 100w, three.png 500w, four.png 1000w",
 *      sizes: "(min-width: 900px) 1000px, (max-width: 900px and (min-width: 400px)) 1000px,"
 * }
 */
export const getSrcSetAndSizesFromFixed = (fixed) => {
    console.log('fixed', fixed);
    return fixed
        .reduce((obj, item) => {
            const sizes = obj.sizes
                ? ` ${item.media} ${item.width}px`
                : `${item.media} ${item.width}px`;
            const srcSet = obj.srcSet
                ? ` ${item.src} ${item.width}w`
                : `${item.src} ${item.width}w`;
            return {
                srcSet: `${obj.srcSet}${srcSet},`,
                sizes: `${obj.sizes}${sizes},`
            };
        }, { srcSet: "", sizes: "" });
};

export const getSrcFromFixed = (fixed) => {
    return { src: fixed[0].src };
};

export const getHeightAndWidthFromFixed = (fixed) => {
    return {
        width: fixed[0].width,
        height: fixed[0].height
    }
}