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
window.addEventListener("load", Ready);
socket.on('init', function (data, fn) {
  console.log("server ping");
  var json = JSON.stringify({"token":token, "userId":userId});
  console.log(json);
  fn(JSON.stringify({"token":token, "userId":userId}));
});
socket.on('send', function (data) {
  var res = JSON.parse(data);
  console.log(res);
  update_box(res.name, res.content, res.href);
});
socket.on('upload done', function (data) {
  var res = JSON.parse(data);
  console.log(res);
  update_box("me", res.content, res.href);
  socket.emit('send', 
	  JSON.stringify({"token":token, "userId":userId, "to":friend_id, "content":res.content, "href":res.href}), 
	  function(data){
  });
});
var SelectedFile;
var FReader;
var Name;
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
				if(list[i].href==undefined){
					tmp = tmp + "<li>"+list[i].from+": "+list[i].content+"</li>";
				}else{
					tmp = tmp + "<li>"+list[i].from+
					": <a href=\""+list[i].href+"\" target=\"_blank\">"+
					list[i].content+"</a></li>";
				}
			}
			ul.innerHTML=tmp;
		}else{
			request_history();
		}
	});
}
function update_box(name, content, href){
	var ul = document.getElementById("message");
	var tmp = ul.innerHTML;
	if(href==undefined){
		tmp = tmp + "<li>"+name+": "+content+"</li>";
	}else{
		tmp = tmp + "<li>"+name+": <a href=\""+href+"\" target=\"_blank\">"+content+"</a></li>";
	}
	ul.innerHTML=tmp;
}
function sendmsg(){
	var msg_box = document.getElementById("msgblock");
	var msg = msg_box.value;
	if(msg!=""){
		socket.emit('send', JSON.stringify({"token":token, "userId":userId, "to":friend_id, "content":msg}), function(data){
			var res = JSON.parse(data);
			console.log("res:"+res);
			msg_box.value="";
			update_box("me", msg);
			if(data.success=='true'){
				console.log("send");
			}else{
				//sendmsg();
			}
		});
	}
}

function Ready(){
	console.log('ready');
	if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use
		document.getElementById('UploadButton').addEventListener('click', StartUpload);
		document.getElementById('FileBox').addEventListener('change', FileChosen);
	}
	else
	{
		alert("Browser doesn't support!");
	}
}
function FileChosen(evnt) {
	SelectedFile = evnt.target.files[0];
}
function StartUpload(){
	if(document.getElementById('FileBox').value != "")
	{
		FReader = new FileReader();
		Name = document.getElementById('FileBox').value;
    var tmp = Name.split("\\");
    Name = tmp[tmp.length-1];
		console.log("file upload! file name="+Name);
		FReader.onload = function(evnt){
			socket.emit('upload', {'name' : Name, data : evnt.target.result});
		}
    FReader.readAsBinaryString(SelectedFile);
	}
	else
	{
		alert("Please Select A File");
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
