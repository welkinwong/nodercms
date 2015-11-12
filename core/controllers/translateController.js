var logger = require('../../lib/logger');
var optionsModel = require('../models/optionsModel');

module.exports = function (req, res) {
	optionsModel.findOne({name: 'siteInfo'}, 'value.translate', function (err, result) {
		if (err) {
			logger.system().error(__dirname, err);
			return res.status(500).end();
		}

		res.status(200).json(result.value.translate);
	});
};