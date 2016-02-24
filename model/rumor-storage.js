var rumorStorage = {};

var rumors = {}

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
    }
};

module.exports = rumorStorage;
