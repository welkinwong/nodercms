var path = require('path');
var router = require('express').Router();
var requireAll = require('require-all');
var logger = require('./logger');
var routerTable = require('../core/router');

/**
 * 读取控制器
 */
var controllers = requireAll({
  dirname: path.join(__dirname, '../core/controllers/'),
  filter: /(.+Controller)\.js$/,
  excludeDirs: /^\.(git|svn)$/
});

function checkType (value) {
  switch (true) {
    case typeof value === 'string':
      return 'string';
    case typeof value === 'object' && !Array.isArray(value):
      return 'object';
    case Array.isArray(value):
      return 'array';
    default:
      return false;
  }
}

function bindController (match, key, route) {
  if (!match) {
    logger.system().error('route-map.js', '路由“' + route + '”格式不正确');
  } else if (!controllers[controller]) {
    logger.system().error('route-map.js', '找不到控制器“' + controller + '”');
  } else if (!controllers[controller][action] && typeof controllers[controller] !== 'function') {
    logger.system().error('route-map.js', '找不到控制器“' + controller + '.' + action + '”');
  } else if (!controllers[controller][action] && typeof controllers[controller] === 'function') {
    router[key](route, controllers[controller]);
  } else {
    router[key](route, controllers[controller][action]);
  }
}

/**
 * 绑定控制器
 * @param  {String} Key
 * @param  {String} Value
 */
(function routeMap(map, route) {
  route = route || '';
  for (var key in map) {
    var type = checkType(map[key]);

    if (type === 'object') {
      // { '/path': { ... }}
      routeMap(map[key], route + key);
    } else {
      var match;
      var controller;
      var action;
      var authority;

      if (type === 'string') {
        // get: function(){ ... }

        // 获取控制器和动作
        controller = map[key].split('.')[0];
        action = map[key].split('.')[1];
      } else if (type === 'array') {
        // get: [10000, function(){ ... }]

        // 获取权限
        authority = map[key][0];
        router[key](route, controllers.validationController(authority));

        if (map[key][1]) {
          // 获取控制器和动作
          controller = map[key][1].split('.')[0];
          action = map[key][1].split('.')[1];
        }
      }

      if (action) {
        router[key](route, controllers[controller][action]);
      } else if (controller) {
        router[key](route, controllers[controller]);
      }
    }
  }
})(routerTable);

module.exports = router;