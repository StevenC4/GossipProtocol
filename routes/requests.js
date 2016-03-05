var express = require('express');

var config = require('../helpers/config.js');
var httpClient = require('../helpers/httpClient.js');
var rumorStorage = require('../helpers/rumor-storage.js');
var websocket = require('../helpers/websocket.js')
var workQueue = require('../helpers/work-queue.js');

var router = express.Router();

router.post('/', function(req, res) {
	if (req.body.hasOwnProperty('Rumor') || req.body.hasOwnProperty('Want')) {

        if (req.body.hasOwnProperty('EndPoint') && !config.neighborInList(req.body.EndPoint)) {
            config.addNeighbor(req.body.EndPoint);
            rumorStorage.updateUnsentMessages(req.body.EndPoint);
        }

        if (req.body.hasOwnProperty('Rumor')) {
            
            rumorStorage.store(req.body);
            websocket.receiveMessage();
            res.send({message: 'Rumor received and processed'});    
            return;

        } else if (req.body.hasOwnProperty('Want')) {
            
            workQueue.enqueue(req.body);
            while (!workQueue.empty()) {
                var want = workQueue.dequeue();
                var requestedRumors = rumorStorage.getRumorsFromWant(want);
                var url = want.EndPoint;
                for (var i = 0; i < requestedRumors.length; i++) {
                    var requestedRumor = {Rumor: requestedRumors[i], EndPoint: config.getBaseUrl()};
                    httpClient.send(url, requestedRumor);
                }
            }

            res.send({message: 'Want received and processed'});
            return;

        }

	} else {
		res.status(400).send({message: 'Bad Request'});
        return;
	}
    
});

module.exports = router;
