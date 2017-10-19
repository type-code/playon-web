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
var MessageSound = new Audio("message.mp3");
var played = false;
var ww = null;

const MSG_MAX = 150;

window.onblur = function() {
	window_blur = true;
}

window.onfocus = function() {
	window_blur = false;
	document.title = window_title;
	if ( $("#chat").hasClass("active") )
		new_messages = 0;
}


//function onYouTubeIframeAPIReady() {
//$(document).ready(function(){
	function onYouTubeIframeAPIReady() {
		if (nick) {
			connetion_step = 1;
			player = new YT.Player('player', {
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
			$("#loader button").hide();
		}
	}
//});
//}


function player_init() {
	if (localStorage.player_volume == undefined)
		localStorage.player_volume = 50;

	var version = $("#changelist_button").data("version");
	if (localStorage.player_version != version)
		$("#changelist_button").addClass("new");

	player.setVolume(localStorage.player_volume);
	$("#volume").val(localStorage.player_volume);

	socket_init();
}


function socket_init() {
	var host = "ws://chrom-web.ga";//document.location.origin;
	socket = io(host + ":8080/");

	socket.on("connected", function(data){
		var video_url = data.video;
		var time = data.time;
		played = data.play;

		if (played == true) {
			player.loadVideoById(video_url, time + delta);
		}
		else {
			if (video_url != video)
			player.cueVideoById(video_url, time + delta);
		}
		video = video_url;
		
		var light = data.light;
		changeLight(light);

		// CALLBACK TO JOIN SERVER
		socket.emit("join", {nick});
	});

	socket.on("disconnect", function(data){
		system_message({type: "disconnect"});
	});

	socket.on("reconnect", function(data){
		system_message({type: "reconnect"});
	});

	socket.on("play", function(data){
		if (data.video != video)
			player.loadVideoById(data.video, data.time);
		else {
			player.seekTo(data.time, true);
			player.playVideo();
		}
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
		var video = data.video;
		player.cueVideoById(video, 0);
		$("#timeline .line").css("width", "0%");
		data.type = "load";
		system_message(data);
		//player.seekTo(0);
		///
	});

	socket.on("rewind", function(data){
		var time = data.time;

		player.seekTo(time, true);
		system_message(data);
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
				//console.log(source);
				// ww = window.open('about:blank');
				// 	ww.document.location.href = source;

				// setTimeout(function(){
				// 	ww.document.write = `<img src='${source}'>`;
				// 	console.log(`<img src='${source}'>`);
				// 	ww.document.location.href = source;
				// 	ww.location.href = source;
				// 	ww.document.URL = source;
				// }, 1000);
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
		}, 1500);

		setTimeout(function(){
			mark.remove();
		}, 2000);
	});

	socket.on("light", function(data){
		var light = data.light;
		changeLight(light);
	});

	function changeLight(light) {
		if (light == false) {
			$("body").addClass("dark");
		}
		else {
			$("body").removeClass("dark");
		}
	}

	socket.on("join", system_message);
	socket.on("disc", system_message);
	socket.on("rename", system_message);

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
	var smiles_buff = [ 
		"KappaOrange", "KappaPride", "KappaDark", "KappaRoss", "KappaHD", "KappaNinja", "KappaSoldier", "KappaWatch", "Keepo", "Kappa", "FroggyOmg", "FroggySleep", "FroggyCry", "Facepalm", "Valakas", "Kombik", "Godzila", "Niger", "Ninja", "Vedro", "Pezda", "Ogre", "Kaef", "Girl", "Rage", "Omg", "Bro", "Rip", "Vac", "Yvo", "Len", "Dendi", "Story", "Omfg", "Cat", "Dog", "Hey", "Baby", "God", "Photo", "Angry", "Cry", "History", "Naruto", "Wow", "Love", "Slow", "Wut", "Frog", "Illuminati", "MegaRofl", "Rofl"
	], smiles = [];

	for(var a in smiles_buff) {
		var smile = smiles_buff[a];
		var s1 = new RegExp(smile, "g");
		var s2 = new RegExp(smile + "Big", "g");
		smiles.push(s2);
		smiles.push(s1);
	}
	////////////////////////////////////

	function checkSmiles(text) {
		for(var a in smiles) {
			var smile = smiles[a];
			var smile_clear = String(smile).replace("/","").replace("/g", "");
			var smile_lower = smile_clear.toLocaleLowerCase();
			var sss = smile_clear;

			if (smile_clear.indexOf("Big") == -1)
				var file = `<img src='img/s/${smile_lower}.png'>`;
			else {
				smile_lower = smile_lower.replace("big", "");
				var file = `<img src='img/s/${smile_lower}.png' class='big'>`;
				//console.log(smile, smile_clear, smile_lower, sss, file);
			}

			text = text.replace(smile, file);
		};

		return text;
	}

	/////////////////////////////////////////////


	$("#play").click(function(){
		socket.emit("play");
		//player.playVideo();
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
		}
	});

	$("#chat .header .setup").click(function(){
		$("#loader").fadeIn("slow").css("display", "flex");
		$("#loader button").show();
		$("#loader .nickname").val(localStorage.player_nick);
		$("#loader .color").val(localStorage.player_color);
		return false;
	});

	$("#chat .header .big").click(function(){
		$("#chat").toggleClass("big");
		$(this).toggleClass("select");
		return false;
	});


	$("#loader button").click(function(){
		$("#loader").fadeOut("fast");
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
		var x = event.offsetX;
		var y = event.offsetY;
		var max_x = $("#timeline").width();

		var duration = player.getDuration();
		var rewind_percent = x / max_x;
		var rewind_seconds = Math.floor(duration * rewind_percent);
		var rewind_time = formatTime(rewind_seconds);
		var rewind_position = (rewind_percent * max_x) - 35;

		if (x >= 0 && x < max_x && y > 1 && y < 24) {
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
			newVolume = volume - 5;
		} 
		else {
			newVolume = volume + 5;
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
		var current_clear = player.getCurrentTime();
		var duration_clear = player.getDuration();
		var current = formatTime(current_clear);
		var duration = formatTime(duration_clear);
		$("#timer .current").html(current);
		$("#timer .duration").html(duration);

		var dir = (current_clear / duration_clear) * 100;
		$("#timeline .line").css("width", dir + "%");
	}, 500);



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


// PLAYLIST
$("#playlist .header").click(function(){
	$("#playlist").toggleClass("active");
});


$("#changelist_button").click(function(){
	$("#changelist").fadeIn(500);
	$("#changelist_button").removeClass("new");
	localStorage.player_version = $(this).data("version");
});

$("#changelist .close").click(function(){
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

