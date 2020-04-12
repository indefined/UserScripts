# HVTranslate

本文件夹下存放关于Hentaiverse的汉化脚本


## 如何使用

1. 你需要一个脚本管理器，如果你没有的话，根据 [这里](https://greasyfork.org/zh-CN#home-step-1) 第一步提示选择一个适合你浏览器的安装。建议使用Tampermonkey而不要选择Greasemonkey

2. 前往 [Hentaiverse设置](https://hentaiverse.org/?s=Character&ss=se#settings_cfont) 在 font-family 后面的文本框填上任意字体名称，并勾选上一行的 Use Custom Font ，拉到最下面点击 Apply Changes

  ![设置字体](./settings.jpg)

3. 按照下面脚本说明安装脚本

## 脚本说明

**本文件夹下脚本在HV 0.86版本下修改测试，不保证后续版本可用**

### HV 装备物品汉化 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E7%89%A9%E5%93%81%E8%A3%85%E5%A4%87%E6%B1%89%E5%8C%96.user.js)

- 原贴吧**物品汉化**脚本，汉化物品、装备界面及论坛，带装备高亮/装备店隐藏锁定装备，无翻译原文切换功能，会直接替换网页源码所以可能导致其它脚本冲突
- 本脚本大致最初由 [ggxxsol](https://greasyfork.org/scripts/25986) 创建，后由贴吧 [mbbdzz](https://tieba.baidu.com/p/4849863522) 修改补充
- 内容由本人大规模重构，原则上没有修改脚本功能（指贴吧修改过后的版本），优化了执行效率，去除了所有语法错误，增加了代码的可读性和可扩展性，但由于重构规模较大，或许哪里会搞错了什么
- 如有同时使用其它汉化，需要先于其它汉化脚本运行才会生效
- 如与HVtoolBox同时使用，将脚本运行顺序置于HVtoolBox之前，如与其它脚本同时使用冲突，也可尝试调整脚本运行顺序，但不保证兼容
- 虽然脚本设计可以在各种HV装备和物品页面及论坛运行，但由于和其它脚本冲突概率大（并且其它页面的汉化下一个脚本中全部有包含），仅在装备仓库和装备商店及论坛启用
- 其它页面如有需要自行添加@match
- 如果你要在论坛买东西，挑好东西之后最好关掉脚本刷新再复制内容，因为别人并不一定看得懂经过翻译过后的东西


### Hentaiverse汉化 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HentaiVerse%E6%B1%89%E5%8C%96.user.js)

- 原贴吧**HV界面和其它汉化**脚本，现除了战斗界面和其它我不知道的地方之外，应该达成了对整个hentaiverse 的完全汉化，包括装备/物品/技能悬浮窗内的内容。
- 除了没有装备高亮和不能在论坛使用之外，本脚本完全包含上一个HV装备物品汉化的所有汉化内容，可单独使用，与其它脚本的兼容性比上一个脚本高
- 本脚本大致最初由 [ggxxsol](https://greasyfork.org/scripts/9680) 创建，后由 [NeedXuyao](https://greasyfork.org/zh-CN/scripts/2120) 和贴吧 [mbbdzz](https://tieba.baidu.com/p/4849863522) 修改整合补充
- 由本人添加装备/物品/技能悬浮窗监听汉化实现，整合装备物品汉化说明，同时增加技能说明汉化，补充修复其它不和谐的翻译内容，当然因为没有整个HV的原文本提取，漏掉的地方肯定是会有的
- 如与Live Percentile Ranges同时使用，将脚本运行顺序置于Live Percentile Ranges之后
- 如有其它脚本共同运行冲突也可尝试调整脚本运行顺序，但无法保证全部兼容


### HV 战斗汉化 [点击此处安装](https://github.com/indefined/UserScripts/raw/master/HVTranslate/HV%20%E6%88%98%E6%96%97%E6%B1%89%E5%8C%96.user.js)

- 仅对战斗说明框进行汉化，除了少量比较稀少使用的药品和效果说明之外应该达成了对整个HV战斗说明的完全汉化
- 本脚本由本人自行实现翻译逻辑并翻译，部分文本参考了HV物品汉化和 [圍紀實驗室 - 中文wiki](https://scratchpad.fandom.com/zh/wiki/Category:HentaiVerse)
- 兼容Hentaiverse Monsterbation，原则上应该不会与其它脚本冲突

### 管理脚本示例

以Tampermonkey为例

![管理脚本](./manage1.jpg)

![管理脚本](./manage2.jpg)

## License

由于本文件夹下脚本可能已经经过多人修改，所以本人也不拥有授权许可的权限，如原作者对脚本的修改公开存在意见，请联系我删除。

本文件夹下脚本不共有主仓库的公开授权，默认情况下本文件夹下脚本为无授权许可（No License）。当然根据github公开仓库的用户条款，你依然可以复制或者修改不满意的地方自己使用，如果你想要修改后再度发布，我也没有权限阻止你，但是请理解此行为与我的授权无关。

