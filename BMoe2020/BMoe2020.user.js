// ==UserScript==
// @name         BMoe2020
// @namespace    indefined
// @version      0.1.4
// @description  计(穷)算(举)2020年度动画大选实际票数
// @author       indefined
// @include      https://www.bilibili.com/blackboard/AOY2020.html*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    if (!document.querySelector('.t-background-image')||window.__inject) return;
    window.__inject = true;

    function qa(selector, parent){
        return Array.from((parent||document.body).querySelectorAll(selector));
    }
    function q(selector, parent) {
        return (parent||document.body).querySelector(selector)
    }
    function copy(data) {
        const a = document.createElement('textarea');
        a.value = data;
        document.body.appendChild(a);
        a.select();
        document.execCommand('copy');
        document.body.removeChild(a);
    }
    function save(datas) {
        localStorage.bmoe2020 = JSON.stringify(datas);
    }
    //new MutationObserver(console.log).observe(qa('.t-space-container.plat-section-space')[2], {childList:true, subtree:true})
    //qa('.t-space-container.plat-section-space')[2].insertAdjacentHTML('afterbegin', '<span id="start-culc" style="background: white;text-align: center;font-size: 50px;cursor: pointer;">计算</span>');
    //q('#start-culc').onclick = start;
    document.head.insertAdjacentHTML('beforeend', '<style>.voted-progress>input[type="number"] {width: 90px;}</style>');
    qa('.t-space-container.plat-section-space')[2].insertAdjacentHTML('afterbegin', '<span id="clear-storage" style="background: white;text-align: center;font-size: 50px;cursor: pointer;margin-left: 140px;" title="如果出现票数倍数错误，点击重置并刷新页面重试">重置票数存储</span>');
    q('#clear-storage').onclick = ()=>delete localStorage.bmoe2020;

    let datas = JSON.parse(localStorage.bmoe2020||'[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],3]');
    if (datas[6]!=3) {
        //增加一位判断数据版本，防止数据出错需要重置
        datas = [[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],3];
    }
    const timmer = setInterval(()=>{
        qa('.content-container').forEach((container,index)=>{
            if (container.classList.contains('handled')||!q('.voted-container2', container)) return;
            container.classList.add('handled');
            console.time(index);
            const votes = qa('.progress-container', container).map(vote=>{
                const percent = parseFloat(q('.progress-line', vote).style.width);
                if (!percent) return;
                const input = document.createElement('input');
                input.type = 'number';
                input.percent = percent;
                input.onchange = function(){recount(input.value/input.percent);show()};
                vote.insertAdjacentElement('afterend',input);
                return {percent, input};
            }).filter(i=>i);
            if (!votes.length) return;
            const total = container.children[0].insertAdjacentElement('beforeend', document.createElement('span'));
            function show() {
                votes.forEach(vote=>(vote.input.value = vote.value));
                total.textContent = (votes.reduce((a,b)=>(a+b.value),0) - votes[0].value).toLocaleString();
            }
            function recount(total) {
                votes.forEach(vote=>(vote.value = vote.percent*total));
            }
            function checkHead() {
                for (let i = 0; i< 20; i++) {
                    const remain = votes[i].value.toFixed(1)%1;
                    if (remain>0.2&&remain<0.8) return false;
                }
                return true;
            }
            function checkTail() {
                for (let i = votes.length-1; i> votes.length-10; i--) {
                    const remain = votes[i].value.toFixed(1)%1;
                    if (remain>0.2&&remain<0.8) return false;
                }
                return true;
            }

            const tail = votes[votes.length-1],
                  head = votes[1];
            let finsh = false;
            let min = 1;
            //计算最小票差
            for (let i = (votes.length/2).toFixed(0); i<votes.length-1; i++) {
                let diff = votes[i-1].percent - votes[i].percent;
                if (diff==0) continue;
                min = Math.min(min, diff);
            }
            //以最小票差为1算最低票不超过percent/min，为防止误差*2
            for (let t = datas[index][0]; t<tail.percent/min*2; t++) {
                recount(t/tail.percent);
                if (!checkTail()) continue;
                console.log(index, 'tail', t);
                const reduce = head.value/50;
                head.value = Math.max(datas[index][1],Math.floor(head.value - reduce));
                for (let k = 0; k<reduce*2; k++) {
                    recount(head.value/head.percent)
                    if (checkHead()) {
                        finsh = true;
                        datas[index] = [tail.value.toFixed(0), head.value.toFixed(0)];
                        console.log(index, t, k)
                        save(datas);
                        show();
                        break;
                    }
                    head.value += 1;
                }
                if (finsh) break;
            }
            console.timeEnd(index);
            container.children[0].onclick = ()=>copy(votes.map(v=>`${v.input.nextElementSibling.textContent}\t${v.input.previousSibling.textContent}\t${v.value.toFixed(1)}\t${v.input.previousSibling.querySelector('span.progress-line').style.width}`).join('\r\n'));
        });
        if (qa('.handled').length==6) clearInterval(timmer);
    },1000);
})();
