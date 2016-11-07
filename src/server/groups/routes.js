var express = require('express'),
  router = express.Router(),
  Groups = require('./groups'),
  bodyParser = require('body-parser');

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({ extended: true }) );

router.get('/all', function(req, res) {
  var uID = req.sessionID;
  if (req.user) {
    Groups.all(req.user).then( function(groups) {
      res.status(200).json(groups);
    }).catch( function(err) {
      res.status(404);
    });
  } else {
    res.status(200).json({resp: false, error: {code: 101, message: "User is not logged in."}});
  }

});

module.exports = router;
