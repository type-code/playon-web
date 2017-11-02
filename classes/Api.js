class Api {
	constructor(config) {
		this.smiles_buff = [ "KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "KappaNinja", "KappaSoldier", "KappaWatch", "KappaSlava", "KeepoSlava", "Keepo", "Kappa", "FroggyOmg", "FroggySleep", "FroggyCry", "Facepalm", "ValakasSon", "Valakas", "Kombik", "Godzila", "Niger", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto", "Wow", "Love", "Slow", "Wut", "Frog", "Illuminati", "MegaRofl", "Rofl" ];

		this.config = config;
	}

	set cfg(cfg) {
		this.config = cfg;
	}

	smiles() {
		var json = {
			varsion: this.config.version_smiles,
			server: this.config.smiles_path,
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
			version_api: this.config.version_api,
			version_app_web: this.config.version_app_web,
			version_app_android: this.config.version_app_android,
			version_smiles: this.config.version_smiles
		}

		return json;
	}
}

module.exports = Api;