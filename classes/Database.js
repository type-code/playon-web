var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;

class Database {
    constructor(config) {
        var host = config.db_host;
        var user = config.db_user;
        var pass = config.db_pass;
        var port = config.db_port;
        var name = config.db_name;

        this.db = null;
        this.url = `mongodb://${user}:${pass}@${host}:${port}/${name}`;
        this.ObjectID = ObjectID;

        MongoClient.connect(this.url, (e, db) => {
            this.db = db;
            console.log("# Database connected".green);
        });
    }

    get conn() {
        return this.db;
    }
}

module.exports = Database;