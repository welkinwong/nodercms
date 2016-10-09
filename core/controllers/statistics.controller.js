var os = require('os');
var _ = require('lodash');
var async = require('async');
var request = require('request');
var mongoose = require('mongoose');
var port = require('../../lib/port.lib.js')();
var packageInfo = require('../../package.json');

/**
 * 统计数据
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  res.status(204).end();

  var hostname = req.body.hostname;

  async.parallel({
    mongodb: function (callback) {
      var mongodbAdmin = new mongoose.mongo.Admin(mongoose.connection.db);

      mongodbAdmin.buildInfo(function (err, info) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback(null, _.pick(info, 'version').version);
      });
    }
  }, function (err, results) {
    var data = {
      hostname: hostname,
      port: port,
      version: packageInfo.version,
      os: {
        type: os.type(),
        version: os.release()
      },
      node: process.versions.node,
      mongodb: results.mongodb
    };

    request({
      url: 'http://console.nodercms.com/openApi/sites',
      method: 'POST',
      body: data,
      json: true
    });
  });
};