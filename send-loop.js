var argv = require('minimist')(process.argv.slice(2));

var sleepInterval = argv.hasOwnProperty('s') ? argv.s : 500;

var sendReminder = function() {
    process.send({});

    setTimeout(sendReminder, sleepInterval);
};

sendReminder();