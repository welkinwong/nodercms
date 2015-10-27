var authorities = [
  {
    authority: 10000,
    name: '所有权限'
  },
  {
    authority: 11000,
    name: '内容管理'
  },
  {
    authority: 12000,
    name: '媒体库'
  },
  {
    authority: 13000,
    name: '用户管理'
  },
  {
    authority: 14001,
    name: '网站配置'
  },
  {
    authority: 14002,
    name: '栏目管理'
  },
  {
    authority: 14003,
    name: '内容模型'
  }
];

module.exports = function (req, res) {
  res.status(200).json(authorities);
};