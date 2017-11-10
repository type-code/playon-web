const express = require("express");
const colors = require("colors");
const ejs = require("ejs");
const config = require("./config.json");
const bodyParser = require("body-parser");

// GLOBALS
global.Controller = require("./classes/Controller.js");
global.config = require("./config.json");


// CLASSES
const ConnectorClass = require("./classes/Connector.js");
const DatabaseClass = require("./classes/Database.js");
const RouterClass = require("./classes/Router.js");


// VARIABLES
const DIR = __dirname;
const app = express();
const PORT_WEB = config.port_web;
const PORT_SOCKET = config.port_socket;

var Database = new DatabaseClass();
var Connector = new ConnectorClass(PORT_SOCKET);
var Router = new RouterClass(app, Database, Connector);

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