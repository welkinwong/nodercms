var config = require('../config/database');
var mongoose = require('mongoose');

mongoose.connect('mongodb://' + config.host + ':' + config.port + '/' + config.db, {
  user: config.user,
  pass: config.password
});

module.exports = mongoose;