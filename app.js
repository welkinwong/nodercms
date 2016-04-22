var path = require('path');
var _ = require('lodash');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('./lib/validator.lib');
var session = require('./lib/session.lib');
var logger = require('./lib/logger.lib');
var router = require('./lib/route-map.lib');
var errors = require('./core/controllers/errors.controller').error;

var app = express();

/**
 * 设置模板解析
 */
app.set('view engine', '.hbs');

/**
 * 中间件
 */
app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.access());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session.check(), session.init());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 转给 Roter 处理路由
 */
app.use(router);

/**
 * 错误处理程序
 */
app.use(errors);

/**
 * 导出 APP
 */
module.exports = app;