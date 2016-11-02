var express = require('express'),
  router = express.Router(),
  Groups = require('../models/groups'),
  bodyParser = require('body-parser');

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({ extended: true }) );

router.get('/all', function(req, res) {
  Groups.all().then( function(groups) {
    res.status(200).json(groups);
  }).catch( function(err) {
    res.status(404);
  });
});

module.exports = router;
