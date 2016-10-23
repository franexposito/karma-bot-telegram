var express = require('express'),
  http = require('http'),
  path = require('path'),
  bodyParser = require("body-parser"),
  mongodb = require("mongodb"),
  logger = require('./server/logger'),
  Bot = require('./server/bot'),
  db = require('./server/db'),
  mongodb = require("mongodb"),
  mongoUri = process.env.MONGOLAB_URI,
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
db.connect(mongoUri, function(err) {
  if (err) {
    logger.error(err);
    process.exit(1);
  } else {
    var server = http.createServer(app);
    server.listen(process.env.PORT || 5000, function() {
      logger.info('Listening on port 5000...');
    });
  }
});
