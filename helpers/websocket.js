var config = require('./config.js');
var rumorStorage = require('./rumor-storage.js');

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
                    Text: data.text
                },
                "EndPoint": config.getBaseUrl(),
                "Timestamp": Math.floor(new Date() / 1000)
            };

            rumorStorage.store(rumor);
            socket.emit('update conversation', {messages: rumorStorage.getMessages()});
        });

        socket.on('request send loop init', function() {
            socket.emit('send loop init', {config: config.getConfig(), rumors: rumorStorage.getRumors(), messages: rumorStorage.getMessages()});
        });

        socket.on('send updated rumors', function() {
            socket.emit('receive updated rumors', {1: "Here"});
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
