var logger = require('../../lib/logger');
var usersModel = require('../models/usersModel');

module.exports = function (authority) {
  return function (req, res, next) {
    usersModel.findById(req.session.user._id)
      .populate('role')
      .exec(function (err, user) {
        if (err) {
          logger.database().error(__dirname, err);
          return res.status(500).end();
        }

        if (user) {
          for (var i = 0; i < user.role.authorities.length; i++) {
            if (user.role.authorities[i] === 100000 || authority === user.role.authorities[i]) {
              return next();
            }
          }

          return res.status(401).json({
            error: {
              code   : 'NO_AUTHORITY',
              message: '没有权限'
            }
          });
        } else {
          res.status(404).json({
            error: {
              code: 'USER_NOT_FOUND',
              message: '找不到用户或用户不存在'
            }
          });
        }
      });
  };
};