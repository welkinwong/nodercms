var path = require('path');
var fs = require('fs');
var async = require('async');
var logger = require('../../lib/logger.lib');
var optionsModel = require('../models/options.model');
var rolesModel = require('../models/roles.model');
var usersModel = require('../models/users.model');
var database = require('../../lib/database.lib');

/**
 * 缓存安装状态
 */
var hasInstall = false;

/**
 * 查询安装状态
 * @param {Function} callback
 */
exports.status = function (callback) {
  if (hasInstall) {
    return callback(null, true);
  }

  fs.stat(path.join(__dirname, '../../install.lock'), function(err, stat) {
    if (err && err.code == 'ENOENT') {
      return callback(null, false);
    } else if (err) {
      err.type = 'system';
      return callback(err);
    }

    if (stat.isFile()) {
      hasInstall = true;

      callback(null, true);
    } else {
      var err = {
        type: 'system',
        error: 'install.lock 非文件，请检查'
      };
      callback(err);
    }
  });
};

/**
 * 安装
 * @param {Function} callback
 */
exports.install = function (options, callback) {
  if (!options.databaseDate || !options.siteInfoDate || !options.userDate) {
    var err = {
      type: 'system',
      error: '没有 data 传入'
    };

    callback(err);
  }

  var databaseDate = options.databaseDate;
  var siteInfoDate = options.siteInfoDate;
  var userDate = options.userDate;
  // 导入示例数据，下一版本
  //var caseDate = options.caseDate;

  async.auto({
    checkInstall: function (callback) {
      exports.status(function (err, hasInstall) {
        if (err) return callback(err);

        if (hasInstall) {
          var err = {
            type: 'system',
            error: '非法调用，NoderCMS 已经安装'
          };

          return callback(err);
        }

        callback();
      });
    },
    databaseInt: ['checkInstall', function (callback) {
      database.init(databaseDate, callback)
    }],
    connectDatabase: ['databaseInt', database.connect],
    writeDatabaseVersion: ['connectDatabase', function (callback) {
      new optionsModel({
        name: 'database', value: 1
      }).save(function (err) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback(err)
      });
    }],
    writeSiteinfo: ['connectDatabase', function (callback) {
      new optionsModel({
        name: 'siteInfo',
        value: siteInfoDate
      }).save(function (err) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback();
      });
    }],
    writeRole: ['connectDatabase', function (callback) {
      new rolesModel({
        name: '管理员',
        description: '系统内置',
        authorities: [100000]
      }).save(function (err, role) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback(null, role);
      });
    }],
    writeUser: ['writeRole', function (callback, results) {
      new usersModel({
        type: 'admin',
        email: userDate.email,
        nickname: userDate.nickname,
        password: userDate.password,
        role: results.writeRole._id
      }).save(function (err, user) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

        callback(null, user);
      });
    }],
    writeCase: ['writeUser', function (callback) {
      // 导入示例数据，下一版本
      callback();
    }],
    writeInstallLock: ['writeCase', function (callback) {
      fs.writeFile('install.lock', true, function (err) {
        if (err) {
          err.type = 'system';
          return callback(err);
        }

        callback();
      });
    }]
  }, function (err, results) {
    if (err) return callback(err);

    var data = {
      user: results.writeUser
    };

    callback(null, data);
  });
};