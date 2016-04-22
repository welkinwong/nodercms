var mongoose = require('mongoose');

/**
 * 配置模型
 */
var optionsSchema = new mongoose.Schema({
  // 配置名
  name: {
    type: String,
    required: true
  },

  // 值
  value: mongoose.Schema.Types.Mixed
}, {
  collection: 'options',
  id: false
});

module.exports = mongoose.model('Options', optionsSchema);