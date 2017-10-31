const express = require("express");
const colors = require("colors");
const ejs = require("ejs");
//const config = require("./config.json");
const bodyParser = require("body-parser")


// VARIABLES
const DIR = __dirname;
const app = express();


// CLASSES
var Router = new (require("./classes/Router.js"))(app);


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


// STARTING
app.listen(81, () => {
	console.log("# PatyPlay - WebServer [81] [Proxy to 80]".green);
});