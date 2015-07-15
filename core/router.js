module.exports = {
  /**
   * 首页
   */
  '/admin*': {
    get: 'adminController'
  },

  /**
   * API
   */
  '/api': {
    // 安装
    '/install': {
      get: 'installController.query',
      post: 'installController.install'
    },
 
    // 登录
    '/login': {
      post: 'loginController.in'
    },

    // 注销
    '/logout': {
      post: 'loginController.out'
    },

    // 检查是否登录
    '/*': {
      all: 'loginController.check'
    },

    // 网站配置
    '/siteInfo': {
      get: 'siteInfoController.query',
      put: [10000, 'siteInfoController.update']
    },

    // 栏目
    '/categories': {
      get: 'categoriesController.query',
      post: [10000, 'categoriesController.create'],

      '/:_id': {
        get: 'categoriesController.query',
        put: [10000, 'categoriesController.update'],
        delete: [10000, 'categoriesController.remove']
      }
    },

    // 内容模型
    '/models': {
      get: 'modelsController.query',
      post: [10000, 'modelsController.create'],

      '/:_id': {
        get: 'modelsController.query',
        put: [10000, 'modelsController.update'],
        delete: [10000, 'modelsController.remove']
      }
    },

    // 权限列表
    '/authorities': {
      get: 'authoritiesController'
    },

    // 权限管理
    '/roles': {
      all: [10000],
      get: 'rolesController.query',
      post: 'rolesController.create',

      '/:_id': {
        all: [10000],
        get: 'rolesController.query',
        put: 'rolesController.update',
        delete: 'rolesController.remove'
      }
    },

    // 后台用户
    '/adminUsers': {
      all: [10000],
      get: 'adminUsersController.query',
      post: 'adminUsersController.create',

      '/:_id': {
        all: [10000],
        get: 'adminUsersController.query',
        put: 'adminUsersController.update',
        delete: 'adminUsersController.remove'
      }
    },

    // 模板
    '/views': {
      get: [10000, 'viewsController']
    }
  }
};