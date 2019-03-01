bilibili CC字幕助手
=======================

[脚本发布页](https://greasyfork.org/scripts/378513)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

**提交问题反馈前请先看完兼容和已知问题**

-------------------------
## 功能

- 旧版HTML5播放器支持使用CC字幕
  - 可配置语言/字体/背景/阴影等
- 新/旧版HTML5播放器可用CC字幕下载
  - 支持ASS/SRT/LRC格式转换
- 新/旧版播放器可用本地字幕加载
  - 支持ASS/SRT/LRC格式
  - 仅支持系统默认编码，否则字幕会乱码
  - 目前在多数视频可启用，但可能会有异常情况，详见已知问题

-------------------------
## 功能预览

![新版](https://greasyfork.org/system/screenshots/screenshots/000/014/323/original/newPlayer.jpg)

![旧版](https://greasyfork.org/system/screenshots/screenshots/000/014/324/original/oldPlayer.jpg)

![下载](https://greasyfork.org/system/screenshots/screenshots/000/014/325/original/download.jpg)

-------------------------
## 兼容性

- chrome 71 @ Tampermonkey 4.7/4.8 测试通过
- firefox 60 @ Tampermonkey 4.8 、Violentmonkey v2.10.1 部分功能可用
  - 新版播放器下载/本地字幕加载功能正常可用
  - 旧版播放器选择语言/字幕位置/描边下拉框将不可用，浏览器本身DOM解析引擎差异问题
    - 如果视频本身有字幕，点击CC字幕按钮可切换第一种语言的字幕或关闭字幕
    - 本地字幕可能因为无法选中而无法使用，虽然功能应该是正常的
- 似乎并不兼容GreaseMonkey，原因未知
- 其它浏览器和脚本管理器未知

-------------------------
## 已知问题

- ASS格式字幕下载可能会有显示不正常的情况，如果显示不正常请使用SRT格式
- 本地字幕选择可能会乱码，以后可能会更新
- 本地字幕可能会加载失败，但是不会有提醒，问题定位中
- 本地字幕可能会丢失内容，因为b站的CC字幕不支持时间轴重叠
- 旧版播放器选择本地字幕后如需更换字幕需先关闭后再重新选择
- 新版播放器选择本地字幕后需要从语言下拉中关闭字幕
- 旧版播放器菜单在某些视频页面可能会表现异常，待修复
