var bodyParser = require('body-parser');
var express = require('express');

var rumors = require('./routes/rumors.js');
var wants = require('./routes/wants.js');

var port = 9876;

var app = express();

app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.use('/', rumors);
app.use('/', wants);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.listen(port, function() {
    console.log("Server listening on port " + port);
});
