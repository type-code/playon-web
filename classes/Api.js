class Api {
	constructor() {
		this.smiles_buff = [ "KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "KappaNinja", "KappaSoldier", "KappaWatch", "KappaSlava", "KeepoSlava", "Keepo", "Kappa", "FroggyOmg", "FroggySleep", "FroggyCry", "Facepalm", "ValakasSon", "Valakas", "Kombik", "Godzila", "Niger", "Ninja", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto", "Wow", "Love", "Slow", "Wut", "Frog", "Illuminati", "MegaRofl", "Rofl" ];

		this.VERSION_SMILES = 5;
		this.VERSION_API = 1;
		this.SMILES_PATH = "http://patyplay.ga/img/s/";
	}

	smiles() {
		var json = {
			varsion: this.VERSION_SMILES,
			server: this.SMILES_PATH,
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

	version() {
		var json = {
			version_api: this.VERSION_API,
			version_smiles: this.VERSION_SMILES
		}

		return json;
	}
}

module.exports = Api;