var url = location.href;
console.log("url="+url);
var tmp = url.split("/");
var token = readCookie("token");
var userId = readCookie("userId");
var friend_id = tmp[tmp.length-1];
console.log("token:"+token);
console.log("id:"+friend_id);
var socket = io('//localhost:3000/chat');
window.onload = init;
socket.on('init', function (data, fn) {
  console.log("server ping");
  var json = JSON.stringify({"token":token, "userId":userId});
  console.log(json);
  fn(JSON.stringify({"token":token, "userId":userId}));
});
socket.on('send', function (data) {
  var res = JSON.parse(data);
  console.log(res);
  update_box(res.name, res.content);
});
function init(){
	request_history();
	document.getElementById("msgblock").addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode == 13) {
			sendmsg();
		}
	});
}
function request_history(){
	socket.emit('history', JSON.stringify({"to":friend_id, "userId":userId, "token":token}), function(data){
		console.log("history"+data);
		var res = JSON.parse(data);
		if(res.success=='true'){
			var ul = document.getElementById("message");
			var list = res.messages;
			var tmp = "";
			for(var i in list){
				tmp = tmp + "<li>"+list[i].from+": "+list[i].content+"</li>";
			}
			ul.innerHTML=tmp;
		}else{
			request_history();
		}
	});
}
function update_box(name, content){
	var ul = document.getElementById("message");
	var tmp = ul.innerHTML;
	tmp = tmp + "<li>"+name+": "+content+"</li>";
	ul.innerHTML=tmp;
}
function sendmsg(){
	var msg_box = document.getElementById("msgblock");
	var msg = msg_box.value;
	if(msg!=""){
		socket.emit('send', JSON.stringify({"token":token, "userId":userId, "to":friend_id, "content":msg}), function(data){
			if(data.success=='true'){
				msg_box.value="";
				console.log("send");	
			}else{
				sendmsg();
			}
		});
	}
}
function goback(){
	var tmp = url;
	var tmp2 = tmp.split("/chat/");
	console.log("tmp:"+tmp);
	console.log("tmp2:"+tmp2);
	document.location.href=tmp2[0];
}
function readCookie(name) {
	name += '=';
	for (var ca = document.cookie.split(/;\s*/), i = ca.length - 1; i >= 0; i--){
		if (!ca[i].indexOf(name))
			return ca[i].replace(name, '');
	}
}

