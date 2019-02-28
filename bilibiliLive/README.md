bilibili直播间助手
=======================

[脚本发布页](https://greasyfork.org/zh-CN/scripts/368635)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

**提交问题前请仔细读完说明和使用须知**

-------------------------
## 功能

- 礼物包裹调整
  - 替换礼物包裹为辣条的大图标并取代大航海的位置
  - 礼物包裹内的样式修正
- 替换弹幕发送框下的勋章、头衔按钮功能，详细功能如下
  - 勋章按钮提供切换/取消佩戴勋章、硬币/银瓜子直接购买勋章、勋章直播间转跳功能
  - 头衔按钮提供头衔切换/取消佩戴功能
- 网页全屏/全屏下将礼物栏放入播放器中并在鼠标移开时自动隐藏(仅限HTML5播放器)
- 全屏可用发送弹幕(仅限HTML5播放器)
- 轮播视频时在标题添加视频转跳连接(仅限HTML5播放器)
- 亿元等其它礼物（[摆设](#关于其它礼物的特别说明)）

-------------------------
## 功能预览


![礼物包裹](https://greasyfork.org/system/screenshots/screenshots/000/012/707/original/blivePlus.normal.jpg)

![勋章](https://greasyfork.org/system/screenshots/screenshots/000/012/708/original/blivePlus.medal.jpg)
![头衔](https://greasyfork.org/system/screenshots/screenshots/000/011/234/original/blivePlus.title.png)

鼠标悬停勋章头衔列表各部分上会显示更多提示信息

![全屏](https://greasyfork.org/system/screenshots/screenshots/000/012/709/original/blivePlus.fullScreen.jpg)

![视频标题](https://greasyfork.org/system/screenshots/screenshots/000/011/236/original/blivePlus.videoTitle.png)

-------------------------
## 兼容性

- 未测试

-------------------------
## 使用须知

- 切换头衔成功之后，发送弹幕别人看到的就是切换后的头衔，但是自己要刷新直播间才能看到效果
- 购买勋章使用旧版APP接口，无法保证B站是否会在什么时候关闭禁止接口，请自行决定是否使用
- 如果你头衔很多，取决于你的浏览器和系统，头衔列表可能会出现比较难看的滚动条
- 为了适配新版礼物包裹里的送礼浮窗，对网页全屏播放器内外进行了一些比较奇葩的样式调整，如果有因为脚本导致的播放器显示错乱请反馈
- b站现在有些样式名称处于薛定谔动态变化状态，姑且对某些元素使用了内嵌样式，但是依然有可能刷新变个样式就显示错乱了，等稳定了再统一修复
- 全屏输入弹幕时鼠标移动离开屏幕底部约1/3位置时会隐藏，这是播放器自己的效果，但是只要点击了发送框依然可以输入发送

-------------------------
## 关于其它礼物的特别说明

- 里面的东西都是官方接口直接列出来的，有什么东西能不能用我也不知道
- 除了辣条都没有实际购买赠送过，自行决定是否使用并承担风险
- 基本属于查看礼物用的摆设，如不想看见图标自行将第17行的`true`改为`false`就可以了
