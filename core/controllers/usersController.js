var async = require('async');
var logger = require('../../lib/logger');
var rolesModel = require('../models/rolesModel');
var usersModel = require('../models/usersModel');

module.exports = {
  query: function (req, res) {
    usersModel.find(req.query, '-password', function (err, users) {
      if (err) {
        logger.system().error(__dirname, err);
        return res.status(500).end();
      }

      res.status(200).json(users);
    });
  }
};