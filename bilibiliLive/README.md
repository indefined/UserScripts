bilibili直播间工具
=======================

[脚本发布页](https://greasyfork.org/zh-CN/scripts/368635)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

**提交问题前请仔细读完说明和使用须知**

-------------------------
## 功能

- 礼物包裹调整
  - 替换礼物包裹为辣条的大图标并取代大航海的位置
  - 礼物包裹内的样式替换
- 替换弹幕发送框下的勋章、头衔按钮功能，详细功能如下
  - 勋章按钮提供切换/取消佩戴勋章、硬币直接购买勋章(银瓜子购买已失效)、勋章直播间转跳功能
  - 头衔按钮提供头衔切换/取消佩戴功能
- 网页全屏/全屏下将礼物栏放入播放器中并在鼠标移开时自动隐藏(仅限HTML5播放器)
- 全屏可用发送弹幕(仅限HTML5播放器)
- 轮播视频时在标题添加视频转跳连接(仅限HTML5播放器)
- 亿元等其它礼物（[摆设](#关于其它礼物的特别说明)）

-------------------------
## 功能预览

![设置](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbFF0IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--719753457d431069fe03eb36c0b037484cfee208/blivePlus.fullScreen.jpg)

![礼物包裹](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbEl0IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--68b45739503dfedbdcf2c7ae4a36e4d22aa0aafa/blivePlus.normal.jpg)

![勋章](https://github.com/indefined/UserScripts/raw/master/bilibiliLive/blivePlus.medal.jpg)
![头衔](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBa290IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--9240b36de90450152e369ed4b7dcd3d183373f78/blivePlus.title.png)

鼠标悬停勋章头衔列表各部分上会显示更多提示信息

![全屏](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbFF0IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--719753457d431069fe03eb36c0b037484cfee208/blivePlus.fullScreen.jpg)

![视频标题](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBa3d0IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--ecdef3a579a578ee61667071e1fdbef8df4c38ef/blivePlus.videoTitle.png)

-------------------------
## 兼容性

- 本脚本使用了较新的ES6+和HTML5 API，比较旧的浏览器版本可能不兼容
- chrome 72 @ Tampermonkey 4.7/4.8 测试通过
- 火狐 64 @ Tampermonkey 4.8 、Violentmonkey v2.10 测试通过
- 不兼容GreaseMonkey4
- 其它浏览器和脚本管理器未知

-------------------------
## 使用须知

- 设置按钮是原本HTML5播放器内的，flash版播放器将看不到设置按钮，也用不了HTML5依赖的几个功能
  - 如果你用不了HTML5播放器又真的想关闭剩下的某部分功能:[存储相关](#设置存储相关)
  - 点击了设置按钮会跳到播放器本身的设置去，需悬停设置本脚本选项，如果看不到，大概脚本坏了
- 切换HTML5/FLASH播放器类型后全屏相关功能需要刷新页面才会生效
- 切换头衔成功之后，发送弹幕别人看到的就是切换后的头衔，但是自己要刷新直播间才能看到效果
- 购买勋章使用旧版APP接口，无法保证B站是否会在什么时候关闭禁止接口，请自行决定是否使用
- 如果你头衔/勋章很多，取决于你的浏览器和系统，头衔列表可能会出现比较难看的滚动条
- 全屏输入弹幕时鼠标移动离开屏幕底部约1/3位置时会隐藏，这是播放器自己的效果，但是只要点击了发送框依然可以输入发送

-------------------------
## 设置存储相关
- 本脚本会优先尝试脚本管理器提供的GM3以前的存储API存取配置
  - 如果无法获得脚本管理器提供存储API，会使用浏览器原生localStorage存储
- 脚本配置项正常可直接在HTML5播放器UI中修改，如需手动修改，请参考以下步骤：
    1. 将脚本管理器设置为高级配置模式，在脚本管理器内打开脚本，切换到存储页
    2. 将以下配置数据需要关闭的对应项后面的`true`修改为`false`，保存后刷新页面
    3. 如果保存后没有生效，请检查是否修改错误
    4. 数据项对应含义请参考代码中`settingInfos`项

```
{
    "BilibiliLiveHelper": "{
        \"giftInPanel\":true,
        \"fullScreenPanel\":true,
        \"fullScreenChat\":true,
        \"chatInGiftPanel\":true,
        \"showVideoLink\":true,
        \"replaceMedalTitle\":true,
        \"showOtherGift\":false
    }"
}
```

![存储](https://github.com/indefined/UserScripts/raw/master/bilibiliLive/storage.jpg)

-------------------------
## 关于其它礼物的特别说明

- 里面的东西都是官方接口直接列出来的，有什么东西能不能用我也不知道
- 除了辣条都没有实际购买赠送过，自行决定是否使用并承担风险
- 基本属于查看礼物用的摆设，如果不想看到在设置里关掉即可
