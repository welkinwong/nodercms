var mongoose = require('../../lib/database');

var optionsSchema = new mongoose.Schema({
  // 配置名
  name: {
    type: String,
    required: true
  },

  // 值
  value: mongoose.Schema.Types.Mixed
}, {
  collection: 'options'
});

module.exports = mongoose.model('Options', optionsSchema);