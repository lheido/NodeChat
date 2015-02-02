var USER_CONNECTED = 'user connected',
    USER_DISCONNECTED = 'user disconnected',
    CHAT_MESSAGE = 'chat message',
    TERM_CLOSE = 'SIGINT';

function User(pseudo, color) {
    return {
        'pseudo' : pseudo,
        'color'  : color,
    };
}

try {
    module.exports = {
        User : User,

        USER_CONNECTED   : USER_CONNECTED,
        USER_DISCONNECTED: USER_DISCONNECTED,
        CHAT_MESSAGE     : CHAT_MESSAGE,
        TERM_CLOSE       : TERM_CLOSE,
    }
} catch (error) {}
