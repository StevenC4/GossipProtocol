var express = require('express');
var rumorStorage = require('../model/rumor-storage.js');

var router = express.Router();

router.post('/rumors', function(req, res) {
    rumorStorage.store(req.body);
    res.send({message: 'Rumor received and processed'});
});

module.exports = router;
