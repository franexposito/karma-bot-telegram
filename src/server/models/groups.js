var db = require('../db');

exports.getGroup = function(id) {
  var collection = db.get().collection('groups');
  var result = new Promise(function(resolve, reject) {
    collection.find({"idGroup": id}).limit(1).toArray( function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.all = function() {
  var collection = db.get().collection('groups');
  var result = new Promise( function(resolve, reject) {
    collection.find().sort().limit(100).toArray(function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.create = function(group) {
  var collection = db.get().collection('groups');

  var result = new Promise( function(resolve, reject) {
    collection.insertOne(group, function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.save = function(group) {
  var collection = db.get().collection('groups');
  var result = new Promise( function(resolve, reject) {
    collection.update({idGroup: group.idGroup}, group, function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.indexOfMember = function(members, user) {
  for (var i = 0; i < members.length; i++) {
    if (members[i].name === user) {
      return i;
    }
  }

  return -1;
};
