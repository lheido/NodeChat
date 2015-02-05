var notifier = require('node-notifier');
var rl       = require("readline2").createInterface(process.stdin, process.stdout);
var io       = require('socket.io-client');
var color    = require("ansi-color").set;
var utils    = require('./utils.js');

var pseudo = "UnknowUser",
    userColor = 'yellow';

var client = new utils.Client(
    false,
    io,
    'http://localhost:'+utils.PORT
);

client.onUserConnected = function(user) {
    // if (!(user.pseudo == client.user.pseudo && user.color == client.user.color)) {
        notifier.notify({
            'title': 'New user is connected:',
            'message': user.pseudo,
        });
        rl.prompt(true);
        console.log(color(user.pseudo+" is connected", 'italic'));
        rl.prompt(true);
    // }
};
client.onUserDisconnected = function(user) {
    rl.prompt(true);
    console.log(color(user.pseudo + " was disconnected.", 'italic'));
    rl.prompt(true);
};

client.onMessageReceived = function(msg, user) {
    if (!(user.pseudo == client.user.pseudo && user.color == client.user.color)) {
        notifier.notify({
            'title': 'New message received:',
            'message': user.pseudo+": "+msg,
        });
        rl.prompt(true);
        console.log(color(user.pseudo+": ", user.color)+msg);
        rl.prompt(true);
    }
};

client.onMessagePrivate = function(msg, user) {
    notifier.notify({
        'title': 'New private message:',
        'message': "from "+user.pseudo,
    });
    rl.prompt(true);
    console.log(color("From ", 'italic')+color(user.pseudo+": ", user.color)+msg);
    rl.prompt(true);
};

client.onReceivedWhosOnline = function(users) {
    rl.setPrompt('');
    console.log('');
    for (var i = 0; i < users.length; i++) {
        console.log(color(users[i].pseudo, 'italic'));
        rl.prompt(true);
    }
    rl.setPrompt('> ');
    rl.prompt(true);
};

client.addQuestion(function(){
    rl.question(color("Pseudo ?", 'green')+" (UnknowUser) ", function(answer) {
        if (answer) {
            if (answer.match(' ') == null) {
                pseudo = answer;
            } else {
                console.log(color("Error : your pseudo must contain only alphanumeric chars.",'red'));
                process.exit(0);
            }
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
        rl.prompt(true);
    });
});

rl.on('line', function (msg) {
    client.emit(utils.MESSAGE_SEND, msg);
    rl.prompt(true);
});

rl.on('SIGINT', function(){
    console.log("\nClosed");
    rl.close();
    process.exit(0);
});

client.question();

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
