var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var modelsService = require('../services/models.service');

/**
 *  多个模型
 * @param {Object} req
 *        {String} req.params.type
 * @param {Object} res
 */
exports.query = function (req, res) {
  req.checkQuery({
    'type': {
      optional: true,
      isString: { errorMessage: 'type 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var query = req.query;

  modelsService.query({ query: query }, function (err, models) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(models);
  });
};

/**
 * 单个模型
 * @param {Object} req
 *        {MongoId} req.params._id
 * @param {Object} res
 */
exports.one = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: { errorMessage: '_id 需为 mongoId' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  modelsService.one({ _id: _id }, function (err, model) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(model);
  });
};

/**
 * 创建模型
 * @param {Object} req
 *        {String} req.body.type
 *        {String} req.body.name
 *        {String} req.body.description
 *        {Object} req.body.mixed
 *        {Object} req.body.system
 *        {Array} req.body.extensions
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkBody({
    'type': {
      notEmpty: {
        options: [true],
        errorMessage: 'type 不能为空'
      },
      isString: { errorMessage: 'type 需为字符串' }
    },
    'name': {
      notEmpty: {
        options: [true],
        errorMessage: 'name 不能为空'
      },
      isString: { errorMessage: 'name 需为字符串' }
    },
    'description': {
      optional: true,
      isString: { errorMessage: 'description 需为字符串' }
    },
    'mixed': {
      optional: true,
      isObject: { errorMessage: 'mixed 需为对象' }
    },
    'system': {
      optional: true,
      isObject: { errorMessage: 'system 需为对象' }
    },
    'extensions': {
      optional: true,
      isArray: { errorMessage: 'extensions 需为数组' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var data = {
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    mixed: req.body.mixed || {},
    system: req.body.system || {},
    extensions: req.body.extensions || []
  };

  modelsService.save({ data: data }, function (err, model) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json({ _id: model._id });
  });
};

/**
 * 更新模型
 * @param {Object} req
 *        {MongoId} req.body._id
 *        {String} req.body.type
 *        {String} req.body.name
 *        {String} req.body.description
 *        {Object} req.body.mixed
 *        {Object} req.body.system
 *        {Array} req.body.extensions
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkBody({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: { errorMessage: '_id 需为 mongoId' }
    },
    'type': {
      optional: true,
      isString: { errorMessage: 'type 需为字符串' }
    },
    'name': {
      optional: true,
      isString: { errorMessage: 'name 需为字符串' }
    },
    'description': {
      optional: true,
      isString: { errorMessage: 'description 需为字符串' }
    },
    'mixed': {
      optional: true,
      isObject: { errorMessage: 'mixed 需为对象' }
    },
    'system': {
      optional: true,
      isObject: { errorMessage: 'system 需为对象' }
    },
    'extensions': {
      optional: true,
      isArray: { errorMessage: 'extensions 需为数组' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;
  var data = {};

  if (req.body.type) data.type = req.body.type;
  if (req.body.name) data.name = req.body.name;
  if (req.body.description) data.description = req.body.description;
  if (req.body.mixed) data.mixed = req.body.mixed;
  if (req.body.system) data.system = req.body.system;
  if (req.body.extensions) data.extensions = req.body.extensions;

  modelsService.save({ _id: _id, data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 删除模型
 * @param {Object} req
 *        {MongoId} req.body._id
 * @param {Object} res
 */
exports.remove = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: { errorMessage: '_id 需为 mongoId' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  modelsService.remove({ _id: _id }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();;
  });
};