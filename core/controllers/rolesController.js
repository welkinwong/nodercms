var validator = require('validator');
var logger = require('../../lib/logger');
var rolesModel = require('../models/rolesModel');

module.exports = {
  /**
   * 查询角色
   */
  query: function (req, res) {
    req.checkParams('_id', '角色 _id 需为 mongoID').optional().isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    if (req.params._id) {
      rolesModel.findById(req.params._id, function (err, role) {
        if (err) {
          logger.system().error(err);
          return res.status(500).end();
        }

        res.status(200).json(role);
      });
    } else {
      rolesModel.find({}, function (err, roles) {
        if (err) {
          logger.system().error(err);
          return res.status(500).end();
        }

        res.status(200).json(roles);
      });
    }
  },

  /**
   * 创建角色
   */
  create: function (req, res) {
    req.checkBody('name', '角色名称需为字符串').isString();
    req.checkBody('description', '角色备注需为字符串').optional().isString();
    req.checkBody('authorities', '权限列表需为数组').isArray()
      .custom(function (values) {
        for (var i = 0; i < values.length; i++) {
          req.checkBody(['authorities', i], '权限列表子项需为为数字').isInt();
        }
      });

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    // 不允许创建权限存在 0 的角色
    for (var i = 0; i < req.body.authorities.length; i++) {
      if (req.body.authorities[i] === 10000) return res.status(400).end();
    }

    new rolesModel({
      name: req.body.name,
      description: req.body.description,
      authorities: req.body.authorities
    }).save(function (err, role) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).json(role);
    });
  },

  /**
   * 更新角色
   */
  update: function (req, res) {
    req.checkParams('_id', '角色 _id 需为 mongoId').isMongoId();
    req.checkBody('name', '角色名称需为字符串').isString();
    req.checkBody('description', '角色备注需为字符串').optional().isString();
    req.checkBody('authorities', '权限列表需为数组').isArray()
      .custom(function (values) {
        for (var i = 0; i < values.length; i++) {
          req.checkBody(['authorities', i], '权限列表子项需为为数字').isInt();
        }
      });

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    // 不允许更新后权限存在 10000 的角色
    for (var i = 0; i < req.body.authorities.length; i++) {
      if (req.body.authorities[i] === 10000) return res.status(400).end();
    }

    rolesModel.update({ _id: req.params._id }, {
      name: req.body.name,
      description: req.body.description,
      authorities: req.body.authorities
    }, { runValidators: true }, function (err) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
  },

  /**
   * 删除角色
   */
  remove: function (req, res) {
    req.checkParams('_id', '角色 _id 需为 mongoId').isString();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    rolesModel.findById(req.params._id, function (err, role) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      // 不允许删除权限存在 10000 的角色
      for (var i = 0; i < role.authorities.length; i++) {
        if (role.authorities[i] === 10000) return res.status(400).end();
      }

      role.remove(function (err) {
        if (err) {
          logger.database().error(__dirname, err);
          return res.status(500).end();
        }

        res.status(204).end();
      });
    });
  }
};