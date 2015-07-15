var path = require('path');
var express = require('express');
var compression = require('compression');
var exphbs  = require('express-handlebars');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var validator = require('validator');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('./lib/database');
var logger = require('./lib/logger');
var router = require('./lib/route-map');

var app = express();

/**
 * 设置模板引擎
 */
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', '.hbs');

/**
 * 中间件
 */
app.use(compression());
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.access());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator({
  errorFormatter: function (param, message, value) {
    return {
      param: param,
      message: message,
      value: value
    };
  },
  customValidators: {
    isEmail: function (value) {
      return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value);
    },
    isString: function (value) {
      return typeof value === 'string';
    },
    isObject: function (value) {
      return (typeof value === 'object' && !Array.isArray(value));
    },
    isArray: function (value) {
      return Array.isArray(value);
    },
    isBoolean: function (value) {
      return value === true || value === false;
    },
    custom: function (value, callback) {
      if (typeof value !== 'undefined') {
        callback(value);
        return true;
      } else {
        return false;
      }
    }
  }
}));
app.use(cookieParser());
app.use(session({
  secret: 'nodercms',
  name: 'nodercmsSid',
  cookie: {
    httpOnly: false
  },
  store: new mongoStore({
    mongooseConnection: mongoose.connection
  }),
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 转给Roter处理路由
 */
app.use('/', router);

/**
 * 404处理程序
 */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * 错误处理程序
 */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logger.system().error(err);

    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  logger.system().error(err);
  
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;