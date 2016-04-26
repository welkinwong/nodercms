var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var pagesService = require('../services/pages.service');
var mediaService = require('../services/media.service');

/**
 * 获取单页
 * @param {Object} req
 *        {MongoId} req.params.page
 * @param {Object} res
 */
exports.get = function (req, res) {
  req.checkParams({
    'page': {
      notEmpty: {
        options: [true],
        errorMessage: 'page 不能为空'
      },
      isMongoId: { errorMessage: 'page 需为 mongoId' }
    }
  });
  req.checkQuery({
    'markdown': {
      optional: true,
      isBoolean: { errorMessage: 'markdown 需为布尔值' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params.page;
  var markdown = false;

  if (req.query.markdown === 'true') {
    markdown = true;
  }

  async.waterfall([
    function (callback) {
      pagesService.one({ _id: _id, markdown: markdown }, function (err, page) {
        if (err) return callback(err);
        if (!page) return callback(null, null);

        var pageData = {
          name: page.name
        };

        if (page.mixed && page.mixed.pageContent) pageData.pageContent = page.mixed.pageContent;
        if (page.mixed && page.mixed.pageMedia) pageData.pageMedia = page.mixed.pageMedia;

        callback(null, pageData);
      });
    },
    function (pageData, callback) {
      if (!pageData) return callback(null, null);
      if (_.isEmpty(pageData.pageMedia)) return callback(null, pageData);

      mediaService.query({ query: { _id: { $in: pageData.pageMedia } } }, function (err, media) {
        if (err) callback(err);

        pageData.pageMedia = media;
        callback(null, pageData);
      });
    }
  ], function (err, pageData) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(pageData);
  });
};

/**
 * 存储单页
 * @param {Object} req
 *        {MongoId} req.params.page
 *        {String} req.params.pageContent
 *        {[MongoId]} req.params.pageMedia
 * @param {Object} res
 */
exports.save = function (req, res) {
  req.checkParams({
    'page': {
      notEmpty: {
        options: [true],
        errorMessage: 'page 不能为空'
      },
      isMongoId: { errorMessage: 'page 需为 mongoId' }
    }
  });
  req.checkBody({
    'pageContent': {
      optional: [true],
      isString: { errorMessage: 'pageContent 需为 mongoId' }
    },
    'pageMedia': {
      optional: [true],
      isArray: { errorMessage: 'pageMedia 需为数组' },
      inArray: {
        options: ['isMongoId'],
        errorMessage: 'pageMedia 内需为 mongoId'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params.page;
  var data = {};

  data['mixed.pageContent'] = req.body.pageContent;
  data['mixed.pageMedia'] = req.body.pageMedia;

  pagesService.save({ _id: _id, data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};