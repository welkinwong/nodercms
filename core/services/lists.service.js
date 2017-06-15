var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var categories = require('../models/categories.model');
var contents = require('../models/contents.model');
var contentsService = require('../services/contents.service');

/**
 * 所有内容列表
 * @param {Function} callback
 */
exports.all = function (callback) {
  async.waterfall([
    function (callback) {
      categories
        .find({ type: { $in: ['channel', 'column'] } })
        .select('type name path isShow sort')
        .sort('sort')
        .lean()
        .exec(callback);
    },
    function (list, callback) {
      var source = _.partition(list, function(category) {
        return category.path.split('/').length === 2;
      });

      var categories = _.sortBy(source[0], 'sort');
      var otherCategories = source[1];

      _.forEach(categories, function (category) {
        if (category.type === 'channel') {
          var source = _.partition(otherCategories, function (otherCategory) {
            return new RegExp('^' + category.path + '/').test(otherCategory.path);
          });

          if (!_.isEmpty(source[0])) {
            category.node = _.map(_.sortBy(source[0], 'sort'), '_id');
          }

          otherCategories = source[1];
        }
      });

      callback(null, categories);
    },
    function (categories, callback) {
      async.map(categories, function (category, callback) {
        if (category.node) {
          contents.find({ category: { $in: category.node }, status: 'pushed', deleted: false })
            .sort('-date')
            .limit(50)
            .select('category title alias user date reading thumbnail')
            .populate('category', 'name path')
            .populate('user', 'nickname email')
            .populate('thumbnail', 'fileName description date src')
            .exec(function (err, contents) {
              if (err) return callback(err);

              category.contents = _.map(contents, function (content) {
                if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;

                content = content.toObject();
                if (_.get(content, 'category.path')) content.href =  content.category.path + '/' + content.alias;

                if (content.thumbnail) content.thumbnail.src = thumbnailSrc;

                delete content.alias;

                return content;
              });

              callback(null, category);
            });
        } else {
          contents.find({ category: category._id, status: 'pushed', deleted: false, date: { $lte: new Date() } })
            .sort('-date')
            .limit(50)
            .select('category title alias user date reading thumbnail')
            .populate('category', 'name path')
            .populate('user', 'nickname email')
            .populate('thumbnail', 'fileName description date')
            .exec(function (err, contents) {
              if (err) return callback(err);

              category.contents = _.map(contents, function (content) {
                if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;

                content = content.toObject();
                if (_.get(content, 'category.path')) content.href = content.category.path + '/' + content.alias;

                if (content.thumbnail) content.thumbnail.src = thumbnailSrc;

                delete content.alias;

                return content;
              });

              callback(null, category);
            });
        }
      }, callback);
    }
  ], function (err, list) {
    if (err) err.type = 'database';

    callback(err, list);
  });
};

/**
 * 频道内容列表
 * @param {Object} options
 *        {String} options.path
 * @param {Function} callback
 */
exports.channel = function (options, callback) {
  async.waterfall([
    function (callback) {
      var regex = new RegExp('^' + options.path, 'i');

      categories
        .find({ path: regex, type: 'column' })
        .select('name path sort type isShow')
        .sort('sort')
        .lean()
        .exec(callback);
    },
    function (columns, callback) {
      async.map(columns, function (column, callback) {
        contents.find({ category: column._id, status: 'pushed', deleted: false, date: { $lte: new Date() } })
          .sort('-date')
          .limit(50)
          .select('category title alias user date reading thumbnail abstract extensions')
          .populate('category', 'name path')
          .populate('user', 'nickname email')
          .populate('thumbnail', 'fileName description date')
          .exec(function (err, contents) {
            if (err) return callback(err);

            column.contents = _.map(contents, function (content) {
              if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;

              content = content.toObject();
              if (_.get(content, 'category.path')) content.href = content.category.path + '/' + content.alias;

              if (content.thumbnail) content.thumbnail.src = thumbnailSrc;

              delete content.alias;

              return content;
            });

            callback(null, column);
          });
      }, callback);
    }
  ], function (err, list) {
    if (err) err.type = 'database';

    callback(err, list);
  });
};

/**
 * 栏目内容列表
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.column = function (options, callback) {
  if (!options._id) {
    var err = {
      type: system,
      error: '没有 _id 传入'
    };
    return callback();
  }

  var _id = options._id;
  var pageSize = options.pageSize || 50;
  var currentPage = 1;

  if (!isNaN(options.currentPage)) currentPage = options.currentPage;

  contentsService.list({ _id: _id, status: 'pushed', deleted: false, pageSize: pageSize, currentPage: currentPage, date: { '$lte': new Date() } }, function (err, result) {
    if (err) return callback(err);

    var pagesList = [];

    switch (true) {
      case result.pages <= 7:
        for (var i = 0; i < result.pages; i++) {
          pagesList[i] = {
            name: i + 1,
            index: i + 1
          };
        }

        break;
      case currentPage <= 3:
        pagesList = [
          { name: 1, index: 1 },
          { name: 2, index: 2 },
          { name: 3, index: 3 },
          { name: 4, index: 4 },
          { name: 5, index: 5 },
          { name: 6, index: 6 },
          { name: '...' + result.pages, index: result.pages }
        ]

        break;
      case currentPage > 3 && currentPage <= result.pages - 3:
        pagesList.push({ name: '1...', index: 1 });
        for (var i = currentPage - 2; i <= currentPage + 2; i++) {
          pagesList.push({ name: i, index: i });
        }
        pagesList.push({ name: '...' + result.pages, index: result.pages });

        break;
      case currentPage > result.pages - 3:
        pagesList.push({ name: '1...', index: 1 });
        for (var i = result.pages - 5; i <= result.pages; i++) {
          pagesList.push({ name: i, index: i });
        }
    }

    result.pagination = _.map(pagesList, function (item) {
      if (item.index === currentPage) item.active = true;
      return item;
    });

    delete result.pages;

    callback(null, result);
  });
};

/**
 * 阅读列表
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.sort
 *        {Number} options.limit
 * @param {Function} callback
 */
exports.reading = function (options, callback) {
  var query = { status: 'pushed', deleted: false, date: { $lte: new Date() }  };
  var sort = '-reading.total';
  var limit = options.limit || 50;

  if (options._id) query.category = options._id;

  if (options.sort) {
    sort = options.sort;

    switch (sort) {
      case '-reading.day':
        query['reading.createAt.day'] = { $gte: new Date(moment(000000, 'hhmmss').format()) };
        break;
      case '-reading.week':
        query['reading.createAt.week'] = { $gte: new Date(moment(000000, 'hhmmss').isoWeekday(1).format()) };
        break;
      case '-reading.month':
        query['reading.createAt.month'] = { $gte: new Date(moment(000000, 'hhmmss').set('date', 1).format()) };
    }
  }

  if (options.path) {
    async.waterfall([
      function (callback) {
        var regex = new RegExp('^' + options.path, 'i');

        categories
          .find({ path: regex, type: 'column' })
          .select('name path sort type isShow')
          .lean()
          .exec(callback);
      },
      function (columns, callback) {
        var columnIds = _.map(columns, '_id');
        query.category = { $in: columnIds };

        contents.find(query)
          .sort(sort)
          .limit(limit)
          .select('category title alias user date reading thumbnail')
          .populate('category', 'name path')
          .populate('user', 'nickname email')
          .populate('thumbnail', 'fileName description date')
          .exec(function (err, contents) {
            if (err) return callback(err);

            contents = _.map(contents, function (content) {
              if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;

              content = content.toObject();
              if (_.get(content, 'category.path')) content.href = content.category.path + '/' + content.alias;

              if (content.thumbnail) content.thumbnail.src = thumbnailSrc;

              delete content.alias;
              delete content.reading.createAt;

              return content;
            });

            callback(null, contents);
          });
      }
    ], function (err, list) {
      if (err) err.type = 'database';

      callback(err, list);
    });
  } else {
    contents.find(query)
      .sort(sort)
      .limit(limit)
      .select('category title alias user date reading thumbnail')
      .populate('category', 'name path')
      .populate('user', 'nickname email')
      .populate('thumbnail', 'fileName description date')
      .exec(function (err, contents) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        contents = _.map(contents, function (content) {
          if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;

          content = content.toObject();
          if (_.get(content, 'category.path')) content.href = content.category.path + '/' + content.alias;

          if (content.thumbnail) content.thumbnail.src = thumbnailSrc;

          delete content.alias;
          delete content.reading.createAt;

          return content;
        });

        callback(null, contents);
      });
  }
};

/**
 * 搜索列表
 * @param {Object} options
 *        {MongoId} options.words
 * @param {Function} callback
 */
exports.search = function (options, callback) {
  var words = options.words || '';
  var pageSize = options.pageSize || 50;
  var currentPage = 1;

  if (!isNaN(options.currentPage)) currentPage = options.currentPage;

  contentsService.list({ words: words, status: 'pushed', deleted: false, pageSize: pageSize, currentPage: currentPage, date: { '$lte': new Date() } }, function (err, result) {
    if (err) return callback(err);

    var pagesList = [];

    switch (true) {
      case result.pages <= 7:
        for (var i = 0; i < result.pages; i++) {
          pagesList[i] = {
            name: i + 1,
            index: i + 1
          };
        }

        break;
      case currentPage <= 3:
        pagesList = [
          { name: 1, index: 1 },
          { name: 2, index: 2 },
          { name: 3, index: 3 },
          { name: 4, index: 4 },
          { name: 5, index: 5 },
          { name: 6, index: 6 },
          { name: '...' + result.pages, index: result.pages }
        ]

        break;
      case currentPage > 3 && currentPage <= result.pages - 3:
        pagesList.push({ name: '1...', index: 1 });
        for (var i = currentPage - 2; i <= currentPage + 2; i++) {
          pagesList.push({ name: i, index: i });
        }
        pagesList.push({ name: '...' + result.pages, index: result.pages });

        break;
      case currentPage > result.pages - 3:
        pagesList.push({ name: '1...', index: 1 });
        for (var i = result.pages - 5; i <= result.pages; i++) {
          pagesList.push({ name: i, index: i });
        }
    }

    result.pagination = _.map(pagesList, function (item) {
      if (item.index === currentPage) item.active = true;
      return item;
    });

    delete result.pages;

    callback(null, result);
  });
};