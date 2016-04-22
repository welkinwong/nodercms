var moment = require('moment');
var mongoose = require('mongoose');

/**
 * 媒体模型
 */
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

  // 来源归属
  quotes: [mongoose.Schema.Types.ObjectId]
}, {
  collection: 'media',
  id: false
});

mediaSchema.virtual('src').get(function () {
  return '/media/' + moment(this.date).format('YYYYMM') + '/' + this._id + '/' + this.fileName;
});

module.exports = mongoose.model('Media', mediaSchema);