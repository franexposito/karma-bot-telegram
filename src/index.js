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
  mongoUri = process.env.MONGOLAB_URI || 'mongodb://test:123456@ds027709.mlab.com:27709/karmabottest',

  ObjectID = mongodb.ObjectID,
  moment = require('moment');


// Config express
app = express();
app.use(require('morgan')('combined', { stream: logger.stream }));
app.use('/lib', express.static(path.join(__dirname, '/bower_components')));
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());

//Sessions
var options = {
  secret: 'cookie_secret',
  name: 'karma_sess',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  },
  store: new MongoStore({
    url: mongoUri,
    autoRemove: 'native'
  }),
  rolling: true
};

app.use(session(options));

// Middleware for user sessions
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    next();
  }
});

//Routes
app.use('/api/groups', require('./server/groups/routes'));
app.use('/api/users', require('./server/users/routes'));
app.use('/', require('./server/routes'));

// Set moment.js format
moment().format("MM/DD/YYYY HH:mm:ss");

// Bot
var Groups;
Bot.connect(function(err) {
  if (err) {
    logger.error("Bot is not working");
  } else {
    Groups = require('./server/bot/index');
  }
});

// Connect to Mongo on start
var server;
dbM.connect(mongoUri, function(err) {
  if (err) {
    logger.error(err);
    process.exit(1);
  } else {
    server = http.createServer(app);
    var port_app = process.env.NODEJS_PORT || 5000;
    var server_app = process.env.NODEJS_IP || 'localhost';
    server.listen(port_app, server_app, function() {
      logger.info('Listening on ' + server_app + ':' + port_app);
    });
  }
});
