// Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var httpClient = require('./helpers/httpClient.js');
var websocket = require('./helpers/websocket.js');

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


// Start up server
var app = express();
var server = http.Server(app);
server.listen(port);

var message = "Server listening on port " + port + "\n";
message += "Origin ID: " + config.getOriginId() + "\n";
message += "Originator name: " + config.getOriginator() + "\n";
message += "Go to 'http://localhost:" + port + "' to access the messaging client\n";
console.log(message);




// Add middleware
app.set('view engine', 'jade');
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



var fork = require('child_process').fork;
var sendLoop = fork(__dirname + '/send-loop.js', ['-s', config.getSleep()]);
sendLoop.on('message', function(data) {
    var isWant = Math.floor(Math.random() * 2);
        
    var neighborUrl = null;
    var body = null;

    if (isWant || !rumorStorage.hasUnsentRumors()) {
        neighborUrl = config.getNeighbor() + '/wants';
        body = rumorStorage.getWant();
    } else {
        var data = rumorStorage.getRandomUnsentRumor()
        neighborUrl = data.Neighbor + '/rumors';
        body = data.RandomRumor;
    }

    httpClient.send(neighborUrl, body);
});