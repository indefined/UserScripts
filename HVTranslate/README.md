# HVTranslate

本文件夹下存放关于Hentaiverse的汉化脚本

[仓库地址](https://github.com/indefined/UserScripts/tree/master/HVTranslate)

## 如何使用

1. 你需要一个脚本管理器，如果你没有的话，根据 [这里](https://greasyfork.org/zh-CN#home-step-1) 第一步提示选择一个适合你浏览器的安装。建议使用Tampermonkey而不要选择Greasemonkey

2. 前往 [Hentaiverse设置](https://hentaiverse.org/?s=Character&ss=se#settings_cfont) 在 font-family 后面的文本框填上任意字体名称，并勾选上一行的 Use Custom Font ，拉到最下面点击 Apply Changes

  - ![设置字体](https://github.com/indefined/UserScripts/raw/master/HVTranslate/settings.jpg)

3. 按照下面脚本说明选择安装需要的脚本

## 脚本说明

**本文件夹下脚本在HV 0.86版本下修改测试，不保证后续版本可用**

### HV 装备物品汉化 v2020.05.24 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E7%89%A9%E5%93%81%E8%A3%85%E5%A4%87%E6%B1%89%E5%8C%96.user.js)

- 原贴吧**物品汉化**脚本，汉化物品、装备界面及论坛，带装备高亮/装备店隐藏锁定装备，会直接替换网页源码所以可能导致其它脚本冲突
- 本脚本大致最初由 [ggxxsol](https://greasyfork.org/scripts/25986) 创建，后由贴吧 [mbbdzz](https://tieba.baidu.com/p/4849863522) 修改补充
- 内容由indefined大规模重构，优化了执行效率，去除了所有语法错误，增加了代码的可读性和可扩展性
- 重新添加实现翻译/原文切换功能，注意切换回原文可能会有意想不到的问题发生，同时使用其它脚本时切换会使大部分其它脚本功能失效
- 原则上没有修改其它脚本功能（指贴吧修改过后的版本），但由于重构规模较大，或许哪里会搞错了什么
- 如有同时使用其它汉化，需要先于其它汉化脚本运行才会生效
- 如与HVtoolBox同时使用，将脚本运行顺序置于HVtoolBox之前，如与其它脚本同时使用冲突，也可尝试调整脚本运行顺序，但不保证兼容
- 目前此脚本仅设置在装备仓库和装备商店及论坛启用（本脚本和其它脚本冲突概率较大，且其它汉化在下一个汉化脚本中全部包含）
- 如果有需要在其它页面使用参考后面脚本管理示例添加用户包含/匹配，或者自行添加排除不需要运行的网址
- 如果你要在论坛买东西，挑好东西之后最好切换回原文再复制内容，因为别人并不一定看得懂经过翻译过后的东西


### Hentaiverse汉化 v2020.05.24 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HentaiVerse%E6%B1%89%E5%8C%96.user.js)

- 原贴吧**HV界面和其它汉化**脚本，现除了战斗界面和未知的地方之外，应该达成了对整个HV的完全汉化，包括装备/物品/技能悬浮窗内的内容。
- 本脚本大致最初由 [ggxxsol](https://greasyfork.org/scripts/9680) 创建，后由 [NeedXuyao](https://greasyfork.org/zh-CN/scripts/2120) 和贴吧 [mbbdzz](https://tieba.baidu.com/p/4849863522) 修改整合补充
- indefined修改内容
  - 添加装备/物品/技能悬浮窗监听汉化实现，整合装备物品汉化说明，增加技能说明汉化
  - 增加原文切换功能，对多数脚本兼容性较好（在基础功能兼容的前提下），但是仍可能有部分冲突
  - 补充修复其它不和谐的翻译内容，当然因为文本量大难以全覆盖测试，错漏的地方肯定是会有的
- 除了没有装备高亮和不能在论坛使用之外，本脚本完全包含上一个脚本所有汉化内容，可单独使用，与其它脚本的兼容性比上一个脚本高
- 如与Live Percentile Ranges同时使用，将脚本运行顺序置于Live Percentile Ranges之后
- 如有其它脚本共同运行冲突也可尝试调整脚本运行顺序，但无法保证全部兼容


### HV 战斗汉化 v2020.04.13 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E6%88%98%E6%96%97%E6%B1%89%E5%8C%96.user.js)

- 仅对战斗说明框进行汉化，除了少量比较少使用的药品和效果说明之外应该达成了对整个HV战斗说明的完全汉化
- 部分文本参考了HV物品汉化和 [圍紀實驗室 - 中文wiki](https://scratchpad.fandom.com/zh/wiki/Category:HentaiVerse)
- 兼容Hentaiverse Monsterbation，原则上应该不会与其它脚本冲突

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