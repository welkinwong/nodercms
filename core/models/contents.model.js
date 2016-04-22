var mongoose = require('mongoose');

/**
 * 内容模型
 */
var contentsSchema = new mongoose.Schema({
  //状态
  status: {
    type: String,
    default: 'draft',
    enum: ['draft', 'pushed']
  },

  // 放入回收站
  deleted: {
    type: Boolean,
    default: false
  },

  //栏目 ID
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: true
  },

  //标题
  title: {
    type: String,
    required: true
  },

  //别名
  alias: {
    type: String,
    unique: true,
    required: true
  },

  //发布人
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },

  //日期
  date: {
    type: Date,
    default: Date.now
  },

  //阅读量
  reading: {
    //总阅读量
    total: {
      type: Number,
      default: 0,
      required: true
    },
    //日阅读量
    day: {
      type: Number,
      default: 0,
      required: true
    },
    //周阅读量
    week: {
      type: Number,
      default: 0,
      required: true
    },
    //月阅读量
    month: {
      type: Number,
      default: 0,
      required: true
    },
    //阅读量创建日期
    createAt: {
      day: {
        type: Date,
        default: Date.now,
        required: true
      },
      week: {
        type: Date,
        default: Date.now,
        required: true
      },
      month: {
        type: Date,
        default: Date.now,
        required: true
      }
    }
  },

  //缩略图
  thumbnail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },

  //媒体
  media: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  ],

  //摘要
  abstract: String,

  //内容
  content: String,

  //标签
  tags: [String],

  // 扩展
  extensions: mongoose.Schema.Types.Mixed
}, {
  collection: 'contents',
  id: false
});

module.exports = mongoose.model('Contents', contentsSchema);