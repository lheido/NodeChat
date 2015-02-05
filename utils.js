var USER_CONNECTED = 'user connected',
    USER_DISCONNECTED = 'user disconnected',
    MESSAGE_SEND = 'message send',
    MESSAGE_RECEIVED = 'message received',
    MESSAGE_PRIVATE = 'message private',
    SHOW_WHOS_ONLINE = 'show whos online',
    DISCONNECT = 'disconnect',
    PORT = 8181,
    commandes = {
        'users' : 'users',
    };
var reCommande = /^(\/|@)(\w*) ?(.*)/;

function User(pseudo, color) {
    return {
        'pseudo' : pseudo,
        'color'  : color,
    };
}

function isCommande(msg) {
    var result = reCommande.exec(msg);
    if (!result) {
        return false;
    }
    return {
        'type'     : result[1],
        'commande' : result[2],
        'arg'  : result[3],
    };
}

function Client(socket, io, connectArg) {
    this.questions = new Array();
    this.user;
    this.socket = (socket) ? socket : false;
    this.io = (io) ? io : false;
    this.connectArg = (!connectArg) ? "": connectArg;
}

/**
 * Exemple d'utilisation :
 *      client.setUser(user);
 *      client.setUser(pseudo, color);
 */
Client.prototype.setUser = function(){
    this.user = arguments[0];
    if (arguments.length == 2) {
        this.user = User(arguments[0], arguments[1]);
    }
    if (this.socket) {
        this.socket.user = this.user;
    }
}

Client.prototype.getUser = function(){
    return this.user;
}

/**
 * emit peut prendre un nombre variable d'arguments.
 * exemple:
 *      emit('event', arg1, arg2, ...);
 * petit truc en plus pour le server:
 *      Si un argument de type boolean est précisé avant l'événement
 *      alors l'événement emis le sera à tous le monde sauf le client lui même.
 *      exemple: emit(true, 'event', arg1, arg2, ...);
 */
Client.prototype.emit = function() {
    var broadcast = false, evt = arguments[0], args = arguments[1];
    if (arguments.length == 3) {
        broadcast = arguments[0];
        evt = arguments[1];
        args = arguments[2];
    }
    if (!broadcast) {
        this.socket.emit(evt, args);
    } else {
        this.socket.broadcast.emit(evt, args);
    }
}

Client.prototype.question = function() {
    var question = this.questions.shift();
    if (typeof(question) != 'undefined') question();
}

Client.prototype.nextQuestion = function() {
    this.question();
}

Client.prototype.addQuestion = function(callback) {
    this.questions.push(callback);
}

Client.prototype.onUserConnected = function(user) {
    throw "Must be implemented";
}

Client.prototype.onUserDisconnected = function(user) {
    throw "Must be implemented";
}

Client.prototype.onMessageSend = function(msg) {
    throw "Must be implemented";
}

Client.prototype.onMessageReceived = function(msg, fromUser) {
    throw "Must be implemented";
}

Client.prototype.onMessagePrivate = function(msg, fromUser) {
    throw "Must be implemented";
}

Client.prototype.onReceivedWhosOnline = function(users) {
    console.log(users);
}

Client.prototype.onDisconnect = function(){}

Client.prototype.init = function() {
    var isClient = false;
    if (!this.socket) {
        if (this.connectArg) {
            this.socket = this.io.connect(this.connectArg);
        } else {
            this.socket = this.io();
        }
        isClient = true;
    }
    this.socket.on(USER_CONNECTED, this.onUserConnected);
    this.socket.on(USER_DISCONNECTED, this.onUserDisconnected);
    this.socket.on(MESSAGE_SEND, this.onMessageSend);
    this.socket.on(MESSAGE_RECEIVED, this.onMessageReceived);
    this.socket.on(MESSAGE_PRIVATE, this.onMessagePrivate);
    this.socket.on(SHOW_WHOS_ONLINE, this.onReceivedWhosOnline);
    this.socket.on(DISCONNECT, this.onDisconnect);
    if (isClient) {
        this.emit(USER_CONNECTED, this.user);
    }
}

try {
    module.exports = {
        User                : User,
        Client              : Client,
        USER_CONNECTED      : USER_CONNECTED,
        USER_DISCONNECTED   : USER_DISCONNECTED,
        MESSAGE_SEND        : MESSAGE_SEND,
        MESSAGE_RECEIVED    : MESSAGE_RECEIVED,
        MESSAGE_PRIVATE     : MESSAGE_PRIVATE,
        SHOW_WHOS_ONLINE    : SHOW_WHOS_ONLINE,
        DISCONNECT          : DISCONNECT,
        PORT                : PORT,
        isCommande          : isCommande,
        commandes           : commandes,
    }
} catch (error) {}
