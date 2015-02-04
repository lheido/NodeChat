
var app    = require('express')();
var server = require('http').Server(app);
var io     = require('socket.io').listen(server);
var utils  = require('./utils.js');

var PORT   = utils.PORT;

io.on('connection', function (socket) {
    socket.on(utils.USER_CONNECTED, function(user){
        console.log("connect : "+user);
        io.sockets.emit("user connected", user);
    });
    socket.on(utils.USER_DISCONNECTED, function(user){
        console.log("disconnect : "+user);
        io.sockets.emit("user disconnected", user);
    });
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(PORT);
console.log('Server listening on port ' + PORT);
