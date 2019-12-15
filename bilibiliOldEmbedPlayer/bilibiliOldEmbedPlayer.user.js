// ==UserScript==
// @name         Bilibili替换旧版播放器
// @namespace    indefined
// @version      0.1.1
// @description  采用替换播放器的方式返回旧版（问题众多，不保证长久可用）
// @author       indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @include      /^https?:\/\/www\.bilibili\.com\/(video\/av|bangumi\/play\/(ss|ep))\d+/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const bfq = document.getElementById('bofqi');
    if (bfq&&window.cid&&window.aid&&!document.querySelector('.vip')) {
        const frame = document.createElement('iframe');
        frame.src = `https://www.bilibili.com/blackboard/html5player.html?aid=${window.aid}&cid=${window.cid}&enable_ssl=1&crossDomain=1`;
        bfq.replaceWith(frame);
        const styleDiv = document.body.appendChild(document.createElement('style'));
        function setSize() {
            const wrap = document.querySelector('.v-wrap')||document.getElementById('app'),
                  w = (wrap||frame.parentNode).clientWidth;
            frame.style = `width: ${w}px; height:${wrap?w/1.5:frame.parentNode.clientHeight}px; border:none;`;
            styleDiv.innerHTML = wrap?`.r-con>#danmukuBox{height:${w/1.5}px !important}.r-con>.members-info+#danmukuBox{display:none}.members-info{margin-top:${w/1.5+100}px!important}#player_module{height:unset!important}.plp-r{margin-top:${w/1.5+16}px}`:'';
        }
        window.addEventListener('resize',setSize);
        setSize();
    }
    window.history.pushState = window.history.replaceState = function() {location.href = arguments[2];}
})();