<? $cache = time(); ?>
<!DOCTYPE html>
<html>
<head>
	<title>Real Time Player</title>
	<meta http-equiv="Cache-Control" content="no-cache">
	<meta http-equiv="pragma" content="no-cache"/>
	<meta http-equiv="Expires" content="Wed, 26 Feb 1999 08:21:57 GMT">
	<link rel="shortcut icon" href="favicon.ico" />
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800&amp;subset=cyrillic" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="style.css?<?=$cache;?>">
	<script src="youtube_api.js"></script>
	<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
	<script src="socket.io.js"></script>
</head>
<body>


	<div id="page" class="p480">
		<div class="overflow"></div>
		<div id="player"></div>

		<div id="timeline">
			<div class="line"></div>
			<div class="time">00:00</div>
		</div>

		<div id="timer">
			<div class="back" title="Rewind back to 10 seconds"></div>
			<div class="forward" title="Rewind forward to 10 seconds"></div>
			<span class="current">00:00</span> / <span class="duration">00:00</span>
		</div>
	</div>

	<div id="menu">
		<div class="header">Controll panel</div>
		<div><button id="play" title="Play Video"></button></div>
		<div><button id="stop" title="Pause Video"></button></div>
		<div><button id="load" title="Load Video Link"></button></div>

		<div id="light"><div class="pointer"></div></div>
		<div id="quality">
			<div class="mq active" data-quality="p480">480p</div>
			<div class="hq" data-quality="p720">720p</div>
			<div class="full" data-quality="full">Full</div>
		</div>
		<input type="range" id="volume" min="0" max="100" step="1">
	</div>

	<div id="playlist">
		<div class="header">Playlist:</div>
		<div class="list">
			<div class="item template" data-videoid="">
				<div class="image"></div>
				<div class="info">
					<span class="name" title="">Dota2 - WTF Moments 220</span>
					<span class="channel">by <b>DotaWTF</b></span>
				</div>
				<div class="holder">
					<div class="play"></div>
					<div class="delete"></div>
				</div>
			</div>
		</div>
	</div>

	<div id="chat">
		<div class="header">
			<div class="new" title="New Messages">0</div>
			<div class="big" title="Big Chat Mode"></div>
			<div class="setup" title="Setup"></div>
			Chat:
		</div>
		<div class="messages"></div>
		<input type="text">
	</div>

	<div id="loader">
		<div>
			<h1>Enter you nickname:</h1>
			<div class="inputs">
				<input type="text" class="nickname">
				<input type="color" class="color">
			</div>
			<button>CANCEL</button>
		</div>
	</div>

<script src="main.js?<?=$cache;?>"></script>
</body>
</html>