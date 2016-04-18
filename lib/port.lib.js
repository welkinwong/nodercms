/**
 * 格式化端口
 */
module.exports = function () {
  var val = process.env.PORT || '3000';
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};