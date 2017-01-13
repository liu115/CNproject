var socket = io('//localhost:3000');
var Href = "http://localhost:3000"
socket.on('init', function (data) {
  console.log(data);
  console.log(JSON.parse(data).text);
  socket.emit('init ack');
});


socket.on('message', function (data) {
  console.log(data);
  socket.emit('message ack');
});

function switch_page(index, data){
	if(index == 0){
		document.location.href=Href+"/register";
	}else if(index ==1){
		document.location.href=Href+"/login";
	}else{
		document.location.href=Href+"/";
	}
}
function login(account, pswd){
	$.post('/login', { username:account, password:pswd }, function(data){
		var res = data;//JSON.parse(data);
		console.log("res:"+res);
		if(res.success=="true"){//if permitted, and parse token
			document.cookie="token="+res.token;
			document.cookie="userId="+res.userId;
			switch_page(2, res.token);
		}else{
			var login_button = document.getElementById("login_button");
			login_button.style.color="#FF0000";
		}
	});
}
function register(account, pswd){
	$.post('/register', {username:account, password:pswd}, function(data){
		console.log("res:"+data);
		var res = (data);
		if(res.success=="true"){//if success
			switch_page(1);		
		}else{
			var submit_button = document.getElementById("register_submit");
			submit_button.style.color="#FF0000";
		}
	});
	
}
function get_login_info(){
	var account_text = document.getElementById("login_account");
	var password_text = document.getElementById("login_pswd");
	var account = account_text.value;
	var password = password_text.value;
	console.log("account:"+account);
	console.log("pswd:"+password);
	//if permit
	login(account, password);
}
function get_register_info(){
	var account = document.getElementById("register_account").value;
	var pswd = document.getElementById("register_pswd").value;
	var cpswd = document.getElementById("register_cpswd").value;
	console.log("account:"+account);
	console.log("pswd:"+pswd);
	console.log("cpswd:"+cpswd);
	
	if (pswd.valueOf() == cpswd.valueOf()&&cpswd.valueOf()!=""&&account.valueOf()!=""){
		var submit_button = document.getElementById("register_submit");
		submit_button.style.color="#000000";
		console.log("equals");
		register(account, pswd);
	}else{
		var submit_button = document.getElementById("register_submit");
		submit_button.style.color="#FF0000";
	}
}
