const path = require('path');
const router = require('express').Router();
const User = require('../models/user');
const Message = require('../models/message');

router.post('/', (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);
  User.findOne({ username: username }, (err, data) => {
    if (err) console.log('find error');
    if (data !== null) res.json({ success: 'false', message: 'username duplicate' });

    User.create({ username: username, password: password }, err1 => {
      if (err1) return res.status(500).send(err1);
      return res.json({ success: 'true' });
    });
  });

});

router.get('/', function(req, res) {
  // TODO: check login session, or redirct to /
  var cookie = req.cookies;
  if (cookie.token != undefined && cookie.userId != undefined) {
    User.findById(cookie.token, (err, data) => {
      if (data.userId == cookie.userId) {
        res.redirect("/");
      }
      else
        res.sendFile(path.join(__dirname, '../../', 'app', 'login.html'));

    });
  }
  else
    res.sendFile(path.join(__dirname, '../../', 'app', 'register.html'));
  console.log('get /register');
});

module.exports = router;
