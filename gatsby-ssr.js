const React = require("react");

const Recaptcha = () => (
    <script src={`https://www.google.com/recaptcha/api.js?render=${GATSBY_RECAPTCHA_ID}`}></script>
);

console.log('process', process.env.GTM_ID);
console.log('process', process.env.CLARITY_ID);
console.log('process', process.env.RECAPTCHA_SITE_KEY);

const Gtm = () => (
    <script>
        ((w,d,s,l,i) => {
            w[l] = w[l] || [];
            w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', GATSBY_GTM_ID);
    </script>
);

const Clarity = () => (
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "3w8xt0o117");
    </script>
);

const GtmNoScript = () => (
    <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GATSBY_GTM_ID}`} height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
);

export { wrapRootElement } from "./wrap-root-element";

// Load Clarity & GTM.
exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents, getPreBodyComponents, replacePreBodyComponents }) => {
    const isProd = process.env.ENV === 'production';
    replaceHeadComponents(getHeadComponents()
        .concat([
            recpatcha,
            Gtm,
            Clarity
        ])
    );
    replacePreBodyComponents(getPreBodyComponents()
        .concat([
            const GtmNoScript = () => (

        ])
    );
  }