// ==UserScript==
// @name         微博自动展开评论
// @namespace    indefined
// @version      0.1.3
// @supportURL   https://github.com/indefined/UserScripts/issues
// @description  自动点击展开微博详情页面中的评论，包括楼中楼，可配置队列延迟
// @notice       可通过 localStorage.autodelay 自定义队列时间
// @author       indefined
// @include      /https?:\/\/weibo\.com/\d+/.+/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    if (!window.$CONFIG||window.$CONFIG.islogin!=1) return;

    function q(a,b) {return (b||document).querySelector(a)}
    function qa(a,b) {return (b||document).querySelectorAll(a)}
    function debug() {localStorage.debug&&console.log(...arguments)}
    const list = [];
    let running;
    function notInList(node) {
        return list.indexOf(node) == -1;
    }
    function clickInView(node) {
        if (
            node &&
            node.offsetTop >= document.documentElement.scrollTop &&
            node.offsetTop < document.documentElement.scrollTop + window.innerHeight + 200
           ) {
            debug('click',list.length)
            node.click();
            return true;
        }
    }
    function runList() {
        running = true;
        const clicked = clickInView(list.shift())
        if(list.length==0) {
            debug('stop',list.length)
            running = false;
            return;
        }
        if(!clicked || !q('.list_con .W_loading:not([style])')) {
            debug('skip delay',list.length)
            runList();
        }
        else setTimeout(runList,localStorage.autodelay||1000);
    }
    function append(selector) {
        list.push(...Array.from(qa(selector)).filter(notInList));
        if(!running) {
            debug('start',list.length)
            runList();
        }
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