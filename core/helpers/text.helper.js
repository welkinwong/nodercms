var _ = require('lodash');

module.exports = function (context, options) {
  if (!options) {
    return logger.system().error(__filename, 'options 不能为空');
  }

  var truncate = parseInt(options.hash.words, 10) || 280;

  return _.truncate(context, { length: truncate });
};