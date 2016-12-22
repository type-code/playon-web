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

if (nick != undefined) {

	function onYouTubeIframeAPIReady() {
	   	player = new YT.Player('player', {
			height: '480',
			playerVars: { 'autoplay': 0, 'controls': 0, 'showinfo': 0, 'rel': 0},
			width: '854',
			events: {
				'onReady': function(){
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
	var socket = io("http://93.175.221.13:8080/");

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

		
		// CALLBACK TO JOIN SERVER
		socket.emit("join", {nick});

	});

	socket.on("play", function(data){
		if (data.video != video)
			player.loadVideoById(data.video, data.time);
		else {
			player.seekTo(data.time);
			player.playVideo();
		}
	});

	socket.on("stop", function(time){
		player.pauseVideo();
	});

	socket.on("load", function(data){
		var video = data.video;
		console.log(data, video);
		player.cueVideoById(video);
		//player.seekTo(0);
		///
	});

	socket.on("message", function(data){
		var nick = data.nick;
		var text = data.text;
		var msg = `<div><b>${nick}:</b> ${text}</div>`;
		$("#chat .messages").append(msg);

		$("#chat .messages").animate({
        	scrollTop: $("#chat .messages")[0].scrollHeight
        }, "fast");

        // CHECK READED MESAGES
        new_messages_check();
	});

	socket.on("join", system_message);
	socket.on("disc", system_message);

	function system_message(data) {
		var nick = data.nick;
		var type = data.type
		var text;

		if (type == "join") text = `${nick} joined us...`;
		if (type == "disc") text = `${nick} disconnected...`;

		var msg = `<div class="${type}">${text}</div>`;
		$("#chat .messages").append(msg);

		new_messages_check();
		$("#chat .messages").animate({
        	scrollTop: $("#chat .messages")[0].scrollHeight
        }, "fast");
	}

	function new_messages_check() {
		if ( !$("#chat").hasClass("active") ) {
        	new_messages++;
        	$("#chat .header .new").show();
        	$("#chat .header .new").html(new_messages);
        }
	}

	/////////////////////////////////////////////


	$("#play").click(function(){
		socket.emit("play");
		//player.playVideo();
	});

	$("#stop").click(function(){
		socket.emit("stop");
		//player.pauseVideo();
	});

	$("#load").click(function(){
		var link = prompt("Link to YouTube video:");
		if (link && link != "") {
			var id = link.replace("https://www.youtube.com/watch?v=", "");
			socket.emit("load", {id});
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

	$("#volume").change(changeVolume);
	$("#volume").mousemove(changeVolume);

	function changeVolume() {
		var volume = $("#volume").val();
		player.setVolume(String(volume));
	};


	setInterval(function(){
		var current = formatTime(player.getCurrentTime());
		var duration = formatTime(player.getDuration());
		$("#timer .current").html(current);
		$("#timer .duration").html(duration);
	}, 500);



	function formatTime(time){
		time = Math.round(time);
		var minutes = Math.floor(time / 60)
		var seconds = time - minutes * 60;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		seconds = seconds < 10 ? '0' + seconds : seconds;
		return minutes + ":" + seconds;
	}

}


$("#loader input").keyup(function(event){
	if (event.keyCode == 13) {
		var nick = $(this).val();
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