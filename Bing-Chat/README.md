Bing Chat Everywhere
=======================

- **你可能不需要这个脚本，因为EDGE浏览器侧边栏自带这个功能，而且没有BUG**
- **这个脚本不能解决你不能用Bing聊天的问题，如果你不能使用正常的Bing聊天，那么这个脚本你也用不了**


![baidu](https://user-images.githubusercontent.com/37869994/226856114-5f16ae95-65ee-40be-88c7-a5921ef58c1f.gif)

照猫画虎，没啥好说的。

-------------------------
## 问题
- **确保你可以使用正常的Bing聊天，不解答任何前置条件问题**
- 在启用了Content-Security-Policy的网站上会报WebSocket错误无法使用，比如github
- 由于不同网页的基础样式问题，你可能会遇到严重的显示问题
- 悬停参考链接大概率有毛病，搞不定
- 可能经常出现连接错误和断开，无解
- 英文错误提示自己找翻译，大概率不关脚本的事
- 回复解析是完全黑盒瞎搞，潜在BUG一堆，你可能会遇到各种奇怪的显示错误
- 由于Bing聊天的回复有很大的随机性无法重复，除非能提供导致错误的完整数据，否则回复解析大概率修不了。
- 兼容性未知，基于Chromium102下的Tampermonkey写的

-------------------------
## Credit
- [BingChat](https://github.com/transitive-bullshit/bing-chat) MIT License Copyright (c) 2023 Travis Fischer

-------------------------
## 二次开发
本脚本是个人心血来潮瞎折腾乱写的，代码没有任何逻辑性。没有长期维护的打算，目前也没有扩展其它功能和用途的打算。如果你有二次开发的打算，建议你以上边引用的轮子为基础进行，或者使用其它成熟的、结构性的模块或者应用，例如
[ChatHub](https://github.com/chathub-dev/chathub)
[EdgeGPT](https://github.com/acheong08/EdgeGPT)