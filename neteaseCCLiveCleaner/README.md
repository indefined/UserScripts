网易CC直播净化
=======================

[脚本发布页](https://greasyfork.org/scripts/382065)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

**提交问题反馈前请先看完说明**

-------------------------
## 功能预览

![预览](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdmc1IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--95bd9a410c9d17bc7b1a57dbfdf87cff96335f12/preview.jpg)

-------------------------
## 使用说明

- 安装脚本后点击直播间的特效按钮，按需求勾选自己想屏蔽的功能
  - 只会在有特效按钮的页面生效，未开播或者页面中找不到特效按钮的房间不起作用
- 屏蔽功能只是不显示了，比如抽奖和清晰度提醒之类还是会存在的，只是你看不见而已
- 功能只是简单分组，没有经过精确测试，各模块功能可能有重复，或者存在实际功能和写的不一样，自行测试
- 不能保证完全屏蔽所显示的功能，如有漏屏蔽或者新屏蔽建议最好精确反馈位置，能直接给个样式表最好
- 可能会存在开启某功能后页面错位等情况，如错位反馈请准确说明在什么情况下开启了哪个功能后触发的
- 本人不常用CC直播所以不一定能解决反馈问题

-------------------------
## 已知问题
- 去除弹幕气泡不能屏蔽包子喊话的气泡
- 解除播放器高度限制、自动折叠榜单区、缩小播放器边距在某些视频页面可能导致播放器和聊天区高度不一致

-------------------------
## 设置存储相关

- 本脚本会优先尝试脚本管理器提供的GM3以前的存储API存取配置
  - Tampermonkey、Violentmonkey、GM3等脚本管理器适用
  - 配置保存在脚本管理器内，所有页面通用
- 如果无法获得脚本管理器提供存储API，会使用浏览器原生localStorage存储
  - 使用GM4、第三方chromium原生扩展、书签法安装的适用
  - 此方法保存的配置HTTP和HTTPS页面不通用
