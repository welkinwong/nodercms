# NoderCMS - 轻量级内容管理系统

NoderCMS 使用 Node.js + MongoDB 开发，拥有灵活的内容模型以及完善的权限角色机制。

[官方网站](http://www.nodercms.com) | [帮助中心](http://www.nodercms.com/help) | QQ群：369888346

## 演示
- 地址：[http://demo.nodercms.com](http://demo.nodercms.com)
- 后台：[http://demo.nodercms.com/admin](http://demo.nodercms.com/admin)
- 账号：ghost@nodercms.com
- 密码：123456

## 安装

```bash
$ npm install --production
$ npm start
```

完成后访问 http://localhost:3000/admin/install 进入安装程序

**环境要求：**

1. [Node.js](https://www.nodejs.org) v4.4.3 及以上
2. [Mongodb](https://www.mongodb.org) v3.0.6 及以上

## 重新安装
1. 清空数据库
2. 删除 /install.lock
3. 访问 http://localhost:3000/admin/install 进入安装程序

### 常见问题
- [使用 Nginx 来反向代理 NoderCMS](http://www.nodercms.com/help/installation/shi-yong-nginx-lai-fan-xiang-dai-li-duo-ge-nodercms)
- [使用 pm2 来守护 NoderCMS](http://www.nodercms.com/help/installation/shi-yong-pm2-lai-shou-hu-nodercms)
- [推荐调用使用说明](http://www.nodercms.com/help/themes/features)

## License
GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007