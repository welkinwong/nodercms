var async = require('async');
var _ = require('lodash');
var cache = require('../../lib/cache.lib');
var categoriesModel = require('../models/categories.model');
var contentsModel = require('../models/contents.model');
var mediaModel = require('../models/media.model');
var contentsService = require('../services/contents.service');

/**
 * 所有分类
 * @param {Function} callback
 */
exports.all = function (callback) {
  var categoriesCache = cache.get('categories');

  if (categoriesCache) {
    callback(null, _.cloneDeep(categoriesCache));
  } else {
    categoriesModel.find({})
      .select('type name path isShow sort model views keywords description mixed')
      .populate('model', 'type name description mixed system extensions')
      .populate('mixed.pageMedia', 'fileName description date src')
      .exec(function (err, categories) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        // 删除非单页分类的 pageMedia
        _.map(categories, function (category) {


          if (category.type !== 'page' && category.mixed) delete category.mixed.pageMedia;
        });

        categories = _.map(categories, function (category) {
          if (category.type === 'page' && !_.isEmpty(category.mixed.pageMedia)) var mediaSrc = _.map(category.mixed.pageMedia, 'src');

          category = category.toObject();

          if (category.type === 'page' && !_.isEmpty(category.mixed.pageMedia)) {
            _.forEach(category.mixed.pageMedia, function (medium, index) {
              medium.src = mediaSrc[index];
            });
          }

          if (category.type !== 'page' && category.mixed) delete category.mixed.pageMedia; // 删除非单页分类的 pageMedia

          return category;
        });

        cache.set('categories', categories, 1000 * 60 * 60 * 24);

        callback(err, categories);
      });
  }
};

/**
 * 所有分类按树输出
 * @param {Function} callback
 */
exports.tree = function (callback) {
  async.waterfall([
    exports.all,
    function (list, callback) {
      var source = _.partition(list, function(category) {
        if (category.path) {
          return category.path.split('/').length === 2;
        } else if (_.get(category, 'mixed.prePath')) {
          return category.mixed.prePath.split('/').length === 2;
        }
      });

      var categories = _.sortBy(source[0], 'sort');
      var otherCategories = source[1];

      if (_.isEmpty(categories)) {
        return callback(null, null);
      }

      function loop (nodes) {
        return _.map(nodes, function (category) {
          var source = _.partition(otherCategories, function(otherCategory) {
            if (otherCategory.path) {
              return new RegExp('^' + category.path + '/[A-z0-9\-\_]+$').test(otherCategory.path);
            } else if (_.get(otherCategory, 'mixed.prePath')) {
              return new RegExp('^' + category.path + '/$').test(otherCategory.mixed.prePath);
            }
          });

          otherCategories = source[1];

          if (!_.isEmpty(source[0])) {
            category.nodes = loop(_.sortBy(source[0], 'sort'));
          }

          return category;
        });
      }

      var tree = loop(categories);

      callback(null, tree);
    }
  ], callback);
};

/**
 * 导航
 * @param {Object} options
 *        {String} options.current
 * @param {Function} callback
 */
exports.navigation = function (options, callback) {
  async.waterfall([
    exports.tree,
    function (tree, callback) {
      tree = tree || [];

      tree.unshift({
        name: '首页',
        path: '/',
        isShow: true
      });

      callback(null, tree);
    },
    function (tree, callback) {
      function loop (nodes) {
        return _.map(nodes, function (category) {
          if (category.path && category.path !== '/') {
            var regex = new RegExp('^' + category.path);

            category.current = regex.test(options.current);
          } else if (category.path && category.path === '/' && category.path === options.current) {
            category.current = true;
          } else {
            category.current = false;
          }

          if (category.node) {
            category.nodes = loop(category.nodes);
          }

          return category;
        });
      }

      var navigation = loop(tree);

      callback(null, navigation);
    }
  ], callback);
};

/**
 * 单个分类
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.path
 *        {String} options.type
 * @param {Function} callback
 */
exports.one = function (options, callback) {
  var query = {};

  if (options._id) query._id = options._id;
  if (options.path) query.path = options.path;
  if (options.type) query.type = options.type;

  exports.all(function (err, categories) {
    if (err) return callback(err);

    var category = _(categories)
      .map(function (category) {
        category._id = category._id.toString();
        return category;
      })
      .find(query);

    if (category) {
      var path = '';

      if (category.path) {
        path = category.path;
      } else if (_.get(category, 'mixed.prePath')) {
        path = category.mixed.prePath;
      } else {
        var err = {
          type: 'system',
          error: '没有 category.path 和 category.mixed.prePath'
        };
        return callback(err);
      }

      category.breadcrumb = _(path.split('/'))
        .tail()
        .initial()
        .map(function (subPath) {
          return _.pick(_.find(categories, function (category) {
            var regex = new RegExp('\/' + subPath + '$');
            return regex.test(category.path);
          }), ['name', 'path']);
        })
        .value();

      callback(null, category);
    } else {
      callback(null, null);
    }
  });
};

/**
 * 保存分类
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (!options.data) {
    var err = {
      type: 'system',
      error: '没有 data 传入'
    };

    return callback(err);
  }

  var _id = options._id;
  var data = options.data;

  if (_id) {
    async.waterfall([
      function (callback) {
        categoriesModel.findByIdAndUpdate(_id, data, { runValidators: true }, function (err, category) {
          if (err) return callback(err);

          callback(null, category);
        });
      },
      function (oldCategory, callback) {
        if (data.type === 'link') return callback();
        if (data.path === oldCategory.path) return callback();

        var regex = new RegExp('^' + oldCategory.path + '/');

        categoriesModel.find({ $or: [ { path: regex }, { 'mixed.prePath': regex } ] }, function (err, categories) {
          if (err) return callback(err);

          async.each(categories, function (category) {
            if (category.type === 'link' && _.get(category, 'mixed.prePath')) {
              //不明原因，不能直接用 category.mixed.prePath =
              category.set({ mixed: {
                prePath: category.mixed.prePath.replace(oldCategory.path, data.path)
              } })
            } else if (category.path) {
              category.path = category.path.replace(oldCategory.path, data.path);
            }

            category.save(function (err) { callback(err) });
          }, function (err) {
            if (err) return callback(err);

            callback();
          });
        });
      }
    ], function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      cache.del('categories');

      callback();
    });
  } else {
    async.waterfall([
      // 检查上级分类是否存在
      function (callback) {
        var prePath = '';

        var regex = /^\/[A-z0-9\_\-\/]+(?=[\/])/;

        if (data.path) {
          var prePathRegex = _.get(regex.exec(data.path), '[0]');

          if (!prePathRegex) return callback();

          prePath = prePathRegex;
        } else if (_.get(data, 'mixed.prePath')) {
          var dataPrePath = _.get(data, ['mixed.prePath']);
          var prePathRegex = _.get(regex.exec(dataPrePath), '[0]');

          if (!prePathRegex) return callback();

          prePath = prePathRegex;
        } else {
          var err = {
            type: 'system',
            error: '未找到 data.path 和 data.mixed.prePath'
          };
          return callback(err);
        }

        categoriesModel.count({ $or: [ { path: prePath }, { 'mixed.prePath': prePath } ] }, function (err, count) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          if (!count) {
            var err = {
              type: 'system',
              error: '上级分类不存在'
            };
            return callback(err);
          }

          callback();
        });
      },
      function (callback) {
        new categoriesModel(data).save(function (err, category) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback(null, category);
        });
      }
    ], function (err, category) {
      if (err) return callback(err);

      cache.del('categories');

      callback(null, category);
    });
  }
};

/**
 * 删除分类
 * @param {Object} options
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  if (!options._id) {
    var err = {
      type: 'system',
      error: '没有 id 传入'
    };

    return callback(err);
  }

  var _id = options._id;

  async.auto({
    // 删除当前分类
    removeCurrent: function (callback) {
      categoriesModel.findByIdAndRemove(_id, function (err, category) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        // 没有查到则结束
        if (!category) return callback();

        callback(null, category);
      });
    },
    // 删除分类包含的链接分类
    removeAftLink: ['removeCurrent', function (callback, results) {
      // 链接分类下不会有分类
      if (results.removeCurrent.type === 'link') return callback();

      var regex = new RegExp('^' + results.removeCurrent.path, 'i');

      categoriesModel.remove({ 'mixed.prePath': regex, type: 'link' }, function (err) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback();
      });
    }],
    // 删除分类包含的栏目和单页分类
    removeAftColumnsAndPages: ['removeCurrent', function (callback, results) {
      // 链接分类下不会有分类
      if (results.removeCurrent.type === 'link') return callback();

      var regex = new RegExp('^' + results.removeCurrent.path, 'i');

      categoriesModel.find({ path: regex, type: { $in: ['column', 'page'] } }, function (err, categories) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        // 没有结果则结束
        if (!categories) return callback();

        categoriesModel.remove({ _id: { $in: _.map(categories, '_id') } }, function (err) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback(null, categories);
        });
      });
    }],
    // 删除当前栏目和包含的栏目分类下所有内容和媒体引用
    removeContentAndMedia: ['removeCurrent', 'removeAftColumnsAndPages', function (callback, results) {
      var categoryIds = [];

      if (results.removeCurrent.type === 'column') categoryIds.push(_id);
      categoryIds = _.concat(categoryIds, _(results.removeAftColumnsAndPages).filter({ type: 'column' }).map('_id').value());

      contentsModel.find({ category: { $in: categoryIds } })
        .select('_id')
        .lean()
        .exec(function (err, categories){
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          var ids = _.map(categories, '_id');

          contentsService.remove({ ids: ids }, function (err) {
            if (err) {
              err.type = 'database';
              return callback(err);
            }

            callback();
          });
        });
    }],
    // 删除当前单页和包含的单页分类下的媒体引用
    removePageMedia: ['removeCurrent', 'removeAftColumnsAndPages', function (callback, results) {
      // 链接分类下不会有分类
      if (results.removeCurrent.type === 'link') return callback();

      var pages = [];

      if (results.removeCurrent.type === 'page') pages.push(results.removeCurrent);

      pages = _.concat(pages, _(results.removeAftColumnsAndPages).filter({ type: 'page' }));

      async.eachLimit(pages, 20, function (item, callback) {
        var media = [];

        if (_.get(item, 'mixed.pageMedia[0]')) {
          media = item.mixed.pageMedia;
        }

        // media 为空则结束
        if (_.isEmpty(media)) return callback();

        mediaModel.update({ _id: { $in: media } }, { $pull: { quotes: item._id } }, { multi: true, runValidators: true }, callback);
      }, function (err) {
        if (err) err.type = 'database';

        callback(err);
      });
    }]
  }, function (err) {
    if (err) return callback(err);

    cache.del('categories');

    callback(null);
  });
};