//////////////////////
// 21.12.2016
// @Createt By CHROM
//////////////////////

var socket = null;
var player = null;
var video = null;
var delta = 0.5;
var nick = localStorage.nick;
var new_messages = 0;
var window_blur = false;
var window_title = document.title;

window.onblur = function() {window_blur = true;}
window.onfocus = function() {
	window_blur = false;
	document.title = window_title;
	if ( $("#chat").hasClass("active") )
		new_messages = 0;
}

if (nick != undefined && nick != "") {

	function onYouTubeIframeAPIReady() {
	   	player = new YT.Player('player', {
			height: '480',
			playerVars: { 'autoplay': 0, 'controls': 0, 'showinfo': 0, 'rel': 0},
			width: '854',
			events: {
				'onReady': function(){
					player.setVolume("50");
					$("#player").attr("width", "100%");
					$("#player").attr("height", "100%");
					socket_init();
				}
			}
		});
	}

}
else {
	console.log("Enter you NickName!");
	$("#loader").fadeIn("slow");
	$("#loader").css("display", "flex");
}




function socket_init() {
	var host = document.location.origin;
	var socket = io(host + ":8080/");

	socket.on("connected", function(data){
		console.log(data);
		var video_url = data.video;
		var time = data.time;
		var play = data.play;

		if (play == true) {
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

	socket.on("play", function(data){
		if (data.video != video)
			player.loadVideoById(data.video, data.time);
		else {
			player.seekTo(data.time, true);
			player.playVideo();
		}
	});

	socket.on("pause", function(data){
		data.type = "pause";
		player.pauseVideo();
		system_message(data);
	});

	socket.on("load", function(data){
		var video = data.video;
		player.cueVideoById(video);
		$("#timeline .line").css("width", "0%");
		data.type = "load";
		system_message(data);
		//player.seekTo(0);
		///
	});

	socket.on("rewind", function(data){
		var nick = data.nick;
		var second = data.second;

		player.seekTo(second, true);
		system_message(data);
	});

	socket.on("message", function(data){
		var nick = data.nick;
		var text = data.text;
		var date = formatDate(new Date().getTime());
		text = checkSmiles(text);
		var msg = `<div title='${date}' class='new'><b>${nick}:</b> ${text}</div>`;
		$("#chat .messages").append(msg);

		setTimeout(function(){
			$(".messages .new").removeClass("new");
		}, 5);
        // CHECK READED MESAGES
        new_messages_check();
	});

	socket.on("light", function(data){
		var light = data.light;
		changeLight(light);
	});

	function changeLight(light) {
		if (light == false) {
			$("body").css("background", "#222");
			$("#page").css("background", "#111");
			$("#page #timeline").css("borderColor", "#111");
			$("#menu #light").addClass("dark");

			$("#chat").css("background", "#1f1e1e");
			$("#chat .messages").css("background", "#232323");
			$("#chat .messages").css("color", "white");
			$("#chat input").css("background", "#2d2d2d");
			$("#chat input").css("color", "white");
			$("#chat .header").css("background", "#151515");
			$("#menu .header").css("background", "#151515");
		}
		else {
			$("body").removeAttr("style");
			$("#page").removeAttr("style");
			$("#page #timeline").removeAttr("style");
			$("#menu #light").removeClass("dark");

			$("#chat").removeAttr("style");
			$("#chat .messages").removeAttr("style");
			$("#chat input").removeAttr("style");
			$("#chat .header").removeAttr("style");
			$("#menu .header").removeAttr("style");
		}
	}

	socket.on("join", system_message);
	socket.on("disc", system_message);

	function system_message(data) {
		var nick = data.nick;
		var type = data.type
		var text;

		if (type == "join") {
			text = `<b>${nick}</b> joined us...`;
		}
		if (type == "disc") {
			text = `<b>${nick}</b> disconnected...`;
		}
		if (type == "pause") {
			text = `<b>${nick}</b> paused video...`;
		}
		if (type == "load") {
			text = `<b>${nick}</b> load video...`;
		}
		if (type == "rewind") {
			var time = formatTime(data.second);
			text = `${nick} rewind to <b>${time}</b>`;
		}

		var date = formatDate(new Date().getTime());
		var msg = `<div class="${type}" title="${date}">${text}</div>`;
		$("#chat .messages").append(msg);

		new_messages_check();
	}

	function new_messages_check() {
		if ( !$("#chat").hasClass("active") ) {
        	new_messages++;
        	$("#chat .header .new").show();
        	$("#chat .header .new").html(new_messages);
        }
        else {
        	if (window_blur) new_messages++;
        }

        if (window_blur) {
        	document.title = `(${new_messages}) - ${window_title}`;
        }

        $("#chat .messages").animate({
        	scrollTop: $("#chat .messages")[0].scrollHeight
        }, "fast");
	}

	function checkSmiles(text) {
		text = text.replace(/KappaOrange/g, "<img src='img/s/kappaorange.png'>");
		text = text.replace(/KappaPride/g, "<img src='img/s/kappapride.png'>");
		text = text.replace(/KappaRoss/g, "<img src='img/s/kappaross.png'>");
		text = text.replace(/KappaHD/g, "<img src='img/s/kappahd.png'>");
		text = text.replace(/Facepalm/g, "<img src='img/s/facepalm.png'>");
		text = text.replace(/Valakas/g, "<img src='img/s/valakas.png'>");
		text = text.replace(/Kombik/g, "<img src='img/s/kombik.png'>");
		text = text.replace(/Godzila/g, "<img src='img/s/godzila.png'>");
		text = text.replace(/Kappa/g, "<img src='img/s/kappa.png'>");
		text = text.replace(/Keepo/g, "<img src='img/s/keepo.png'>");
		text = text.replace(/Niger/g, "<img src='img/s/niger.png'>");
		text = text.replace(/Ninja/g, "<img src='img/s/ninja.png'>");
		text = text.replace(/Vedro/g, "<img src='img/s/vedro.png'>");
		text = text.replace(/Ogre/g, "<img src='img/s/ogre.png'>");
		text = text.replace(/Kaef/g, "<img src='img/s/kaef.png'>");
		text = text.replace(/Girl/g, "<img src='img/s/girl.png'>");
		text = text.replace(/Rage/g, "<img src='img/s/rage.png'>");
		text = text.replace(/Omg/g, "<img src='img/s/omg.png'>");
		text = text.replace(/Bro/g, "<img src='img/s/bro.png'>");
		text = text.replace(/Rip/g, "<img src='img/s/rip.png'>");

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
		if (link && link != "") {
			link = link.replace("https://www.youtube.com/watch?v=", "");
			link = link.split("&");
			var id = link[0];
			socket.emit("load", {id, nick});
		}
	});

	$("#chat input").keyup(function(event){
		if (event.keyCode == 13 && $(this).val().length > 0) {
			var text = $(this).val();

			if (text.length > 140) text = text.substr(0, 140);
			socket.emit("message", {nick, text});
			$(this).val('');
		}
	});

	$("#chat .header .setup").click(function(){
		$("#loader").css("display", "flex");
		$("#loader").fadeIn("slow");
		$("#loader input").val(localStorage.nick);
		return false;
	});


	$("#timeline").click(function(event){
		var x = event.offsetX;
		var max_x = $("#timeline").width();
		if (x > max_x) x = max_x;

		var duration = player.getDuration();
		var rewind_percent = x / max_x;
		var rewind_seconds = duration * rewind_percent;

		socket.emit("rewind", {second: rewind_seconds, nick});
	});

	$("#timeline").mousemove(function(event){
		var x = event.offsetX;
		var y = event.offsetY;
		var max_x = $("#timeline").width();
		

		var duration = player.getDuration();
		var rewind_percent = x / max_x;
		var rewind_seconds = Math.floor(duration * rewind_percent);
		var rewind_time = formatTime(rewind_seconds);
		var rewind_position = (rewind_percent * max_x) - 20;

		if (x >= 0 && x < max_x && y > 1 && y < 24) {
			$(this).find(".time").css("left", rewind_position + "px");
			$(this).find(".time").html(rewind_time);
		}
	});


	$("#timer .back").click(function(){
		var second = player.getCurrentTime() - 10;
		if (second < 0) second = 0;
		socket.emit("rewind", {second, nick});
	});

	$("#timer .forward").click(function(){
		var duration = player.getDuration();
		var second = player.getCurrentTime() + 10;
		if (second > duration) second = duration;
		socket.emit("rewind", {second, nick});
	});


	$("#volume").change(changeVolume);
	$("#volume").mousemove(changeVolume);

	function changeVolume() {
		var volume = $("#volume").val();
		player.setVolume(String(volume));
	};

	$('#page').bind('mousewheel', function(e){
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

		//prevent page fom scrolling
		return false;
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
	});


	setInterval(function(){
		var current_clear = player.getCurrentTime();
		var duration_clear = player.getDuration();
		var current = formatTime(current_clear);
		var duration = formatTime(duration_clear);
		$("#timer .current").html(current);
		$("#timer .duration").html(duration);

		var dir = (current_clear / duration_clear) * 100;
		$("#timeline .line").css("width", dir+"%");
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


$("#loader input").keyup(function(event){
	var nick = $(this).val();
	if (nick.length > 11) {
		nick = nick.substr(0, 11);
		$(this).val(nick);
	}

	if (event.keyCode == 13) {
		localStorage.nick = nick;
		document.location.reload();
	}
});

$("#chat .header").click(function(){
	$("#chat").toggleClass("active");
	new_messages = 0;
	$("#chat .header .new").html(new_messages);
	$("#chat .header .new").fadeOut("slow");
});


function fullScreen() {
	$("#page").css({"width": "100%", "height": "100%", "marginTop": "0px"}); 
	$("#page #timer").css("top", "15px").css("zIndex", "9999999");
	$("body").css("overflow", "hidden");
	$("#page #timeline").css({"zIndex": "99999", "marginTop": "-4px"});
	//$("#menu").css("bottom", "-90px");
}