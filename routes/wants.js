var express = require('express');
var workQueue = require('../model/work-queue.js');
var router = express.Router();

router.post('/wants', function(req, res) {
    console.log(req.body);

    workQueue.enqueue(req.body);
    while (!workQueue.empty()) {
        var want = workQueue.dequeue();
    }

    res.send({message: 'Want received and processed'});
});

module.exports = router;
