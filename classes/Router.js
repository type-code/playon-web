var Api = require("./Api.js");
var fs = require("fs");

class Router extends Controller {
	constructor(app, db, socket) {
		super();
		
		this.app = app;
		this.db = db;
		this.socket = socket;

		this.Api = new Api(this.db);
	}

	// ROUTING: patyplay.ga/
	home() {
		this.app.get("/", (req, res) => {
			res.render("index", {version: config.version_app_web});
		});
	}


	// ROUTING: patyplay.ga/tabs
	tabs() {
		this.app.get("/tabs", (req, res) => {
			res.render("tabs", {version: config.version_app_web});
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

		/////////////////////////////////////////////

		this.app.get("/api/rooms/", (req, res) => {
			this.Api.room_list((rooms) => {
				res.json(rooms);
			});
		});

		this.app.post("/api/room/", (req, res) => {
			this.Api.room_create({
				name: req.body.name,
				description: req.body.description,
				video: req.body.video,
				creator: req.body.creator
			}, (data) => {
				if (data) {
					res.status(200).end();

					this.socket.emit("room_create", {
						name: data.name,
						video: data.video
					});
				}
				else res.status(500).end();
			});
		});
	}

	

	system() {
		this.app.get("/system/config", (req, res) => {
			fs.readFile("../config.json", "utf8", (e, cfg) => {
				global.config = JSON.parse(cfg);
				var time = this.consoleTime();
				console.log(`# Config updated! ${time}`.yellow);
				res.send("success update").status(200).end();
			});
		});

		// ROUTING: patyplay.ga/404
		this.app.get("*", (req, res) => {
			res.render("404");
		});
	}
}

module.exports = Router;