/**
 * 后台首页
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  res.sendFile('index.html', { root: './public/assets/admin/' });
};