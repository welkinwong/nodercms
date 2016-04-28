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

若是在 Windows 下安装，需先行安装 Canvas 依赖

```bash
$ npm install canvas ----msvs_version=2015
```
（其中 2015 是你安装图形库依赖时安装的 Visual Studio 版本，目前最新的是 2015）

完成后访问 http://localhost:3000/admin/install 进入安装程序

**环境要求：**

1. [Node.js](https://www.nodejs.org) v5.4.1 及以上
2. [Mongodb](https://www.mongodb.org) v3.0.6 及以上
3. [Cairo](http://www.cairographics.org) v1.8.6 及以上（图形库）

如果你没有安装过 Cairo，你可以使用操作系统的命令来快速安装

OS | Command
----- | -----
OS X | `brew install pkg-config cairo libpng jpeg giflib`
Ubuntu | `sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++`
Fedora | `sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel`
Solaris | `pkgin install cairo pkg-config xproto renderproto kbproto xextproto`
Windows | [Windows 下安装教程](http://www.nodercms.com/help/installation/windows-xia-an-zhuang-tu-xing-ku-cairo-jiao-cheng)

## 重新安装
1. 清空数据库
2. 删除 /install.lock
3. 访问 http://localhost:3000/admin/install 进入安装程序

## License
GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007