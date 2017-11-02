var Controller = require("./Controller.js");
var Api = require("./Api.js");
var fs = require("fs");

class Router extends Controller {
	constructor(app, config) {
		super();
		this.app = app;
		this.config = config;

		this.Api = new Api(config);
	}

	// ROUTING: patyplay.ga/
	home() {
		this.app.get("/", (req, res) => {
			res.render("index", {version: this.config.version_app_web});
		});
	}


	// ROUTING: patyplay.ga/tabs
	tabs() {
		this.app.get("/tabs", (req, res) => {
			res.render("tabs", {version: this.config.version_app_web});
		});
	}


	// ROUTING: patyplay.ga/api/versions
	// ROUTING: patyplay.ga/api/smiles
	api() {
		this.app.get("/api/versions", (req, res) => {
			var versions = this.Api.versions();
			res.json(versions).end();
		});

		this.app.get("/api/smiles", (req, res) => {
			var smiles = this.Api.smiles();
			res.json(smiles).end();
		});
	}


	
	system() {
		this.app.get("/system/config", (req, res) => {
			fs.readFile(__dirname + "/../config.json", "utf8", (e, config) => {
				this.config = JSON.parse(config);
				this.Api.cfg = this.config;
				var time = this.consoleTime();
				console.log(`# Config updated! ${time}`.yellow);
				res.send("success update");
			});
		});

		// ROUTING: patyplay.ga/404
		this.app.get("*", (req, res) => {
			res.render("404");
		});
	}
}

module.exports = Router;