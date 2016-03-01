var name = '';

$(document).ready(function() {
    name = $('input.originator').val();
    var baseUrl = $('input.base-url').val();

    var socket = io(baseUrl);

    socket.emit('init');

    socket.on('update conversation', function(data) {
        var existentMessageDivs = $('div.message');
        var existentMessageLength = existentMessageDivs.length;
        var existentMessageIndex = 0;

        var messages = data.messages;
        var newMessageIds = Object.keys(messages).sort();
        var newMessageIdsLength = newMessageIds.length;
        var newMessageIdsIndex = 0;

        var lastExistentMessage = null;

        //var numLoops = 0;
        while (existentMessageIndex < existentMessageLength && newMessageIdsIndex < newMessageIdsLength) {
            var currentExistentMessage = existentMessageDivs[existentMessageIndex];
            var currentExistentMessageId = $(currentExistentMessage).attr('id');

            var currentNewMessageId = newMessageIds[newMessageIdsIndex];
            var currentNewMessage = messages[currentNewMessageId];

            if (equals(currentNewMessageId, currentExistentMessageId)) {
                lastExistentMessage = currentExistentMessage;

                existentMessageIndex++;
                newMessageIdsIndex++;
            } else if (greaterThan(currentNewMessageId, currentExistentMessageId)) {
                lastExistentMessage = currentExistentMessage;
                existentMessageIndex++;
            } else {
                var messageDiv = createMessageDiv(currentNewMessage);

                if (lastExistentMessage == null) {
                    $('div.conversation-window').prepend(messageDiv);
                } else {
                    messageDiv.insertAfter(lastExistentMessage);
                }

                lastExistentMessage = messageDiv;
                newMessageIdsIndex++;
            }
        }

        // If there are still new elements left, append the rest
        while (newMessageIdsIndex < newMessageIdsLength) {
            currentNewMessageId = newMessageIds[newMessageIdsIndex++];
            currentNewMessage = messages[currentNewMessageId];
            var messageDiv = createMessageDiv(currentNewMessage);
            $('div.conversation-window').append(messageDiv);
        }
    });

    socket.on('disconnect', function() {
        socket.close();
        socket = io(baseUrl);
    });

    $('div#send-button').click(submitText);
    $('textarea#message-input').keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            submitText();
        }
    });

    function submitText() {
        var textarea = $('textarea#message-input');

        var text = textarea.val();
        if (text.trim() != "" && text.trim() != '') {
            socket.emit('chat message', {text: text});
        }
        textarea.val('');
        textarea.focus();
    }

    $('textarea#message-input').focus();
});

function createMessageDiv(message) {
    var originatorDisplay = (name == message.originator) ? "Me" : message.originator;

    return $('<div/>', {id: message.timestamp + ":" + message.id, class: 'message'}).append(
        $('<div/>', {class: 'originator', text: originatorDisplay + ":"})
    ).append(
        $('<div/>', {class: 'text', text: message.text})
    );
}

function equals(key1, key2) {
    return key1 === key2;
}

function greaterThan(key1, key2) {
    var parts1 = key1.split(':');
    var ts1 = parseInt(parts1[0]);
    var seq1 = parseInt(parts1[2]);

    var parts2 = key2.split(':');
    var ts2 = parseInt(parts2[0]);
    var seq2 = parseInt(parts2[2]);

    if (ts1 > ts2) {
        return true;
    } else if (ts1 == ts2 && parts1[1] > parts2[1]) {
        return true;
    } else if (ts1 == ts2 && parts1[1] == parts2[1] && seq1 > seq2) {
        return true;
    } else {
        return false;
    }
}

function lessThan(key1, key2) {
    var parts1 = key1.split(':');
    var ts1 = parseInt(parts1[0]);
    var seq1 = parseInt(parts1[2]);

    var parts2 = key2.split(':');
    var ts2 = parseInt(parts2[0]);
    var seq2 = parseInt(parts2[2]);

    if (ts1 < ts2) {
        return true;
    } else if (ts1 == ts2 && parts1[1] < parts2[1]) {
        return true;
    } else if (ts1 == ts2 && parts1[1] == parts2[1] && seq1 < seq2) {
        return true;
    } else {
        return false;
    }
}
