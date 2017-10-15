<?

$json = array();
$json['version'] = 2;
$json['server'] = "http://player.chrom-web.ga/img/s/";
$json['smiles'] = [];

$smiles_array = [];
$smiles_buff = [ "KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "Keepo", "Kappa", "Facepalm", "Valakas", "Kombik", "Godzila", "Niger", "Ninja", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Rofl", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto" ];


foreach($smiles_buff as $smile) {
	$smile_name = $smile;
	$smile_file = strtolower($smile) . '.png';
	$json['smiles'][] = ['name' => $smile_name, 'file' => $smile_file];
}

echo json_encode($json);

?>