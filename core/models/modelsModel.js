var mongoose = require('../../lib/database');

var modelsSchema = new mongoose.Schema({
  // 类别
  type: {
    type: String,
    enum: ['content']
  },
  
  // 名称
  name: {
    type: String,
    required: true
  },

  // 备注
  description: String,

  // 系统
  system: mongoose.Schema.Types.Mixed,

  // 扩展
  extensions: mongoose.Schema.Types.Mixed
}, {
  collection: 'models'
});

module.exports = mongoose.model('Models', modelsSchema);