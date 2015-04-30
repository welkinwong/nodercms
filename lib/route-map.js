var path = require('path');
var router = require('express').Router();
var requireAll = require('require-all');
var logger = require('./log4js').logger('System');
var routerTable = require('../core/router');

/**
 * 读取控制器
 */
var controllers = requireAll({
  dirname: path.join(__dirname, '../core/controllers/'),
  filter: /(.+Controller)\.js$/,
  excludeDirs: /^\.(git|svn)$/
});

/**
 * 绑定控制器
 * @param  {String} Key
 * @param  {String} Value
 */
(function routeMap(map, route) {
  route = route || '';
  for (var key in map) {
    switch (typeof map[key]) {
      // { '/path': { ... }}
      case 'object':
        routeMap(map[key], route + key);
        break;
      // get: function(){ ... }
      case 'string':
        // 获取控制器
        var match = map[key].match(/^(\w+\-+|\w)+/);
        var controller = match ? match[0] : null;

        // 获取控制器动作
        var action = map[key].replace(controller + '.', '');

        if (!match) {
          logger.error('route-map.js', '路由“' + route + '”格式不正确');
        } else if (!controllers[controller]) {
          logger.error('route-map.js', '找不到控制器“' + controller + '”');
        } else if (!controllers[controller][action] && typeof controllers[controller] !== 'function') {
          logger.error('route-map.js', '找不到控制器“' + controller + '.' + action + '”');
        } else if (!controllers[controller][action] && typeof controllers[controller] === 'function') {
          router[key](route, controllers[controller]);
        } else {
          router[key](route, controllers[controller][action]);
        }

        break;
    }
  }
})(routerTable);

module.exports = router;