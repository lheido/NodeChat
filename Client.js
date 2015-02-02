
var rl    = require("readline").createInterface(process.stdin, process.stdout);
var io    = require('socket.io-client');
var color = require("ansi-color").set;

var user = {
    'pseudo' : "lheido",
    'color' : "blue",
};

var socket = io.connect('http://192.168.43.202:8181');

socket.emit("user connected", user);

rl.on('line', function (msg) {
    socket.emit('chat message', msg, user);
    rl.prompt(true);
});

socket.on('chat message', function (msg, user) {
    console.log(msg);
    rl.prompt(true);
});

socket.on("user connected", function(user){
    console.log(color(user.pseudo+" is connected", user.color));
    rl.prompt(true);
});

socket.on("user disconnected", function(user){

});
