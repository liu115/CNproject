var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var register = require('./routers/register');
var login = require('./routers/login');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser')

var User = require('./models/user');
var Message = require('./models/message');

mongoose.Promise = global.Promise;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use('/register', register);
app.use('/login', login);
app.use('/public', express.static('app/public'));


app.post('/register', (req, res) => {
  // TODO: redirect to /login if success
  console.log('post register request');
  console.log(req.body.id);
  console.log(req.body.password);
  res.send('12345');
});

app.get('/', function(req, res, next) {
  // TODO: check login session, or redirct to /login
  res.sendFile(path.join(__dirname, '../', 'app', 'index.html'));
  console.log('get /');
});

var chat_socket = io.of('/chat');
app.get('/chat/:id', function(req, res) {
  // TODO: check login session, or redirct to /login
  res.sendFile(path.join(__dirname, '../', 'app', 'chat.html'));


  console.log('get /chat');
});

io.on('connection', function (socket) {
  console.log('connect /');
  socket.on('init', function (data, fn) {
    var json = JSON.parse(data);
    User.find({}, 'username userId').exec((err, users) => {
      if (err) return fn(JSON.stringify({ success: 'false' }));
      console.log(users);
      var sendback = {
        success: 'true',
        friends: users.map(user => ({
          name: user.username,
          userId: user.userId
        }))
      };
      return fn(JSON.stringify(sendback));
    });
    console.log(data.token);
  });

  socket.on('disconnect', function () {
    console.log('disconnect with client');
  });
});

var client = {};
function sendto(id, data) {
  if (client[`c${id}`] == undefined || client[`c${id}`] == null) return 0;
  var socketId = client[`c${id}`].socketId;
  console.log('to ' + socketId);
  io.of('/chat').connected[socketId]
    .emit('send', data);
}
chat_socket.on('connection', function (socket) {
  socket.emit('init', null, function (data) {
    console.log(data);

    var user = JSON.parse(data);
    console.log('user');
    if (client[`c${user.userId}`] === undefined) {
      User.findById(user.token, (err, finduser) => {
        if (finduser.userId == user.userId) {
          client[`c${user.userId}`] = {
            token: user.token,
            socketId: socket.id
          };
          console.log(`c${user.userId} has socket ${client[`c${user.userId}`].socketId}`);
        }
      });
    }
    else {
      if (client[`c${user.userId}`].token == user.token) {
        client[`c${user.userId}`].socketId = socket.id;
        console.log(`c${user.userId} has socket ${client[`c${user.userId}`].socketId}`);
      }
    }
    console.log(client);
  });
  console.log('connect /chat with ');
  // console.log('with' + socket.handshake.to);
  socket.on('history', function(data, fn) {
    console.log(data);
    var json = JSON.parse(data);
    var token = json.token, target = json.to;
    if (target === null) return fn(JSON.stringify({ success: 'false' }));
    User.findById(token, 'userId', (err, user) => {
      if (user === null) return 0;
      var userId = user.userId;
      console.log(socket.id);
      Message.find({ $or: [{from: target, to: userId}, {from: userId, to: target}] }).exec((err, messages) => {
        var sendback = {
          success: 'true',
          messages: messages.map(msg => {
            var message = {
              from: (userId == msg.from) ? 'me' : 'other',
              content: msg.content
            };
            if (msg.href != undefined) {
              message.href = msg.href;
            }
            return message;
          })
        };
        return fn(JSON.stringify(sendback));
      });
    });
  });
  socket.on('send', function (data, fn) {
    var json = JSON.parse(data);
    var userId = json.userId;
    console.log(userId);
    console.log(client[`c${userId}`]);

    if (client[`c${userId}`].token != json.token) {
      return fn(JSON.stringify({ success: 'false' }));
    }
    console.log('send from ' + userId)
    var message = {
      from: userId,
      content: json.content,
      to: json.to
    };
    if (json.href != undefined) {
      message.href = json.href;
    }
    Message.create(message, (err, msg) => {
      if (err) return fn(JSON.stringify({ success: 'false' }));
      User.findOne({ userId: json.to }, (err, target_user) => {
        if (err) return fn(JSON.stringify({ success: 'false' }));
        if (json.href != undefined)
          sendto(json.to, JSON.stringify({ name: target_user.username, content: json.content }));
        else
          sendto(json.to, JSON.stringify({ name: target_user.username, content: json.content, href: json.href }));
        fn(JSON.stringify({ success: 'true' }));
      });
    });

    console.log('something send');
  });

  socket.on('upload', function(data) {
    var name = data.name, data = data.data;
    var dir = path.join(__dirname, '../', 'app', 'public', 'download');
    console.log(dir);
    fs.open(dir + '/' + name, "w", 0755, function (err, fd) {
      if (err) console.log(err);
      fs.write(fd, data, null, 'Binary', function(write_err, written) {
        if (write_err) console.log(write_err);
        console.log(written);
        socket.emit('upload done', JSON.stringify({href: `/public/download/${name}`, name: name}));
      });
    });

  });
  socket.on('disconnect', function () {
    console.log('disconnect with client');
  });
});

server.listen(process.env.PORT || 3000);
