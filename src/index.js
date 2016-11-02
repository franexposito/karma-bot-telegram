var express = require('express'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  http = require('http'),
  path = require('path'),
  bodyParser = require("body-parser"),
  logger = require('./server/logger'),
  Bot = require('./server/bot'),
  dbM = require('./server/db'),
  mongodb = require("mongodb"),
  //mongoUri = process.env.MONGOLAB_URI || 'mongodb://test:123456@ds027709.mlab.com:27709/karmabottest',
  mongoUri = process.env.MONGOLAB_URI || 'mongodb://test:123456@ds045598.mlab.com:45598/topusers',
  ObjectID = mongodb.ObjectID,
  moment = require('moment');


// Config express
app = express();
app.use(require('morgan')('combined', {
  stream: logger.stream
}));
app.use('/lib', express.static(path.join(__dirname, '/bower_components')));
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());

//Routes
app.use('/api/groups', require('./server/controllers/groups_api'));

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
app.get('/', function(req, res) {
  var user = req.session;
  if (user) {
    res.render('index.html');
  } else {
    res.redirect('/login');
    res.end();
  }
});

app.get('/login', function(req, res) {
  var user = req.session;
  res.render('index.html');
});

// Connect to Mongo on start
var server;
dbM.connect(mongoUri, function(err) {
  if (err) {
    logger.error(err);
    process.exit(1);
  } else {
    var options = {
      secret: 'cookie_secret',
      name: 'karma_sess_',
      store: new MongoStore({
        db: dbM.get()
      }),
      resave: true,
      saveUninitialized: true
    };
    app.use(session(options));
    server = http.createServer(app);
    var port_app = process.env.NODEJS_PORT || 5000;
    var server_app = process.env.NODEJS_IP || 'localhost';
    server.listen(port_app, server_app, function() {
      logger.info('Listening on ' + server_app + ':' + port_app);
    });
  }
});
