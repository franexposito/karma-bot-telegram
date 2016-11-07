var express = require('express'),
  router = express.Router(),
  Users = require('./users'),
  bodyParser = require('body-parser'),
  logger = require('../logger');

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({ extended: true }) );

router.get('/all', function(req, res) {
  Groups.all().then( function(groups) {
    res.status(200).json(groups);
  }).catch( function(err) {
    res.status(404);
  });
});

router.get('/getToken', function(req, res) {
  var uID = req.sessionID;

  Users.GetToken(uID).then( function(data) {
    if (data.length < 1) {
      return false;
    } else {
      return data[0];
    }
  }).then( function(tok) {
    if (tok !== false)
      res.status(200).json({token: tok.token});
    else
      res.status(200).json({token: false});
  }).catch( function(err) {
    logger.error(err);
    res.status(404);
  });
});

router.post('/getTokenAuth', function(req, res) {
  var uID = req.sessionID;
  var token = req.body.token;

  Users.GetTokenAuth(token).then( function(data) {

    if (data.length < 1) {
      return false;
    } else {
      if (data[0].auth.isUsed === true && data[0].sessID === uID) {
        return Users.GetUser(data[0].userId);
      }
      else {
        return false;
      }

    }
  }).then( function(data) {
    if (data.length > 0) {
      req.session.user = data[0].username;
      res.status(200).json({token: true, user: data[0]});
    }
    else {
      res.status(200).json({token: false, user: false});
    }
  }).catch( function(err) {
    logger.error(err);
    res.status(404);
  });
});

module.exports = router;
