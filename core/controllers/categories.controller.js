var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var categoriesService = require('../services/categories.service');

/**
 * 查询分类
 * @param {Object} req
 *        {Object} req.query
 * @param {Object} res
 */
exports.query = function (req, res) {
  var query = req.query;

  if (!_.isEmpty(query)) {
    categoriesService.one(query, function (err, category) {
      if (err) {
        logger[err.type]().error(err);
        return res.status(500).end();
      }

      res.status(200).json(category);
    });
  } else {
    categoriesService.all(function (err, categories) {
      if (err) {
        logger[err.type]().error(err);
        return res.status(500).end();
      }

      res.status(200).json(categories);
    });
  }
};

/**
 * 查询指定分类
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

  categoriesService.one({ _id: _id }, function (err, category) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(category);
  });
};

/**
 * 创建分类
 * @param {Object} req
 *        {String} req.body.type
 *        {String} req.body.name
 *        {Boolean} req.body.isShow
 *        {Number} req.body.sort
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
    'isShow': {
      notEmpty: {
        options: [true],
        errorMessage: 'isShow 不能为空'
      },
      isBoolean: { errorMessage: 'isShow 需为布尔值' }
    },
    sort: {
      optional: true,
      isNumber: { errorMessage: 'sort 需为数字' }
    }
  });

  switch (req.body.type) {
    case 'channel':
      req.checkBody({
        'path': {
          notEmpty: {
            options: [true],
            errorMessage: 'path 不能为空'
          },
          isString: { errorMessage: 'path 需为布尔值' }
        },
        'views.layout': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.layout 不能为空'
          },
          isString: { errorMessage: 'views.layout 需为字符串' }
        },
        'views.channel': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.channel 不能为空'
          },
          isString: { errorMessage: 'views.channel 需为字符串' }
        },
        'keywords': {
          optional: true,
          isString: { errorMessage: 'keywords 需为字符串' }
        },
        'description': {
          optional: true,
          isString: { errorMessage: 'description 需为字符串' }
        }
      });
      break;
    case 'column':
      req.checkBody({
        'model': {
          notEmpty: {
            options: [true],
            errorMessage: 'model 不能为空'
          },
          isMongoId: { errorMessage: 'model 需为 mongoId' }
        },
        'path': {
          notEmpty: {
            options: [true],
            errorMessage: 'path 不能为空'
          },
          isString: { errorMessage: 'path 需为字符串' }
        },
        'mixed.pageSize': {
          notEmpty: {
            options: [true],
            errorMessage: 'mixed.pageSize 不能为空'
          },
          isNumber: { errorMessage: 'mixed.pageSize 需为数字' }
        },
        'views.layout': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.layout 不能为空'
          },
          isString: { errorMessage: 'views.layout 需为字符串' }
        },
        'views.column': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.column 不能为空'
          },
          isString: { errorMessage: 'views.column 需为字符串' }
        },
        'views.content': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.content 不能为空'
          },
          isString: { errorMessage: 'views.content 需为字符串' }
        },
        'keywords': {
          optional: true,
          isString: { errorMessage: 'keywords 需为字符串' }
        },
        'description': {
          optional: true,
          isString: { errorMessage: 'description 需为字符串' }
        }
      });
      break;
    case 'page':
      req.checkBody({
        'path': {
          notEmpty: {
            options: [true],
            errorMessage: 'path 不能为空'
          },
          isString: { errorMessage: 'path 需为字符串' }
        },
        'views.layout': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.layout 不能为空'
          },
          isString: { errorMessage: 'views.layout 需为字符串' }
        },
        'views.page': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.page 不能为空'
          },
          isString: { errorMessage: 'views.page 需为字符串' }
        },
        'mixed.isEdit': {
          notEmpty: {
            options: [true],
            errorMessage: 'mixed.isEdit 不能为空'
          },
          isBoolean: { errorMessage: 'mixed.isEdit 需为布尔值' }
        },
        'keywords': {
          optional: true,
          isString: { errorMessage: 'path 需为字符串' }
        },
        'description': {
          optional: true,
          isString: { errorMessage: 'path 需为字符串' }
        }
      });
      break;
    case 'link':
      req.checkBody({
        'mixed.prePath': {
          notEmpty: {
            options: [true],
            errorMessage: 'mixed.prePath 不能为空'
          },
          isString: { errorMessage: 'mixed.prePath 需为字符串' }
        },
        'mixed.url': {
          notEmpty: {
            options: [true],
            errorMessage: 'mixed.url 不能为空'
          },
          isString: { errorMessage: 'mixed.url 需为字符串' }
        }
      });
  }

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var data = {
    type: req.body.type,
    name: req.body.name,
    isShow: req.body.isShow,
    sort: req.body.sort
  };

  switch (req.body.type) {
    case 'channel':
      data.path = req.body.path;
      data['views.layout'] = req.body['views.layout'];
      data['views.channel'] = req.body['views.channel'];
      data.keywords = req.body.keywords;
      data.description = req.body.description;

      break;
    case 'column':
      data.model = req.body.model;
      data.path = req.body.path;
      data['mixed.pageSize'] = req.body['mixed.pageSize'];
      data['views.layout'] = req.body['views.layout'];
      data['views.column'] = req.body['views.column'];
      data['views.content'] = req.body['views.content'];
      data.keywords = req.body.keywords;
      data.description = req.body.description;

      break;
    case 'page':
      data.path = req.body.path;
      data['views.layout'] = req.body['views.layout'];
      data['views.page'] = req.body['views.page'];
      data['mixed.isEdit'] = req.body['mixed.isEdit'];
      data['mixed.pageMedia'] = [];
      data.keywords = req.body.keywords;
      data.description = req.body.description;
      break;
    case 'link':
      data['mixed.prePath'] = req.body['mixed.prePath'];
      data['mixed.url'] = req.body['mixed.url'];
  }

  categoriesService.save({ data: data }, function (err, category) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json({_id: category._id});
  });
};

/**
 * 更新分类
 * @param {Object} req
 *        {MongoId} req.params._id
 *        {String} req.body.type
 *        {String} req.body.name
 *        {Boolean} req.body.isShow
 *        {Number} req.body.sort
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: { errorMessage: '_id 需为 mongoId' }
    }
  });
  req.checkBody({
    'type': {
      optional: true,
      isString: { errorMessage: 'type 需为字符串' }
    },
    'name': {
      optional: true,
      isString: { errorMessage: 'name 需为字符串' }
    },
    'isShow': {
      optional: true,
      isBoolean: { errorMessage: 'isShow 需为布尔值' }
    },
    'sort': {
      optional: true,
      isNumber: { errorMessage: 'sort 需为数字' }
    }
  });

  switch (req.body.type) {
    case 'channel':
      req.checkBody({
        'path': {
          optional: true,
          isString: { errorMessage: 'path 需为布尔值' }
        },
        'views.layout': {
          optional: true,
          isString: { errorMessage: 'views.layout 需为字符串' }
        },
        'views.channel': {
          optional: true,
          isString: { errorMessage: 'views.channel 需为字符串' }
        },
        'keywords': {
          optional: true,
          isString: { errorMessage: 'keywords 需为字符串' }
        },
        'description': {
          optional: true,
          isString: { errorMessage: 'description 需为字符串' }
        }
      });
      break;
    case 'column':
      req.checkBody({
        'model': {
          optional: true,
          isMongoId: { errorMessage: 'model 需为 mongoId' }
        },
        'path': {
          optional: true,
          isString: { errorMessage: 'path 需为字符串' }
        },
        'mixed.pageSize': {
          optional: true,
          isNumber: { errorMessage: 'mixed.pageSize 需为数字' }
        },
        'views.layout': {
          optional: true,
          isString: { errorMessage: 'views.layout 需为字符串' }
        },
        'views.column': {
          optional: true,
          isString: { errorMessage: 'views.column 需为字符串' }
        },
        'views.content': {
          notEmpty: {
            options: [true],
            errorMessage: 'views.content 不能为空'
          },
          isString: { errorMessage: 'views.content 需为字符串' }
        },
        'keywords': {
          optional: true,
          isString: { errorMessage: 'keywords 需为字符串' }
        },
        'description': {
          optional: true,
          isString: { errorMessage: 'description 需为字符串' }
        }
      });
      break;
    case 'page':
      req.checkBody({
        'path': {
          optional: true,
          isString: { errorMessage: 'path 需为字符串' }
        },
        'views.layout': {
          optional: true,
          isString: { errorMessage: 'views.layout 需为字符串' }
        },
        'views.page': {
          optional: true,
          isString: { errorMessage: 'views.page 需为字符串' }
        },
        'mixed.isEdit': {
          optional: true,
          isBoolean: { errorMessage: 'mixed.isEdit 需为布尔值' }
        },
        'keywords': {
          optional: true,
          isString: { errorMessage: 'path 需为字符串' }
        },
        'description': {
          optional: true,
          isString: { errorMessage: 'path 需为字符串' }
        }
      });
      break;
    case 'link':
      req.checkBody({
        'mixed.prePath': {
          optional: true,
          isString: { errorMessage: 'mixed.prePath 需为字符串' }
        },
        'mixed.url': {
          optional: true,
          isString: { errorMessage: 'mixed.url 需为字符串' }
        }
      });
  }

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  var data = {};

  if (req.body.type) data.type = req.body.type;
  if (req.body.name) data.name = req.body.name;
  if (_.isBoolean(req.body.isShow)) data.isShow = req.body.isShow;
  if (_.isNumber(req.body.sort)) data.sort = req.body.sort;

  switch (req.body.type) {
    case 'channel':
      if (req.body.path) data.path = req.body.path;
      if (req.body['views.layout']) data['views.layout'] = req.body['views.layout'];
      if (req.body['views.channel']) data['views.channel'] = req.body['views.channel'];
      if (req.body.keywords) data.keywords = req.body.keywords;
      if (req.body.description) data.description = req.body.description;

      break;
    case 'column':
      if (req.body.model) data.model = req.body.model;
      if (req.body.path) data.path = req.body.path;
      if (req.body['mixed.pageSize']) data['mixed.pageSize'] = req.body['mixed.pageSize'];
      if (req.body['views.layout']) data['views.layout'] = req.body['views.layout'];
      if (req.body['views.column']) data['views.column'] = req.body['views.column'];
      if (req.body['views.content']) data['views.content'] = req.body['views.content'];
      if (req.body.keywords) data.keywords = req.body.keywords;
      if (req.body.description) data.description = req.body.description;

      break;
    case 'page':
      if (req.body.path) data.path = req.body.path;
      if (req.body['views.layout']) data['views.layout'] = req.body['views.layout'];
      if (req.body['views.page']) data['views.page'] = req.body['views.page'];
      if (_.isBoolean(req.body['mixed.isEdit'])) data['mixed.isEdit'] = req.body['mixed.isEdit'];
      if (req.body.keywords) data.keywords = req.body.keywords;
      if (req.body.description) data.description = req.body.description;
      break;
    case 'link':
      if (req.body['mixed.prePath']) data['mixed.prePath'] = req.body['mixed.prePath'];
      if (req.body['mixed.url']) data['mixed.url'] = req.body['mixed.url'];
  }

  categoriesService.save({ _id: _id, data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 删除分类
 * @param {Object} req
 *        {MongoId} req.params._id
 * @param {Object} res
 */
exports.remove = function (req, res) {
  req.checkParams({
    '_id': {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: { errorMessage: '_id 不能为空' }
    }
  });

  if (req.validationErrors()) {
    logger[err.type]().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params._id;

  categoriesService.remove({ _id: _id }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};