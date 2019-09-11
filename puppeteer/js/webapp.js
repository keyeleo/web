const express = require('express');
const Logger=require('./logger');

exports = module.exports = function run(port){

    const app = express();

    app.get('/test', function (req, res) {
        res.end( 'hello puppeteer!' );
    })

    // usage: 'http://127.0.0.1/open?url=http://www.baidu.com'
    app.get('/open', async function (req, res) {
        if(req.query.reload)
            delete require.cache[require.resolve('./pagefetcher')];

        let url=req.query.url;
        if(url==null)
            res.end('no url set(url=http://website)');
        const PageFetcher=require('./pagefetcher');
        const result=await PageFetcher.fetch(url);

        res.send(result);
    })

    app.get('/close', function (req, res) {
        server.close();
        res.end( 'close puppeteer!' );
    })

    var server = app.listen(port, function () {

        const _host = server.address().address
        const _port = server.address().port
        Logger.log("server listen at: http://"+_host+":"+_port)
    })
}
