
var app    = require('express')();
var server = require('http').Server(app);
var io     = require('socket.io').listen(server);
var utils  = require('./utils.js');
var users = [];

var me = new utils.User("Server","black");
users.push(me);

function traitementDeLaCommande(commandeUser, currentSocket, currentUser){
    messageSend = false;

    if(commandeUser['type'] == '@'){
        //TRAITMENT DU MESSAGE PRIVER
        for(var i= 0; i < io.sockets.sockets.length; i++ ){
            console.log(io.sockets.sockets[i].user.pseudo);
            if(io.sockets.sockets[i].user.pseudo == commandeUser['commande']){
                io.sockets.sockets[i].emit(utils.MESSAGE_PRIVATE, commandeUser.arg, currentUser);
                messageSend = true;
            }
        };
        if(!messageSend)
            currentSocket.emit(utils.MESSAGE_PRIVATE, "User "+commandeUser.commande+" not exist",me);
    }
    else{
        //TRAITEMENT DE LA COMMANDE
    }
}

io.on('connection', function (socket) {
    var user;
    var client = new utils.Client(socket);

    client.onUserConnected = function(user) {
        this.user = user;
        users.push(this.user);
        io.sockets.emit(utils.USER_CONNECTED, this.user);
        console.log("connect : "+this.user.pseudo);
    }

    client.onMessageSend = function(msg) {
        commandeUser = utils.isCommande(msg);
        if( !commandeUser )
            io.sockets.emit(utils.MESSAGE_RECEIVED, msg, this.user);
        else{
            traitementDeLaCommande(commandeUser, socket, this.user);
        }
    }

    client.init();

    socket.on('disconnect',function(){
        users.splice(this.user,1);
        console.log('user disconnected '+this.user.pseudo);
        io.sockets.emit(utils.USER_DISCONNECTED, this.user);
    });
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(utils.PORT);
console.log('Server listening on port ' + utils.PORT);
