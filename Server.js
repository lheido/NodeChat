
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
            //sockets[i].user possible car client.setUser rajoute également le user dans le socket.
            if(io.sockets.sockets[i].user.pseudo == commandeUser['commande']){
                console.log(io.sockets.sockets[i].user.pseudo);
                io.sockets.sockets[i].emit(utils.MESSAGE_PRIVATE, commandeUser.arg, currentUser);
                messageSend = true;
            }
        };
        if(!messageSend) {
            currentSocket.emit(utils.MESSAGE_PRIVATE, "User "+commandeUser.commande+" not exist",me);
        }
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
    var client = new utils.Client(socket);

    client.onUserConnected = function(user) {
        client.setUser(user);
        // client.socket.user = user;
        users.push(client.user);
        client.emit(true, utils.USER_CONNECTED, client.user);
        console.log("connect : "+client.user.pseudo);
    };

    client.onMessageSend = function(msg) {
        commandeUser = utils.isCommande(msg);
        if ( !commandeUser ) {
            // client.emit(true, utils.MESSAGE_RECEIVED, msg, client.user);
            io.sockets.emit(utils.MESSAGE_RECEIVED, msg, client.user);
        } else{
            traitementDeLaCommande(commandeUser, client.socket, client.user);
        }
    };

    client.onDisconnect = function(){
        for(var i= 0; i < users.length; i++ ){
            if(users[i] == client.user){
                users.splice(i,1);
            }
        }
        console.log('user disconnected '+client.user.pseudo);
        client.emit(true, utils.USER_DISCONNECTED, client.user);
    };

    client.init();

});

app.use(express.static(__dirname));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(utils.PORT);
console.log('Server listening on port ' + utils.PORT);
