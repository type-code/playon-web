var Api = new (require("./Api.js"))();

class Router {
	constructor(app) {
		this.app = app;
		this.app_version = 33.1;
	}

	home() {
		this.app.get("/", (req, res) => {
			res.render("index", {app_version: this.app_version});
		});
	}

	tabs() {
		this.app.get("/tabs", (req, res) => {
			res.render("tabs", {app_version: this.app_version});
		});
	}

	api() {
		this.app.get("/api/version", (req, res) => {
			var version = Api.version();
			res.send(version).end(200);
		});

		this.app.get("/api/smiles", (req, res) => {
			var smiles = Api.smiles();
			res.send(smiles).end(200);
		});
	}
}

module.exports = Router;