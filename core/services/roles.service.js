var _ = require('lodash');
var async = require('async');
var rolesModel = require('../models/roles.model');
var usersModel = require('../models/users.model');

/**
 * 多个角色
 * @param {Object} callback
 */
exports.all = function (callback) {
  rolesModel.find({})
    .lean()
    .exec(function (err, roles) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback(null, roles);
    });
};

/**
 * 单个角色
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.one = function (options, callback) {
  if (!options._id) {
    var err = {
      type: 'system',
      error: '没有 _id 传入'
    };

    return callback(err);
  }

  var _id = options._id;

  rolesModel.findById(_id)
    .lean()
    .exec(function (err, role) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback(null, role)
    });
};

/**
 * 创建角色
 * @param {Object} options
 *        {MongoId} options._id
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (!options.data) {
    var err = {
      type: 'system',
      error: '没有 data 传入'
    };

    return callback(err);
  }

  var _id = options._id;
  var data = options.data;

  if (!_.isEmpty(data.authorities)) {
    var isAdmin =  _.find(data.authorities, function (authority) {
      if (authority === 100000) return true;
    });

    if (isAdmin) {
      var err = {
        type: 'system',
        error: '不允许更新后权限存在 100000 的角色'
      };

      return callback(err);
    }
  }

  if (_id) {
    rolesModel.update({ _id: _id }, data, { runValidators: true }, function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
  } else {
    new rolesModel(data).save(function (err, role) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback(null, role);
    });
  }
};

/**
 * 删除角色
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  if (!options._id) {
    var err = {
      type: 'system',
      error: '没有 _id 传入'
    };

    return callback(err);
  }

  var _id = options._id;

  rolesModel.findById(_id, function (err, role) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    if (!role) return callback();

    // 查找权限内是否有 100000
    var isAdmin = _.find(role.authorities, function (authority) {
      if (authority === 100000) return true;
    });

    if (isAdmin) {
      var err = {
        type: 'system',
        error: '不允许删除权限存在 100000 的角色'
      };

      return callback(err);
    }

    async.parallel([
      function (callback) {
        role.remove(function (err) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback();
        });
      },
      function (callback) {
        usersModel.update({ role: role._id }, { $unset: { role: true } }, function (err) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback();
        });
      }
    ], function (err) {
      callback(err);
    });
  });
};