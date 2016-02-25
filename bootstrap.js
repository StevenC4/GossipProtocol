var fork = require('child_process').fork;
var fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));

var clients = null;

if (argv.hasOwnProperty('f')) {
    clients = JSON.parse(fs.readFileSync(argv.f, 'utf8'));
} else {

    var numClients = argv.hasOwnProperty('c') ? argv.c : 8;

    var currentPort = 9384;
    
    clients = {};
    for (var i = 0; i < numClients; i++) {
        clients[i] = {
	    domain: "localhost",
	    port: currentPort++,
	    neighbors: [(((i - 1) % numClients) + numClients) % numClients, (i + 1) % numClients]
	}
    }
}

var keys = Object.keys(clients);
var children = {};

for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var client = clients[key];

    var neighbors = [];
    for (var j = 0; j < client.neighbors.length; j++) {
        var neighborIndex = client.neighbors[j];
	var neighbor = clients[neighborIndex];
	neighbors.push({domain: neighbor.domain, port: neighbor.port});
    }

    children[i] = fork('./server.js', ['-d', client.domain, '-p', client.port, '-n', JSON.stringify(neighbors)]);    
}
