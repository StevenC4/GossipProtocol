var config = require('./config.js');
var websocket = require('./websocket.js');
var fs = require('graceful-fs');

var functions = {};

var rumors = {};
var messages = {};

functions.store = function(rumor) {
    var uuid = rumor.Rumor.MessageID.split(':');
    var originId = uuid[0];
    var sequenceNum = uuid[1];

    //console.log("Storing rumor: " + rumor.Rumor.MessageID);

    if (!rumors.hasOwnProperty(originId)) {
        rumors[originId] = {};
    }

    if (!rumors[originId].hasOwnProperty(sequenceNum)) {
        rumors[originId][sequenceNum] = rumor.Rumor;
        addMessage(rumor.Rumor);
    }
};

functions.getMessages = function() {
    return messages;
};

function addMessage(rumor) {
    var key = rumor.Timestamp + ':' + rumor.MessageID;

    if (!messages.hasOwnProperty(key)) {
        messages[key] = {
            originator: rumor.Originator,
            text: rumor.Text,
            timestamp: rumor.Timestamp,
            id: rumor.MessageID
        };
    }
}

functions.getRumor = function() {
    var keys = Object.keys(messages);

    if (keys.length == 0) {
        return null;
    }

    var keyIndex = Math.floor(Math.random() * keys.length);
    var key = keys[keyIndex];

    var keyParts = key.split(':');
    var timestamp = keyParts[0];
    var originId = keyParts[1];
    var sequenceNum = keyParts[2];

    var rumor = rumors[originId][sequenceNum];
    return {Rumor: rumor, EndPoint: config.getBaseUrl()};
};

functions.rumorEmpty = function() {
    return Object.keys(rumors).length == 0;
};

functions.getRumorsFromWant = function(want) {
    var wantedRumors = [];

    // Process the highest origin IDs from the want.Want object
    if (want.hasOwnProperty('Want')) {
        var wantOriginIds = Object.keys(want.Want);
        var originIds = Object.keys(rumors);
        for (var i = 0; i < originIds.length; i++) {
            var originId = originIds[i];
            var originMessages = rumors[originId];
            var sequenceNums = Object.keys(originMessages);

            for (var j = 0; j < sequenceNums.length; j++) {
                var sequenceNum = sequenceNums[j];
                if (!want.Want.hasOwnProperty(originId) || sequenceNum > want.Want[originId]) {
                    wantedRumors.push(rumors[originId][sequenceNum]);
                }
            }
        }
    }

    // Process the missing sequence numbers from the want.Missing object
    if (want.hasOwnProperty('Missing')) {
        var originIds = Object.keys(want.Missing);
        for (var i = 0; i < originIds.length; i++) {
            var originId = originIds[i];
            if (rumors.hasOwnProperty(originId)) {
                var sequenceNums = want.Missing[originId];
                for (var j = 0; j < sequenceNums.length; j++) {
                    var sequenceNum = sequenceNums[j];
                    if (rumors[originId].hasOwnProperty(sequenceNum)) {
                        wantedRumors.push(rumors[originId][sequenceNum]);
                    }
                }
            }
        }
    }


    return wantedRumors;
};

functions.getWant = function() {
    var want = {
        "Want": {},
        "Missing": {},
        "EndPoint": config.getBaseUrl()
    };

    var originIds = Object.keys(rumors);
    for (var i = 0; i < originIds.length; i++) {
        var originId = originIds[i];
        var originRumors = rumors[originId];

        // Get max sequence number for originId
        var sequenceNums = Object.keys(originRumors).sort();
        var maxSequenceNum = 0;
        if (sequenceNums.length > 0) {
            maxSequenceNum = sequenceNums[sequenceNums.length - 1];
            want.Want[originId] = maxSequenceNum;
        }

        // Get missing sequence numbers
        var sequenceIndex = 0;
        for (var j = 0; j < maxSequenceNum; j++) {
            if (j == sequenceNums[sequenceIndex]) {
                sequenceIndex++;
            } else {
                if (!want.Missing.hasOwnProperty(originId)) {
                    want.Missing[originId] = [];
                }
                want.Missing[originId].push(j);
            }
        }
    }

    return want;
};

functions.getRumors = function() {
    return rumors;
};

functions.setRumors = function(newRumors) {
    rumors = newRumors;
};

functions.getMessages = function() {
    return messages;
};

functions.setMessages = function(newMessages) {
    messages = newMessages;
};

module.exports = functions;
