var express = require('express');

var config = require('../helpers/config.js');
var rumorStorage = require('../helpers/rumor-storage.js');
var websocket = require('../helpers/websocket.js')

var router = express.Router();

router.get('/rumors', function(req, res) {
    res.send({rumors: rumorStorage.getRumors(), messages: rumorStorage.getMessages()});
});

router.post('/rumors', function(req, res) {
    rumorStorage.store(req.body);
    websocket.receiveMessage();
    res.send({message: 'Rumor received and processed'});
});

module.exports = router;
