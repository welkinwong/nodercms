var mongoose = require('../../lib/database');

var contentSchema = new mongoose.Schema({
  // 状态
  status: {
    type: String,
    default: 'draft',
    enum: ['draft', 'pushed']
  },

  // 栏目 ID
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // 标题
  title: {
    type: String,
    required: true
  },

  // 别名
  alias: {
    type: String,
    unique: true
  },

  // 日期
  date: {
    type: Date,
    default: Date.now
  },

  // 缩略图
  thumbnail: {
    url: String,
    mediaId: mongoose.Schema.Types.ObjectId
  },

  // 媒体
  media: [
    {
      type: String,
      url: String,
      mediaId: mongoose.Schema.Types.ObjectId
    }
  ],

  // 内容
  content: String,

  // 标签
  tags: Array,

  // 扩展
  extensions: mongoose.Schema.Types.Mixed 
}, {
  collection: 'content'
});

module.exports = mongoose.model('Content', contentSchema);