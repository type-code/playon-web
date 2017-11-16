var io = require("socket.io-client");

class Connector {
    constructor() {
        this.host = config.host_socket;
        this.port = config.port_socket;
        this.socket = io(`ws://${this.host}:${this.port}`);

        this.socket.on("connect", () => {
            console.log("# Socket Connected".green);
            this.emit("system");
        });
    }

    emit(name, data = {}, cb = null) {
        data.socket_token = config.socket_token;
        this.socket.emit(name, data);
    }
}

module.exports = Connector;