var Users = require('./users/users'),
  express = require('express'),
  router = express.Router(),
  crypto = require('crypto'),
  logger = require('./logger');

router.get('/', function(req, res) {
  var user = req.sessionID;
  if (req.user) {
    res.render('index.html');
  } else {
    res.redirect('/login');
  }
});

router.get('/login', function(req, res) {
  var uID = req.sessionID;
  if (!req.user) {
    Users.GetToken(uID).then( function(data) {
      if (data.length < 1) {
        var sess = {
          _createdAt: new Date(),
          sessID: uID,
          token: crypto.randomBytes(3).toString('hex'),
          auth: {
            date: false,
            isUsed: false
          }
        };

        return Users.SaveToken(sess);
      } else {
        return data;
      }
    }).then( function(tok) {
      res.render('index.html');
    }).catch( function(err) {
      logger.error(err);
      res.render('index.html');
    });
  } else {
    res.redirect('/');
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

router.post('/logout', function(req, res) {
  req.session.destroy();
  res.status(200).json({resp: true});
});


module.exports = router;
