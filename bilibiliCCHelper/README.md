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
  - 目前在多数视频可启用，但可能会有异常情况，详见[已知问题](#已知问题)

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

- 仅支持HTML5播放器，不支持FLASH播放器
- 字幕下载
  - 应该只支持浏览器自身下载，外部下载工具无效
  - ASS格式字幕下载可能会有显示不正常的情况
    - 如果是字体/样式显示不正常请使用SRT格式
    - 如果有其它显示不正常情况请提交反馈视频链接
  - LRC歌词格式本身只有起始时间戳没有结束时间，会丢弃所有字幕结束时间
  - LRC歌词格式不支持换行，如果字幕本身有换行将替换为空格
- 本地字幕
  - 加载可能会乱码，如果尝试完下拉框中的编码仍然乱码，请将文件转为UTF-8编码
  - 可能会加载失败，但是不会有提醒，问题无法定位暂时挂起，如遇到请重试
    - 如遇到未提示加载失败有详细可复现失败步骤或其它头绪请[到这里提交反馈](https://github.com/indefined/UserScripts/issues/6)
  - B站的CC字幕不支持内置样式，所有ASS字幕内置的样式会被丢弃
  - B站的CC字幕不支持字幕特效，所有`{\code}`格式的字幕特效将会被替换忽略
    - 非贪婪匹配，可能会有部分特效代码残留导致类似乱码的字符出现在字幕中
    - 如字幕中有类似特效代码残留或者字幕内容丢失请反馈原始字幕内容
  - VTT格式字幕仅支持简单纯文本，如果文件中存在内联样式或者结构化数据将会被忽略或者表现乱码
  - LRC歌词格式本身只有起始时间戳没有结束时间，所有字幕会持续到下一条字幕开始或者结束后20秒
  - 不支持XLRC格式，如果选择了XLRC格式的LRC后缀歌词:
    - 所有翻译行将被忽略
    - 如果歌词中没有逐字控制符，字幕可正常显示原语言内容
    - 如果歌词中含有逐字控制符，字幕将会表现为乱码

-------------------------
## 设置存储相关

- 本脚本使用浏览器自身的localStorage存储设置数据
- 包含播放器其它设置数据所有网页新旧版通用
- 新版播放器的设置保存读取由播放器自身维护
- 旧版播放器设置保存读取由脚本自身维护
  - 脚本在初始化时读取播放器设置内的字幕设置
  - 页面关闭时重新读取整个播放器设置并替换字幕设置为设置面板内容
  - 如果开启多个旧版播放器网页，最后一个关闭的页面设置有效
