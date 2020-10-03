
const imgBreakPointsByTShirtSize = {
    small: `(min-width: 0px) and (max-width: 767px)`,
    medium: `(min-width: 768px) and (max-width: 1399px)`,
    large: `(min-width: 1400px)`,
    hoverImg: {
        small: `(min-width: 0px) and (max-width: 767px)`,
        medium: `(min-width: 768px)`
        // large: `(min-width: 1200px)  and (max-width: 1799px)`,
        // xl: `(min-width: 1800px)`
    }
};

// TODO: should except fluid/fixed as param
export const getResponsiveImages = (
    { img },
    breakPointsByTshirtSize = imgBreakPointsByTShirtSize
) => {
    if (!img) return null;
    const rtrn = {
        responsiveImgs: Object
            .keys(img)
            .map((key) => ({
                imgSize: key,
                ...img[key].fixed,
                media: breakPointsByTshirtSize[key]
            }))
    };
    if (img.hoverImgs) {
        return {
            responsiveHoverImgs: Object.keys(img.hoverImgs)
                .map((key) => ({
                    imgSize: key,
                    ...img.hoverImgs[key],
                    media: breakPointsByTshirtSize.hoverImg[key]
                })),
            ...rtrn
        };
    };
    return rtrn;
};

export const getFileAsBase64String = (file) => {
    if (!file) return Promise.resolve();
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject("REJECTEDD!!!!");
        };
    });
};