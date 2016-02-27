// Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('graceful-fs');
var http = require('http');
var httpClient = require('./helpers/httpClient.js');
var websocket = require('./helpers/websocket.js');
var logger = require('morgan');

// Routes
var rumors = require('./routes/rumors.js');
var wants = require('./routes/wants.js');


// Get arguments and config
var argv = require('minimist')(process.argv.slice(2));
var config = require('./helpers/config.js');
var rumorStorage = require('./helpers/rumor-storage.js');


// Set up specifics of the client
var protocol = argv.hasOwnProperty('pr') ? argv.pr : 'http';
var domain = argv.hasOwnProperty('d') ? argv.d : 'localhost';
var port = argv.hasOwnProperty('p') ? argv.p : 9876;
var sleepInterval = argv.hasOwnProperty('s') ? argv.s : 900;
var neighbors = argv.hasOwnProperty('n') ? JSON.parse(argv.n) : [];



// Setting up instance configurations
config.baseUrl = protocol + '://' + domain + ':' + port;
config.sleep = sleepInterval;
config.neighbors = neighbors;
config.setBaseUrl(domain, port);
config.setSleep(sleepInterval);
config.setNeighbors(neighbors);
//rumorStorage.save(config.getOriginId());


// Start up server
var app = express();
var server = http.Server(app);
server.listen(port);

var message = "Server listening on port " + port + "\n";
message += "Origin ID: " + config.getOriginId() + "\n";
message += "Originator name: " + config.getOriginator() + "\n";
console.log(message);




// Add middleware
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(logger('dev'));

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




// Set up routes
app.use('/', rumors);
app.use('/', wants);
app.use('/public', express.static(__dirname + '/public'));
app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));
app.get('/', function(req, res) {
    res.render('index', {originator: config.getOriginator(), baseUrl: config.getBaseUrl()});
});

websocket.init(server);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/*
// Looping functionality

function sleep() {
    setInterval(loop, config.getSleep() * 5);
}

var wantSize = 0;
var pastWant = null;
function loop() {
    var neighborUrl1 = config.getNeighbor();
    var neighborUrl2 = config.getNeighbor();

    var randomRumor = rumorStorage.getRumor();
    if (randomRumor != null) {
        httpClient.send(neighborUrl1 + '/rumors', randomRumor);
    }
    httpClient.send(neighborUrl2 + '/wants', rumorStorage.getWant());
    sleep();
}

sleep();

//var neighborUrl1 = config.getNeighbor();
//var neighborUrl2 = config.getNeighbor();

//httpClient.send(neighborUrl1 + '/rumors', rumorStorage.getRumor());
//httpClient.send(neighborUrl2 + '/wants', rumorStorage.getWant());
*/

var fork = require('child_process').fork;
child = fork('./send-loop.js', ['-u', config.getBaseUrl()]);
child.on('message', function(data) {
    //console.log("Parent receiving message", data);
    child.send({rumors: rumorStorage.getRumors(), messages: rumorStorage.getMessages()});
});

child.send({message: 'this'});