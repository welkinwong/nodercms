/**
 * I'm the King of the World!
 */
angular.module('nodercms', [
  'ngAnimate',
  'ipCookie',
  'ui.router',
  'ngFileUpload',
  'angular-img-cropper',
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
    $httpProvider.interceptors.push('authorityInterceptor');

    // 开启 HTML5 模式
    $locationProvider.html5Mode(true);

    // 将所有未匹配路由转至根目录
    $urlRouterProvider.otherwise(function ($injector) { $injector.get('$state').go('main') });

    // 路由
    $stateProvider
      // 安装
      .state('install', {
        url: '^/admin/install',
        templateUrl: '/assets/admin/views/install.view.html',
        controller: 'install',
        resolve: {
          checkInstallResolve: ['checkInstallResolve', function (resolve) { return resolve.leaveToSignInOrNone() }],
        }
      })

      // 登录
      .state('signIn', {
        url: '^/admin/sign-in',
        templateUrl: '/assets/admin/views/sign-in.view.html',
        controller: 'signIn',
        resolve: {
          checkInstallResolve: ['checkInstallResolve', function (resolve) { return resolve.enterToInstallOrNone() }],
        }
      })

      // 控制面板
      .state('main', {
        url: '^/admin',
        templateUrl: '/assets/admin/views/main.view.html',
        controller: 'main',
		    resolve: {
          account: 'account'
		    }
      })

      // 推荐管理
      .state('main.features', {
        url: '^/admin/features',
        templateUrl: '/assets/admin/views/features.view.html',
        controller: 'features',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('features', 'read') }]
        }
      })

      // 新增推荐
      .state('main.features.create', {
        url: '^/admin/features/:model/create',
        templateUrl: '/assets/admin/views/features-change.view.html',
        controller: 'featuresChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('features', 'edit') }]
        }
      })

      // 更新推荐
      .state('main.features.update', {
        url: '^/admin/features/:model/feature/:feature',
        templateUrl: '/assets/admin/views/features-change.view.html',
        controller: 'featuresChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('features', 'edit') }]
        }
      })

      // 没有内容
      .state('main.notFoundContents', {
        url: '^/admin/contents',
        templateUrl: '/assets/admin/views/not-fount-contents.view.html',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contents', 'read') }]
        }
      })

      // 内容列表
      .state('main.contents', {
        url: '^/admin/contents/category/:category',
        templateUrl: '/assets/admin/views/contents.view.html',
        controller: 'contents',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contents', 'read') }]
        }
      })

      // 栏目列表 - 新建内容
      .state('main.contents.create', {
        url: '^/admin/contents/category/:category/create',
        templateUrl: '/assets/admin/views/content-change.view.html',
        controller: 'contentChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contents', 'edit') }]
        }
      })

      // 栏目列表 - 更新内容
      .state('main.contents.update', {
        url: '^/admin/contents/category/:category/content/:content',
        templateUrl: '/assets/admin/views/content-change.view.html',
        controller: 'contentChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contents', 'edit') }]
        }
      })

      // 回收站
      .state('main.trash', {
        url: '^/admin/contents/trash',
        templateUrl: '/assets/admin/views/trash.view.html',
        controller: 'trash',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contents', 'read') }]
        }
      })

      // 没有单页时
      .state('main.notFoundPages', {
        url: '^/admin/pages',
        templateUrl: '/assets/admin/views/not-found-pages.view.html',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('pages', 'read') }]
        }
      })

      // 单页
      .state('main.pages', {
        url: '^/admin/pages/:page',
        templateUrl: '/assets/admin/views/page-change.view.html',
        controller: 'pageChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('pages', 'read') }]
        }
      })

      // 媒体库
      .state('main.media', {
        url: '^/admin/media',
        templateUrl: '/assets/admin/views/media.view.html',
        controller: 'media',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('media', 'read') }]
        }
      })

      // 帐号设置
      .state('main.account', {
        url: '^/admin/account',
        templateUrl: '/assets/admin/views/account.view.html',
        controller: 'account',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('account', 'read') }]
        }
      })

      // 网站配置
      .state('main.siteInfo', {
        url: '^/admin/setting/site-info',
        templateUrl: '/assets/admin/views/site-info.view.html',
        controller: 'siteInfo',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('siteInfo', 'read') }]
        }
      })

      // 分类管理
      .state('main.categories', {
        url: '^/admin/setting/categories',
        templateUrl: '/assets/admin/views/categories.view.html',
        controller: 'categories',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('categories', 'read') }]
        }
      })

      // 分类管理 - 创建分类
      .state('main.categories.create', {
        url: '^/admin/setting/categories/create',
        templateUrl: '/assets/admin/views/categories-change.view.html',
        controller: 'categoriesChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('categories', 'edit') }]
        }
      })

      // 分类管理 - 更新分类
      .state('main.categories.update', {
        url: '^/admin/setting/categories/:_id',
        templateUrl: '/assets/admin/views/categories-change.view.html',
        controller: 'categoriesChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('categories', 'edit') }]
        }
      })

      // 内容模型
      .state('main.contentModels', {
        url: '^/admin/setting/content-models',
        templateUrl: '/assets/admin/views/content-models.view.html',
        controller: 'contentModels',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contentModels', 'read') }]
        }
      })

      // 内容模型 - 创建模型
      .state('main.contentModels.create', {
        url: '^/admin/setting/content-models/create',
        templateUrl: '/assets/admin/views/content-model-change.view.html',
        controller: 'contentModelChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contentModels', 'edit') }]
        }
      })

      // 内容模型 - 更新模型
      .state('main.contentModels.update', {
        url: '^/admin/setting/content-models/:_id',
        templateUrl: '/assets/admin/views/content-model-change.view.html',
        controller: 'contentModelChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('contentModels', 'edit') }]
        }
      })

      // 推荐位配置
      .state('main.featureModels', {
        url: '^/admin/setting/feature-models',
        templateUrl: '/assets/admin/views/feature-models.view.html',
        controller: 'featureModels',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('featureModels', 'read') }]
        }
      })

      // 推荐位配置 - 新增推荐位
      .state('main.featureModels.create', {
        url: '^/admin/setting/feature-models/create',
        templateUrl: '/assets/admin/views/feature-model-change.view.html',
        controller: 'featureModelChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('featureModels', 'edit') }]
        }
      })

      // 推荐位配置 - 更新推荐位
      .state('main.featureModels.update', {
        url: '^/admin/setting/feature-models/:_id',
        templateUrl: '/assets/admin/views/feature-model-change.view.html',
        controller: 'featureModelChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('featureModels', 'edit') }]
        }
      })

      // 角色权限
      .state('main.roles', {
        url: '^/admin/setting/roles',
        templateUrl: '/assets/admin/views/roles.view.html',
        controller: 'roles',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('roles', 'read') }]
        }
      })

      // 角色权限 - 添加角色
      .state('main.roles.create', {
        url: '^/admin/setting/roles/create',
        templateUrl: '/assets/admin/views/roles-change.view.html',
        controller: 'rolesChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('roles', 'edit') }]
        }
      })

      // 角色权限 - 更新角色
      .state('main.roles.update', {
        url: '^/admin/setting/roles/:_id',
        templateUrl: '/assets/admin/views/roles-change.view.html',
        controller: 'rolesChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('roles', 'edit') }]
        }
      })

      // 后台用户
      .state('main.adminUsers', {
        url: '^/admin/setting/admin-users',
        templateUrl: '/assets/admin/views/admin-users.view.html',
        controller: 'adminUsers',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('adminUsers', 'read') }]
        }
      })

      // 后台用户 - 创建用户
      .state('main.adminUsers.create', {
        url: '^/admin/setting/admin-users/create',
        templateUrl: '/assets/admin/views/admin-users-change.view.html',
        controller: 'adminUsersChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('adminUsers', 'edit') }]
        }
      })

      // 后台用户 - 更新用户
      .state('main.adminUsers.update', {
        url: '^/admin/setting/admin-users/:_id',
        templateUrl: '/assets/admin/views/admin-users-change.view.html',
        controller: 'adminUsersChange',
        resolve: {
          checkAuth: ['checkAuthResolve', function (resolve) { return resolve('adminUsers', 'edit') }]
        }
      });
  }
]).run(['checkSignIn', function (checkSignIn) {
  // 检查用户是否登录
  checkSignIn();
}]);

/**
 * 创建 Controllers, Services, Directives, Filters 模块
 */
angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);