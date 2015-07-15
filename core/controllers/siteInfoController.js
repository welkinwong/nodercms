var async = require('async');
var logger = require('../../lib/logger');
var optionsModel = require('../models/optionsModel');

module.exports = {
  query: function (req, res) {
    optionsModel.findOne({ name: 'siteInfo' }, function (err, siteInfo) {
      if (err) {
        logger.system().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).json(siteInfo.value);
    });
  },
  update: function (req, res) {
    req.checkBody('title', '网站标题需为字符串且不能为空').isString();
    req.checkBody('translate.on', '百度翻译开关值需为布尔').isBoolean();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors() );
      return res.status(400).end();
    }

    optionsModel.update({ name: 'siteInfo' }, {
      value: {
        title: req.body.title,
        keywords: req.body.keywords,
        description: req.body.description,
        translate: {
          on: req.body.translate.on,
          key: req.body.translate.key
        },
        codeHeader: req.body.codeHeader,
        codeFooter: req.body.codeFooter
      }
    }, { runValidators: true }, function (err, siteInfo) {
      if (err) {
        logger.system().error(__dirname, err);
        return res.status(500).end();
      }
      
      res.status(204).end();
    });
  }
};