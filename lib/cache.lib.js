var lru = require('lru-cache');

/**
 * 缓存
 */
var options = {
  max: 500,
  maxAge: 1000 * 60 * 60
};

module.exports = lru(options);