var TelegramBot = require('node-telegram-bot-api'),
  db = require('./app/db'),
  mongodb = require("mongodb"),
  mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/topusers',
  ObjectID = mongodb.ObjectID,
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

var bot;
// Setup polling way
if (externalUrl == false) {
  bot = new TelegramBot(token, {polling: true});
} else {
  bot = new TelegramBot(token, options);
  bot.setWebHook(externalUrl + ':'+process.env.PORT+'/' + token);
}

var Groups = require('./app/models/groups.js');

//Bot /start
bot.onText(/\/start/, function(msg, match) {
  var fromId = msg.chat.id;
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    bot.sendMessage(fromId, "This bot only works in groups");
  } else {
    var group = {
      _createdAt: new Date(),
      name: msg.chat.title,
      members: [],
      idGroup: msg.chat.id
    };

    Groups.getGroup(group.idGroup).then( function(data) {
      if (data.length > 0) {
        throw ({name: "GroupIsInDatabase", message: "Group is already in db!"});
      } else {
        return Groups.create(group);
      }
    }).then( function (data) {
      bot.sendMessage(fromId, "Group has a top now");
    }).catch(function (err) {
      console.log("EROR (" + new Date() + "): " + err.message);
      if (err.name === "GroupIsInDatabase")
        bot.sendMessage(fromId, "Welcome back");
      else
        bot.sendMessage(fromId, "An error has occurred");
    });
  }
});

//Bot /karma username?
bot.onText(/\/karma @(.+)\?/, function(msg, match) {
  console.log(msg);
  console.log("entra en devoler");
  var idGroup = msg.chat.id;
  var user = match[1];
  //delete whitespaces
  user = user.replace(/\s+/g, '');

  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    bot.sendMessage(idGroup, "This bot only works in groups");
  } else {
    Groups.getGroup(idGroup).then( function(data) {
      if (data.length > 0) {
        return data[0];
      } else {
        throw ({name: "NullGroupException", message: "There is no group in db"});
      }
    }).then( function (data) {
      var users = data.members;
      var index = Groups.indexOfMember(users, user);

      if (index > -1) {
        var puntuacion = users[index].votes;
        bot.sendMessage(idGroup, "@" +user+ " - <strong>"+puntuacion+" votes</strong>", {parse_mode: "HTML"});
      } else {
        throw ({name: "UserNotFound", message: "There is no user in this group with this username"});
      }
    }).catch(function (err) {
      console.log("EROR (" + new Date() + "): " + err.message);
      if (err.name === "NullGroupException")
        bot.sendMessage(idGroup, "You need to start this group before. (/start@bestuserbot)");
      else if (err.name === "UserNotFound")
        bot.sendMessage(idGroup, "@" +user+ " do not has votes");
      else
        bot.sendMessage(idGroup, "An error has occurred");
    });
  }

});

//Bot /karma username++
bot.onText(/\/karma @(.+)(\+\+|\-\-)/, function(msg, match) {
  console.log(msg);
  console.log("entra en voto");
  var puntuacion = match[2];
  var idGroup = msg.chat.id;
  var userMsg = msg.from.username;
  var user = match[1];
  //delete whitespaces
  user = user.replace(/\s+/g, '');
  var response = "vote for @" + user + ", saved";

  if (puntuacion === '++' )
    puntuacion = 1;
  else if (puntuacion === '--')
    puntuacion = -1;
  else
    puntuacion = false;

  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    bot.sendMessage(idGroup, "This bot only works in groups");
  } else if (user == userMsg) {
    bot.sendMessage(idGroup, "You can't vote yourself");
  } else if (puntuacion == false) {
    bot.sendMessage(idGroup, "You forgot the vote");
  } else {
    Groups.getGroup(idGroup).then( function(data) {
      if (data.length > 0) {
        return data[0];
      } else {
        throw ({name: "NullGroupException", message: "There is no group in db"});
      }
    }).then( function (data) {
      var users = data.members;
      var index = Groups.indexOfMember(users, user);

      if (index > -1) {
        users[index].votes += puntuacion;
      } else {
        var newUser = {
          name: user,
          votes: puntuacion
        };
        users.push(newUser);
      }
      data.members = users;
      return Groups.save(data);
    }).then( function (resp) {
      bot.sendMessage(idGroup, response);
    }).catch(function (err) {
      console.log("EROR (" + new Date() + "): " + err.message);
      if (err.name === "NullGroupException")
        bot.sendMessage(idGroup, "You need to start this group before. (/start@bestuserbot)");
      else
        bot.sendMessage(idGroup, "An error has occurred");
    });
  }

});

//Show top3 of users
bot.onText(/\/topuser/, function(msg, match) {
  var idGroup = msg.chat.id;
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    bot.sendMessage(idGroup, "This bot only works in groups");
  } else {
    Groups.getGroup(idGroup).then( function(data) {
      if (data.length > 0) {
        return data[0];
      } else {
        throw ({name: "NullGroupException", message: "There is no group in db"});
      }
    }).then( function (data) {
      var users = data.members;
      if (users.length > 0) {
        users.sort(function(a, b) { return b.votes - a.votes; });
        var users_text = '';
        for (var i = 0; i < 3 && i < users.length; i++) {
          users_text += (i+1)+'- @'+ users[i].name + ': <strong>' + users[i].votes + ' votes</strong>\n';
        }
        var final = 'Top users\n' + users_text;
        bot.sendMessage(idGroup, final,  { parse_mode: "HTML" } );
      } else {
        bot.sendMessage(idGroup, "Nobody has votes in this group!");
      }
    }).catch(function (err) {
      console.log("EROR (" + new Date() + "): " + err.message);
      if (err.name === "NullGroupException")
        bot.sendMessage(idGroup, "You need to start this group before. (/start@bestuserbot)");
      else
        bot.sendMessage(idGroup, "An error has occurred");
    });
  }
});

// Connect to Mongo on start
db.connect(mongoUri, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  } else {
    console.log('Bot is ready.');
  }
});
