// Dependencies
var httpClient = require('./helpers/httpClient.js');
var sleep = require('sleep');
var request = require('request');

var argv = require('minimist')(process.argv.slice(2));
var config = require('./helpers/config.js');
var rumorStorage = require('./helpers/rumor-storage.js');

var sleepInterval = argv.hasOwnProperty('s') ? argv.s : 500;

var sendReminder = function() {
    process.send({});

    setTimeout(sendReminder, sleepInterval);
};

sendReminder();