
var express    = require('express');
var app = express();
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
            if(io.sockets.sockets[i].user.pseudo == commandeUser['commande']){
                io.sockets.sockets[i].emit(utils.MESSAGE_PRIVATE, commandeUser.arg, currentUser);
                messageSend = true;
            }
        };
        if(!messageSend)
            currentSocket.emit(utils.MESSAGE_PRIVATE, "User "+commandeUser.commande+" not exist",me);
    }
    else{
        //TRAITEMENT DES COMMANDES
        switch(commandeUser['commande']){
            case utils.commandes.users:
                currentSocket.emit(utils.SHOW_WHOS_ONLINE, users);
                break;
        }
    }
}

io.on('connection', function (socket) {
    var user;
    var client = new utils.Client(socket);

    client.onUserConnected = function(user) {
        this.user = user;
        users.push(this.user);
        for(var i= 0; i < io.sockets.sockets.length; i++ ){
            if(io.sockets.sockets[i].user != this.user){
                io.sockets.sockets[i].emit(utils.USER_CONNECTED, this.user);
            }
        }

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
        for(var i= 0; i < users.length; i++ ){
            if(users[i] == this.user){
                users.splice(i,1);
            }
        }

        console.log('user disconnected '+this.user.pseudo);
        io.sockets.emit(utils.USER_DISCONNECTED, this.user);
    });
});
app.use(express.static(__dirname));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(utils.PORT);
console.log('Server listening on port ' + utils.PORT);
