var workQueueFunctions = {};

var queue = [];

workQueueFunctions.enqueue = function(data) {
    queue.push(data);
};

workQueueFunctions.dequeue = function() {
    if (queue.length > 0) {
        return queue.shift();
    } else {
        return null;
    }
};

workQueueFunctions.empty = function() {
    return queue.length <= 0;
};

module.exports = workQueueFunctions;
