var TelegramBot = require('node-telegram-bot-api-latest'),
  port = process.env.TELEGRAM_PORT || 553,
  host = '0.0.0.0',
  externalUrl = process.env.NODEJS_IP || false,

  token = process.env.TOKEN || '278952241:AAFDpSew6V80bQSeJWba9D40qIqC3XiXHD0',
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
