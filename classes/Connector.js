var io = require("socket.io-client");

class Connector {
    constructor() {
        this.host = config.webnode_host;
        this.port = config.port_socket;
        this.socket = io(this.host + ':' + this.port);
    }

    emit(name, data, cb = null) {
        this.socket.emit(name, data, cb);
    }
}

module.exports = Connector;