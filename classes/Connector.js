const io = require("socket.io-client");

class Connector {
    constructor(port) {
        this.host = 'localhost';
        this.port = port;
        this.socket = io(this.host + ':' + this.port);
    }

    emit(name, data, cb = null) {
        this.socket.emit(name, data, cb);
    }
}

module.exports = Connector;