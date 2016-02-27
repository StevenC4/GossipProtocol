var config = require('./config.js');

var functions = {};

var rumors = {}
var messages = {};

functions.store = function(rumor) {
    var uuid = rumor.Rumor.MessageID.split(':');
    var originId = uuid[0];
    var sequenceNum = uuid[1];

    console.log("Storing rumor: " + rumor.Rumor.MessageID);

    if (!rumors.hasOwnProperty(originId)) {
        rumors[originId] = {};
    }

    if (!rumors[originId].hasOwnProperty(sequenceNum)) {
        rumors[originId][sequenceNum] = rumor.Rumor;
	addMessage(rumor.Timestamp, rumor.Rumor);
    }
};

functions.getMessages = function() {
    return messages;
}

function addMessage(timestamp, rumor) {
    if (!messages.hasOwnProperty(timestamp)) {
        messages[timestamp] = {};
    }

    if (!messages[timestamp].hasOwnProperty(rumor.MessageID)) {
        messages[timestamp][rumor.MessageID] = {
	    originator: rumor.Originator,
	    text: rumor.Text,
	    timestamp: timestamp,
	    id: rumor.MessageID
	}
    } // Don't store it if they already have it
}

functions.getRumor = function() {
    var timestamps = Object.keys(messages);

    if (timestamps.length == 0) {
        return null;
    }

    var tsIndex = Math.floor(Math.random() * timestamps.length);
    var timestamp = timestamps[tsIndex];
    var tsMessages = messages[timestamp];

    var messageIds = Object.keys(tsMessages);

    if (messageIds.length == 0) {
        return null;
    }

    var midIndex = Math.floor(Math.random() * messageIds.length);
    var messageId = messageIds[midIndex];

    var messageIdParts = messageId.split(':');
    var originId = messageIdParts[0];
    var sequenceNum = messageIdParts[1];

    var rumor = rumors[originId][sequenceNum];
    return {Rumor: rumor, EndPoint: config.getBaseUrl()};
}

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
}

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
	if (sequenceNums.length > 0) {
            var maxSequenceNum = sequenceNums[sequenceNums.length - 1];
            want.Want[originId] = maxSequenceNum;
	}

	// Get missing sequence numbers
	sequenceIndex = 0;
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
}

module.exports = functions;
