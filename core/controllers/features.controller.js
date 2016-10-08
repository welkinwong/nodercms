var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var featuresService = require('../services/features.service');

/**
 * 获取推荐
 * @param {Object} req
 * @param {Object} res
 */
exports.all = function (req, res) {
  featuresService.all(function (err, features) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(features);
  });
};

/**
 * 获取单个推荐
 * @param {Object} req
 * @param {Object} res
 */
exports.one = function (req, res) {
  req.checkParams({
    'feature': {
      notEmpty: {
        options: [true],
        errorMessage: 'feature 不能为空'
      },
      isMongoId: {errorMessage: 'feature 需为 mongoId'}
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params.feature;

  featuresService.one({ _id: _id },function (err, feature) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(feature);
  });
};

/**
 * 存储推荐
 * @param {Object} req
 *        {MongoId} req.body.model
 *        {Number} req.body.sort
 *        {String} req.body.title
 *        {String} req.body.link
 *        {MongoId} req.body.thumbnail
 *        {Object} req.body.extensions
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkBody({
    'model': {
      notEmpty: {
        options: [true],
        errorMessage: 'model 不能为空'
      },
      isMongoId: { errorMessage: 'model 需为 mongoId' }
    },
    'sort': {
      notEmpty: {
        options: [true],
        errorMessage: 'sort 不能为空'
      },
      isNumber: { errorMessage: 'sort 需为数字' }
    },
    'title': {
      notEmpty: {
        options: [true],
        errorMessage: 'title 不能为空'
      },
      isString: { errorMessage: 'title 需为字符串' },
    },
    'url': {
      optional: true,
      isString: { errorMessage: 'url 需为字符串' },
    },
    'thumbnail': {
      optional: true,
      isMongoId: { errorMessage: 'thumbnail 需为 mongoId' }
    },
    'media': {
      optional: true,
      inArray: {
        options: ['isMongoId'],
        errorMessage: 'media 内需为 mongoId'
      }
    },
    'extensions': {
      optional: true,
      isObject: { errorMessage: 'extensions 需为对象' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var data = {
    model: req.body.model,
    sort: req.body.sort,
    title: req.body.title,
    url: req.body.url,
    thumbnail: req.body.thumbnail,
    media: req.body.media || [],
    extensions: req.body.extensions
  };

  featuresService.save({ data: data }, function (err, feature) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(feature);
  });
};

/**
 * 更新推荐
 * @param {Object} req
 *        {MongoId} req.params.feature
 *        {MongoId} req.body._id
 *        {MongoId} req.body.model
 *        {Number} req.body.sort
 *        {String} req.body.title
 *        {String} req.body.url
 *        {MongoId} req.body.thumbnail
 *        {Object} req.body.extensions
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkParams({
    'feature': {
      notEmpty: {
        options: [true],
        errorMessage: 'feature 不能为空'
      },
      isMongoId: { errorMessage: 'feature 需为 mongoId' }
    }
  });
  req.checkBody({
    'model': {
      notEmpty: {
        options: [true],
        errorMessage: 'model 不能为空'
      },
      isMongoId: { errorMessage: 'model 需为 mongoId' }
    },
    'sort': {
      optional: true,
      isNumber: { errorMessage: 'sort 需为数字' }
    },
    'title': {
      optional: true,
      isString: { errorMessage: 'title 需为字符串' },
    },
    'url': {
      optional: true,
      isString: { errorMessage: 'url 需为字符串' },
    },
    'thumbnail': {
      optional: true,
      isMongoId: { errorMessage: 'thumbnail 需为 mongoId' }
    },
    'media': {
      optional: true,
      inArray: {
        options: ['isMongoId'],
        errorMessage: 'media 内需为 mongoId'
      }
    },
    'extensions': {
      optional: true,
      isObject: { errorMessage: 'extensions 需为对象' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params.feature;
  var data = {};

  if (req.body.part) {
    if (req.body.model) data.model = req.body.model;
    if (req.body.sort) data.sort = req.body.sort;
    if (req.body.title) data.title = req.body.title;
    if (req.body.url) data.url = req.body.url;
    if (req.body.thumbnail) data.thumbnail = req.body.thumbnail;
    if (req.body.media) data.media = req.body.media;
    if (req.body.extensions) data.extensions = req.body.extensions;
  } else {
    data.model = req.body.model;
    data.sort = req.body.sort;
    data.title = req.body.title;
    data.url = req.body.url;
    data.thumbnail = req.body.thumbnail;
    data.media = req.body.media;
    data.extensions = req.body.extensions;
  }

  featuresService.save({ _id: _id, data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 删除推荐
 * @param {Object} req
 *        {MongoId} req.params.feature
 * @param {Object} res
 */
exports.remove = function (req, res) {
  req.checkParams({
    'feature': {
      notEmpty: {
        options: [true],
        errorMessage: 'feature 不能为空'
      },
      isMongoId: { errorMessage: 'feature 需为 mongoId' },
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  featuresService.remove({ _id: req.params.feature }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};