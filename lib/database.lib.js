var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var optionsModel = require('../core/models/options.model');
var modelsModel = require('../core/models/models.model');

/**
 * 使用 bluebird 诺言库
 */
mongoose.Promise = require('bluebird');

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

    db.close(function () {
      callback();
    });
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

/**
 * 升级数据库
 */
exports.update = function (callback) {
  optionsModel.findOne({ name: 'database' }, function (err, option) {
    if (err) return callback(err);

    // 数据库升级 v0 -> v1
    // categories model 的 path 增加 sparse, 所以需要重建 path 索引
    // content model 的 extensions[i].select 迁移到 extensions[i].mixed.select 下
    // feature model 的 model.mixed.items 更名为 model.mixed.limit
    // feature model 的 extensions[i].select 迁移到 extensions[i].mixed.select 下
    if (!option) {
      var db = mongoose.connection.collections;

      async.auto({
        // 删除 path 索引
        deletePathIndex: function(callback) {
          db.categories.dropIndex('path_1', callback);
        },
        // 重建 path 索引
        rePathIndex: ['deletePathIndex', function (callback) {
          db.categories.createIndex({ path: 1 }, { unique: true, sparse: true, background: true }, callback);
        }],
        // 转换 Content Model
        transformContentModel: function (callback) {
          modelsModel.find({ type: 'content' }, function (err, models) {
            if (err) return callback(err);

            async.eachLimit(models, 100, function (model, callback) {
              var extensions = _.cloneDeep(model.extensions);

              async.each(extensions, function (extension, callback) {
                if (extension.select) {
                  extension.mixed = {
                    select: extension.select
                  };
                  delete extension.select;
                }

                callback();
              }, function () {
                model.extensions = extensions;

                model.save(callback);
              });
            }, callback);
          });
        },
        // 转换 Feature Model
        transformFeatureModel: function (callback) {
          modelsModel.find({ type: 'feature' }, function (err, models) {
            if (err) return callback(err);

            async.eachLimit(models, 100, function (model, callback) {
              var mixed = _.clone(model.mixed);
              mixed.limit = model.mixed.items;
              delete mixed.items;
              model.mixed = mixed;

              var extensions = _.cloneDeep(model.extensions);

              async.each(extensions, function (extension, callback) {
                if (extension.select) {
                  extension.mixed = {
                    select: extension.select
                  };
                  delete extension.select;
                }

                callback();
              }, function () {
                model.extensions = extensions;

                model.save(callback);
              });
            }, callback);
          });
        }
      }, function (err) {
        if (err) return callback(err);

        // 写入数据库版本号
        new optionsModel({ name: 'database', value: 1 }).save(function (err) { callback(err) });
      });
    } else callback();
  });
};