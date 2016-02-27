// Dependencies
var httpClient = require('./helpers/httpClient.js');
var sleep = require('sleep');
var request = require('request');

var argv = require('minimist')(process.argv.slice(2));
var config = require('./helpers/config.js');
var rumorStorage = require('./helpers/rumor-storage.js');

var url = argv.hasOwnProperty('u') ? argv.u : 'http://localhost';
var sleepInterval = argv.hasOwnProperty('s') ? argv.s : 500;

var socket = require('socket.io-client')(url);

//while (1) {
//    socket.emit('send random message');
//    sleep.usleep(sleepInterval);
//}

var emitMessage = function() {
    socket.emit('send random message');

    setTimeout(emitMessage, sleepInterval);
};

emitMessage();