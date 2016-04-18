var logger = require('../../lib/logger.lib');
var usersService = require('../services/users.service');

module.exports = {
  get: function (req, res) {
    req.checkQuery({
      'email': {
        optional: true,
        isEmail: { errorMessage: 'email 格式不正确' }
      }
    });

    if (req.validationErrors()) {
      logger.system().error(__filename, '参数验证失败', req.validationErrors());
      return res.status(400).end();
    }

    var query = {};

    if (req.query.email) query.email = req.query.email;

    usersService.one(query, function (err, user) {
      if (err) {
        logger.system().error(__filename, err);
        return res.status(500).end();
      }

      res.status(200).json(user);
    });
  }
};