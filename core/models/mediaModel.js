var mongoose = require('../../lib/database');

var mediaSchema = new mongoose.Schema({
  // 媒体类型
  type: {
    type: String,
    required: true
  },

  // 文件名
  fileName: {
    type: String,
    required: true
  },

  // 描述
  description: String,

  // 上传日期
  date: {
    type: Date,
    default: Date.now
  },

  // 媒体大小
  size: {
    type: Number,
    required: true
  },

  // 媒体 URL
  url: {
    type: String,
    required: true
  },

  // 来源归属
  sourceId: [mongoose.Schema.Types.ObjectId]
}, {
  collection: 'media'
});

module.exports = mongoose.model('Media', mediaSchema);