// ==UserScript==
// @name         BMoe2020
// @namespace    indefined
// @version      0.1
// @description  计(穷)算(举)2020年度动画大选实际票数
// @author       indefined
// @include      https://www.bilibili.com/blackboard/AOY2020.html
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
    //new MutationObserver(console.log).observe(qa('.t-space-container.plat-section-space')[2], {childList:true, subtree:true})
    //qa('.t-space-container.plat-section-space')[2].insertAdjacentHTML('afterbegin', '<span id="start-culc" style="background: white;text-align: center;font-size: 50px;cursor: pointer;">计算</span>');
    //q('#start-culc').onclick = start;
    const timmer = setInterval(()=>{
        if (qa('.voted-container2').length==6){
            clearInterval(timmer);
            start();
        }
    },1000);
    function start(){
        //this.remove();
        const datas = JSON.parse(localStorage.bmoe2020||'[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]]');
        qa('.content-container').forEach((container,index)=>{
            //if (index>0) return;
            const votes = qa('.progress-container', container).map(vote=>{
                const percent = parseFloat(q('.progress-line', vote).style.width);
                if (!percent) return;
                const input = document.createElement('input');
                input.type = 'number';
                input.percent = percent;
                input.onchange = function(){recount(input.percent/input.value);show()};
                vote.insertAdjacentElement('afterend',input);
                return {percent, input};
            }).filter(i=>i);
            const total = container.children[0].insertAdjacentElement('beforeend', document.createElement('span'));
            if (!votes.length) return;
            function show() {
                votes.forEach(vote=>(vote.input.value = vote.value));
                total.textContent = votes.reduce((a,b)=>(a+b.value),0) - votes[0].value;
            }
            function recount(rate) {
                votes.forEach(vote=>(vote.value = vote.percent/rate));
            }
            function checkHead() {
                for (let i = 0; i< 10; i++) {
                    if (votes[i].value.toFixed(1)%1) return false;
                }
                return true;
            }
            function checkTail() {
                for (let i = votes.length-1; i> votes.length-10; i--) {
                    if (votes[i].value.toFixed(1)%1) return false;
                }
                return true;
            }

            const tail = votes[votes.length-1],
                  head = votes[1];
            let finsh = false;
            for (let t = datas[index][0]; t<150; t++) {
                recount(tail.percent/t);
                if (!checkTail()) continue;
                const reduce = head.value/100;
                head.value = Math.max(datas[index][1],Math.floor(head.value - reduce));
                for (let k = 0; k<reduce*2; k++) {
                    recount(head.percent/head.value)
                    if (checkHead()) {
                        finsh = true;
                        datas[index] = [tail.value.toFixed(0), head.value.toFixed(0)];
                        break;
                    }
                    head.value += 1;
                }
                if (finsh) break;
            }
            show();
            container.children[0].onclick = ()=>copy(votes.map(v=>`${v.input.nextElementSibling.textContent}\t${v.input.previousSibling.textContent}\t${v.value.toFixed(1)}\t${v.input.previousSibling.querySelector('span.progress-line').style.width}`).join('\r\n'));
            localStorage.bmoe2020 = JSON.stringify(datas);
        });
    }
})();