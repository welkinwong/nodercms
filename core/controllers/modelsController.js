var async = require('async');
var logger = require('../../lib/logger');
var modelsModel = require('../models/modelsModel');

module.exports = {
  /**
   * 查询内容模型
   */
  query: function (req, res) {
    req.checkParams('_id', '模型 _id 需为 mongoId').optional().isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    if (req.params._id) {
      modelsModel.findById(req.params._id, 'type name description system extensions', function (err, model) {
        if (err) {
          logger.system().error(err);
          return res.status(500).end();
        }

        res.status(200).json(model);
      });
    } else {
      modelsModel.find(req.query, 'type name description system extensions', function (err, models) {
        if (err) {
          logger.system().error(err);
          return res.status(500).end();
        }

        res.status(200).json(models);
      });
    }
  },

  /**
   * 创建内容模型
   */
  create: function (req, res) {
    req.checkBody('name', '模型名称需为字符串且不能为空').isString();
    req.checkBody('type', '模型类别需为字符串且不能为空').isString();
    req.checkBody('system', '系统键需为对象').isObject();
    req.checkBody('extensions', '扩展键需为数组').isArray();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    new modelsModel({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      system: req.body.system,
      extensions: req.body.extensions
    }).save(function (err, model) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).json(model);
    });
  },

  /**
   * 更新内容模型
   */
  update: function (req, res) {
    req.checkParams('_id', '模型 _id 需为 mongoId 且不能为空').isMongoId();
    req.checkBody('name', '模型名称需为字符串且不能为空').isString();
    req.checkBody('type', '模型类别需为字符串且不能为空').isString();
    req.checkBody('system', '系统键需为对象').isObject();
    req.checkBody('extensions', '扩展键需为数组').isArray();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    modelsModel.update({ _id: req.params._id }, {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      system: req.body.system,
      extensions: req.body.extensions
    }, { runValidators: true }, function (err) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
  },

  /**
   * 删除模型
   */
  remove: function (req, res) {
    req.checkParams('_id', '模型 _id 需为 mongoId 且不能为空').isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    modelsModel.remove({ _id: req.params._id }, function (err) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();;
    });
  }
};