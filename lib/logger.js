var fs = require("fs");
var path = require('path');
var log4js = require('log4js');
var config = require('../config/log4js');

/**
 * 定义 logs 目录及子目录
 */
var logsDir = {
  base: path.join(__dirname, '../logs'),
  log: [
    'access',
    'system',
    'database',
    'admin',
    'errors'
  ]
};

/**
 * 检查 logs 目录是否存在并创建
 */
if (!fs.existsSync(logsDir.base)) {
  fs.mkdirSync(logsDir.base);
}

/**
 * 检查 logs 子目录是否存在并创建
 */
logsDir.log.forEach(function (logDir) {
  var dir = path.join(logsDir.base, logDir);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

/**
 * 载入配置
 */
log4js.configure(config);

/**
 * 导出日志接口
 */
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