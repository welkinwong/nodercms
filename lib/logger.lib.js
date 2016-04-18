var log4js = require('log4js');
var config = require('../config/log4js.config');

/**
 * 载入配置
 */
log4js.configure(config);

/**
 * 导出日志接口
 */
module.exports = {
  access: function () {
    return log4js.connectLogger(log4js.getLogger('access'), { level: 'auto', format: ':method :url' });
  },
  system: function () {
    return log4js.getLogger('system');
  },
  database: function () {
    return log4js.getLogger('database');
  }
};