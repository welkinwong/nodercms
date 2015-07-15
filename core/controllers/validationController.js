module.exports = function (authority) {
  return function (req, res, next) {
    for (var i = 0; i < req.session.user.role.authorities.length; i++) {
      if (authority === req.session.user.role.authorities[i]) {
        return next();
      } else {
        return res.status(401).json({
          error: {
            code: 'NO_AUTHORITY',
            message: '没有权限'
          }
        });
      }
    }
  };
};