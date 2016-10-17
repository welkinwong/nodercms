var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var contentsService = require('../services/contents.service');

/**
 * 单条内容
 * @param {Object} req
 *        {MongoId} req.params._id
 *        {Boolean} req.params.reading
 * @param {Object} res
 */
exports.one = function (req, res) {
  req.checkParams({
    'content': {
      notEmpty: {
        options: [true],
        errorMessage: 'content 不能为空'
      },
      isMongoId: { errorMessage: 'content 需为 mongoId' }
    }
  });
  req.checkQuery({
    'reading': {
      optional: true,
      isBoolean: { errorMessage: 'reading 需为布尔值' }
    },
    'markdown': {
      optional: true,
      isBoolean: { errorMessage: 'markdown 需为布尔值' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.params.content;
  var reading = false;
  var markdown = false;

  if (req.query.reading === 'true') reading = true;
  if (req.query.markdown === 'true') markdown = true;

  contentsService.one({_id: _id, reading: reading, markdown: markdown }, function (err, content) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(content);
  });
};

/**
 * 多条内容
 * @param {Object} req
 *        {Boolean} req.query.deleted
 *        {MongoId} req.query.category
 *        {Number} req.query.pageSize
 *        {Number} req.query.currentPage
 * @param {Object} res
 */
exports.list = function (req, res) {
  req.checkQuery({
    'deleted': {
      optional: true,
      isBoolean: { errorMessage: 'deleted 需为布尔值' }
    },
    '_id': {
      optional: true,
      isMongoId: { errorMessage: 'category _id 需为 mongoId' }
    },
    'pageSize': {
      optional: true,
      isInt: { errorMessage: 'pageSize 需为数字' }
    },
    'currentPage': {
      optional: true,
      isInt: { errorMessage: 'currentPage 需为数字' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var query = {};
  if (req.query._id) query._id = req.query._id;
  if (req.query.deleted === 'true') {
    query.deleted = true;
  } else if (req.query.deleted === 'false') {
    query.deleted = false;
  }
  if (req.query.pageSize) query.pageSize = req.query.pageSize;
  if (req.query.currentPage) query.currentPage = req.query.currentPage;

  contentsService.list(query, function (err, result) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    res.status(200).json(result);
  });
};

/**
 * 新增内容
 * @param {Object} req
 *        {Boolean} req.query.deleted
 *        {MongoId} req.query.category
 *        {Number} req.query.pageSize
 *        {Number} req.query.currentPage
 * @param {Object} res
 */
exports.create = function (req, res) {
  req.checkBody({
    'status': {
      custom: {
        options: [function (value) {
          if (value === 'draft' || value === 'pushed') {
            return true;
          } else {
            return false;
          }
        }],
        errorMessage: 'status 值需为 draft 或 pushed'
      }
    },
    'category': {
      notEmpty: {
        options: [true],
        errorMessage: 'category 不能为空'
      },
      isMongoId: { errorMessage: 'category _id 需为 mongoId' }
    },
    'title': {
      notEmpty: {
        options: [true],
        errorMessage: 'title 不能为空'
      },
      isString: { errorMessage: 'title 需为字符串' }
    },
    'date': {
      notEmpty: {
        options: [true],
        errorMessage: 'date 不能为空'
      },
      isDate: { errorMessage: 'date 需为日期' }
    },
    'thumbnail': {
      optional: true,
      isMongoId: { errorMessage: 'thumbnail _id 需为 mongoId' }
    },
    'media': {
      optional: true,
      inArray: {
        options: ['isMongoId'],
        errorMessage: 'media 内需为 mongoId'
      }
    },
    'abstract': {
      optional: true,
      isString: { errorMessage: 'abstract 需为字符串' }
    },
    'content': {
      optional: true,
      isString: { errorMessage: 'content 需为字符串' }
    },
    'tags': {
      optional: true,
      inArray: {
        options: ['isString'],
        errorMessage: 'tags 内需为字符串'
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
    status: req.body.status,
    category: req.body.category,
    title: req.body.title,
    alias: req.body.alias,
    user: req.session.user,
    date: req.body.date,
    thumbnail: req.body.thumbnail,
    media: req.body.media || [],
    abstract: req.body.abstract,
    content: req.body.content,
    tags: req.body.tags || [],
    extensions: req.body.extensions || {}
  };

  contentsService.save({ data: data }, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 更新内容
 * @param {Object} req
 *        {MongoId} req.params.content
 *        {[MongoId]} req.query.ids
 *        {Boolean} req.body.part
 *        {String} req.body.status
 *        {Boolean} req.body.deleted
 *        {MongoId} req.body.category
 *        {String} req.body.title
 *        {String} req.body.alias
 *        {Date} req.body.date
 *        {MongoId} req.body.thumbnail
 *        {[MongoId]} req.body.media
 *        {String} req.body.abstract
 *        {String} req.body.content
 *        {[String]} req.body.tags
 *        {Object} req.body.extensions
 * @param {Object} res
 */
exports.update = function (req, res) {
  if (req.params.content) {
    req.checkParams({
      'content': {
        notEmpty: {
          options: [true],
          errorMessage: 'content _id 不能为空'
        },
        isMongoId: { errorMessage: 'content _id 需为 mongoId' }
      }
    });
  } else {
    req.checkQuery({
      'ids': {
        notEmpty: {
          options: [true],
          errorMessage: 'ids _id 不能为空'
        },
        inArray: {
          options: ['isMongoId'],
          errorMessage: 'ids 内需为 mongoId'
        }
      }
    });
  }

  if (req.body.part) {
    req.checkBody({
      'part': {
        notEmpty: {
          options: [true],
          errorMessage: 'part 不能为空'
        },
        isBoolean: { errorMessage: 'part 需为布尔值' }
      },
      'status': {
        optional: true,
        custom: {
          options: [function (value) {
            if (value === 'draft' || value === 'pushed') {
              return true;
            } else {
              return false;
            }
          }],
          errorMessage: 'status 需为 draft 或 pushed'
        }
      },
      'deleted': {
        optional: true,
        isBoolean: { errorMessage: 'deleted 需为布尔值' }
      },
      'category': {
        optional: true,
        isMongoId: { errorMessage: 'category 需为 mongoId' }
      },
      'title': {
        optional: true,
        isString: { errorMessage: 'title 需为字符串' }
      },
      'alias': {
        optional: true,
        isString: { errorMessage: 'alias 需为字符串' }
      },
      'date': {
        optional: true,
        isDate: { errorMessage: 'date 需为日期' }
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
      'abstract': {
        optional: true,
        isString: { errorMessage: 'abstract 需为字符串' }
      },
      'content': {
        optional: true,
        isString: { errorMessage: 'content 需为字符串' }
      },
      'tags': {
        optional: true,
        isArray: {
          options: ['isString'],
          errorMessage: 'tags 内需为字符串'
        }
      },
      'extensions': {
        optional: true,
        isObject: { errorMessage: 'extensions 需为对象' }
      }
    });
  } else {
    req.checkBody({
      'status': {
        notEmpty: {
          options: [true],
          errorMessage: 'status 不能为空'
        },
        custom: {
          options: [function (value) {
            if (value === 'draft' || value === 'pushed') {
              return true;
            } else {
              return false;
            }
          }],
          errorMessage: 'status 需为 draft 或 pushed 或 deleted'
        }
      },
      'deleted': {
        optional: true,
        isBoolean: { errorMessage: 'deleted 需为布尔值' }
      },
      'category': {
        notEmpty: {
          options: [true],
          errorMessage: 'category 不能为空'
        },
        isMongoId: { errorMessage: 'category 需为 mongoId' }
      },
      'title': {
        notEmpty: {
          options: [true],
          errorMessage: 'title 不能为空'
        },
        isString: { errorMessage: 'title 需为字符串' }
      },
      'alias': {
        notEmpty: {
          options: [true],
          errorMessage: 'alias 不能为空'
        },
        isString: { errorMessage: 'alias 需为字符串' }
      },
      'date': {
        notEmpty: {
          options: [true],
          errorMessage: 'date 不能为空'
        },
        isDate: { errorMessage: 'date 需为日期' }
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
      'abstract': {
        optional: true,
        isString: { errorMessage: 'abstract 需为字符串' }
      },
      'content': {
        optional: true,
        isString: { errorMessage: 'content 需为字符串' }
      },
      'tags': {
        optional: true,
        isArray: {
          options: ['isString'],
          errorMessage: 'tags 内需为字符串'
        }
      },
      'extensions': {
        optional: true,
        isObject: { errorMessage: 'extensions 需为对象' }
      }
    });
  }

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var data = {};

  if (req.body.part) {
    if (req.body.status) data.status = req.body.status;
    if (_.isBoolean(req.body.deleted)) data.deleted = req.body.deleted;
    if (req.body.category) data.category = req.body.category;
    if (req.body.title) data.title = req.body.title;
    if (req.body.alias) data.alias = req.body.alias;
    if (req.body.date) data.date = req.body.date;
    if (req.body.thumbnail) data.thumbnail = req.body.thumbnail;
    if (req.body.media) data.media = req.body.media;
    if (req.body.abstract) data.abstract = req.body.abstract;
    if (req.body.content) data.content = req.body.content;
    if (req.body.tags) data.tags = req.body.tags;
    if (req.body.extensions) data.extensions = req.body.extensions;
  } else {
    data.status = req.body.status;
    data.deleted = req.body.deleted;
    data.category = req.body.category;
    data.title = req.body.title;
    data.alias = req.body.alias;
    data.date = req.body.date;
    data.thumbnail = req.body.thumbnail;
    data.media = req.body.media || [];
    data.abstract = req.body.abstract;
    data.content = req.body.content;
    data.tags = req.body.tags || [];
    data.extensions = req.body.extensions || {};
  }

  var query = {
    data: data
  };

  if (req.params.content) {
    query._id = req.params.content;
  } else if (req.body.contentIds) {
    query.ids = req.body.contentIds;
  }

  contentsService.save(query, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};

/**
 * 删除内容
 * @param {Object} req
 *        {MongoId} req.params.content
 *        {[MongoId]} req.query.ids
 * @param {Object} res
 */
exports.remove = function (req, res) {
  if (req.params.content) {
    req.checkParams({
      'content': {
        notEmpty: {
          options: [true],
          errorMessage: 'content 不能为空'
        },
        isMongoId: { errorMessage: 'content 需为 mongoId' },
      }
    });
  } else {
    req.checkQuery({
      'ids': {
        notEmpty: {
          options: [true],
          errorMessage: 'ids 不能为空'
        },
        inArray: {
          options: ['isMongoId'],
          errorMessage: 'ids 内需为 mongoId'
        }
      }
    });
  }

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var query = {};

  if (req.params.content) {
    query._id = req.params.content;
  } else {
    query.ids = req.query.ids;
  }

  contentsService.remove(query, function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};