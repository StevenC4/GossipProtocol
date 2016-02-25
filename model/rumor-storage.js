var rumorStorage = {};

var rumors = {}
var messages = {};

rumorStorage.store = function(rumor) {
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

rumorStorage.getMessages = function() {
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
    } else {
        console.log('-------Potential for error - duplicate timestamp and messageid encountered--------');
        messages[timestamp][rumor.MessageID].text = rumor.text
    }
}

module.exports = rumorStorage;
