/**
 * 路由表
 */
module.exports = {
  /**
   * 后台首页
   */
  '/admin*': {
    get: 'admin'
  },

  /**
   * API
   */
  '/api': {
    /**
     * 公用部分
     */
    // 安装
    '/install': {
      get: 'install.status',
      post: 'install.install',

      '/themes': {
        get: 'install.themes',
      },

      '/test-database': {
        put: 'install.testDatabase'
      }
    },

    // 当前用户帐号
    '/account': {
      all: 'account.check',
      get: 'account.current',
      put: [109001, 'account.update'],

      '/sign-in': {
        put: 'account.signIn'
      },

      '/sign-out': {
        put: 'account.signOut'
      }
    },

    // 检查是否登录
    '/*': {
      all: 'account.check'
    },

    /**
     * 数据
     */
    // 控制面板数据
    '/dashboard': {
      get: 'dashboard'
    },

    // 用户
    '/users': {
      get: 'users.get'
    },

    // 推荐
    '/features': {
      get: [100100, 'features.all'],
      post: [100101, 'features.create'],

      '/:feature': {
        get: [100100, 'features.one'],
        put: [100101, 'features.update'],
        delete: [100101, 'features.remove']
      }
    },

    // 内容
    '/contents': {
      get: [100200, 'contents.list'],
      post: [100201, 'contents.create'],
      put: [100201, 'contents.update'],
      delete: [100201, 'contents.remove'],

      '/:content': {
        get: [100200, 'contents.one'],
        put: [100201, 'contents.update'],
        delete: [100201, 'contents.remove']
      }
    },

    // 单页
    '/pages/:page': {
      get: [100300, 110200, 'pages.get'],
      put: [100301, 'pages.save']
    },

    // 媒体库
    '/media': {
      get: [100400, 100100, 100200, 100300, 'media.list'],
      post: [100401, 100101, 100201, 100301, 'media.create'],

      '/:medium': {
        put: [100401, 100101, 100201, 100301, 'media.update'],
        delete: [100401, 100101, 100201, 100301, 'media.remove']
      }
    },

    /**
     * 后台
     */
    // 网站配置
    '/site-info': {
      get: [110100, 'site-info.get'],
      put: [110101, 'site-info.update']
    },

    // 分类管理
    '/categories': {
      get: [110200, 100200, 100201, 100300, 100301, 'categories.query'],
      post: [110201, 'categories.create'],

      '/:_id': {
        get: [110200, 100200, 100300,  'categories.one'],
        put: [110201, 100301, 'categories.update'],
        delete: [110201, 'categories.remove']
      }
    },

    // 模型
    '/models': {
      get: [110300, 110400, 100100, 'models.query'],
      post: [110301, 110401, 100101, 'models.create'],

      '/:_id': {
        get: [110300, 110400, 100100, 100200, 'models.one'],
        put: [110301, 110401, 100101, 'models.update'],
        delete: [110301, 110401, 100101, 'models.remove']
      }
    },

    // 权限列表
    '/authorities': {
      get: 'authorities'
    },

    // 权限管理
    '/roles': {
      get: [110500, 110600, 'roles.list'],
      post: [110501, 'roles.create'],

      '/:_id': {
        get: [110500, 'roles.one'],
        put: [110501, 'roles.update'],
        delete: [110501, 'roles.remove']
      }
    },

    // 后台用户
    '/admin-users': {
      get: [110600, 'admin-users.list'],
      post: [110601, 'admin-users.create'],

      '/:_id': {
        get: [110600, 'admin-users.one'],
        put: [110601, 'admin-users.update'],
        delete: [110601, 'admin-users.remove']
      }
    },

    // 模板
    '/views': {
      get: [110100, 110201, 'views']
    },

    // 统计
    '/statistics': {
      put: 'statistics'
    }
  },

  /**
   * 网站前台
   */
  // 检查安装状态
  '*': { get: 'install.access' },

  // 首页
  '/': { get: 'home'},

  // 搜索页
  '/search': { get: 'search' },

  // 频道页
  '/:channel*': { get: 'channel' },

  // 栏目页
  '/:column*': { get: 'column' },

  // 单页
  '/:page*': { get: 'page' },

  // 内容页
  '/:content*': { get: 'content' },

  // 错误页
  '/*': { get: 'errors.notFound' }
};