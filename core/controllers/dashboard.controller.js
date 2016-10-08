var os = require('os');
var async = require('async');
var _ = require('lodash');
var packageInfo = require('../../package.json');
var listsService = require('../services/lists.service');
var contentsService = require('../services/contents.service');
var mediaService = require('../services/media.service');
var usersService = require('../services/users.service');
var mongoose = require('mongoose');

/**
 * 控制面板数据
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  async.parallel({
    systemInfo: function (callback) {
      var system = {
        version: packageInfo.version,
        osType: os.type(),
        osRelease: os.release(),
      };

      callback(null, system);
    },
    nodeInfo: function (callback) {
      var nodeInfo = process.versions;

      callback(null, nodeInfo);
    },
    databaseInfo: function (callback) {
      var mongodbAdmin = new mongoose.mongo.Admin(mongoose.connection.db);

      mongodbAdmin.buildInfo(function (err, info) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback(null, _.pick(info, 'version'));
      });
    },
    contentsTotal: contentsService.total,
    mediaTotal: mediaService.total,
    adminsTotal: function (callback) {
      usersService.total({ type: 'admin' }, callback);
    },
    readingTotal: function (callback) {
      listsService.reading({ limit: 5 }, callback);
    },
    readingDay: function (callback) {
      listsService.reading({ sort: '-reading.day', limit: 5 }, callback);
    },
    readingWeek: function (callback) {
      listsService.reading({ sort: '-reading.week', limit: 5 }, callback);
    },
    readingMonth: function (callback) {
      listsService.reading({ sort: '-reading.month', limit: 5 }, callback);
    }
  }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    var data = {
      systemInfo: results.systemInfo,
      nodeInfo: results.nodeInfo,
      databaseInfo: results.databaseInfo,
      contentsTotal: results.contentsTotal,
      mediaTotal: results.mediaTotal,
      adminsTotal: results.adminsTotal,
      readingList: {
        total: results.readingTotal,
        day: results.readingDay,
        week: results.readingWeek,
        month: results.readingMonth
      }
    };

    res.status(200).json(data);
  });
};