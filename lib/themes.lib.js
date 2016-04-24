var fs = require('fs');
var requireAll = require('require-all');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var hbs = require('express-hbs');
var options = require('../core/models/options.model');

/**
 * 读取 Helper
 */
var helpers = requireAll({
  dirname: path.join(__dirname, '../core/helpers/'),
  filter: /(.+)\.helper\.js$/,
  excludeDirs: /^\.(git|svn)$/
});

/**
 * 读取 Async Helper
 */
var asyncHelpers = requireAll({
  dirname: path.join(__dirname, '../core/helpers/'),
  filter: /(.+)\.asyncHelper\.js$/,
  excludeDirs: /^\.(git|svn)$/
});

/**
 * 注册 Helper
 */
_.forEach(helpers, function (helper, key) {
  hbs.registerHelper(key, helper);
});

/**
 * 注册 Async Helper
 */
_.forEach(asyncHelpers, function (helper, key) {
  hbs.registerAsyncHelper(key, helper);
});

/**
 * 设置模板引擎
 * @param app 应用
 * @param directory 模板目录
 */
function viewEngine (app, directory) {
  app.cache = {};
  app.engine('.hbs', hbs.express4({
    layoutsDir: 'public/themes/' + directory,
    partialsDir: 'public/themes/' + directory,
    extname: '.hbs'
  }));
  app.set('view engine', '.hbs');
  app.set('views', 'public/themes/' + directory);
}

exports.init = function (app, callback) {
  options.findOne({ name: 'siteInfo' }, function (err, siteInfo) {
    if (err) {
      err.type = 'database';

      return callback(err);
    }

    (function checkDirectory (directory) {
      fs.stat(path.join(__dirname, '../public/themes/' + directory), function (err, stats) {
        if (stats && stats.isDirectory()) {
          viewEngine(app, directory);

          callback();
        } else {
          if (directory !== 'default') {
            checkDirectory('default');
          } else {
            callback(directory + '目录不存在或非法');
          }
        }
      });
    })(_.get(siteInfo, 'value.theme') || 'default');
  });
};

exports.get = function (callback) {
  async.waterfall([
    //读取主题目录下所有文件
    function (callback) {
      fs.readdir(path.join(__dirname, '../public/themes/'), callback);
    },
    //从所有文件中提取主题
    function (files, callback) {
      async.filter(files, function(file, callback) {
        fs.exists(path.join(__dirname, '../public/themes/' + file + '/package.json'), function (exist) {
          callback(exist);
        });
      }, function (files) {
        callback(null, files);
      });
    },
    //读取主题的 package.json
    function (files, callback) {
      async.map(files, function (directory, callback) {
        fs.readFile(path.join(__dirname, '../public/themes/' + directory + '/package.json'), function (err, file) {
          if (err) return callback(err);

          var theme = {
            directory: directory,
            name: JSON.parse(file).name
          };

          callback(null, theme);
        });
      }, callback);
    }
  ], function (err, themes) {
    if (err) err.type = 'system';

    callback(err, themes);
  });
};

exports.set = function (app, directory, callback) {
  fs.stat(path.join(__dirname, '../public/themes/' + directory), function (err, stats) {
    if (err) {
      err.type = 'system';
      return callback(err);
    }

    if (stats && stats.isDirectory()) {
      viewEngine(app, directory);

      callback(null);
    } else {
      var err = {
        type: 'system',
        error: directory + '目录不存在或非法'
      };

      callback(err);
    }
  });
};