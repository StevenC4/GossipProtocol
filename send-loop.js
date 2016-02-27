// Dependencies
var httpClient = require('./helpers/httpClient.js');
var sleep = require('sleep');
var request = require('request');

var argv = require('minimist')(process.argv.slice(2));
var config = require('./helpers/config.js');
var rumorStorage = require('./helpers/rumor-storage.js');

var url = argv.hasOwnProperty('u') ? argv.u : 'http://localhost';

var socket = require('socket.io-client')(url);

process.on('message', function(data) {
    console.log("Child receiving message", data);
});

socket.on('send loop init', function(data) {
    config.setConfig(data.config);
    rumorStorage.setRumors(data.rumors);
    rumorStorage.setMessages(data.messages);

    //socket.on('receive updated rumors', function(data) {
    //    console.log(data);
    //});
    while (1) {
        //rumorStorage.load(config.getOriginId());

        var neighborUrl = config.getNeighbor();

        var isWant = Math.floor(Math.random() * 2);
        var data = null;

        if (isWant || rumorStorage.rumorEmpty()) {
            neighborUrl += '/wants';
            data = rumorStorage.getWant();
        } else {
            neighborUrl += '/rumors';
            data = rumorStorage.getRumor();
        }

        //httpClient.send(neighborUrl, data);

        request({
            url: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }, function(error, response, body) {
            console.log(error, response, body);
            var now = new Date().getTime();
            while(new Date().getTime() < now + 1000) {
                // do nothing
            }
        });

        process.send({message: 'that'});

        //console.log(neighborUrl);
        //console.log(data);
        //console.log();
        //console.log();

        //sleep.usleep(config.getSleep() * 1000);
        //sleep.usleep(config.getSleep() * 100);


    }
    /*    request({
     url: neighborUrl,
     method: 'POST',
     headers: {
     'Content-Type': 'application/json'
     },
     body: JSON.stringify(data)
     }, function(error, response, body) {
     console.log(error, response, body);
     });*/
});

socket.emit('request send loop init');
