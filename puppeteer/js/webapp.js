var express = require('express');
var browse=require('./browse');

exports = module.exports = function run(port){

    var app = express();

    app.get('/test', function (req, res) {
        res.end( 'hello puppeteer!' );
    })

    app.get('/open', function (req, res) {
        console.log( 'originalUrl: '+req.originalUrl+', query.url: '+req.query.url );
        browse(req.query.url);
        res.end( 'open puppeteer!' );
    })

    app.get('/close', function (req, res) {
        server.close();
        res.end( 'close puppeteer!' );
    })

    var server = app.listen(port, function () {

        var _host = server.address().address
        var _port = server.address().port
        console.log("server listen at: http://%s:%s", _host, _port)
    })
}
