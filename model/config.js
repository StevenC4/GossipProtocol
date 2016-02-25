var randomName = require('random-name');
var uuid = require('uuid');

var config = {
    baseUrl: null,
    neighbors: null,
    originator: randomName.first(),
    originId: uuid.v4(),
    sequenceNum: 0,
    sleep: 500
}

var functions = {};


functions.getBaseUrl = function() {
    return config.baseUrl;
}

functions.setBaseUrl = function(domain, port) {
    config.baseUrl = "http://" + domain + ":" + port;
}


functions.getNeighbor = function() {
    return null;
}

functions.setNeighbors = function(neighbors) {
    config.neighbors = neighbors;
}

functions.addNeighbor = function(neighbor) {
    config.neighbors.push(neighbor);
}


functions.getOriginator = function() {
    return config.originator;
}

functions.setOriginator = function(originator) {
    config.originator = originator;
}


functions.getOriginId = function() {
    return config.originId;
}

functions.setOriginId = function(originId) {
    config.originId = originId;
}


functions.getSequenceNum = function() {
    return config.sequenceNum;
}

functions.incrementSequenceNum = function() {
    config.sequenceNum++;
}


functions.getSleep = function() {
    return config.sleep;
}

functions.setSleep = function(sleep) {
    config.sleep = sleep;
}



functions.getNewMessageId = function() {
    return (config.originId != null) ? config.originId + ":" + config.sequenceNum++ : null;
}

module.exports = functions;
