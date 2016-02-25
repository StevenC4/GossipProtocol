var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');


// Get arguments and config
var argv = require('minimist')(process.argv.slice(2));
var config = require('./model/config.js');
var rumorStorage = require('./model/rumor-storage.js');


// Set up routes
var rumors = require('./routes/rumors.js');
var wants = require('./routes/wants.js');


// Set up specifics of the client
var domain = argv.hasOwnProperty('d') ? argv.d : 'localhost';
var port = argv.hasOwnProperty('p') ? argv.p : 9876;
var sleep = argv.hasOwnProperty('s') ? argv.s : 500;
var neighbors = argv.hasOwnProperty('n') ? JSON.parse(argv.n) : [];

config.setBaseUrl(domain, port);
config.setSleep(sleep);
config.setNeighbors(neighbors);


// Start up server
var app = express();
var server = http.Server(app);
server.listen(port);
var io = require('socket.io')(server);

var message = "Server listening on port " + port + "\n";
message += "Origin ID: " + config.getOriginId() + "\n";
message += "Originator name: " + config.getOriginator() + "\n";
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

app.use('/', rumors);
app.use('/', wants);
app.use('/public', express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.render('index', {originator: config.getOriginator(), baseUrl: config.getBaseUrl()});
});

io.on('connection', function(socket) {
    socket.on('init', function() {
        socket.emit('update conversation', {messages: rumorStorage.getMessages()});
    });
   
    socket.on('chat message', function(data) {
        var rumor = {
	    "Rumor": {
		MessageID: config.getNewMessageId(),
	        Originator: config.getOriginator(),
	        Text: data.text
	    },
	    "EndPoint": config.getBaseUrl(),
	    "Timestamp": Math.floor(new Date() / 1000)
	};

        rumorStorage.store(rumor);

	socket.emit('update conversation', {messages: rumorStorage.getMessages()});
    });
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
