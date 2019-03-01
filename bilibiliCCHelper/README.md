bilibili CC字幕助手
=======================

[脚本发布页](https://greasyfork.org/scripts/378513)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

-------------------------
## 功能

- 旧版HTML5播放器支持使用CC字幕
  - 可配置语言/字体/背景/阴影等
- 新/旧版HTML5播放器可用CC字幕下载
  - 支持ASS/SRT/LRC格式转换
- 新/旧版播放器可用本地字幕加载
  - 支持ASS/SRT/LRC格式
  - 仅支持系统默认编码，否则字幕会乱码
  - 旧版播放器目前在多数视频可启用，但功能还不完善
  - 新版播放器暂只支持有字幕/允许上传字幕的视频

-------------------------
## 功能预览

![新版](https://greasyfork.org/system/screenshots/screenshots/000/014/323/original/newPlayer.jpg)

![旧版](https://greasyfork.org/system/screenshots/screenshots/000/014/324/original/oldPlayer.jpg)

![下载](https://greasyfork.org/system/screenshots/screenshots/000/014/325/original/download.jpg)

-------------------------
## 兼容性

- chrome 71 @ Tampermonkey 4.7/4.8 测试通过
- 暂时不兼容火狐(正则表达式原因，select hover处理原因)
- 其它浏览器和脚本管理器未知

-------------------------
## 已知问题

- ASS格式字幕可能会有不适用情况，如果显示不正常请使用SRT格式
- 本地字幕选择可能会乱码，以后可能会更新
- 本地字幕可能会丢失内容，因为b站的CC字幕不支持时间轴重叠
- 旧版播放器菜单在某些视频页面可能会表现异常，待修复
