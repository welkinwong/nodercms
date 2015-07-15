var async = require('async');
var logger = require('../../lib/logger');
var rolesModel = require('../models/rolesModel');
var usersModel = require('../models/usersModel');
var sha1 = require('../services/sha1Service');

module.exports = {
  /**
   * 查询用户
   */
  query: function (req, res) {
    req.checkParams('_id', '用户 _id 需为 mongoID').optional().isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    if (req.params._id) {
      usersModel.findById(req.params._id, 'type nickname email role')
        .populate({
          path: 'role',
          select: 'name description authorities'
        })
        .exec(function (err, user) {
          if (err) {
            logger.database().error(err);
            return res.status(500).end();
          }

          res.status(200).json(user);
        });
    } else {
      usersModel.find({ type: 'admin' }, 'type nickname email role')
        .populate({
          path: 'role',
          select: 'name description authorities'
        })
        .exec(function (err, users) {
          if (err) {
            logger.database().error(__dirname, err);
            return res.status(500).end();
          }

          res.status(200).json(users);
        });
    }
  },

  /**
   * 创建用户
   */
  create: function (req, res) {
    req.checkBody('email', '邮件格式不正确').isEmail();
    req.checkBody('nickname', '昵称需为字符串').isString();
    req.checkBody('password', '密码不能小于 6 位').isLength(6);
    req.checkBody('role', '角色需为 mongoId').isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors() );
      return res.status(400).end();
    }

    new usersModel({
      type: 'admin',
      email: req.body.email,
      nickname: req.body.nickname,
      password: req.body.password,
      role: req.body.role
    }).save(function (err, user) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).json({ _id: user._id });
    });
  },

  /**
   * 更新用户
   */
  update: function (req, res) {
    req.checkParams('_id', '用户 _id 需为 mongoId').isMongoId();
    req.checkBody('email', '邮箱格式不正确').isEmail();
    req.checkBody('nickname', '昵称需为字符串').isString();
    req.checkBody('password', '密码不能小于 6 位').optional().isLength(6);
    req.checkBody('role', '权限需为 mongoID').isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    var user = {
      type: 'admin',
      email: req.body.email,
      nickname: req.body.nickname,
      role: req.body.role
    };

    if (req.body.password) user.password = sha1(req.body.password);

    usersModel.update({ _id: req.params._id }, user, { runValidators: true }, function (err) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
  },

  /**
   * 删除用户
   */
  remove: function (req, res) {
    req.checkParams('_id', '用户 _id 需为 mongoId').isString();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    usersModel.remove({ _id: req.params._id }, function (err) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
  }
};