var path = require('path');
var fs = require('fs');
var async = require('async');
var moment = require('moment');
var logger = require('../../lib/logger.lib');
var mediaService = require('../services/media.service');

/**
 * 多条媒体
 * @param {Object} req
 *        {Number} req.query.currentPage
 *        {Number} req.query.pageSize
 * @param {Object} res
 */
exports.list = function (req, res) {
  req.checkQuery({
    'currentPage': {
      optional: true,
      isInt: { errorMessage: 'currentPage 需为数字' }
    },
    'pageSize': {
      optional: true,
      isInt: { errorMessage: 'pageSize 需为数字' }
    }
  });

  var query = {};

  if (req.query.currentPage) query.currentPage = req.query.currentPage;
  if (req.query.pageSize) query.pageSize = req.query.pageSize;

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  mediaService.list(query, function (err, results) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(results);
  });
};

/**
 * 创建媒体
 * @param {Object} req
 *        {*} req.headers.content-type
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkHeaders({
    'content-type': {
      notEmpty: {
        options: [true],
        errorMessage: 'content-type 不能为空'
      },
      matches: {
        optional: [/multipart\/form-data/i],
        errorMessage: '数据需为文件格式'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  mediaService.save({ req: req }, function (err, medium) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(medium);
  });
};

/**
 * 更新媒体
 * @param {Object} req
 *        {MongoId} req.params.medium
 *        {String} req.body.fileName
 *        {String} req.body.description
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkParams({
    'medium': {
      notEmpty: {
        options: [true],
        errorMessage: 'medium 不能为空'
      },
      isMongoId: { errorMessage: 'medium 需为 mongoId' }
    }
  });
  req.checkBody({
    'fileName': {
      notEmpty: {
        options: [true],
        errorMessage: 'fileName 不能为空'
      },
      isString: { errorMessage: 'fileName 需为字符串' }
    },
    'description': {
      optional: true,
      isString: { errorMessage: 'description 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var data = {
    fileName: req.body.fileName
  };

  if (req.body.description) data.description = req.body.description;

  mediaService.save({ _id: req.params.medium, data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 删除媒体
 * @param {Object} req
 *        {MongoId} req.params.medium
 * @param {Object} res
 */
exports.remove = function (req, res) {
  req.checkParams({
    'medium': {
      notEmpty: {
        options: [true],
        errorMessage: 'medium 不能为空'
      },
      isMongoId: { errorMessage: 'medium 需为 mongoId' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var _id = req.params.medium;

  mediaService.remove({ _id: _id }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};