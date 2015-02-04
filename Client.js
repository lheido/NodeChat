
var rl    = require("readline2").createInterface(process.stdin, process.stdout);
var io    = require('socket.io-client');
var color = require("ansi-color").set;
var utils = require('./utils.js');

var pseudo = "Unknow User",
    userColor = 'yellow';

var client = new utils.Client(
    false,
    io,
    'http://localhost:'+utils.PORT
);

client.onUserConnected = function(user) {
    console.log(user.pseudo);
}
client.onUserDisconnected = function(user) {
    console.log(user.pseudo + " was disconnected.");
}
client.onMessageSend = function(msg, user) {
    throw "onMessageSend implemented";
}
client.onMessageReceived = function(msg, user) {
    throw "onMessageReceived implemented";
}

client.addQuestion(function(){
    rl.question(color("Pseudo ?", 'green')+" (Unknow User) ", function(answer) {
        if (answer) {
            pseudo = answer;
        }
        client.nextQuestion();
    });
});

client.addQuestion(function(){
    rl.question(color("Color ?", 'green')+" (yellow) ", function(answer) {
        if (answer){
            userColor = answer;
        }
        client.setUser(pseudo, userColor);
        client.init();
    });
});

rl.on('line', function (msg) {
    client.emit(utils.MESSAGE_SEND, msg, client.getUser());
    rl.prompt(true);
});

rl.on('SIGINT', function(){
    console.log("\nClosed");
    rl.close();
    client.emit(utils.USER_DISCONNECTED, client.getUser());
    process.exit(0);
});

client.question();

// process.exit(0);

// function init() {
//     var user = utils.User(pseudo, userColor);
//
//     rl.setPrompt(color("> ", userColor), 2);
//     rl.prompt(true);
//
//     var socket = io.connect('http://192.168.43.202:8181');
//
//     socket.emit(utils.USER_CONNECTED, user);
//
//     rl.on(utils.TERM_LINE, function (msg) {
//         socket.emit(utils.message, msg, user);
//         rl.prompt(true);
//     });
//
//     rl.on(utils.TERM_CLOSE, function(){
//         console.log("\nClosed");
//         rl.close();
//         socket.emit(utils.USER_DISCONNECTED, user);
//     });
//
//     socket.on(utils.CHAT_MESSAGE, function (msg, user) {
//         console.log(msg);
//         rl.prompt(true);
//     });
//
//     socket.on(utils.USER_CONNECTED, function(user){
//         console.log(color(user.pseudo + " is connected", 'italic'));
//         rl.prompt(true);
//     });
//
//     socket.on(utils.USER_DISCONNECTED, function(userDisconnected){
//         if (user.pseudo === userDisconnected.pseudo) {
//             console.log(color("Bye bye!", 'italic'));
//             process.exit(0);
//         } else {
//             console.log(color(userDisconnected.pseudo + " is disconnected", 'italic'));
//         }
//     });
// }

// process.argv.forEach(function(val, index, array){
//     switch (index) {
//         case 2:
//             pseudo = val;
//             break;
//         case 3:
//             userColor = val;
//             break;
//         default:
//             break;
//     }
// });
