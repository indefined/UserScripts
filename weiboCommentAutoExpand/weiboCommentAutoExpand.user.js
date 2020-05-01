// ==UserScript==
// @name         微博自动展开评论
// @namespace    indefined
// @version      0.1.1
// @supportURL   https://github.com/indefined/UserScripts/issues
// @description  自动展开微博详情页面中的评论，包括楼中楼，可配置队列延迟
// @notice       可通过 localStorage.autodelay 自定义队列时间
// @author       indefined
// @include      /https?:\/\/weibo\.com/\d+/.+/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function q(a,b) {return (b||document).querySelector(a)}
    function qa(a,b) {return (b||document).querySelectorAll(a)}
    const list = [];
    let running;
    function isInView(node) {
        return list.indexOf(node) == -1 &&
            node.offsetTop >= document.documentElement.scrollTop &&
            node.offsetTop < document.documentElement.scrollTop + window.innerHeight + 200;
    }
    function runList() {
        if(list.length==0) {
            running = false;
            return;
        }
        running = true;
        list.shift().click();
        if(!q('.list_con .W_loading:not([style])')) {
            runList();
        }
        else setTimeout(runList,localStorage.autodelay||1000);
    }
    function append(selector) {
        list.push(...Array.from(qa(selector)).filter(isInView));
        if(!running) runList();
    }
    function run() {
        if(q('.WB_tab')) {
            window.removeEventListener('scroll',run);
            return;
        }
        append('.WB_text a[action-data*="more_comment"]');
        append('.list_box .WB_cardmore .more_txt');
    }
    window.addEventListener('scroll',run);
})();