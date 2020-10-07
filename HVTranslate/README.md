# HVTranslate

本文件夹下存放关于Hentaiverse的汉化脚本

[仓库地址](https://github.com/indefined/UserScripts/tree/master/HVTranslate)

## 如何使用

1. 你需要一个脚本管理器，如果你没有的话，根据 [这里](https://greasyfork.org/zh-CN#home-step-1) 第一步提示选择一个适合你浏览器的安装。建议使用Tampermonkey而不要选择Greasemonkey

2. 前往 [Hentaiverse设置](https://hentaiverse.org/?s=Character&ss=se#settings_cfont) 在 font-family 后面的文本框填上任意字体名称，并勾选上一行的 Use Custom Font ，拉到最下面点击 Apply Changes

  - ![设置字体](https://github.com/indefined/UserScripts/raw/master/HVTranslate/settings.jpg)

3. 按照下面脚本说明选择安装需要的脚本

## 脚本说明

**以下脚本在HV 0.86版本下修改测试，如果HV更新了版本可能无法保证正确运行**

### HV 装备物品汉化 v2020.10.07 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E7%89%A9%E5%93%81%E8%A3%85%E5%A4%87%E6%B1%89%E5%8C%96.user.js)

- 原贴吧**物品汉化**脚本，汉化物品、装备界面及论坛，带装备高亮/装备店隐藏锁定装备，会直接替换网页源码所以可能导致其它脚本冲突
- 本脚本大致最初由 [ggxxsol](https://greasyfork.org/scripts/25986) 创建，后由贴吧 [mbbdzz](https://tieba.baidu.com/p/4849863522) 修改补充
- 由 [indefined](https://github.com/indefined/UserScripts/tree/master/HVTranslate) 大规模重构，提高了部分兼容性，但失去原脚本的装备后缀语序倒转功能和物品列表部分悬浮窗说明汉化
- 如有同时使用其它汉化，需要先于其它汉化脚本运行才会生效
- 与HVtoolBox在大部分装备装备列表冲突会失去装备高亮功能；在物品仓库中会导致HVtoolBox部分物品功能无效；与Live Percentile Ranges在装备详情页冲突
- 如与其它脚本同时使用冲突，可尝试调整脚本运行顺序，但无法保证完全兼容
- 默认只在物品列表、装备店、论坛启用（其它页面汉化易冲突可使用下一个汉化脚本代替）
- 如果需要启用其它装备物品位置的汉化或者关闭某些页面的汉化可以参考后面脚本管理示例添加用户包含或者用户排除
- 如果你要在论坛买东西，挑好东西之后最好切换回原文再复制内容，因为别人并不一定看得懂经过翻译过后的东西


### Hentaiverse汉化 v2020.10.07 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HentaiVerse%E6%B1%89%E5%8C%96.user.js)

- 原贴吧**HV界面和其它汉化**脚本，现已基本完成对整个hentaiverse的完全汉化
- 本脚本大致最初由 [ggxxsol](https://greasyfork.org/scripts/9680) 创建，后由 [NeedXuyao](https://greasyfork.org/zh-CN/scripts/2120) 和贴吧 [mbbdzz](https://tieba.baidu.com/p/4849863522) 修改整合补充
- 由 [indefined](https://github.com/indefined/UserScripts/tree/master/HVTranslate) 添加装备/物品/技能悬浮窗汉化功能的实现及翻译，添加原文切换功能
- 除了没有装备高亮和不能在论坛使用之外，本脚本完全包含上一个脚本所有汉化内容，可单独使用，与其它脚本的兼容性比上一个脚本高
- 此脚本已完全整合下方HV战斗汉化，**与独立的HV战斗汉化脚本互斥**，默认不开启，**如需开启在战斗界面中双击下方经验条**
- 如与Live Percentile Ranges同时使用，需要将脚本运行顺序置于Live Percentile Ranges之后，查询不同品质范围需要切换到英文状态
- 如有其它脚本共同运行冲突也可尝试调整脚本运行顺序，但无法保证全部兼容


### HV 战斗汉化 v2020.10.07 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E6%88%98%E6%96%97%E6%B1%89%E5%8C%96.user.js)

- **此脚本已完全合并到上方hentaiverse汉化，如无特殊需求不需要独立安装，此脚本后续可能会删除。**
- 仅对战斗说明框进行汉化，除了少量比较少使用的药品和效果说明之外应该达成了对整个HV战斗说明的完全汉化
- 与20200922之后版本的hentaiverse汉化互斥，如果你已经安装了新版hentaiverse汉化脚本建议禁用或者删除此脚本然后双击战斗底部经验条开启战斗汉化
- 部分文本参考了HV物品汉化和 [圍紀實驗室 - 中文wiki](https://scratchpad.fandom.com/zh/wiki/Category:HentaiVerse)
- 兼容Hentaiverse Monsterbation，原则上应该不会与其它脚本冲突


### HV 图片按钮汉化 v2020.10.07 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E5%9B%BE%E7%89%87%E6%8C%89%E9%92%AE%E6%B1%89%E5%8C%96.user.js)

- 仅翻译带功能的按钮图片，也就是在设置中开启自定义字体之后剩下的图片，HV原始图片字体不会被翻译
- 执行逻辑和效率比较奇葩，对不同浏览器的兼容性很难说，建议按照自己需求决定是否安装
- 由于兼容问题不同浏览器之间存在不同执行方式逻辑，有兴趣有一定基础的可以自己读一下代码注释
- 默认不翻译战斗页面图片，如果你使用的是Chrome并且同时安装了新版本的hentaiverse汉化，双击战斗底部经验条会同步开关战斗文字和图片汉化（可能需要刷新）

### 关于脚本乱码

- 使用上方链接直接在线安装一般不会导致乱码，并且有新版本时会收到自动更新
  - 注意：如果你在线安装了脚本，那么在编辑器中更改的内容会在下一次自动更新中被覆盖
  - 但是设置中更改的内容不会被覆盖
  - 如果不想接收新版本更新，参照下方第二张图取消勾选检查更新
- 如果你将汉化脚本下载到本地安装，不要将脚本直接拉到浏览器中
  1. 在脚本管理器中点击新建脚本，或者右键点击乱码的脚本名字修改编辑脚本
  2. 将新建脚本或者乱码的脚本全部内容清空
  3. 使用记事本打开脚本，复制全部内容粘贴到空脚本编辑窗口中，按Ctrl+S保存

### 管理脚本示例

以Tampermonkey为例

![管理脚本](https://github.com/indefined/UserScripts/raw/master/HVTranslate/manage1.jpg)


![管理脚本](https://github.com/indefined/UserScripts/raw/master/HVTranslate/manage2.jpg)

## License

由于本文件夹下脚本经多人修改，本文件夹下脚本不共有主仓库的公开授权，原则上修改的脚本沿用原作者授权，不增加额外权限和限制，如原作者对脚本的修改公开存在意见，请联系我删除。
