var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var logger = require('../../lib/logger.lib');
var themes = require('../../lib/themes.lib');
var siteInfoService = require('../services/site-info.service');

/**
 * 查询网站信息
 * @param {Object} req
 * @param {Object} res
 */
exports.get = function (req, res) {
  async.parallel({
    themes: themes.get,
    siteInfo: siteInfoService.get
  }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json({
      themes: results.themes,
      siteInfo: results.siteInfo
    });
  });
};

/**
 * 更新网站信息
 * @param {Object} req
 *        {String} req.body.theme
 *        {String} req.body.title
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkBody({
    'theme': {
      notEmpty: {
        options: [true],
        errorMessage: 'theme 不能为空'
      },
      isString: { errorMessage: 'theme 需为字符串' }
    },
    'title': {
      notEmpty: {
        options: [true],
        errorMessage: 'title 不能为空'
      },
      isString: { errorMessage: 'title 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var data = {
    theme: req.body.theme,
    title: req.body.title,
    keywords: req.body.keywords,
    description: req.body.description,
    codeHeader: req.body.codeHeader,
    codeFooter: req.body.codeFooter
  };

  async.parallel([
    function (callback) {
      siteInfoService.save({
        data: data
      }, callback);
    },
    function (callback) {
      themes.set(req.app, req.body.theme, callback)
    }
  ], function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};