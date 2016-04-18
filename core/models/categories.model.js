var mongoose = require('../../lib/database.lib').mongoose;

/**
 * 栏目模型
 */
var categoriesSchema = new mongoose.Schema({
  // 类型
  type: {
    type: String,
    default: 'column',
    enum: ['channel', 'column', 'page', 'link'],
    required: true
  },

  // 分类名
  name: {
    type: String,
    required: true
  },

  // 目录
  path: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[A-z0-9\-\_\/]+$/
  },

  // 是否在导航中显示
  isShow: {
    type: Boolean,
    default: true
  },

  // 排序
  sort: {
    type: Number,
    default: 0
  },

  // 内容模型
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Models'
  },

  // 视图
  views: {
    layout: String,
    channel: String,
    column: String,
    content: String,
    page: String
  },

  // 关键字
  keywords: String,

  // 描述
  description: String,

  // 其他
  mixed: mongoose.Schema.Types.Mixed
}, {
  collection: 'categories',
  id: false
});

module.exports = mongoose.model('Categories', categoriesSchema);