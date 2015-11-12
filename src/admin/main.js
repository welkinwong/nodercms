/**
 * I'm the King of the World!
 */
angular.module('nodercms', [
  'ngAnimate',
  'ipCookie',
  'ui.router',
  // 'angular-loading-bar',
  'controllers',
  'services',
  'directives',
  'filters'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    'use strict';

    // 修改默认请求头
    $httpProvider.defaults.headers.common = {'content-type': 'application/json;charset=utf-8'};

    // 拦截无权限请求
    $httpProvider.interceptors.push('authorityInterceptorService');

    // 开启 HTML5 模式
    $locationProvider.html5Mode(true);

    // 将所有未匹配路由转至根目录
    $urlRouterProvider.otherwise(function ($injector) { $injector.get('$state').go('main') });

    // 路由
    $stateProvider
      // 安装
      .state('install', {
        url: '^/admin/install',
        templateUrl: '/assets/admin/views/install.html',
        controller: 'installController',
        resolve: {
          checkInstallResolve: ['checkInstallResolveService', function (resolve) { return resolve.leaveToLoginOrNone() }],
        }
      })

      // 登录
      .state('login', {
        url: '^/admin/login',
        templateUrl: '/assets/admin/views/login.html',
        controller: 'loginController',
        resolve: {
          checkInstallResolve: ['checkInstallResolveService', function (resolve) { return resolve.enterToInstallOrNone() }],
        }
      })

      // 控制面板
      .state('main', {
        url: '^/admin',
        templateUrl: '/assets/admin/views/main.html',
        controller: 'mainController',
		    resolve: {
			    currentUser: 'currentUserService'
		    }
      })

      // 栏目列表
      .state('main.column', {
        url: '^/admin/column/:_id',
        templateUrl: '/assets/admin/views/column.html',
        controller: 'columnController'
      })

      // 栏目列表 - 新建内容
      .state('main.column.content', {
        url: '^/admin/column/:_id/create',
        templateUrl: '/assets/admin/views/columnChange.html',
        controller: 'columnChangeController'
      })

      // 网站配置
      .state('main.siteInfo', {
        url: '^/admin/setting/siteInfo',
        templateUrl: '/assets/admin/views/siteInfo.html',
        controller: 'siteInfoController'
      })

      // 分类管理
      .state('main.categories', {
        url: '^/admin/setting/categories',
        templateUrl: '/assets/admin/views/categories.html',
        controller: 'categoriesController'
      })

      // 分类管理 - 创建分类
      .state('main.categories.create', {
        url: '^/admin/setting/categories/create',
        templateUrl: '/assets/admin/views/categoriesChange.html',
        controller: 'categoriesChangeController'
      })

      // 分类管理 - 更新分类
      .state('main.categories.update', {
        url: '^/admin/setting/categories/:_id',
        templateUrl: '/assets/admin/views/categoriesChange.html',
        controller: 'categoriesChangeController'
      })

      // 内容模型
      .state('main.contentModels', {
        url: '^/admin/setting/contentModels',
        templateUrl: '/assets/admin/views/contentModels.html',
        controller: 'contentModelsController'
      })

      // 内容模型 - 创建模型
      .state('main.contentModels.create', {
        url: '^/admin/setting/contentModels/create',
        templateUrl: '/assets/admin/views/contentModelChange.html',
        controller: 'contentModelChangeController'
      })

      // 内容模型 - 更新模型
      .state('main.contentModels.update', {
        url: '^/admin/setting/contentModels/:_id',
        templateUrl: '/assets/admin/views/contentModelChange.html',
        controller: 'contentModelChangeController'
      })

      // 角色权限
      .state('main.roles', {
        url: '^/admin/setting/roles',
        templateUrl: '/assets/admin/views/roles.html',
        controller: 'rolesController'
      })

      // 角色权限 - 添加角色
      .state('main.roles.create', {
        url: '^/admin/setting/roles/create',
        templateUrl: '/assets/admin/views/rolesChange.html',
        controller: 'rolesChangeController'
      })

      // 角色权限 - 更新角色
      .state('main.roles.update', {
        url: '^/admin/setting/roles/:_id',
        templateUrl: '/assets/admin/views/rolesChange.html',
        controller: 'rolesChangeController'
      })

      // 后台用户
      .state('main.adminUsers', {
        url: '^/admin/setting/adminUsers',
        templateUrl: '/assets/admin/views/adminUsers.html',
        controller: 'adminUsersController'
      })

      // 后台用户 - 创建用户
      .state('main.adminUsers.create', {
        url: '^/admin/setting/adminUsers/create',
        templateUrl: '/assets/admin/views/adminUsersChange.html',
        controller: 'adminUsersChangeController'
      })

      // 后台用户 - 更新用户
      .state('main.adminUsers.update', {
        url: '^/admin/setting/adminUsers/:_id',
        templateUrl: '/assets/admin/views/adminUsersChange.html',
        controller: 'adminUsersChangeController'
      });
  }
]).run(['checkloginService', function (checkloginService) {
  // 检查用户是否登录
  checkloginService();
}]);

/**
 * 创建 Controllers, Services, Directives, Filters 模块
 */
angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);