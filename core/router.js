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
      get: [140010, 'siteInfoController.query'],
      put: [140011, 'siteInfoController.update']
    },

    // 分类管理
    '/categories': {
      get: 'categoriesController.query',
      post: [140021, 'categoriesController.create'],

      '/:_id': {
        get: 'categoriesController.query',
        put: [140021, 'categoriesController.update'],
        delete: [140021, 'categoriesController.remove']
      }
    },

    // 内容模型
    '/models': {
      get: [140030, 'modelsController.query'],
      post: [140031, 'modelsController.create'],

      '/:_id': {
        get: [140030, 'modelsController.query'],
        put: [140031, 'modelsController.update'],
        delete: [140031, 'modelsController.remove']
      }
    },

    // 权限列表
    '/authorities': {
      get: 'authoritiesController'
    },

    // 权限管理
    '/roles': {
      all: [100000],
      get: 'rolesController.query',
      post: 'rolesController.create',

      '/:_id': {
        get: 'rolesController.query',
        put: [100000, 'rolesController.update'],
        delete: [100000, 'rolesController.remove']
      }
    },

    // 后台用户
    '/adminUsers': {
      all: [100000],
      get: 'adminUsersController.query',
      post: 'adminUsersController.create',

      '/:_id': {
        all: [100000],
        get: 'adminUsersController.query',
        put: 'adminUsersController.update',
        delete: 'adminUsersController.remove'
      }
    },

    // 模板
    '/views': {
      get: 'viewsController'
    }
  }
};