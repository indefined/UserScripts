// ==UserScript==
// @name         微博自动展开评论
// @namespace    indefined
// @version      0.1
// @supportURL   https://github.com/indefined/UserScripts/issues
// @description  自动展开微博详情页面中的评论，包括楼中楼
// @author       indefined
// @include      /https?:\/\/weibo\.com/\d+/.+/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function q(a,b) {return (b||document).querySelector(a)}
    function qa(a,b) {return (b||document).querySelectorAll(a)}
    function isInView(node) {
        return node.offsetTop >= document.documentElement.scrollTop && node.offsetTop < document.documentElement.scrollTop + window.innerHeight + 200;
    }
    function run() {
        if(q('.WB_tab')) {
            window.removeEventListener('scroll',run);
            return;
        }
        Array.from(qa('.WB_text a[action-data*="more_comment"]')).filter(isInView).forEach(item=>item.click());
        Array.from(qa('.list_box .WB_cardmore .more_txt')).filter(isInView).forEach(item=>item.click());
    }
    window.addEventListener('scroll',run);
})();