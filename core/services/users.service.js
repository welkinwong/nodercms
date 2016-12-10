var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var usersModel = require('../models/users.model');
var rolesModel = require('../models/roles.model');

/**
 * 用户列表
 * @param {Object} options
 *        {String} options.type
 * @param callback
 */
exports.list = function (options, callback) {
  var query = {};

  if (options.type) query.type = options.type;

  usersModel.find(query)
    .select('type nickname email role')
    .populate('role', 'name description authorities')
    .lean()
    .exec(function (err, users) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback(null, users);
    });
};

/**
 * 查询用户
 * @param {Object} options
 *        {String} options.email
 *        {MongoId} options._id
 *        {Boolean} options.selectPassword
 * @param callback
 */
exports.one = function (options, callback) {
  var selectPassword = options.selectPassword || false;

  var query = {};

  if (options.email) query.email = options.email;
  if (options._id) query._id = options._id;

  usersModel.findOne(query)
    .select('type nickname email password role')
    .populate('role', 'name description authorities')
    .lean()
    .exec(function (err, user) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (!user) return callback();

      if (!selectPassword) {
        delete user.password;
      }

      callback(null, user);
    });
};

/**
 * 存储用户
 * @param {Object} options
 *        {MongoId} options._id
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (!options.data || (!options.userSelf && !_.get(options, 'data.role'))) {
    var err = {
      type: 'system',
      error: '没有传入 data 或 role'
    };

    return callback(err);
  }

  var _id = options._id;
  var data = options.data;
  var userSelf = options.userSelf;

  if (_id) {
    usersModel.findById(_id)
      .populate('role')
      .exec(function (err, user) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        var isSuAdmin =  _.find(_.get(user, 'role.authorities'), function (authory) {
          return authory === 100000;
        });

        if (isSuAdmin && !userSelf) {
          var err = {
            type: 'system',
            error: '不允许更新权限存在 100000 的用户'
          };
          return callback(err);
        }

        usersModel.update({ _id: _id }, data, { runValidators: true }, function (err) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback();
        });
      });
  } else {
    rolesModel.findById(data.role)
      .lean()
      .exec(function (err, role) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        if (!role) {
          var err = {
            type: 'system',
            error: '没有找到 role'
          };
          return callback(err);
        }

        var isSuAdmin =  _.find(role.authorities, function (authory) {
          return authory === 100000;
        });

        if (isSuAdmin) {
          var err = {
            type: 'system',
            error: '不允许创建权限存在 100000 的用户'
          };
          return callback(err);
        }

        new usersModel(data).save(function (err, user) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback(null, user);
        });
      });
  }




  async.waterfall([
    function (callback) {

    },
    function (callback) {

    }
  ], function (err, result) {
    if (err) return callback(err);

    callback(null, result);
  });
};

/**
 * 删除用户
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  if (!options._id) {
    var err = {
      type: 'system',
      error: '没有传入 _id'
    };

    return callback(err);
  }

  var _id = options._id;

  usersModel.findById(_id)
    .populate('role')
    .exec(function (err, user) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (!user) return callback();

      var isSuAdmin =  _.find(_.get(user, 'role.authorities'), function (authory) {
        return authory === 100000;
      });

      if (isSuAdmin) {
        var err = {
          type: 'system',
          error: '不允许删除权限存在 100000 的用户'
        };
        return callback(err);
      }

      user.remove(function (err) {
        if (err) err.type = 'database';

        callback(err);
      })
    });
};

/**
 * 用户总数
 * @param {Object} options
 *        {String} options.type
 * @param {Function} callback
 */
exports.total = function (options, callback) {
  usersModel.count({ type: options.type }, function (err, count) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    callback(null, count);
  });
};