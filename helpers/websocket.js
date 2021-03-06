var config = require('./config.js');
var rumorStorage = require('./rumor-storage.js');
var httpClient = require('./httpClient.js');

var functions = {};

var io = null;

functions.init = function(server) {
    io = require('socket.io')(server);

    io.on('connection', function(socket) {

        socket.on('init', function() {
            socket.emit('update conversation', {messages: rumorStorage.getMessages()});
        });

        socket.on('chat message', function(data) {
            var rumor = {
                "Rumor": {
                    MessageID: config.getNewMessageId(),
                    Originator: config.getOriginator(),
                    Text: data.text,
                    Timestamp: Math.floor(new Date() / 1000)
                },
                "EndPoint": config.getBaseUrl()
            };

            rumorStorage.store(rumor);
            socket.emit('update conversation', {messages: rumorStorage.getMessages()});
        });

        socket.on('add neighbor', function(data) {
            var neighbor = data.url;
            config.addNeighbor(neighbor);
            rumorStorage.updateUnsentMessages(neighbor);
        });
    });
};

functions.receiveMessage = function() {
    io.sockets.emit('update conversation', {messages: rumorStorage.getMessages()});
};

functions.sendRumors = function(rumors, messages) {
    io.sockets.emit('update rumors', {rumors: rumors, messages: messages});
};

module.exports = functions;
