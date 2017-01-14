const path = require('path');
const router = require('express').Router();
const User = require('../models/user');

router.post('/', (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);
  User.findOne({ username: username }, (err, data) => {
    if (err) {
      res.status(404).send(err);
      console.log('find error');
    }
    if (data === null) return 0;
    if (data.password === password) {
      return res.json({
        success: 'true',
        token: data._id,
        userId: data.userId
      });
    }
    console.log(data);
    return res.json({ success: 'false' });
  });
  // TODO: redirect to / if success
  console.log('post login request');
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
    res.sendFile(path.join(__dirname, '../../', 'app', 'login.html'));
  console.log('get /login');
});

module.exports = router;
