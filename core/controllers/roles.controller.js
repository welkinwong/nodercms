var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var rolesService = require('../services/roles.service');

/**
 * 多个角色
 * @param {Object} req
 * @param {Object} res
 */
exports.list = function (req, res) {
  rolesService.all(function (err, roles) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(roles);
  });
};

/**
 * 单个角色
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

  rolesService.one({ _id: _id }, function (err, role) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(role);
  });
};

/**
 * 创建角色
 * @param {Object} req
 *        {String} req.body.name
 *        {String} req.body.description
 *        {[Number]} req.body.authorities
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkBody({
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
    'authorities': {
      optional: true,
      inArray: {
        options: ['isNumber'],
        errorMessage: 'authorities 内需为数字'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var data = {
    name: req.body.name,
    description: req.body.description,
    authorities: req.body.authorities || []
  };

  rolesService.save({ data: data }, function (err, role) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(role);
  });
};

/**
 * 更新角色
 * @param {Object} req
 *        {String} req.body.name
 *        {String} req.body.description
 *        {[Number]} req.body.authorities
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: {errorMessage: 'name 需为 mongoId'}
    }
  });
  req.checkBody({
    'name': {
      optional: true,
      isString: { errorMessage: 'name 需为字符串' }
    },
    'description': {
      optional: true,
      isString: { errorMessage: 'description 需为字符串' }
    },
    'authorities': {
      optional: true,
      inArray: {
        options: ['isNumber'],
        errorMessage: 'authorities 内需为数字'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;
  var data = {
    name: req.body.name,
    authorities: req.body.authorities
  };

  if (req.body.description) data.description = req.body.description;

  rolesService.save({ _id: _id, data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 删除角色
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
      isMongoId: {errorMessage: 'name 需为 mongoId'}
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  rolesService.remove({ _id: _id }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};