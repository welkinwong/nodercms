var path = require('path');
var log4js = require('log4js');
var config = require('../config/log4js')

log4js.configure(config);

module.exports = {
  connect: function () {
    var logger = log4js.getLogger('Access');
    return log4js.connectLogger(logger, {level: 'auto', format: ':method :url'});
  },
  logger: function (name) {
    var logger = log4js.getLogger(name);
    return logger;
  }
};