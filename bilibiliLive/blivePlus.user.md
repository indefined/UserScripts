bilibili直播间功能增强
=======================

[脚本发布页](https://greasyfork.org/zh-CN/scripts/368635)

[主站功能增强脚本](https://greasyfork.org/zh-CN/scripts/368446)

[问题反馈到这里](https://github.com/indefined/UserScript-for-Bilibili/issues)

**提交问题前请仔细读完说明和使用须知**

-------------------------
## 功能

- 替换礼物包裹为瓜子宝箱打开状态的大图标并取代大航海的位置
- 替换弹幕发送框下的勋章、头衔按钮功能，详细功能如下
  - 勋章按钮提供切换/取消佩戴勋章、硬币/银瓜子直接购买勋章、勋章直播间转跳功能
  - 头衔按钮提供头衔切换/取消佩戴功能
- 网页全屏/全屏可用礼物包裹(仅限HTML5播放器)
- 全屏可用发送弹幕(仅限HTML5播放器)
- 轮播视频时在标题添加视频转跳连接(仅限HTML5播放器)

-------------------------
## 关于新版礼物的特别说明

本特性属于测试功能，未经全部测试和严格的异常捕获提示，需要特别强调几点

0. 除了辣条都没有实际购买赠送过，因为我没钱，只测试了赠送参数正确，请自行决定是否使用
1. 新版礼物接口不稳定，b站可能还会更改，所以如果你点开图标发现没有东西刷新也无效就不用试了
2. 有些礼物虽然显示但是送的时候会提示不存在，因为有些限时过期或者限区礼物b站也会返回，脚本只是把返回的东西都显示出来
3. 新礼物接口返回的瓜子类型很多是错的，所以脚本直接让你自己选金银瓜子了，但是该用金瓜子买的东西你选了银瓜子也是购买失败的
4. 该功能以后应该会移除或者换掉，如果你现在不想看到该图标可以将第12行的`true`改为`false`就可以了
![新版礼物预览](https://greasyfork.org/system/screenshots/screenshots/000/011/273/original/blivePlus.newGift.jpg)

-------------------------
## 功能预览

鼠标悬停各元素上会显示更多有用的提示信息

![图片预览](https://greasyfork.org/system/screenshots/screenshots/000/011/233/original/blivePlus.medal.png)
![图片预览](https://greasyfork.org/system/screenshots/screenshots/000/011/234/original/blivePlus.title.png)
![图片预览](https://greasyfork.org/system/screenshots/screenshots/000/011/235/original/blivePlus.fullWin.jpg)
![图片预览](https://greasyfork.org/system/screenshots/screenshots/000/011/236/original/blivePlus.videoTitle.png)

-------------------------
## 兼容性

- chrome 66 in Tampermonkey4.6 测试通过
- EDGE in Tampermonkey4.6 测试通过
- 其它浏览器和脚本管理器未知

-------------------------
## 使用须知

- 切换勋章/头衔成功之后，发送弹幕别人看到的就是切换后的勋章/头衔，但是自己要刷新直播间才能看到效果
- 购买勋章使用旧版APP接口，无法保证B站是否会在什么时候关闭禁止接口，请自行决定是否使用
- 如果你头衔很多，取决于你的浏览器和系统，头衔列表可能会出现比较难看的滚动条
- 在存在实物抽奖的房间，礼物包裹可能会不显示，因为有实物抽奖的房间可能不会加载瓜子宝箱样式，如果刷新无法解决，请关闭脚本
- 全屏输入弹幕时鼠标移动离开屏幕底部约1/3位置时会隐藏，这是播放器自己的效果，但是只要点击了发送框依然可以输入发送
- 全屏播放器底部的颜文字和热门弹幕会直接发送出去而不会显示在输入框中，这是播放器自己的效果脚本没有做处理也不会处理