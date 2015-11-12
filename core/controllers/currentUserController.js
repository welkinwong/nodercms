module.exports = function (req, res) {
	if (req.session.user) {
		res.status(200).json(req.session.user);
	} else {
		res.status(401).json({
			error: {
				code: 'NOT_LOGGED_IN',
				message: '没有登录'
			}
		});
	}
};