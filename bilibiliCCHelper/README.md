bilibili CC字幕工具
=======================

[脚本发布页](https://greasyfork.org/scripts/378513)

[个人脚本仓库](https://github.com/indefined/UserScripts)

[问题反馈到这里](https://github.com/indefined/UserScripts/issues)

**提交问题反馈前请先看完兼容和已知问题**

-------------------------
## 功能

- 旧版HTML5播放器支持使用CC字幕
  - 可配置语言/字体/背景/阴影等
- CC字幕下载
  - 新/旧版HTML5播放器可用
  - 支持ASS/SRT/LRC/BCC/TXT纯文本格式
  - 默认系统编码，CR/LF换行
- 载入本地字幕
  - 新/旧版HTML5播放器可用
  - 支持ASS/SRT/LRC/BCC/SBV/VTT格式
  - 支持字幕偏移调整，支持读取LRC歌词内置偏移
  - 支持UTF-8/GB18030/BIG5/UNICODE/JIS/EUC-KR编码
  - 目前在多数视频可启用，但可能会有异常情况，如果遇到异常情况请先查看是否为[已知问题](#已知问题)

-------------------------
## 功能预览

![新版](https://greasyfork.org/system/screenshots/screenshots/000/014/323/original/newPlayer.jpg)

![旧版](https://greasyfork.org/system/screenshots/screenshots/000/014/409/original/oldPlayer.jpg)

![本地](https://greasyfork.org/system/screenshots/screenshots/000/014/446/original/local.jpg)

![下载](https://greasyfork.org/system/screenshots/screenshots/000/014/325/original/download.jpg)

-------------------------
## 兼容性

- 本脚本使用了较新的ES6+和HTML5 API，比较旧的浏览器版本可能不兼容
- chrome 72 @ Tampermonkey 4.7/4.8 测试通过
- firefox 64 @ Tampermonkey 4.8 、Violentmonkey v2.10 测试通过
- 不兼容GreaseMonkey4+……
- 其它浏览器和脚本管理器未知

-------------------------
## 已知问题

- 仅支持HTML5播放器，不支持FLASH播放器，在收藏播放列表中无效
- 字幕下载
  - 应该只支持浏览器自身下载，外部下载工具无效
  - ASS格式字幕如果遇到字体/样式显示不正常或不顺眼请使用SRT格式
  - LRC歌词格式不支持结束时间戳和内容换行，会丢弃字幕结束时间，如果字幕中有换行将替换为空格
  - 如果有其它下载后的字幕使用显示不正常情况请提交反馈视频链接
- 本地字幕
  - 加载可能会乱码，如果尝试完下拉框中的编码仍然乱码，请将文件转为UTF-8编码
  - 可能会无提示加载失败，如遇到未提示加载失败有详细可复现失败步骤或其它头绪请[到这里提交反馈](https://github.com/indefined/UserScripts/issues/6)
  - B站的CC字幕不支持内置样式和特效，所有字幕内置的样式和`{\code}`格式的字幕特效将会被替换忽略
  - VTT格式字幕仅支持简单文本，如果文件中存在内联样式或者结构化数据将会被忽略或者表现乱码
  - LRC歌词格式本身没有结束时间戳，所有歌词字幕会持续到下一条字幕开始或者最后一条结束后20秒
  - 不支持XLRC格式，如果使用XLRC所有翻译行将会被丢弃且卡拉OK特效会表现为乱码
  - 如果有除了以上列出的其它类似特效代码残留乱码或者字幕内容丢失请反馈提供原始字幕内容

-------------------------
## 设置存储相关

- 本脚本使用浏览器自身的localStorage存储设置数据
- 包含播放器其它设置数据所有网页新旧版通用
- 新版播放器的设置保存读取由播放器自身维护
- 旧版播放器设置保存读取由脚本自身维护
  - 脚本在初始化时读取播放器设置内的字幕设置
  - 页面关闭时重新读取整个播放器设置并替换字幕设置为设置面板内容
  - 如果开启多个旧版播放器网页，最后一个关闭的页面设置有效
