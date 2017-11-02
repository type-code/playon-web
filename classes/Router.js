var Controller = require("./Controller.js");
var fs = require("fs");
var Api = null;

class Router extends Controller {
	constructor(app, config) {
		super();
		this.app = app;
		this.config = config;

		Api = new (require("./Api.js"))(config);
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


	// ROUTING: patyplay.ga/api/version
	// ROUTING: patyplay.ga/api/smiles
	api() {
		this.app.get("/api/versions", (req, res) => {
			var version = Api.version();
			res.json(version).end();
		});

		this.app.get("/api/smiles", (req, res) => {
			var smiles = Api.smiles();
			res.json(smiles).end();
		});
	}


	// ROUTING: patyplay.ga/404
	system() {
		this.app.get("/system/config", (req, res) => {
			fs.readFile(__dirname + "/../config.json", "utf8", (e, config) => {
				this.config = JSON.parse(config);
				var time = this.consoleTime();
				console.log(`# Config updated! ${time}`.yellow);
				res.send("success update");
			});
		});

		this.app.get("*", (req, res) => {
			res.render("404");
		});
	}
}

module.exports = Router;