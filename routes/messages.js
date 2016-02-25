var config = require('../model/config.js');
var express = require('express');
var rumorStorage = require('../model/rumor-storage.js');

var router = express.Router();

router.post('/messages', function(req, res) {

    if (!req.body.hasOwnProperty('text')) {
        res.status(422).send("No text body parameter");
	return;
    }

    var text = req.body.text;

    var rumor = {
        "Rumor": {
	    MessageID: config.getNewMessageId(),
	    Originator: config.getOriginator(),
	    Text: text
	},
	"EndPoint": config.getBaseUrl()
    };

    rumorStorage.store(rumor);
});

module.exports = router;
