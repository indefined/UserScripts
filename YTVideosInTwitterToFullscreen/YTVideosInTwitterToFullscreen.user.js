// ==UserScript==
// @name         allow YouTube videos in twitter to fullscreen
// @name:zh-CN   允许推特内YouTube视频全屏
// @namespace    indefined
// @version      0.1
// @description  make embedded YouTube video in twitter able to fullscreen
// @description:zh-CN  使推特中嵌入的YouTube视频可以全屏
// @author       indefined
// @include      http*://twitter.com/i/cards*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    [].forEach.call(document.body.querySelectorAll('iframe[data-src*="youtube"]'),frame=>{
        //console.log(frame);
        frame.setAttribute('allowfullscreen', 'true');
    });
})();