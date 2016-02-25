$(document).ready(function() {
    var name = $('input.originator').val();
    var baseUrl = $('input.base-url').val();

    var socket = io(baseUrl);

    socket.emit('init');

    socket.on('update conversation', function(data) {
        //console.log(data);

	var messages = data.messages;

        var lastObject = null;
	var timestamps = Object.keys(messages).sort();
	for (var i = 0; i < timestamps.length; i++) {
            var timestamp = timestamps[i];

	    var timeBucket = messages[timestamp];
	    var messageIds = Object.keys(timeBucket).sort();
	    for (var j = 0; j < messageIds.length; j++) {
                var messageId = messageIds[j];
		var message = timeBucket[messageId];

                var originatorDisplay = (name == message.originator) ? "Me" : message.originator;

                var messageDiv = $('<div/>', {id: timestamp + ":" + messageId, class: 'message'}).append(
		    $('<div/>', {class: 'originator', text: originatorDisplay + ":"})
		).append(
		    $('<div/>', {class: 'text', text: message.text})
		); 

                var objectId = timestamp + ":" + messageId;
		objectId = objectId.replace(/:/g, '\\:');
                if ($("div#" + objectId).length == 0) {
		    if (lastObject == null) {
		        $('div.conversation-window').prepend(messageDiv);
	            } else {
		        messageDiv.insertAfter(lastObject);
		    }
		}

		lastObject = $("div#" + objectId);
	    }
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

        var text = textarea.val()
	if (text.trim() != "" && text.trim() != '') {
            socket.emit('chat message', {text: text});
        }
	textarea.val('');
	textarea.focus();
    }
});

