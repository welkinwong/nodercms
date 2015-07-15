var path = require('path');
var log4js = require('log4js');
var config = require('../config/log4js');

log4js.configure(config);

module.exports = {
  access: function () {
    return log4js.connectLogger(log4js.getLogger('Access'), { level: 'auto', format: ':method :url' });
  },
  system: function () {
    return log4js.getLogger('system');
  },
  database: function () {
    return log4js.getLogger('database');
  },
  admin: function () {
    return log4js.getLogger('admin');
  }
};