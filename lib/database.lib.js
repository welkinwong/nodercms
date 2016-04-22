var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var database = require('./database.lib');

/**
 * 测试数据库连接
 * @param {Object} options
 *        {String} options.host
 *        {String} options.database
 *        {Number} options.port
 *        {String} options.user
 *        {String} options.pass
 * @param {Function} callback
 */
exports.test = function (options, callback) {
  var db = mongoose.createConnection();
  db.open(options.host, options.db, options.port, {
    user: options.user,
    pass: options.pass
  }, function (err) {
    if (err) {
      err.type = 'system';
      return callback(err);
    }

    db.close();

    callback();
  });
};

/**
 * 初始化数据库配置
 * @param {Object} options
 *        {String} options.host
 *        {String} options.database
 *        {Number} options.port
 *        {String} options.user
 *        {String} options.pass
 * @param {Function} callback
 */
exports.init = function (options, callback) {
  var data = require('../config/database.config.example');

  data.host = options.host;
  data.port = options.port;
  data.db = options.db;
  data.user = options.user;
  data.pass = options.pass;

  fs.writeFile(path.join(__dirname, '../config/database.config.js'), JSON.stringify(data, null, 2), function (err) {
    if (err) {
      err.type = 'system'
      return callback(err);
    }

    callback();
  });
};

/**
 * 连接数据库
 */
exports.connect = function (callback) {
  async.waterfall([
    function (callback) {
      fs.readFile(path.join(__dirname, '../config/database.config.js'), function (err, file) {
        if (err && err.code === 'ENOENT') {
          var err = {
            type: 'system',
            error: 'database.config.js 文件不存在'
          };

          return callback(err);
        } else if (err) {
          err.type = 'system';
          return callback(err);
        }

        var config = JSON.parse(file);

        var databaseConfig = {
          host: config.host,
          port: config.port,
          db: config.db,
          user: config.user,
          pass: config.pass
        };

        callback(null, databaseConfig);
      });
    },
    function (config, callback) {
      mongoose.connect('mongodb://' + config.host + ':' + config.port + '/' + config.db, {
        user: config.user,
        pass: config.pass
      }, function (err) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback();
      });
    }
  ], function (err) {
    if (err) return callback(err);

    callback();
  });
};