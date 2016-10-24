var express = require('express'),
  http = require('http'),
  path = require('path'),
  bodyParser = require("body-parser"),
  mongodb = require("mongodb"),
  logger = require('./server/logger'),
  Bot = require('./server/bot'),
  db = require('./server/db'),
  mongodb = require("mongodb"),
  mongoUri = process.env.MONGOLAB_URI || 'mongodb://test:123456@ds027709.mlab.com:27709/karmabottest',
  ObjectID = mongodb.ObjectID,
  moment = require('moment');

// Config express
app = express();
app.use(require('morgan')('combined', {stream: logger.stream}));
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());

// Set moment.js format
moment().format("MM/DD/YYYY HH:mm:ss");

// Bot
var Groups;
Bot.connect(function(err) {
  if (err) {
    logger.error("Bot is not working");
  } else {
    Groups = require('./server/controllers/groups');
  }
});

// Routes
app.get('/', function (req, res) {
  res.render('index.html');
});

// Connect to Mongo on start
var server;
db.connect(mongoUri, function(err) {
  if (err) {
    logger.error(err);
    process.exit(1);
  } else {
    server = http.createServer(app);
    var port_app = process.env.OPENSHIFT_NODEJS_PORT || 5000;
    var server_app = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
    server.listen(port_app, server_app, function() {
      logger.info('Listening on ' + server_app + ':' + port_app);
    });
  }
});
