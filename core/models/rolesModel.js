var mongoose = require('../../lib/database');

/**
 * Schema
 */
var rolesSchema = new mongoose.Schema({
  // 角色名称
  name: {
    type: String,
    required: true
  },

  // 角色备注
  description: String,

  // 权限列表
  authorities: [Number]
}, {
  collection: 'roles'
});

/**
 * 发布为模型
 */
module.exports = mongoose.model('Roles', rolesSchema);