var fs = require('graceful-fs');
var randomName = require('random-name');
var uuid = require('uuid');

var config = {
    baseUrl: null,
    neighbors: null,
    originator: randomName.first(),
    originId: uuid.v4(),
    sequenceNum: 0,
    sleep: 500
};

var functions = {};


functions.getBaseUrl = function() {
    return config.baseUrl;
};

functions.setBaseUrl = function(domain, port) {
    config.baseUrl = "http://" + domain + ":" + port;
};


functions.getNeighbor = function() {
    if (config.neighbors.length == 0) {
        return null;
    }

    var neighborIndex = Math.floor(Math.random() * config.neighbors.length);
    var neighbor = config.neighbors[neighborIndex];

    return neighbor;
};

functions.setNeighbors = function(neighbors) {
    config.neighbors = neighbors;
};

functions.addNeighbor = function(neighbor) {
    config.neighbors.push(neighbor);
};


functions.getOriginator = function() {
    return config.originator;
};

functions.setOriginator = function(originator) {
    config.originator = originator;
};


functions.getOriginId = function() {
    return config.originId;
};

functions.setOriginId = function(originId) {
    config.originId = originId;
};


functions.getSequenceNum = function() {
    return config.sequenceNum;
};

functions.incrementSequenceNum = function() {
    config.sequenceNum++;
};


functions.getSleep = function() {
    return config.sleep;
};

functions.setSleep = function(sleep) {
    config.sleep = sleep;
};

functions.save = function(originId) {
    var dir = './workdir';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    dir += '/' + originId;
    if (!fs.existsSync()) {
        fs.mkdirSync(dir);
    }

    var filename = dir + '/config';
    fs.writeFile(filename, JSON.stringify(config), function(err) {
        if (err) {
            console.log("Config error saving");
            console.log(err);
        }
    });
};

functions.load = function(originId) {
    var filename = './workdir/' + originId + '/config';

    if (!fs.existsSync(filename)) {
        return;
    }

    fs.readFile(filename, function(err, data) {
        if (err) {
            console.log("Config error loading");
            console.log(err);
        } else {
            config = data;
        }
    });
};

functions.getConfig = function() {
    return config;
};

functions.setConfig = function(newConfig) {
    config = newConfig;
};

functions.getNewMessageId = function() {
    return (config.originId != null) ? config.originId + ":" + config.sequenceNum++ : null;
};

module.exports = functions;
