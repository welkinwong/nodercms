# NoderCMS - 轻量级内容管理系统

NoderCMS 使用 Node.js + MongoDB 开发，拥有灵活的内容模型以及完善的权限角色机制。

[官方网站](http://www.nodercms.com) | [帮助中心](http://www.nodercms.com/help) | QQ 群：369888346

<br>

## 产品推荐

<a href="https://sdocapp.com">
<img src="https://github.com/welkinwong/nodercms/blob/master/superdocs-logo.jpg" width="160" alt="超级文档 | 下一代协作文档办公" style="margin-left: 20px" />
</a>

<br>

超级文档 | 下一代协作文档办公<br><br>
网址：[https://sdocapp.com](https://sdocapp.com)<br>
QQ群：638440389<br><br>
介绍：超级文档是一个以文档为核心的协作办公工具，在完整的排版和格式支持之外，还可以在文档中嵌入任务看板、思维导图、表格、表单、投票等等提高办公效率的功能。<br>

[![超级文档 | 下一代协作文档办公](https://github.com/welkinwong/nodercms/blob/master/superdocs-ad.png)](https://sdocapp.com)

## 作者的话

NoderCMS 是我“相对”比较成功的项目了，看了下提交记录，第一次提交还是在 2015 年，这个项目收获了很多小伙伴的支持，也能看到有很多小伙伴使用它来部署了网站，很开心，很有成就感，也很感激支持的小伙伴们。

做自己的项目很难坚持，除了有对技术对产品的激情外，还需要不畏寒暑的坚持，一路走来，很不容易。

但我没有气馁，对未来仍抱希望，因此诞生了上面的“大”广告（超级文档），这是我最近的个人项目，我擅长开发、擅长产品，但不擅长运营和推广，因此厚着脸皮在这里插广告，也希望大家能体验一下这个产品，这个产品花了很多心血，创业不易，希望它能成功，谢谢大家 : )

## NoderCMS 演示

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

NoderCMS is MIT licensed, as found in the LICENSE file.
