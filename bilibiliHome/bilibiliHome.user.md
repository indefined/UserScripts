B站网页端添加APP首页推荐
=========================

[脚本发布页](https://greasyfork.org/zh-CN/scripts/368446)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

**提交问题前请仔细读完说明和使用须知**

-------------------------
## 功能

**20180724开始由于b站提升了该接口的鉴权要求，现在本脚本显示的内容已经不是APP登录状态下根据个人喜好推荐的视频，而是未登录状态下b站随机推荐的，请根据自身需求决定是否保留此脚本。**

同时不喜欢功能也因为失效移除显示，功能保留，如需显示可将第16行`const displayDislike = false;`改为`const displayDislike = true;`，但在缺少登录鉴权前提下该功能会返回未登录错误。

由于提升的鉴权要求对网页端实现不友好，且在网页端保存鉴权存在一定安全隐患，故本决定暂停本脚本更新。如有意自行实现该接口可[查看完整API](https://github.com/indefined/UserScripts/blob/master/bilibiliHome/bilibiliHome.API.md)。

如果有迹象该接口恢复以前的可用状态（`const displayDislike = true;`启用后可正常提交不喜欢）或者有新的可行接口方案请到[这里反馈](https://github.com/indefined/UserScripts/issues/3)，我会视情况决定是否重启此脚本开发。

以下截图预览为B站提升鉴权要求之前的功能界面，当前界面显示相同，但不喜欢功能已去除。

![图片预览](https://greasyfork.org/system/screenshots/screenshots/000/011/238/original/bilibiliHome.user.jpg)

-------------------------
## 兼容性

- chrome 66 in Tampermonkey4.6 测试通过
- EDGE in Tampermonkey4.6 测试通过
- 火狐 in Tampermonkey4.6 测试通过
- GreaseMonkey不兼容（不支持GM_xmlhttpRequest函数，不支持调用页面中js文件，单独require一个jquery对本脚本太繁重不打算支持）
- 其它浏览器和脚本管理器未知
- 由于使用了GM_xmlhttpRequest函数，该脚本无法直接当作扩展安装 ~~跨域真TM麻烦~~

-------------------------
## 使用须知

- 功能依赖登录token，当前网页登录cookie已不再有效因此获取到的数据不再根据个人喜好
- 添加内容依赖首页的动画版块，如果找不到版块或者版块定义变更脚本将不工作
- APP首页内容使用旧版APP接口，由于需要跨域使用了GM_xmlhttpRequest函数，官方后续是否会更改关闭该接口无法判断
- 全站排行使用全站排行页面的接口，由于该页面不提供返回页大小选项和简介信息该接口效率很低，欢迎反馈可用接口
- 本脚本使用MIT协议发布