const express = require('express');
// const PageFetcher=require('./pagefetcher');

exports = module.exports = function run(port){

    const app = express();

    app.get('/test', function (req, res) {
        res.end( 'hello puppeteer!' );
    })

    app.get('/open', async function (req, res) {
        if(req.query.reload)
            delete require.cache[require.resolve('./pagefetcher')];

        let url=req.query.url;
        if(url==null)
            url='http://vip.stock.finance.sina.com.cn/mkt/';
        const PageFetcher=require('./pagefetcher');
        console.log( 'originalUrl: '+req.originalUrl+', query.url: '+url );
        const pageFetcher=new PageFetcher();
        const result=await pageFetcher.fetch(url);
        // let helper=new PageFetcher.Helper();
        // helper.log();

        res.send(result);
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
