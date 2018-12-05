// ==UserScript==
// @name         贴吧回复修正
// @namespace    indefined
// @version      0.1
// @description  还原被百度zz折叠逻辑隐藏的楼层、楼中楼，修正因为高级发帖气泡变形的图片比例
// @author       indefined
// @include      http*://tieba.baidu.com/p/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    (function disableBubbleResize() {
        const style = document.createElement('style');
        style.innerText = '.post_bubble_middle .BDE_Image{height:unset!important;}';
        document.head.appendChild(style);
    })();

    function unfoldPost(){
        [].forEach.call(document.querySelectorAll('[style="display:;"]>.p_forbidden_post_content_fold'),node=>{
            //console.log(node)
            setTimeout(()=>node.click());
        });
    }
    new MutationObserver(mutations => {
        for(const mutation of mutations){
            //console.log(mutation.target,mutation.target.id,mutation.target.className)
            if (mutation.attributeName) {
                const {target,oldValue} = mutation;
                if(target.className == 'j_lzl_container core_reply_wrapper'){
                    if ((target.style.cssText=='display: none; min-height: 0px;' && !oldValue.includes('display'))
                        ||(target.style.cssText=='min-height: 0px; display: none;' && oldValue.match(/^min-height:(?!50px$)\d+px$/))) {
                        target.style.display = 'block';
                    }
                }
            }
            else if (mutation.target.id == 'j_p_postlist') {
                return unfoldPost();
            }
            else{
                for (const addedNode of mutation.addedNodes){
                    //console.log(addedNode,addedNode.id,addedNode.className)
                    if (addedNode.className == 'j_lzl_container core_reply_wrapper'){
                        if (addedNode.parentNode.parentNode.parentNode.dataset.field.match(/is_fold":1/)){
                            addedNode.style = 'display:block';
                        }
                        /*return [].forEach.call(document.querySelectorAll(`[data-field*="\\"is_fold\\":1"] .j_lzl_container.core_reply_wrapper`),node=>{
                            node.style = 'dispaly:block';
                        });*/
                    }
                }
            }
        }
    }).observe(document.getElementById('pb_content')||document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['style']
    });
    unfoldPost();
})();