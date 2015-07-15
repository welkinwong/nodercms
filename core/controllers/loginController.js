var async = require('async');
var crypto = require('crypto');
var logger = require('../../lib/logger');
var sha1 = require('../services/sha1Service');
var usersModel = require('../models/usersModel');
var rolesModel = require('../models/rolesModel');

module.exports = {
  // 检查是否登录
  check: function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.status(401).json({
        error: {
          code: 'NOT_LOGGED_IN',
          message: '没有登录'
        }
      });
    }
  },

  // 登入
  in: function (req, res) {
    req.checkBody('email', '邮件格式不正确').isEmail();
    req.checkBody('password', '密码不能小于 6 位').isLength(6);

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    usersModel.findOne({ email: req.body.email })
      .populate('role')
      .exec(function (err, user) {
        if (err) {
          logger.database().error(__dirname, err);
          return res.status(500).end();
        }

        if (user && sha1(req.body.password) === user.password) {
          req.session.user = {
            _id: user._id,
            type: user.type,
            nickname: user.nickname,
            email: user.email,
            role: {
              _id: user.role._id,
              name: user.role.name,
              description: user.role.description,
              authorities: user.role.authorities
            }
          };

          res.status(204).end();
        } else {
          res.status(401).json({
            error: {
              code: 'WRONG_EMAIL_OR_PASSWORD',
              message: '用户名或密码错误'
            }
          });
        }
      });
  },

  // 登出
  out: function (req, res) {
    req.session.destroy(function(err) {
      if (err) {
        logger.system().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).end();
    });
  }
};