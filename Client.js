
var rl    = require("readline").createInterface(process.stdin, process.stdout);
var io    = require('socket.io-client');
var color = require("ansi-color").set;
var utils = require('./utils.js');

var user = utils.User('lheido', 'cyan');

console.log(user);

var socket = io.connect('http://192.168.43.202:8181');

socket.emit(utils.USER_CONNECTED, user);

rl.on('line', function (msg) {
    socket.emit(utils.message, msg, user);
    rl.prompt(true);
});

rl.on(utils.TERM_CLOSE, function(){
    console.log("Closed");
    process.exit(0);
    socket.emit(utils.USER_DISCONNECTED, user);
});

socket.on(utils.CHAT_MESSAGE, function (msg, user) {
    console.log(msg);
    rl.prompt(true);
});

socket.on(utils.USER_CONNECTED, function(user){
    console.log(color(user.pseudo+" is connected", 'italic'));
    rl.prompt(true);
});

socket.on(utils.USER_DISCONNECTED, function(userDisconnected){
    if (user.pseudo === userDisconnected.pseudo) {
        rl.close();
        console.log(color("Bye bye!", 'italic'));
        process.exit(0);
    } else {
        console.log(color(userDisconnected.pseudo+" is disconnected", 'italic'));
    }
});
