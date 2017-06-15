var async = require('async');
var _ = require('lodash');
var marked = require('marked');
var logger = require('../../lib/logger.lib');
var moment = require('moment');
var categories = require('../models/categories.model');
var contentsModel = require('../models/contents.model');
var mediaModel = require('../models/media.model');

/**
 * 单条内容
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.status
 *        {String} options.alias
 *        {Boolean} options.reading
 * @param {Function} callback
 */
exports.one = function (options, callback) {
  var query = {};
  var reading = true;
  var markdown = false;

  if (options._id) query._id = options._id;
  if (options.status) query.status = options.status;
  if (options.alias) query.alias = options.alias;
  if (_.isBoolean(options.reading)) reading = options.reading;
  if (_.isBoolean(options.markdown)) markdown = options.markdown;

  contentsModel.findOne(query)
    .select('status category title alias user date reading thumbnail media abstract content tags extensions')
    .populate('category', 'name path')
    .populate('thumbnail', 'fileName description date src')
    .populate('user', 'nickname email')
    .populate('media', 'fileName description date src')
    .exec(function (err, content) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (!content) return callback();

      async.waterfall([
        // 阅读量 +1
        function (callback) {
          if (reading) {
            exports.reading({_id: content._id}, function (err, reading) {
              if (err) return callback(err);

              if (reading) {
                callback(null, reading);
              } else {
                callback(null, null);
              }
            });
          } else {
            callback(null, null);
          }
        },
        function (reading, callback) {
          if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;
          if (!_.isEmpty(content.media)) var meiaSrc = _.map(content.media, 'src');

          content = content.toObject();
          if (_.get(content, 'category.path')) content.url = content.category.path + '/' + content.alias;

          if (reading) content.reading = reading;
          if (content.content && !markdown) content.content = marked(content.content);

          if (content.thumbnail) content.thumbnail.src = thumbnailSrc;
          if (!_.isEmpty(content.media)) {
            _.forEach(content.media, function (medium, index) {
              medium.src = meiaSrc[index];
            });
          }

          delete content.category;

          if (!markdown) delete content.alias;

          if (_.get(content, 'reading.createAt')) delete content.reading.createAt;

          callback(null, content);
        }
      ], callback);
    });
};

/**
 * 多条内容
 * @param {Object} options
 *        {MongoId} options._id
 *        {Boolean} options.deleted
 *        {String|Array} options.type
 *        {Number} options.currentPage
 *        {Number} options.pageSize
 * @param {Function} callback
 */
exports.list = function (options, callback) {
  var query = {};
  var currentPage = 1;
  var pageSize = 50;

  if (options._id) query.category = options._id;
  if (options.words) query.title = new RegExp(options.words, 'i');
  if (options.status) query.status = options.status;
  if (_.isBoolean(options.deleted)) query.deleted = options.deleted;
  if (options.currentPage) currentPage = parseInt(options.currentPage);
  if (options.pageSize) pageSize = parseInt(options.pageSize);
  if (options.date) query.date = options.date;

  async.waterfall([
    function (callback) {
      contentsModel.count(query, function (err, count) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        if (count) {
          callback(null, count);
        } else {
          callback(null, null);
        }
      });
    },
    function (count, callback) {
      contentsModel.find(query)
        .sort('status -date')
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .select('status category title alias user date reading thumbnail abstract extensions')
        .populate('category', 'name path')
        .populate('user', 'nickname email')
        .populate('thumbnail', 'fileName description date src')
        .exec(function (err, contents) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          contents = _.map(contents, function (content) {
            if (content.thumbnail) var thumbnailSrc = content.thumbnail.src;

            content = content.toObject();
            if (_.get(content, 'category.path')) content.url = content.category.path + '/' + content.alias;

            if (content.thumbnail) content.thumbnail.src = thumbnailSrc;

            delete content.alias;

            return content;
          });

          callback(null, count, contents);
        });
    }
  ], function (err, count, contents) {
    if (err) return callback(err);

    var result = {
      contents: contents,
      pages: Math.ceil(count / pageSize)
    };

    callback(err, result);
  });
};

/**
 * 内容总数
 * @param {Function} callback
 */
exports.total = function (callback) {
  contentsModel.count({}, function (err, count) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    callback(null, count);
  });
};

/**
 * 增加阅读数
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.reading = function (options, callback) {
  if (!options._id) return callback(null);

  contentsModel.findById(options._id)
    .exec(function (err, content) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (!content) return callback();

      content.reading.total = content.reading.total + 1;

      if (content.reading.createAt.day <= new Date(moment(000000, 'hhmmss').format())) {
        content.reading.day = 1;
        content.reading.createAt.day = new Date();
      } else {
        content.reading.day = content.reading.day + 1;
      }

      if (content.reading.createAt.week <= new Date(moment(000000, 'hhmmss').isoWeekday(1).format())) {
        content.reading.week = 1;
        content.reading.createAt.week = new Date();
      } else {
        content.reading.week = content.reading.week + 1;
      }

      if (content.reading.createAt.month <= new Date(moment(000000, 'hhmmss').set('date', 1).format())) {
        content.reading.month = 1;
        content.reading.createAt.month = new Date();
      } else {
        content.reading.month = content.reading.month + 1;
      }

      content.save(function (err) {
        if (err) logger.database().error(__filename, err);
      });

      callback(null, content.toObject().reading);
    });
};

/**
 * 检查别名
 * @param {Object} options
 *        {String} options.alias
 * @param {Function} callback
 */
exports.checkAlias = function (options, callback) {
  if (!options.alias) {
    return callback({
      type: 'system',
      error: 'alias 不能为空'
    });
  }

  contentsModel.find({
    alias: {
      $in: [options.alias, new RegExp('^' + options.alias + '-\\d+$')]
    }
  }, 'alias', function (err, contents) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    if (contents.length === 0 || (contents.length === 1 && contents[0]._id.toString() === options._id)) {
      callback(null, options.alias);
    } else {
      var aliasSuffix = [];

      for (var i = 0; i < contents.length; i++) {
        var suffix = contents[i].alias.match(/-(\d+)$/);
        if (suffix) aliasSuffix.push(suffix[1]);
      }

      if (aliasSuffix.length > 0) {
        options.alias = options.alias + '-' + (Number(Math.max.apply(null, aliasSuffix)) + 1);
      } else {
        options.alias = options.alias + '-2';
      }

      callback(null, options.alias);
    }
  });
};

/**
 * 存储内容
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.data
 *        {Boolean} options.multi
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

  var data = options.data;
  var _id = options._id;
  var ids = options.ids;

  if (ids) {
    contentsModel.update({ $in: { _id: ids } }, data, { multi: true, runValidators: true }, function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
  } else if (_id) {
    async.auto({
      checkAlias: function (callback) {
        if (!data.alias) return callback();

        exports.checkAlias({
          _id: _id,
          alias: data.alias
        }, function (err, alias) {
          if (err) callback(err);

          data.alias = alias;

          callback();
        });
      },
      updateContent: ['checkAlias', function (callback) {
        contentsModel.findByIdAndUpdate(_id, data, { runValidators: true }, function (err, oldContent) {
          callback(err, oldContent);
        });
      }],
      pullMedia: ['updateContent', function (callback, results) {
        if (!data.media) return callback();

        var oldMedia = results.updateContent.media;
        var newMedia = data.media;
        var oldThumbnail = results.updateContent.thumbnail;
        var newThumbnail = data.thumbnail;

        // 待解除引用列表
        // 相比旧的 media 缺少的部分
        var pullMedia = _.difference(_.map(oldMedia, function (medium) {
          return medium.toString()
        }), newMedia);

        if (oldThumbnail) {
          var isQuote = _.find(newMedia, function (medium) {
            return medium === oldThumbnail.toString();
          });

          if (!isQuote) pullMedia.push(oldThumbnail.toString());
        }

        if (newThumbnail) {
          _.pull(pullMedia, newThumbnail);
        }

        mediaModel.update({ _id: { $in: pullMedia } }, { $pull: { quotes: _id } }, {
          multi: true,
          runValidators: true
        }, function (err) {
          callback(err);
        });
      }],
      addMedia: ['updateContent', function (callback, results) {
        if (!data.media) return callback();

        var oldMedia = results.updateContent.media;
        var newMedia = data.media;
        var oldThumbnail = results.updateContent.thumbnail;
        var newThumbnail = data.thumbnail;

        var addMedia = _.difference(newMedia, _.map(oldMedia, function (medium) {
          return medium.toString()
        }));

        if (newThumbnail && oldThumbnail && newThumbnail === oldThumbnail.toString()) {
          _.pull(addMedia, newThumbnail);
        }

        if ((newThumbnail && !oldThumbnail) || (oldThumbnail && (newThumbnail !== oldThumbnail.toString()))) {
          addMedia.push(newThumbnail);
        }

        mediaModel.update({ _id: { $in: addMedia } }, { $addToSet: { quotes: _id } }, {
          multi: true,
          runValidators: true
        }, function (err) {
          callback(err);
        });
      }]
    }, function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
  } else {
    async.auto({
      checkAlias: function (callback) {
        exports.checkAlias({ alias: data.alias }, function (err, alias) {
          if (err) callback(err);

          data.alias = alias;

          callback();
        });
      },
      saveContent: ['checkAlias', function (callback) {
        new contentsModel(data).save(function (err, content) {
          callback(err, content);
        });
      }],
      updateMedia: ['saveContent', function (callback, results) {
        if (data.thumbnail) {
          data.media = data.media || [];
          data.media.push(data.thumbnail);
        }

        mediaModel.update({ _id: { $in: _.uniq(data.media) } }, { $addToSet: { quotes: results.saveContent._id } }, {
          multi: true,
          runValidators: true
        }, function (err) {
          callback(err);
        });
      }]
    }, function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
  }
};

/**
 * 删除内容
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  if (!options._id && !options.ids) {
    var err = {
      type: 'system',
      error: '没有 _id 或 ids 传入'
    };

    return callback(err);
  }

  var _id = options._id;
  var ids = options.ids;

  if (ids) {
    async.auto({
      contents: function (callback) {
        contentsModel.find({ _id: { $in: ids } })
          .select('_id thumbnail media')
          .lean()
          .exec(callback);
      },
      removeContents: ['contents', function (callbac, results) {
        async.eachLimit(results.contents, 100, function (content, callback) {
          contentsModel.remove({ _id: { $in: ids } }, callback);
        }, callback);
      }],
      updateMedia: ['contents', function (callback, results) {
        async.eachLimit(results.contents, 20, function (content, callback) {
          if (content.thumbnail) content.media.push(content.thumbnail);

          mediaModel.update({ _id: { $in: content.media } }, { $pull: { quotes: content._id } }, {
            multi: true,
            runValidators: true
          }, callback);
        }, callback);
      }]
    }, function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
  } else {
    contentsModel.findById(_id)
      .exec(function (err, content) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        if (!content) return callback();

        if (content.deleted === false) {
          content.deleted = true;
          content.save(function (err) {
            if (err) {
              err.type = 'database';
              return callback(err);
            }

            callback();
          });
        } else {
          async.waterfall([
            function (callback) {
              contentsModel.findByIdAndRemove(_id, function (err, oldContent) {
                callback(err, oldContent.toObject());
              });
            },
            function (oldContent, callback) {
              if (oldContent.thumbnail) oldContent.media.push(oldContent.thumbnail);

              mediaModel.update({_id: {$in: oldContent.media}}, {$pull: {quotes: _id}}, {
                multi: true,
                runValidators: true
              }, function (err) {
                callback(err);
              });
            }
          ], function (err) {
            if (err) {
              err.type = 'database';
              return callback(err);
            }

            callback();
          });
        }
      });
  }
};