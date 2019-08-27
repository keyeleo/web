const express = require('express');
// const PageFetcher=require('./pagefetcher');

exports = module.exports = function run(port){

    const app = express();

    app.get('/test', function (req, res) {
        res.end( 'hello puppeteer!' );
    })

    app.get('/open', function (req, res) {
        if(req.query.reload)
            delete require.cache[require.resolve('./pagefetcher')];

        const PageFetcher=require('./pagefetcher');
        console.log( 'originalUrl: '+req.originalUrl+', query.url: '+req.query.url );
        const pageFetcher=new PageFetcher();
        pageFetcher.fetch(req.query.url).then();
        // let helper=new PageFetcher.Helper();
        // helper.log();

        res.end( 'open puppeteer!' );
    })

    app.get('/close', function (req, res) {
        server.close();
        res.end( 'close puppeteer!' );
    })

    var server = app.listen(port, function () {

        const _host = server.address().address
        const _port = server.address().port
        console.log("server listen at: http://%s:%s", _host, _port)
    })
}
