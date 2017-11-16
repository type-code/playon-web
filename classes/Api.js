class Api extends Controller {
	constructor(db) {
		super();

		this.smiles_buff = [ "KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "KappaNinja", "KappaSoldier", "KappaWatch", "KappaSlava", "KeepoSlava", "Keepo", "Kappa", "FroggyOmg", "FroggySleep", "FroggyCry", "Facepalm", "ValakasSon", "Valakas", "Kombik", "Godzila", "Niger", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto", "Wow", "Love", "Slow", "Wut", "Frog", "Illuminati", "RoflEpic", "RoflMega", "Rofl" ];

		this.db = db;
	}

	smiles() {
		var json = {
			varsion: config.version_smiles,
			server: config.smiles_path,
			smiles: [],
		};

		for(var a in this.smiles_buff) {
			var smile = this.smiles_buff[a];
			var smile_file = smile.toLowerCase() + ".png";

			json.smiles.push({
				name: smile,
				file: smile_file
			});
		}

		return json;
	}

	versions() {
		var json = {
			version_api: config.version_api,
			version_app_web: config.version_app_web,
			version_app_android: config.version_app_android,
			version_smiles: config.version_smiles
		}

		return json;
	}

	room_list(cb) {
		this.db.conn.collection("rooms").find({}).toArray((e, data) => {
			cb(data);
		});
	}

	room_create(insert, cb) {
		if (insert.name > 30) 
		insert.name = insert.name.substr(0, 30);
		insert.name = this.html(insert.name).trim();
		insert.description = this.html(insert.description).trim();
		insert.users = 0;
		insert.users_max = 10;

		if (insert.name == "system") {
			cb(false);
			return false;
		}

		this.db.conn.collection("rooms").findOne({"name": insert.name}, (e, data) => {
			if (e) {
				cb(false);
				return false;
			}

			if (!data) {
				this.db.conn.collection("rooms").insert(insert);
				cb({name: insert.name, video: insert.video});
			}
			else {
				cb(false);
			}
		});
	}
}

module.exports = Api;