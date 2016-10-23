var TelegramBot = require('node-telegram-bot-api-latest'),
  port = process.env.OPENSHIFT_NODEJS_PORT || 443,
  host = '0.0.0.0',
  externalUrl = process.env.OPENSHIFT_NODEJS_IP || false,
  token = process.env.TOKEN,
  options = {
    webHook: {
      host: host,
      port: port
    },
    polling: true
  };

var state = {
  bot: null,
};

exports.connect = function(done) {
  if (state.bot)
    return done();

  if (externalUrl === false) {
    state.bot = new TelegramBot(token, {polling: true});
  } else {
    state.bot = new TelegramBot(token, options);
  }

  done();
};

// Setup polling way
exports.get = function() {
  return state.bot;
};
