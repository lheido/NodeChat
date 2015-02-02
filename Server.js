
var app    = require('express')();
var server = require('http').Server(app);
var io     = require('socket.io').listen(server);

var PORT   = 8080;

io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('user connected', function(user){
        io.sockets.emit("user connected", user);
    });
    socket.on('chat message', function (msg) {
        io.sockets.emit('chat message', msg);
    });
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(PORT);
console.log('Server listening on port ' + PORT);
