const express = require("express");
const colors = require("colors");
const ejs = require("ejs");
const config = require("./config.json");
const bodyParser = require("body-parser")


// VARIABLES
const DIR = __dirname;
const app = express();
const PORT_WEB = 8000;
const PORT_SOCKET = 8080;

// CLASSES
var Connector = new (require("./classes/Connector.js"))(PORT_SOCKET);
var Database = new (require("./classes/Database.js"))(config);
var Router = new (require("./classes/Router.js"))(app, config, Database, Connector);

// SETTINGS
app.use(express.static(DIR + "/static"));
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

ejs.delimiter = '?';


// ROUTING
Router.api();
Router.home();
Router.tabs();
Router.system();


// STARTING
app.listen(PORT_WEB, () => {
	console.log(`# PatyPlay - WebServer [${PORT_WEB}] [Proxy from 80]`.green);
});