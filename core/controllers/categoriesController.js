var async = require('async');
var logger = require('../../lib/logger');
var categoriesModel = require('../models/categoriesModel');

module.exports = {
  /**
   * 查询分类
   */
  query: function (req, res) {
    req.checkParams('_id', '模型 _id 需为 mongoId').optional().isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    if (req.params._id) {
      categoriesModel.findById(req.params._id)
        .populate('model')
        .exec(function (err, category) {
          if (err) {
            logger.database().error(err);
            return res.status(500).end();
          }

          res.status(200).json(category);
        });
    } else {
      categoriesModel.find(req.query)
        .populate('model')
        .exec(function (err, categories) {
          if (err) {
            logger.system().error(__dirname, err);
            return res.status(500).end();
          }

          res.status(200).json(categories);
        });
    }
  },

  /**
   * 创建分类
   */
  create: function (req, res) {
    req.checkBody('type', '分类名称需为字符串').isString();
    req.checkBody('name', '分类名需为字符串').isString();
    req.checkBody('directory', '目录名需为字符串').isString();
    req.checkBody('isShow', '在导航栏中显示需为布尔').isBoolean();
    req.checkBody('sort', '排序需为数字').isInt();
    switch (req.body.type) {
      case 'channel':
        req.checkBody('views', '视图需为对象').isObject();
        req.checkBody('keywords', '关键词需为字符串').optional().isString();
        req.checkBody('description', '描述需为字符串').optional().isString();

        break;
      case 'column':
        req.checkBody('model', '模型需为 mongoId').isMongoId();
        req.checkBody('parentCategory', '上级分类需为 mongoId').optional().isMongoId();
        req.checkBody('views', '视图需为对象').isObject();
        req.checkBody('keywords', '关键词需为字符串').optional().isString();
        req.checkBody('description', '描述需为字符串').optional().isString();

        break;
      case 'page':
        req.checkBody('parentCategory', '上级分类需为 mongoId').optional().isMongoId();
        req.checkBody('views', '视图需为对象').isObject();
        req.checkBody('keywords', '关键词需为字符串').optional().isString();
        req.checkBody('description', '描述需为字符串').optional().isString();

        break;
      case 'link':
        req.checkBody('parentCategory', '上级分类需为 mongoId').optional().isMongoId();
    }

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }
    
    var category = {
      type: req.body.type,
      name: req.body.name,
      directory: req.body.directory,
      isShow: req.body.isShow,
      sort: req.body.sort
    }

    switch (req.body.type) {
      case 'channel':
        category.views = req.body.views;
        category.keywords = req.body.keywords;
        category.description = req.body.description;

        break;
      case 'column':
        category.model = req.body.model;
        category.parentCategory = req.body.parentCategory
        category.views = req.body.views;
        category.keywords = req.body.keywords;
        category.description = req.body.description;

        break;
      case 'page':
        category.parentCategory = req.body.parentCategory
        category.views = req.body.views;
        category.keywords = req.body.keywords;
        category.description = req.body.description;

        break;
      case 'link':
        category.parentCategory = req.body.parentCategory
    }

    new categoriesModel(category).save(function (err, category) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).json({ _id: category._id });
    });
  },

  /**
   * 更新分类
   */
  update: function (req, res) {
    req.checkParams('_id', '分类 _id 需为 mongoId').isMongoId();
    req.checkBody('type', '分类名称需为字符串').isString();
    req.checkBody('name', '分类名需为字符串').isString();
    req.checkBody('directory', '目录名需为字符串').isString();
    req.checkBody('isShow', '在导航栏中显示需为布尔').isBoolean();
    req.checkBody('sort', '排序需为数字').isInt();
    switch (req.body.type) {
      case 'channel':
        req.checkBody('views', '视图需为对象').isObject();
        req.checkBody('keywords', '关键词需为字符串').optional().isString();
        req.checkBody('description', '描述需为字符串').optional().isString();

        break;
      case 'column':
        req.checkBody('model', '模型需为 mongoId').isMongoId();
        req.checkBody('parentCategory', '上级分类需为 mongoId').optional().isMongoId();
        req.checkBody('views', '视图需为对象').isObject();
        req.checkBody('keywords', '关键词需为字符串').optional().isString();
        req.checkBody('description', '描述需为字符串').optional().isString();

        break;
      case 'page':
        req.checkBody('parentCategory', '上级分类需为 mongoId').optional().isMongoId();
        req.checkBody('views', '视图需为对象').isObject();
        req.checkBody('keywords', '关键词需为字符串').optional().isString();
        req.checkBody('description', '描述需为字符串').optional().isString();

        break;
      case 'link':
        req.checkBody('parentCategory', '上级分类需为 mongoId').optional().isMongoId();
    }

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    var category = {
      type: req.body.type,
      name: req.body.name,
      directory: req.body.directory,
      isShow: req.body.isShow,
      sort: req.body.sort
    }

    switch (req.body.type) {
      case 'channel':
        category.views = req.body.views;
        category.keywords = req.body.keywords;
        category.description = req.body.description;

        break;
      case 'column':
        category.model = req.body.model;
        category.parentCategory = req.body.parentCategory
        category.views = req.body.views;
        category.keywords = req.body.keywords;
        category.description = req.body.description;

        break;
      case 'page':
        category.parentCategory = req.body.parentCategory
        category.views = req.body.views;
        category.keywords = req.body.keywords;
        category.description = req.body.description;

        break;
      case 'link':
        category.parentCategory = req.body.parentCategory
    }

    categoriesModel.update({ _id: req.params._id }, category, { runValidators: true }, function (err) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
  },

  /**
   * 删除分类
   */
  remove: function (req, res) {
    req.checkParams('_id', '分类 _id 需为 mongoId').isMongoId();

    if (req.validationErrors()) {
      logger.system().error(__dirname, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    async.parallel([
      function (callback) {
        categoriesModel.update({ parentCategory: req.params._id }, { parentCategory: null }, { multi: true }, function (err) {
          callback(err);
        });
      },
      function (callback) {
        categoriesModel.remove({ _id: req.params._id }, function (err) {
          callback(err);
        });
      }
    ], function (err, results) {
      if (err) {
        logger.database().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
  }
};