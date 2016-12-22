<? $cache = time(); ?>
<!DOCTYPE html>
<html>
<head>
	<title>Real Time Player</title>
	<meta http-equiv="Cache-Control" content="no-cache">
	<meta http-equiv="pragma" content="no-cache"/>
	<meta http-equiv="Expires" content="Wed, 26 Feb 1999 08:21:57 GMT">
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800&amp;subset=cyrillic" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="style.css?<?=$cache;?>">
	<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
	<script src="https://www.youtube.com/iframe_api"></script>
	<script src="socket.io.js"></script>
</head>
<body>


	<div id="page">
		<div class="overflow"></div>
		<div id="player"></div>

		<div id="timeline"><div class="line"></div></div>
		<div id="timer">
			<div class="back" title="Rewind back to 10 seconds"></div>
			<div class="forward" title="Rewind forward to 10 seconds"></div>
			<span class="current">00:00</span> / <span class="duration">00:00</span>
		</div>
	</div>

	<div id="menu">
		<div class="header">Hover me</div>
		<div><button id="play" title="Play Video"></button></div>
		<div><button id="stop" title="Pause Video"></button></div>
		<div><button id="load" title="Load Video Link"></button></div>

		<input type="range" id="volume" min="0" max="100" step="1">
	</div>

	<div id="chat">
		<div class="header">
			<div class="new">0</div>
			<div class="setup"></div>
			Chat:
		</div>
		<div class="messages"></div>
		<input type="text">
	</div>

	<div id="loader">
		<div>
			<h1>Enter you nickname:</h1>
			<input type="text" class="nickname">
		</div>
	</div>

<script src="main.js?<?=$cache;?>"></script>
</body>
</html>