var TelegramBot = require('node-telegram-bot-api'),
  db = require('./app/db'),
  mongodb = require("mongodb"),
  mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/topusers',
  ObjectID = mongodb.ObjectID;

var token = process.env.TELEGRAM_TOKEN;
// Setup polling way
var bot = new TelegramBot(token, {polling: true});
var Groups = require('./app/models/groups.js');

//Bot /start
bot.onText(/\/start/, function(msg, match) {
  var fromId = msg.chat.id;
  if (msg.chat.type !== "group" && msg.chat.type !== "private") {
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

// Up vote user
bot.onText(/@(.+)\+\+/, function(msg, match) {
  var idGroup = msg.chat.id;
  var user = msg.text.substring(0, msg.text.length-2).substring(1, msg.text.length);
  var response = "Congrats @" + user;

  if (msg.chat.type !== "group" && msg.chat.type !== "private") {
    bot.sendMessage(fromId, "This bot only works in groups");
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
        users[index].votes += 1;
      } else {
        var newUser = {
          name: user,
          votes: 1
        };
        users.push(newUser);
      }
      data.members = users;
      return Groups.save(data);
    }).then( function (resp) {
      bot.sendMessage(fromId, response);
    }).catch(function (err) {
      console.log("EROR (" + new Date() + "): " + err.message);
      if (err.name === "NullGroupException")
        bot.sendMessage(fromId, "You need to start this group before. (/start@bestuserbot)");
      else
        bot.sendMessage(fromId, "An error has occurred");
    });
  }

});

//Show top
bot.onText(/\/topUser/, function(msg, match) {
  var idGroup = msg.chat.id;

  if (msg.chat.type !== "group" && msg.chat.type !== "private") {
    bot.sendMessage(fromId, "This bot only works in groups");
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
          users_text += (i+1)+'- @'+ users[i].name + ': **' + users[i].votes + ' votes**\n';
        }
        var final = 'Top users\n' + users_text;
        bot.sendMessage(idGroup, final, { 'parse_mode': 'markdown'} );
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