var request = require('request');

var functions = {};

functions.send = function(url, data) {
    request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }, function(error, response, body) {
        if (error) {
            console.log("ERROR: ", error);
        }
    });
};

module.exports = functions;
