<? $version = 30; ?>
<!DOCTYPE html>
<html>
<head>
	<title>Real Time Player</title>
	<link rel="shortcut icon" href="favicon.ico" />
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800&amp;subset=cyrillic" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="style.css?<?=$version;?>">
	<script src="youtube_api.js"></script>
	<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
	<script src="socket.io.js"></script>
</head>
<body>

	<div id="changelist_button" data-version="<?=$version;?>"></div>
	<div id="changelist">
		<h1>Playon - Changelog</h1>
		<div class="close"></div>

		<div class="news">
			<h2>Update 0.30<span>19.10.2017</span></h2>
			<p>- Добавленна функция передачи кликов по видео. Для этого при зажатой кнопке CTRL нажмите на любую часть видео<br>
			- Добавленно окно списка изменений версий<br>
			- Изменены некоторые цвета на странице</p>

			<h2>Update 0.29<span>16.10.2017</span></h2>
			<p>- Новые смайлы: Naruto, KappaNinja, KappaSoldier, Wow, Love, Slow, Wut, Frog, Illuminati, FroggyOmg, FroggySleep, FroggyCry, MegaRofl, KappaWatch<br>
			- Добавленна эксперементальная функция вставки изображений из буфера обмена</p>

			<h2>Update 0.28<span>15.10.2017</span></h2>
			<p>- Новые смайлы: KappaDark, Dendi, Story, Omfg, Cat, Dog, Rofl, Hey, Baby, God, Photo, Angry, Cry, History<br>
			- Немного обновлён Fullscreen мод.</p>

			<h2>Update 0.27<span>Давно :D</span></h2>
			<p>- При изменение цвета/ника сайт не будет перезагружаться, а также в чате все пользователи будут уведомлены о вашей смене ника</p>

			<h2>Update 0.2<span>Очень давно :DD</span></h2>
			<p>- Теперь при нажатие кнопки пробел видео ставиться на паузу/плей<br>
			- При новых нововведениях кнопушка мигает</p>
		</div>
	</div>

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
			<div class="item template" data-video="{{VIDEO_ID}}">
				<div class="image"></div>
				<div class="info">
					<span class="name" title="{{NAME}}">{{NAME}}</span>
					<span class="channel">by <b>{{CHANNEL}}</b></span>
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
		<input type="text" placeholder="Press ENTER to focus input...">
	</div>


	<div id="loader">
		<div>
			<h1>Enter you nickname:</h1>
			<div class="inputs">
				<input type="text" class="nickname" maxlength="11">
				<input type="color" class="color">
			</div>
			<button>CANCEL</button>
		</div>
	</div>

<script src="main.js?<?=$version;?>"></script>

</body>
</html>