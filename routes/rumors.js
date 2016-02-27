var express = require('express');

var config = require('../helpers/config.js');
var io = require('../server.js');
var rumorStorage = require('../helpers/rumor-storage.js');
var websocket = require('../helpers/websocket.js');

console.log(io.sockets);

var router = express.Router();

router.post('/rumors', function(req, res) {
    rumorStorage.store(req.body);
    websocket.receiveMessage();
    res.send({message: 'Rumor received and processed'});
});

module.exports = router;
