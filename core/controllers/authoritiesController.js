var config = require('../../config/authorities');

module.exports = function (req, res) {
  res.status(200).json(config);
};