module.exports = function (req, res) {
  res.sendFile('index.html', { root: './public/assets/admin/' });
};