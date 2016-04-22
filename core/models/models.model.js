var mongoose = require('mongoose');

/**
 * 模型
 */
var modelsSchema = new mongoose.Schema({
  // 类别
  type: {
    type: String,
    enum: ['content', 'feature']
  },
  
  // 名称
  name: {
    type: String,
    required: true
  },

  // 备注
  description: String,

  // 其他
  mixed: mongoose.Schema.Types.Mixed,

  // 系统
  system: mongoose.Schema.Types.Mixed,

  // 扩展
  extensions: mongoose.Schema.Types.Mixed
}, {
  collection: 'models',
  id: false
});

module.exports = mongoose.model('Models', modelsSchema);