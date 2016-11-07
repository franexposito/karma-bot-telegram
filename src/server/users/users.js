var db = require('../db'),
  logger = require('../logger');


// User
exports.create = function(user) {
  var collection = db.get().collection('users');
  var result = new Promise( function(resolve, reject) {
    collection.findOne({id: user.id}, function(err, docs) {
      if (err)
        reject(err);
      else if(docs) {
        resolve(docs);
      } else {
        collection.insertOne(user, function(err, docs) {
          if (err) {
            reject(err);
          } else {
            resolve(docs.ops[0]);
          }
        });
      }
    });

  });

  return result;
};

exports.save = function(user) {
  var collection = db.get().collection('users');
  var result = new Promise( function(resolve, reject) {
    collection.update({_id: user._id}, user, function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.GetUser = function(id) {
  var collection = db.get().collection('users');
  var result = new Promise(function(resolve, reject) {
    collection.find({_id: id}).limit(1).toArray( function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};


// Tokens
exports.GetToken = function(id) {
  var collection = db.get().collection('users_sessions');
  var result = new Promise(function(resolve, reject) {
    collection.find({"sessID": id}).limit(1).toArray( function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.GetTokenAuth = function(t) {
  var collection = db.get().collection('users_sessions');
  var result = new Promise(function(resolve, reject) {
    collection.find({token: t}).limit(1).toArray( function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.SaveToken = function(sess) {
  var collection = db.get().collection('users_sessions');
  var result = new Promise( function(resolve, reject) {
    collection.insertOne(sess, function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};

exports.UpdateToken = function(sess) {
  var collection = db.get().collection('users_sessions');
  var result = new Promise( function(resolve, reject) {
    collection.update({_id: sess._id}, sess, function(err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });

  return result;
};
