const https = require('https');
// const pw = process.env.PW;
// const apiKey = process.env.API_KEY;
const apiKey = 'a743ff35e7cce9f11082d33d3bc5c305';
const pw = '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';

const variantId = '48256754632';
const options = {
    hostname: `ckendallart.myshopify.com`,
    path: `/admin/api/2020-07/variants/${variantId}.json`,
    method: `GET`,
    // port: 80,
    headers: {
        'Authorization': 'Basic ' + new Buffer(apiKey + ':' + pw).toString('base64')
    }
};

const promise = new Promise((resolve, reject) => {
    https.get(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        let body;
    
        res.on('data', (d) => {
            console.log(typeof d)
            body = new Buffer(d).toString('utf-8');
        });
        
        res.on('end', () => {
            resolve({
                statusCode: 200,
                body: JSON.parse(body)
            });
        });
    
        res.on('error', (e) => {
            reject({
                statusCode: 500,
                body: e
            });
        });
    });
});

return promise.then((data) => console.log('data', data));
