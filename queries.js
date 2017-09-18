var config = require('config');
var pg = require('pg-promise')({promiseLib: require('bluebird')});
var connectionString = `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
var db = pg(connectionString);

function searchUser(req, res, next) {
  var query = 'SELECT "Number", givenname, surname FROM users';
  var args = [];
  if (req.query.first) {
    query += ' WHERE lower(givenname) like $1 || \'%\'';
    args.push(req.query.first.toLowerCase());
    if (req.query.last) {
      query += ' AND lower(surname) like $2 || \'%\'';
      args.push(req.query.last.toLowerCase());
    }
  }
  else if (req.query.last) {
    query += ' WHERE lower(surname) like $1 || \'%\'';
    args.push(req.query.last.toLowerCase());
  } else {
    return res.status(400)
      .json({
         status: 'error',
         message: "You must specify first name and/or last name"
      });
  }
  query += ' ORDER BY surname ASC, givenname ASC';
  db.any(query, args)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: `Retrieved ${data.length} matching users`
      })
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleUser(req, res, next) {
  db.one('select * from users where "Number" = $1', parseInt(req.params.id))
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved one user'
        });
    })
    .catch(function (err) {
      res.status(404)
        .json({
          status: 'not found',
          message: 'Retrieved 0 users'
        });
    });
}

module.exports = {
  searchUser: searchUser,
  getSingleUser: getSingleUser
};
