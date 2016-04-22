var session = require('express-session');
var sessionConfig = require('../config/session.config');


exports.init = function (app, callback) {
  app.use(session(sessionConfig));

  callback();
};