B站网页端添加APP首页推荐
=========================

[脚本发布页](https://greasyfork.org/zh-CN/scripts/368446)

[直播间功能增强脚本](https://greasyfork.org/zh-CN/scripts/368635)

[问题反馈到这里](https://github.com/indefined/UserScript-for-Bilibili/issues)

**提交问题前请仔细读完说明和使用须知**

-------------------------
## 功能

- bilibili网页端首页添加APP首页推荐内容
- 添加/撤销稍后再看
- 不喜欢/撤销不喜欢
- 全站排行榜

![图片预览](https://greasyfork.org/system/screenshots/screenshots/000/011/238/original/bilibiliHome.user.jpg)

-------------------------
## 兼容性

- chrome 66 in Tampermonkey4.6 测试通过
- EDGE in Tampermonkey4.6 测试通过
- 其它浏览器和脚本管理器未知
- 由于使用了GM_xmlhttpRequest函数，该脚本无法直接当作扩展安装 ~~跨域真TM麻烦~~

-------------------------
## 使用须知

- 功能依赖cookie，未登录或者脚本找不到登录token将不工作
- 添加内容依赖首页的动画版块，如果找不到版块或者版块定义变更脚本将不工作
- APP首页内容使用旧版APP接口，由于需要跨域使用了GM_xmlhttpRequest函数，官方后续是否会更改关闭该接口无法判断
- 不喜欢/撤销不喜欢功能使用APP接口，脚本只负责提交执行效果由服务器决定，请自行决定是否使用。
- 全站排行使用全站排行页面的接口，由于该页面不提供返回页大小选项和简介信息该接口效率很低，欢迎反馈可用接口
- 代码很乱，有机会再整理吧
- 本脚本使用MIT协议发布