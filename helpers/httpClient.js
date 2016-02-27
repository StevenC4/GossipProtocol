var request = require('request');

var functions = {};

functions.send = function(url, data) {
    console.log(data);
    request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }, function(error, response, body) {
        console.log(error, response, body);
    });
};

module.exports = functions;
