var async = require('async');
var logger = require('../../lib/logger');
var optionsModel = require('../models/optionsModel');
var rolesModel = require('../models/rolesModel');
var usersModel = require('../models/usersModel');

module.exports = {
  query: function (req, res) {
    optionsModel.findOne({ name: 'install' }, function (err, install) {
      if (err) {
        logger.system().error(__dirname, err);
        return res.status(500).end();
      }

      if (install) {
        res.status(404).end();
      } else {
        res.status(204).end();
      }
    });
  },
  install: function (req, res) {
    req.checkBody('title', '网站标题需为字符串且不能为空').isString();
    req.checkBody('email', '邮箱格式不正确').isEmail();
    req.checkBody('nickname', '昵称需为字符串').isString();
    req.checkBody('password', '密码不能小于 6 位').isLength(6);

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors() );
      return res.status(400).end();
    }

    async.auto({
      isInstall: function (callback) {
        optionsModel.findOne({ name: 'install' }, function (err, install) {
          if (err) {
            return callback(err);
          } else if (install) {
            return callback('installed');
          } else {
            callback(null);
          }
        });
      },
      writeInstall: ['isInstall', function (callback, results) {
        new optionsModel({
          name: 'install',
          value: true
        }).save(function (err) {
          callback(err);
        });
      }],
      writeSiteinfo: ['isInstall', function (callback) {
        new optionsModel({
          name: 'siteInfo',
          value: {
            title: req.body.title
          }
        }).save(function (err) {
          callback(err);
        });
      }],
      writeRole: ['isInstall', function (callback) {
        new rolesModel({
          name: '管理员',
          description: '系统内置',
          authorities: [10000]
        }).save(function (err, data) {
          callback(err, data);
        });
      }],
      writeUser: ['isInstall', 'writeRole', function (callback, results) {
        new usersModel({
          type: 'admin',
          email: req.body.email,
          nickname: req.body.nickname,
          password: req.body.password,
          role: results.writeRole._id
        }).save(function (err, user) {
          callback(err, user);
        });
      }]
    }, function (err, results) {
      if (err && err === 'installed') {
        logger.system().error(__dirname, 'NoderCMS 已安装过');
        return res.status(410).json({ message: 'NoderCMS 已安装过' });
      } else if (err) {
        logger.system().error(__dirname, err);
        return res.status(500).end();
      }

      req.session.userId = results.writeUser._id;

      logger.system().info(__dirname, 'NoderCMS 成功安装');
      res.status(204).end();
    });
  }
};