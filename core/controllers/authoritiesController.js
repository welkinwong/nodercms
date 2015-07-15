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
    authority: 14000,
    name: '设置'
  }
];

module.exports = function (req, res) {
  res.status(200).json(authorities);
};