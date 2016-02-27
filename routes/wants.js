var express = require('express');
var router = express.Router();

var config = require('../helpers/config.js');
var httpClient = require('../helpers/httpClient.js');
var rumorStorage = require('../helpers/rumor-storage.js');
var workQueue = require('../helpers/work-queue.js');

router.post('/wants', function(req, res) {

    console.log('RECEIVED WANT');

    workQueue.enqueue(req.body);
    while (!workQueue.empty()) {
        var want = workQueue.dequeue();
        var requestedRumors = rumorStorage.getRumorsFromWant(want);
        var url = want.EndPoint;
        for (var i = 0; i < requestedRumors.length; i++) {
            var requestedRumor = {Rumor: requestedRumors[i], EndPoint: config.getBaseUrl()};
            httpClient.send(url + '/wants', requestedRumor);
        }
    }

    res.send({message: 'Want received and processed'});
});

module.exports = router;
