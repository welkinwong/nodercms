var async = require('async');
var logger = require('../../lib/logger.lib');
var database = require('../../lib/database.lib');
var themes = require('../../lib/themes.lib');
var installService = require('../services/install.service');

/**
 * 根据安装状态跳转前台页面
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.access = function (req, res, next) {
  installService.status(function (err, hasInstall) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    if (hasInstall) {
      next();
    } else {
      res.sendFile('notInstalled.html', { root: './public/assets/admin/' });
    }
  });
};

/**
 * 查询安装状态
 * @param {Object} req
 * @param {Object} res
 */
exports.status = function (req, res) {
  installService.status(function (err, hasInstall) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    if (hasInstall) {
      res.status(200).json({ hasInstall: true });
    } else {
      res.status(200).json({ hasInstall: false });
    }
  });
};

/**
 * 查询主题
 * @param {Object} req
 * @param {Object} res
 */
exports.themes = function (req, res) {
  themes.get(function (err, themes) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(themes);
  });
};

/**
 * 测试数据库
 * @param {Object} req
 * 				{String} req.body.host
 * 				{Number} req.body.port
 * 				{String} req.body.db
 * 				{String} req.body.user
 * 				{String} req.body.password
 * @param {Function} res
 */
exports.testDatabase = function (req, res) {
  req.checkBody({
    'host': {
      notEmpty: {
        options: [true],
        errorMessage: 'host 不能为空'
      },
      matches: {
        options: [/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^localhost$/],
        errorMessage: 'host 格式不正确'
      }
    },
    'port': {
      notEmpty: {
        options: [true],
        errorMessage: 'port 不能为空'
      },
      isInt: {
        options: [{ min: 0, max: 65535 }],
        errorMessage: 'port 需为整数'
      }
    },
    'db': {
      notEmpty: {
        options: [true],
        errorMessage: 'database 不能为空'
      },
      isString: { errorMessage: 'database 需为字符串' }
    },
    'user': {
      notEmpty: {
        options: [true],
        errorMessage: 'user 不能为空'
      },
      isString: { errorMessage: 'user 需为字符串' }
    },
    'pass': {
      notEmpty: {
        options: [true],
        errorMessage: 'password 不能为空'
      },
      isString: { errorMessage: 'password 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var data = {
    host: req.body.host,
    port: req.body.port,
    db: req.body.db,
    user: req.body.user,
    pass: req.body.pass
  };

  async.series([
    // 检查安装状态
    function (callback) {
      installService.status(function (err, hasInstall) {
        if (err) return callback(err);

        if (hasInstall) {
          var err = {
            type: 'system',
            error: '非法调用，NoderCMS 已经安装'
          };
          return callback(err);
        }

        callback();
      });
    },
    // 测试数据库连接
    function (callback) {
      database.test(data, function (err) {
        if (err) return callback(err);

        callback();
      });
    }
  ], function (err) {
    if (err) {
      return res.status(400).end();
    }

    res.status(204).end();
  });
};

/**
 * 安装
 * @param {Object} req
 * 				{String} req.body.databaseHost
 * 				{Number} req.body.databasePort
 * 				{String} req.body.database
 * 				{String} req.body.databaseUser
 * 				{String} req.body.databasePassword
 * 				{String} req.body.theme
 * 				{String} req.body.title
 * 				{String} req.body.email
 * 				{String} req.body.nickname
 * 				{String} req.body.password
 * @param {Function} res
 */
exports.install = function (req, res) {
  req.checkBody({
    'databaseHost': {
      notEmpty: {
        options: [true],
        errorMessage: 'databaseHost 不能为空'
      },
      matches: {
        options: [/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^localhost$/],
        errorMessage: 'databaseHost 格式不正确'
      }
    },
    'databasePort': {
      notEmpty: {
        options: [true],
        errorMessage: 'databasePort 不能为空'
      },
      isInt: {
        options: [{ min: 0, max: 65535 }],
        errorMessage: 'databasePort 需为整数'
      }
    },
    'database': {
      notEmpty: {
        options: [true],
        errorMessage: 'database 不能为空'
      },
      isString: { errorMessage: 'database 需为字符串' }
    },
    'databaseUser': {
      notEmpty: {
        options: [true],
        errorMessage: 'databaseUser 不能为空'
      },
      isString: { errorMessage: 'databaseUser 需为字符串' }
    },
    'databasePassword': {
      notEmpty: {
        options: [true],
        errorMessage: 'databasePassword 不能为空'
      },
      isString: { errorMessage: 'databasePassword 需为字符串' }
    },
    'theme': {
      notEmpty: {
        options: [true],
        errorMessage: 'theme 不能为空'
      },
      isString: { errorMessage: 'theme 需为字符串' }
    },
    // 导入示例数据，下一版本
    //'case': {
    //  notEmpty: {
    //    options: [true],
    //    errorMessage: 'case 不能为空'
    //  },
    //  isBoolean: { errorMessage: 'case 需为布尔值' }
    //},
    'title': {
      notEmpty: {
        options: [true],
        errorMessage: 'title 不能为空'
      },
      isString: { errorMessage: 'title 需为字符串' }
    },
    'email': {
      notEmpty: {
        options: [true],
        errorMessage: 'email 不能为空'
      },
      matches: {
        options: [/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/],
        errorMessage: 'email 格式不正确'
      }
    },
    'nickname': {
      notEmpty: {
        options: [true],
        errorMessage: 'nickname 不能为空'
      },
      isString: { errorMessage: 'nickname 需为字符串' }
    },
    'password': {
      notEmpty: {
        options: [true],
        errorMessage: 'password 不能为空'
      },
      isLength: {
        options: [6],
        errorMessage: 'password 不能小于 6 位'
      }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var databaseDate = {
    host: req.body.databaseHost,
    port: req.body.databasePort,
    db: req.body.database,
    user: req.body.databaseUser,
    pass: req.body.databasePassword
  };

  var siteInfodata = {
    title: req.body.title,
    theme: req.body.theme
  };

  var userDate = {
    email: req.body.email,
    nickname: req.body.nickname,
    password: req.body.password
  };

  // 导入示例数据，下一版本
  //var caseData = {
  //  case: req.body.case
  //};

  async.auto({
    status: function (callback) {
      installService.status(function (err, hasInstall) {
        if (err) return callback(err);

        if (hasInstall) {
          var err = {
            type: 'system',
            error: 'NoderCMS 已经安装'
          };
          return callback(err);
        }

        callback();
      });
    },
    install: ['status', function (callback) {
      installService.install({
        databaseDate: databaseDate,
        siteInfoDate: siteInfodata,
        userDate: userDate
        // 导入示例数据，下一版本
        //caseDate: caseData
      }, function (err, install) {
        if (err) return callback(err);

        callback(null, install);
      });
    }],
    initTheme: ['install', function (callback) {
      themes.init(req.app, callback);
    }]
  }, function (err) {
    if (err) {
      logger[err.type]().error(err);
      return res.status(500).end();
    }

    logger.system().info(__dirname, 'NoderCMS 成功安装');

    res.status(204).end();
  });
};