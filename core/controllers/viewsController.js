var fs = require('fs');
var path = require('path');

/**
 * 读取所有模板
 */
var files = fs.readdirSync(path.join(__dirname, '../../views/'));
var views = [];
for (var i = 0; i < files.length; i++) {
  var re = /.*(?=\.hbs$)/.exec(files[i]);
  if (re) {
    views.push(re[0]);
  }
}

module.exports = function (req, res) {
  res.status(200).json(views);
};