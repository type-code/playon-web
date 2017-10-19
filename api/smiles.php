<?

$json = array();
$json['version'] = 4;
$json['server'] = "http://player.chrom-web.ga/img/s/";
$json['smiles'] = [];

$smiles_array = [];
$smiles_buff = [ "KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "KappaNinja", "KappaSoldier", "KappaWatch", "Keepo", "Kappa", "FroggyOmg", "FroggySleep", "FroggyCry", "Facepalm", "Valakas", "Kombik", "Godzila", "Niger", "Ninja", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto", "Wow", "Love", "Slow", "Wut", "Frog", "Illuminati", "MegaRofl", "Rofl" ];


foreach($smiles_buff as $smile) {
	$smile_name = $smile;
	$smile_file = strtolower($smile) . '.png';
	$json['smiles'][] = ['name' => $smile_name, 'file' => $smile_file];
}

echo json_encode($json);

?>