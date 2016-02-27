var request = require('request');

var functions = {};

functions.send = function(url, data) {
    request.post({
        method: 'POST',
	uri: url,
	json: true,
	body: data
    });
}

module.exports = functions;
