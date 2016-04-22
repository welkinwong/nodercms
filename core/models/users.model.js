var sha1 = require('../services/sha1.service');
var mongoose = require('mongoose');

/**
 * 用户模型
 */
var usersSchema = new mongoose.Schema({
  // 用户类别
  type: {
    type: String,
    enum: ['admin'],
    required: true
  },

  // 昵称
  nickname: {
    type: String,
    trim: true,
    required: true
  },

  // 邮箱
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    required: true
  },

  // 密码
  password: {
    type: String,
    set: sha1,
    required: true
  },

  // 角色
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles'
  }
}, {
  collection: 'users',
  id: false
});

/**
 * 发布为模型
 */
module.exports = mongoose.model('Users', usersSchema);