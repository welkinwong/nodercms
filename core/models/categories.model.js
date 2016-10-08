var mongoose = require('mongoose');

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
    match: /^[A-z0-9\-\_\/]+$/,
    sparse: true
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

  // 混合
  mixed: {
    // 栏目条数
    pageSize: Number,
    // 单页内容
    pageContent: String,
    // 单页媒体
    pageMedia: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
      }
    ],
    // 单页后台可编辑性
    isEdit: Boolean,
    // 链接父目录
    prePath: String,
    // 链接地址
    url: String
  }
}, {
  collection: 'categories',
  id: false
});

module.exports = mongoose.model('Categories', categoriesSchema);