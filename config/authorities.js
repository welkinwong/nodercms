/**
 * 权限配置
 */
module.exports = [
  {
    name: 'allAuth',
    description: '所有权限',
    code: 100000
  },
  {
    name: 'contentManage',
    description: '内容管理',
    authorities: [
      {
        name: 'read',
        description: '查看',
        code: 110000
      },
      {
        name: 'edit',
        description: '编辑',
        code: 110001
      }
    ]
  },
  {
    name: 'mediaManage',
    description: '媒体库',
    authorities: [
      {
        name: 'read',
        description: '查看',
        code: 120000
      },
      {
        name: 'edit',
        description: '编辑',
        code: 120001
      }
    ]
  },
  {
    name: 'settingManage',
    description: '设置',
    nodes: [
      {
        name: 'siteInfoManage',
        description: '网站配置',
        authorities: [
          {
            name: 'read',
            description: '查看',
            code: 140010
          },
          {
            name: 'edit',
            description: '编辑',
            code: 140011
          }
        ]
      },
      {
        name: 'categoriesManage',
        description: '分类管理',
        authorities: [
          {
            name: 'read',
            description: '查看',
            code: 140020
          },
          {
            name: 'edit',
            description: '编辑',
            code: 140021
          }
        ]
      },
      {
        name: 'contentModelsManage',
        description: '内容模型',
        authorities: [
          {
            name: 'read',
            description: '查看',
            code: 140030
          },
          {
            name: 'edit',
            description: '编辑',
            code: 140031
          }
        ]
      },
    ]
  }
];