var Groups = require('../groups/groups'),
  Users = require('../users/users'),
  logger = require('../logger'),
  ModuleBot = require('../bot'),
  bot = ModuleBot.get();

//Bot on /start
bot.onText(/\/start\s*([a-zA-Z\d]{6})/, function(msg, match) {
  var fromId = msg.chat.id;
  var token = match[1];

  if (token) {
    StartForUser(msg, match);
  } else {
    StartFroGroups(msg, match);
  }
});

// Start token
/*bot.onText(/\/start\s*([a-zA-Z\d]{6})/, function(msg, match) {
  var fromId = msg.chat.id;
  var token = match[1];

  if (msg.chat.type === "private") {
    var user = {
      _createdAt: new Date(),
      _createdAtUnit: msg.date,
      id: msg.from.id,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      username: msg.from.username
    };

    var sess;

    Users.GetTokenAuth(token).then( function(data) {
      if (data.length > 0) {
        sess = data[0];
        return Users.create(user);
      } else {
        return false;
      }
    }).then( function (data) {
      if (data === false) {
        bot.sendMessage(fromId, "Code is incorret.");
      }
      else {
        CheckToken(sess, data);
        bot.sendMessage(fromId, "Correct code. Now yor browser will be refresh.");
      }
    }).catch(function (err) {
      logger.error(err);
      if (err.name === "GroupIsInDatabase")
        bot.sendMessage(fromId, "Welcome back");
      else
        bot.sendMessage(fromId, "An error has occurred");
    });
  }
});
*/
function StartFroGroups() {
  var fromId = msg.chat.id;
  var token = match[1];
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    bot.sendMessage(fromId, "This bot only works in groups");
  } else {
    var group = {
      _createdAt: new Date(),
      _createdAtUnit: msg.date,
      _createdBy : {
        id: msg.from.id,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
        username: msg.from.username
      },
      name: msg.chat.title,
      members: [],
      historyV: [],
      idGroup: msg.chat.id
    };

    Groups.getGroup(group.idGroup).then( function(data) {
      if (data.length > 0) {
        if (!("_createdBy" in data)) {
          CompleteGroupInfo(group.idGroup, msg.from);
        }
        throw ({name: "GroupIsInDatabase", message: "Group is already in db!"});
      } else {
        return Groups.create(group);
      }
    }).then( function (data) {
      bot.sendMessage(fromId, "Group has a top now");
    }).catch(function (err) {
      logger.error(err);
      if (err.name === "GroupIsInDatabase")
        bot.sendMessage(fromId, "Welcome back");
      else
        bot.sendMessage(fromId, "An error has occurred");
    });
  }
}

function StartForUser(msg, match) {
  var fromId = msg.chat.id;
  var token = match[1];

  if (msg.chat.type === "private") {
    var user = {
      _createdAt: new Date(),
      _createdAtUnit: msg.date,
      id: msg.from.id,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      username: msg.from.username
    };

    var sess;

    Users.GetTokenAuth(token).then( function(data) {
      if (data.length > 0) {
        sess = data[0];
        return Users.create(user);
      } else {
        return false;
      }
    }).then( function (data) {
      if (data === false) {
        bot.sendMessage(fromId, "Code is incorret.");
      }
      else {
        CheckToken(sess, data);
        bot.sendMessage(fromId, "Correct code. Now yor browser will be refresh.");
      }
    }).catch(function (err) {
      logger.error(err);
      if (err.name === "GroupIsInDatabase")
        bot.sendMessage(fromId, "Welcome back");
      else
        bot.sendMessage(fromId, "An error has occurred");
    });
  }
}

//Bot on /karma username?
bot.onText(/\/karma(?:@bestuserbot)? @([0-9a-zA-Z_]*)\s*\?$/, function(msg, match) {
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
      logger.error(err);
      if (err.name === "NullGroupException")
        bot.sendMessage(idGroup, "You need to start this group before. (/start@bestuserbot)");
      else if (err.name === "UserNotFound")
        bot.sendMessage(idGroup, "@" +user+ " do not has votes");
      else
        bot.sendMessage(idGroup, "An error has occurred");
    });
  }
});

//Bot on /karma username++
bot.onText(/\/karma(?:@bestuserbot)? @([0-9a-zA-Z_]*)\s*(\+\+|\-\-)$/, function(msg, match) {
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
  } else if (puntuacion === false) {
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
      var h = {
        date: new Date(),
        user_date: msg.date,
        from: userMsg,
        to: user,
        vote: puntuacion
      };

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
      //save history
      if (data.historyV === undefined)
        data.historyV = [];
      data.historyV.push(h);
      //update group
      return Groups.save(data);
    }).then( function (resp) {
      bot.sendMessage(idGroup, response);
    }).catch(function (err) {
      logger.error(err);
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
          if (users[i].votes > 0)
            users_text += (i+1)+'- @'+ users[i].name + ': <strong>' + users[i].votes + ' votes</strong>\n';
        }
        var final = 'Top users\n' + users_text;
        bot.sendMessage(idGroup, final,  { parse_mode: "HTML" } );
      } else {
        bot.sendMessage(idGroup, "Nobody has votes in this group!");
      }
    }).catch(function (err) {
      logger.error(err);
      if (err.name === "NullGroupException")
        bot.sendMessage(idGroup, "You need to start this group before. (/start@bestuserbot)");
      else
        bot.sendMessage(idGroup, "An error has occurred");
    });
  }
});

//Show history
bot.onText(/\/history(?:@bestuserbot)?\s*(\d*)/, function(msg, match) {
  var idGroup = msg.chat.id;
  var num = parseInt(match[1]);

  if (match[1].length === undefined || isNaN(num)) {
    num = 3;
  } else if (num <= 0) {
    num = 10;
  } else if (num > 20) {
    num = 20;
  }

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
      var users = data.historyV;
      if (users.length > 0) {
        users.sort(function(a, b) { return b.date - a.date; });
        var users_text = '';
        var cont = 0;
        for (var i = 0; i < num && i < users.length; i++) {
          cont += 1;
          var v = (users[i].vote > 0) ? "++" : "--" ;
          var udate = ("user_date" in users[i]) ? new Date(users[i].user_date*1000) : users[i].date;
          var temp_date = (udate.getUTCMonth() + 1) +'/'+ udate.getUTCDate() +'/'+ udate.getUTCFullYear();
          var temp_time = udate.getHours() + ':' + udate.getMinutes() + ':' + udate.getSeconds();
          udate = temp_date + ' ' + temp_time;
          users_text += udate + ': @' + users[i].from + ' -> @'+users[i].to + v + '\n';
        }
        var final = 'Last '+cont+' votes\n' + users_text;
        bot.sendMessage(idGroup, final,  { parse_mode: "HTML" } );
      } else {
        bot.sendMessage(idGroup, "Nobody has votes in this group!");
      }
    }).catch(function (err) {
      logger.error(err);
      if (err.name === "NullGroupException")
        bot.sendMessage(idGroup, "You need to start this group before. (/start@bestuserbot)");
      else
        bot.sendMessage(idGroup, "An error has occurred");
    });
  }
});

//Show help
bot.onText(/\/help/, function(msg, match) {
  var idGroup = msg.chat.id;
  var mensaje = "Karma Bot allows you to keep the control of the user's reputation in a group.\n";
  mensaje += "You must call <strong>/start</strong> to initialize the top.\n\n";
  mensaje += "For add positive or negative karma you can use <strong>/karma @username++</strong> or <strong>/karma @username--</strong>\n";
  mensaje += "For see the top and user's karma you can use <strong>/topuser</strong> and <strong>/karma @username?</strong>\n";
  mensaje += "For see the history you can use <strong>/history</strong>\n\n";
  mensaje += "Thanks for use Karma Bot. You can contact with me <a href='https://github.com/franexposito/karma-bot-telegram/issues'>here</a>.";
  bot.sendMessage(idGroup, mensaje,  { disable_notification: true, disable_web_page_preview: true, parse_mode: "HTML" } );
});


function CompleteGroupInfo(idGroup, info) {
  Groups.getGroup(idGroup).then( function(data) {
    if (data.length > 0) {
      var group = data[0];
      group._createdBy = {
        id: info.id,
        first_name: info.first_name,
        last_name: info.last_name,
        username: info.username
      };
      return Groups.save(group);
    } else {
      throw ({name: "GroupNotUpdate", message: "Group not updated"});
    }
  }).then( function(dataSaved) {

  }).catch(function (err) {
    logger.error(err);
  });
}

function CheckToken(token, user) {
  token.auth.date = new Date();
  token.auth.isUsed = true;
  token.userId = user._id;
  Users.UpdateToken(token);
}
