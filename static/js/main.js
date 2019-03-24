//////////////////////
// 21.12.2016
// @Createt By CHROM
//////////////////////

var socket = null;
var player = null;
var video = null;
var delta = 0.5;
var nick = localStorage.player_nick;
var new_messages = 0;
var window_blur = false;
var window_title = document.title;
var connetion_step = 0;
var MessageSound = new Audio("/assets/message.mp3");
var played = false;
var room = (document.location.hash || "#default").substr(1);
var users = [];
var smiles = [];

//const HOST = document.location.hostname;
const HOST = "patyplay.ga";
const MSG_MAX = 150;

window.onblur = function() {
	window_blur = true;
	if (socket) socket.emit("focus_toggle", {focus: false});
}

window.onfocus = function() {
	window_blur = false;
	document.title = window_title;
	if ( $("#chat").hasClass("active") ) new_messages = 0;
	if (socket) socket.emit("focus_toggle", {focus: true});
}

window.onstorage = function(e) {
	if (e.oldValue > 10000)
		console.log(e);

	document.location.pathname = "/tabs";
}


function onYouTubeIframeAPIReady() {
	if (nick) {
		connetion_step = 1;
		player = new YT.Player("player", {
			playerVars: { 
				iv_load_policy: 3,
				autoplay: 0, 
				controls: 0, 
				showinfo: 0, 
				rel: 0
			},
			events: {
				onReady: player_init
			}
		});
	}
	else {
		console.log("Enter you Nick!");
		$("#loader").fadeIn("slow");
		$("#loader").css("display", "flex");
		$("#loader .close").hide();
		$("#loader .save").addClass("full");
	}

	$("#preload").fadeOut(500);
	localStorage.last_visit = new Date().getTime();
}


function player_init(event) {
	if (localStorage.player_volume == undefined)
		localStorage.player_volume = 50;

	var version = $("#changelist_button").data("version");
	if (localStorage.player_version != version)
		$("#changelist_button").addClass("new");

	player.setVolume(localStorage.player_volume);
	$("#volume").val(localStorage.player_volume);

	// console.log(event);
	// player = event.target;
	// event.target.playVideo();

	// player.playVideo();
	// setTimeout(() => {
	// 	player.pauseVideo();
	// }, 250);

	socket_init();
}


function socket_init() {
	socket = io(HOST + ":8080/");

	socket.on("connect", function(){
		socket.emit("join", {nick: nick, room: room})
	});

	socket.on("joined", function(data){
		var video_url = data.video;
		var time = data.time;
		played = data.play;
		nick = data.nick;
		localStorage.player_nick = nick;

		if (played == true) {
			player.loadVideoById(video_url, time + delta);
		}
		else {
			if (video_url != video)
			player.cueVideoById(video_url, time + delta);
		}
		video = video_url;
		changeLight(data.light);

		for(var u in data.users) {
			var user = data.users[u];
			users[user.nick] = user;
			users.length = data.users.length;
		}

		//console.log(data);
		usersRedraw();
	});

	socket.on("disconnect", (data) => {
		system_message({type: "disconnect"});
	});

	socket.on("reconnect", (data) => {
		system_message({type: "reconnect"});
	});

	socket.on("error_message", (data) => {
		console.log("Server error: ", data);
	});

	socket.on("play", (data) => {
		if (data.video != video) {
			player.loadVideoById(data.video, data.time);
			video = data.video;
		}
		else {
			player.seekTo(data.time, true);
		}
		
		player.playVideo();
		played = true;
		data.type = "play";
		system_message(data);
	});

	socket.on("pause", function(data){
		data.type = "pause";
		player.pauseVideo();
		played = false;
		system_message(data);
	});

	socket.on("load", function(data){
		video = data.video;
		player.cueVideoById(video, 0);
		$("#timeline .line").css("width", "0%");
		data.type = "load";
		system_message(data);
		//player.seekTo(0);
		///
	});

	socket.on("rewind", function(data){
		var time = data.time;
		data.type = "rewind";

		player.seekTo(time, true);
		system_message(data);

		setTimeout(refresh_timeline, 100);
		setTimeout(refresh_timeline, 250);
		setTimeout(refresh_timeline, 1000);
	});

	socket.on("message", function(data){
		var nick = data.nick;
		var text = data.text;
		var date = formatDate(new Date().getTime());
		var style = `style='border-left: 3px solid ${data.color}'`;
		text = checkSmiles(text);


		var msg = `<div title='${date}' class='new' ${style}><b>${nick}:</b> ${text}</div>`;
		$("#chat .messages").append(msg);

		setTimeout(function(){
			$(".messages .new").removeClass("new");
		}, 5);

		// CHECK READED MESAGES
		checkNewMessages();
	});

	socket.on("message_image", function(data){
		var nick = data.nick;
		var source = data.image;
		var image = $("<img />");
			image.attr("src", source);
			image.addClass("source");
			image.click(function(){
				var w = window.open('about:blank');
				var s = source;

				setTimeout(function(){ 
					var elem = w.document.createElement('img');
					elem.style.maxWidth = "100%";
					elem.style.maxHeight = "100%";
					elem.style.borderRadius = "5px";
					elem.style.padding = "5px";
					elem.style.background = "white";
					elem.style.boxShadow = "0px 10px 100px 0px black";
					w.document.body.appendChild(elem).src = s;
					w.document.body.style.padding = "0px";
					w.document.body.style.margin = "0px";
					w.document.body.style.display = "flex";
					w.document.body.style.justifyContent = "center";
					w.document.body.style.alignItems = "center";
				}, 0);
			});

		var div = $("<div></div>");
			div.append(`<b>${nick}</b> share image:`);
			div.append(image);
			div.appendTo("#chat .messages");

		checkNewMessages();
	});

	socket.on("playlist", function(data){
		$("#playlist .list .item:not(.template)").remove();

		for(var id in data) {
			var video = data[id];
			var image_url = `url('${video.thumbnail_url}')`;

			var item = $("#playlist .list .template").clone();
				item.appendTo("#playlist .list");
				item.removeClass("template");
				item.find(".image").css("backgroundImage", image_url);
				item.find(".name").html(video.title);
				item.find(".name").attr("title", video.title);
				item.find(".channel b").html(video.author_name);
				item.data("video", id);
				item.attr("title", video.title);

				item.find(".play").click(function(e){
					var link = $(this).parents(".item").data("video");
					socket.emit("load", {link, playlist: true});
					e.preventDefault();
					return false;
				});

				item.find(".delete").click(function(e){
					var id = $(this).parents(".item").data("video");
					socket.emit("playlist_delete", {id});
					e.preventDefault();
					return false;
				});
		}
	});

	socket.on("kick", function(data){
		if (data.user == localStorage.player_nick) {
			document.location = "about:blank";
		}
	});

	socket.on("click", function(data){
		var mark = $("<div></div>");
			mark.appendTo("#page");
			mark.addClass("mark");
			mark.css({
				"left": data.x + "%",
				"top": data.y + "%",
				"borderColor": data.color
			});

		setTimeout(function(){
			mark.addClass("start");
		}, 10);

		setTimeout(function(){
			mark.addClass("reduction");
		}, 1250);

		setTimeout(function(){
			mark.remove();
		}, 2000);
	});

	socket.on("light", function(data){
		var light = data.light;
		changeLight(light);
	});

	socket.on("join", (data) => {
		data.type = "join";
		system_message(data);

		users[data.nick] = {
			nick: data.nick,
			focus: true
		}

		if (data.nick != nick)
			users.length++;

		usersRedraw();
	});

	socket.on("focus_toggle", (data) => {
		users[data.nick].focus = data.focus;
		onlineRedraw(data.nick, data.focus);
	});

	socket.on("sync", (data) => {
		if (video != data.video) {
			player.loadVideoById(data.video, data.time + delta);
		}

		var time = player.getCurrentTime();
			time = parseInt(time);

		if (((data.time - 1) > time) || ((data.time + 1) < time)) {
			player.seekTo(data.time);
		}
	});

	socket.on("disc", (data) => {
		data.type = "disc";
		system_message(data);

		users.length--;
		delete users[data.nick];
		usersRedraw();
	});

	socket.on("rename", (data) => {
		data.type = "rename";

		delete users[data.old_nick];
		users[data.new_nick] = {
			nick: data.new_nick,
			focus: true
		}

		usersRedraw();
		system_message(data);
	});	

	/////////////////////////////////////////////


	$("#play").click(function(){
		socket.emit("play");
	});

	$("#stop").click(function(){
		socket.emit("pause");
		//player.pauseVideo();
	});

	$("#load").click(function(){
		var link = prompt("Link to YouTube video:");
		if (link) {
			socket.emit("load", {link, playlist: false});
		}
	});

	$("#chat input").keydown(function(event){
		if (event.keyCode == 13 && $(this).val().length > 0) {
			var text = $(this).val();
			var color = localStorage.player_color;

			if (text.length > MSG_MAX) text = text.substr(0, MSG_MAX);
			socket.emit("message", {text, color});
			$(this).val('');

			$("#chat .smiles.show").removeClass("show");
		}
	});

	$("#chat .header .setup").click(function(){
		$("#loader").fadeIn("slow").css("display", "flex");
		$("#loader button").show();
		$("#loader button.full").removeClass("full");
		$("#loader .nickname").val(localStorage.player_nick);
		$("#loader .color").val(localStorage.player_color);
		return false;
	});

	$("#chat .header .big").click(function(){
		$("#chat").toggleClass("big");
		$(this).toggleClass("select");
		return false;
	});

	$("#chat .header .users").click(function(){
		$("#chat .users_list").toggleClass("show");
		$(this).toggleClass("select");
		return false;
	});


	$("#timeline").click(function(event){
		var x = event.offsetX;
		var max_x = $("#timeline").width();
		if (x > max_x) x = max_x;

		var duration = player.getDuration();
		var rewind_percent = x / max_x;
		var rewind_seconds = duration * rewind_percent;

		if (player.getPlayerState() != 5)
		socket.emit("rewind", {time: rewind_seconds, nick});
	});

	$("#timeline").mousemove(function(event){
		var x = event.originalEvent.layerX - 10;
		var y = event.offsetY;
		var max_x = parseInt( $("#timeline").width() );

		var duration = player.getDuration();
		var rewind_percent = x / max_x;
		if (rewind_percent < 0) rewind_percent = 0;
		var rewind_seconds = Math.floor(duration * rewind_percent);
		if (rewind_seconds > duration) rewind_seconds = duration;
		var rewind_time = formatTime(rewind_seconds);
		var rewind_position = (rewind_percent * max_x) - 35;

		if (rewind_position < 0) rewind_position = 0;
		if (x > max_x - 35) rewind_position = max_x - 70;

		if (event.target.id == "timeline" || event.target.className == "line") {
			if (event.target.className == "line") rewind_position += 10;
			$(this).find(".time").css("left", rewind_position + "px");
			$(this).find(".time").html(rewind_time);
		}
	});


	$("#timer .back").click(function(){
		var second = player.getCurrentTime() - 10;
		if (second < 0) second = 0;
		socket.emit("rewind", {time: second, nick});
	});

	$("#timer .forward").click(function(){
		var duration = player.getDuration();
		var second = player.getCurrentTime() + 10;
		if (second > duration) second = duration;
		socket.emit("rewind", {time: second, nick});
	});


	$("#volume").mousemove(function(){
		var volume = $("#volume").val();
		player.setVolume(String(volume));
		localStorage.player_volume = volume;
	});


	$('#page').bind("mousewheel", function(e){
		var volume = parseInt($("#volume").val());
		var newVolume = 0;
		if(e.originalEvent.wheelDelta < 0) {
			newVolume = volume - 3;
		} 
		else {
			newVolume = volume + 3;
		}

		if (newVolume < 0) newVolume = 0;
		if (newVolume > 100) newVolume = 100;
		$("#volume").val(newVolume);
		player.setVolume(String(newVolume));
		localStorage.player_volume = newVolume;

		//prevent page fom scrolling
		return false;
	});


	$("#page").click(function(e){
		if (e.ctrlKey) {
			var x = e.offsetX;
			var y = e.offsetY;

			var width = $(e.target).width();
			var height = $(e.target).height();

			var xx = +((x / width) * 100).toFixed(2);
			var yy = +((y / height) * 100).toFixed(2);
			var color = localStorage.player_color;

			socket.emit("click", {x: xx, y: yy, color: color});
		}
	});


	$("#light").click(function(){
		socket.emit("light");
	});


	$("#menu #quality div").click(function(){
		var quality = $(this).data("quality");
		$("#page").removeAttr("class");
		$("#page").addClass(quality);
		$("#menu #quality div").removeClass("active");
		$(this).addClass("active");

		if (quality == "full") {
			$("body").addClass("full");
			document.documentElement.webkitRequestFullScreen();
		}
		else {
			$("body").removeClass("full");
			document.webkitCancelFullScreen();
		}

	});


	setInterval(function(){
		if (played) refresh_timeline();
	}, 500);
}

function refresh_timeline() {
	var current_clear = player.getCurrentTime();
	var duration_clear = player.getDuration();
	var current = formatTime(current_clear);
	var duration = formatTime(duration_clear);
	$("#timer .current").html(current);
	$("#timer .duration").html(duration);

	var dir = (current_clear / duration_clear) * 100;
	$("#timeline .line").css("width", dir + "%");
}

function changeLight(light) {
	if (light == false) {
		$("body").addClass("dark");
	}
	else {
		$("body").removeClass("dark");
	}
}

function system_message(data) {
	var nick = data.nick;
	var type = data.type
	var text = null;

	switch(type) {
		case "join": {
			text = `<b>${nick}</b> joined us...`;
			break;
		}
		case "disc": {
			text = `<b>${nick}</b> disconnected...`;
			break;
		}
		case "play": {
			text = `<b>${nick}</b> played video...`;
			break;
		}
		case "pause": {
			text = `<b>${nick}</b> paused video...`;
			break;
		}
		case "load": {
			text = `<b>${nick}</b> load video...`;
			break;
		}
		case "rewind": {
			var time = formatTime(data.time);
			text = `${nick} rewind to <b>${time}</b>`;
			break;
		}
		case "rename": {
			text = `<b>${data.old_nick}</b> renamed to <b>${data.new_nick}</b>`;
			break;
		}
		case "disconnect": {
			text = "Connection lost! Reconnecting...";
			break;
		}
		case "reconnect": {
			text = "Connection repaired!";
			break;
		}
	}

	var date = formatDate(new Date().getTime());
	var msg = `<div class="${type}" title="${date}">${text}</div>`;
	$("#chat .messages").append(msg);

	checkNewMessages();
}

function checkNewMessages() {
	if ( !$("#chat").hasClass("active") ) {
		if (new_messages > 0)
			$("#chat .header .new").show();
		new_messages++;
		$("#chat .header .new").html(new_messages);
	}
	else {
		if (window_blur) new_messages++;
	}

	if (window_blur) {
		document.title = `(${new_messages}) - ${window_title}`;
		MessageSound.play();
	}


	$("#chat .messages").animate({
		scrollTop: $("#chat .messages")[0].scrollHeight
	}, "fast");
}

///////////////////////////////////
// SMILES GENERATE REGEXP's ///////

function smiles_init() {
	$.ajax({
		url: "/api/smiles",
		type: "GET",
		dataType: "json",
		success: function(data) {
			var version = data.varsion;
			var smiles = [];

			if (localStorage.player_smiles_version != version) {
				data.smiles.map((item) => {
					smiles.push(item.name);
				});

				localStorage.player_smiles = JSON.stringify(smiles);
				localStorage.player_smiles_version = version;
			}
			else {
				smiles = JSON.parse(localStorage.player_smiles);
			}

			smiles_store(smiles);
		}
	});
}

function smiles_store(smiles_buff) {
	/*var smiles_buff = [ 
		"KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "KappaNinja", "KappaSoldier", "KappaWatch", "KappaSlava", "KeepoSlava", "Keepo", "Kappa", "FroggyOmg", "FroggySleep", "FroggyCry", "Facepalm", "ValakasSon", "Valakas", "Kombik", "Godzila", "Niger", "Ninja", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto", "Wow", "Love", "Slow", "Wut", "Frog", "Illuminati", "RoflEpic", "RoflMega", "Rofl"
	], */

	for(var a in smiles_buff) {
		var smile = smiles_buff[a];
		var smile_lower = smile.toLocaleLowerCase();
		var s1 = new RegExp(smile + " ", "g");
		var s2 = new RegExp(smile + "Big ", "g");
		var s3 = new RegExp(smile + "Blg ", "g");
		smiles.push(s3);
		smiles.push(s2);
		smiles.push(s1);

		$("#chat .smiles").append(`<img src='/img/s/${smile_lower}.png' title='${smile}'>`);
	}

	$("#chat .smiles img").click(function(){
		var smile = $(this).attr("title");
		var message = $("#chat input").val();
		$("#chat input").val(`${message}${smile} `);		
	});
}
	
////////////////////////////////////

function checkSmiles(text) {
	if (text.slice(-1) != " ") text += " ";

	for(var a in smiles) {
		var smile = smiles[a];
		var smile_clear = String(smile).replace("/","").replace("/g", "");
		var smile_lower = smile_clear.toLocaleLowerCase().replace(" ", "");
		var title = smile_clear;

		if (smile_clear.indexOf("Big") == -1 && smile_clear.indexOf("Blg") == -1)
			var file = `<img src='img/s/${smile_lower}.png' alt='${title}'>`;
		else {
			smile_lower = smile_lower.replace("big", "")
			smile_lower = smile_lower.replace("blg", "");
			var file = `<img src='img/s/${smile_lower}.png' class='big' alt='${title}'>`;
			//console.log(smile, smile_clear, smile_lower, sss, file);
		}

		text = text.replace(smile, file);
	};

	return text;
}

function usersRedraw() {
	$("#chat .users_list").empty();

	for(var u in users) {
		var user = users[u];
		var online = user.focus ? 'Watching video' : 'Not watch video';
		var item = $("<div></div>");
			item.addClass("user");
			item.append(`<span class="${user.focus}" title="${online}"></span>`);
			item.append(user.nick);
			item.attr("data-nick", user.nick);
			item.appendTo("#chat .users_list");
	}
	
	$("#chat .header .users i").html(users.length);
}

function onlineRedraw(nick, focus) {
	var online = users[nick].focus ? 'Watching video' : 'Not watching video';
	var user = $(`#chat .users_list .user[data-nick='${nick}']`);
		user.find("span").removeClass(String(!focus));
		user.find("span").addClass(String(focus));
		user.find("span").attr("title", online);
}



function formatTime(time){
	time = Math.round(time);
	var minutes = Math.floor(time / 60)
	var seconds = time - minutes * 60;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;
	return minutes + ":" + seconds;
}

function formatDate(unix) {
	var date = new Date(unix);	
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	hours = (hours > 9 ? hours: "0"+hours);
	minutes = (minutes > 9 ? minutes: "0"+minutes);
	seconds = (seconds > 9 ? seconds: "0"+seconds);

	return `${hours}:${minutes}:${seconds}`;
}


$("#loader .nickname").keyup(function(event){
	var new_nick = $(this).val();
	var color = $("#loader .color").val();

	if (new_nick.length > 11) {
		new_nick = new_nick.substr(0, 11);
		$(this).val(new_nick);
	}

	if (event.keyCode == 13) {
		var old_nick = nick;
		localStorage.player_nick = new_nick;
		localStorage.player_color = color;
		nick = localStorage.player_nick;

		if (socket) {
			if (new_nick != old_nick)
			socket.emit("rename", {old_nick, new_nick});
		}
		else {
			onYouTubeIframeAPIReady();
		}

		$("#loader").fadeOut("slow").css("display", "none");
	}

	return false;
});

$("#loader .save").click(function(){
	var new_nick = $("#loader .nickname").val();
	var color = $("#loader .color").val();
	var old_nick = nick;
	localStorage.player_nick = new_nick;
	localStorage.player_color = color;
	nick = localStorage.player_nick;

	if (socket) {
		if (new_nick != old_nick)
		socket.emit("rename", {old_nick, new_nick});
	}
	else {
		onYouTubeIframeAPIReady();
	}

	$("#loader").fadeOut("slow").css("display", "none");
});

$("#loader .close").click(function(){
	$("#loader").fadeOut("fast");
});


$("#chat .header").click(function(){
	$("#chat").toggleClass("active");
	new_messages = 0;
	$("#chat .header .new").html(new_messages);
	$("#chat .header .new").fadeOut("slow");
});

$("#chat .header .new").click(function(){
	new_messages = 0;
	$("#chat .header .new").html(new_messages);
	$("#chat .header .new").fadeOut("slow");
	return false;
});


$("#chat .smiles_open").click(function(){
	$("#chat .smiles").toggleClass("show");
});


// PLAYLIST
$("#playlist .header").click(function(){
	$("#playlist").toggleClass("active");
});


$("#changelist_button").click(function(){
	$("#darker").fadeIn(500);
	$("#changelist").fadeIn(500);
	$("#changelist_button").removeClass("new");
	localStorage.player_version = $(this).data("version");
});

$("#changelist .close").click(function(){
	$("#darker").fadeOut(500);
	$("#changelist").fadeOut(500);
});


//////////////////////////////
// 	 PAGE KEYBOARD EVENTS 	//
//////////////////////////////

$(document).keydown(function(event){
	var loader_focus = $("#loader input").is(":focus");
	var chat_open = $("#chat").hasClass("active");
	var chat_focus = $("#chat input").is(":focus");
	var nickinput = $("#loader .nickname").is(":focus");

	// Focus Chat
	if (event.keyCode == 13 && loader_focus == false) {
		$("#chat input").focus();
		if (chat_open == false) {
			new_messages = 0;
			$("#chat .header .new").html(new_messages);
			$("#chat .header .new").fadeOut("slow");
			$("#chat").addClass("active");
		}
	}

	// DeFocus Chat
	if (event.keyCode == 27 && chat_open) {
		 $("#chat").removeClass("active");
		 $("#chat input").blur();
	}

	// Pause Video
	if (event.keyCode == 32 && !chat_focus && !nickinput) {
		if (played) $("#stop").click();
		else $("#play").click();
	}
});



$(document).on("paste", function(e){
	var items = (event.clipboardData  || event.originalEvent.clipboardData).items;

	for(var a = 0; a < items.length; a++) {
		if (items[a].type.indexOf("image") === 0) {
			blob = items[a].getAsFile();
			
			openFile(blob).then(source => {
				socket.emit("message_image", {
					image: source
				});
			});
		}
	}
});



async function openFile(file) {
	var reader = new FileReader();

	var promise = new Promise((resolve, reject) => {
		reader.onload = function(event) {
			var r = event.target.result;
			resolve(r);
		};
		reader.readAsDataURL(blob);
	});
	return await promise;
}


/*function fullScreen() {
	$("#page").css({"width": "100%", "height": "100%", "marginTop": "0px"}); 
	$("#page #timer").css("top", "15px").css("zIndex", "9999999");
	$("body").css("overflow", "hidden");
	$("#page #timeline").css({"zIndex": "99999", "marginTop": "-4px"});
	//$("#menu").css("bottom", "-90px");
}*/

$(document).ready(function(){
	//document.location.reload();
	//socket_init();

	smiles_init();

	setTimeout(function(){
		if (player == null) {
			onYouTubeIframeAPIReady();
			console.log("Trying reinit");
		}

		setTimeout(function(){
			if ((socket == null || player == null) && (localStorage.player_nick != undefined) && connetion_step == 0) 
			alert("Connection error... Reload page!\rIf reload not help - press CTRL + F5");
			//document.location.reload();
		}, 2000);
	}, 2000);
});
