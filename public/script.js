$(document).ready(function() {
    var name = $('input.originator').val();
    var baseUrl = $('input.base-url').val();

    var socket = io(baseUrl);
    socket.on('init', function(data) {
        console.log(data);
    });
});
