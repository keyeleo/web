var express = require('express');
var app = express();

app.get('/test', function (req, res) {
    res.end( 'hello puppeteer!' );
})

app.get('/open', function (req, res) {
    console.log( 'baseUrl: '+req.baseUrl+', originalUrl: '+req.originalUrl+', query.url: '+req.query.url );
    var browse=require('./js/browse');
    browse(req.query.url);
    res.end( 'open puppeteer!' );
})

app.get('/close', function (req, res) {
    server.close();
    res.end( 'close puppeteer!' );
})

var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port
    console.log("server listen at: http://%s:%s", host, port)
})
