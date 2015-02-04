var USER_CONNECTED = 'user connected',
    USER_DISCONNECTED = 'user disconnected',
    MESSAGE_SEND = 'message send',
    MESSAGE_RECEIVED = 'message received',
    PORT = 8181,
    commandes = new Array('exit');
var reCommande = /^(\/|@)(\w*) ?(.*)/;

// console.log(reCommande.exec("/exit"));
// console.log(reCommande.exec("@lheido message"));

function User(pseudo, color) {
    return {
        'pseudo' : pseudo,
        'color'  : color,
    };
}

function Client(socket, io, connectArg) {
    this.questions = new Array();
    this.user;
    this.socket = (socket) ? socket : false;
    this.io = (io) ? io : false;
    this.connectArg = (!connectArg) ? "": connectArg;
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

Client.prototype.setUser = function(pseudo, color, user){
    if (typeof(user) != 'undefined') {
        this.user = user;
    } else {
        this.user = User(pseudo, color);
    }
}

Client.prototype.getUser = function(){
    return this.user;
}

Client.prototype.emit = function() {
    this.socket.emit(arguments[0], arguments[1]);
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

Client.prototype.onMessageReceived = function(msg, user) {
    throw "Must be implemented";
}

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
        PORT                : PORT,
        isCommande          : isCommande,
    }
} catch (error) {}
