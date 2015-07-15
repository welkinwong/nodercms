var mongoose = require('../../lib/database');

var categoriesSchema = new mongoose.Schema({
  // 类型
  type: {
    type: String,
    default: 'column',
    enum: ['channel', 'column', 'page', 'link']
  },

  // 分类名
  name: {
    type: String,
    required: true
  },

  // 目录
  directory: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[A-z0-9_]+$/,
    required: true
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

  // 父栏目
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories'
  },

  // 内容模型
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Models'
  },

  // 视图
  views: {
    // 列表页视图
    list: String,

    // 内容页视图
    content: String
  },

  // 关键字
  keywords: String,

  // 描述
  description: String,

  // 是否能后台编辑（单页）
  isEdit: Boolean
}, {
  collection: 'categories'
});

module.exports = mongoose.model('Categories', categoriesSchema);