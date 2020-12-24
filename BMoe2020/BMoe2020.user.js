// ==UserScript==
// @name         BMoe2020
// @namespace    indefined
// @version      0.1.9
// @description  （已失效）计(穷)算(举)2020年度动画大选实际票数
// @author       indefined
// @include      https://www.bilibili.com/blackboard/AOY2020.html*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    if (!document.querySelector('.t-background-image')||window.__inject) return;
    window.__inject = true;
    if (localStorage.bmoe2020) delete localStorage.bmoe2020;
    return;

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

    qa('.t-space-container.plat-section-space')[2].insertAdjacentHTML('afterbegin', '<div id="clear-storage" style="background: white;font-size: 20px;cursor: pointer;">由于B站提供的比例精度下调低于目前最大票位数，脚本已无法计算有效数值。<br>请根据需求删除脚本或者等待后续是否有更新<br>在删除脚本前可点击此标签清空票数存储</div>');

    //document.head.insertAdjacentHTML('beforeend', '<style>.voted-progress>input[type="number"] {width: 90px;}</style>');
    //qa('.t-space-container.plat-section-space')[2].insertAdjacentHTML('afterbegin', '<span id="clear-storage" style="background: white;text-align: center;font-size: 50px;cursor: pointer;margin-left: 140px;" title="如果出现票数倍数错误，点击重置并刷新页面重试">重置票数存储</span>');
    q('#clear-storage').onclick = ()=>delete localStorage.bmoe2020;

    return;

    let datas = JSON.parse(localStorage.bmoe2020||'[]');
    if (datas[6]!=7) {
        //增加一位判断数据版本，防止数据出错需要重置
        datas = [[99,260247],[31,77392],[36,119900],[84,81535],[66,140128],[95,60899],7];
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
            function recount(total, verify) {
                let count = 0;
                for (const vote of votes) {
                    vote.value = vote.percent*total
                    if (verify&&count++<20) {
                        const remain = vote.value%1;
                        if (remain>0.2&&remain<0.8) return false; //可正确验证出来的数据上限可能达不到最高有效精度上限的60%
                        //另一种傻缺验证法，反过来计算比例相同，可验证的数据上限大概能达到最高精度上限80%以上，但是计算量更高
                        //if ((vote.value.toFixed(0)/votes[0].value).toFixed(4)!=vote.percent) return false;
                    }
                }
                return true;
            }

            const tail = votes[votes.length-1],
                  head = votes[1];
            let finsh = false;
            let minP = 1;
            //计算最小票差百分比
            for (let i = (votes.length/2).toFixed(0); i<votes.length-1; i++) {
                let diff = votes[i-1].percent - votes[i].percent;
                if (diff==0) continue;
                minP = Math.min(minP, diff);
            }
            //最小票差误差可以达到一半(0.000001/0.000002)，50%偏差分割穷举范围会重叠，直接进行无条件穷举效率反而更高
            let minT = 1;
            while (100*minT/minP<.5*datas[index][1]) {
                //50%最大误差算，最小票差计算出来的结果不可能低于保存值50%
                console.log(index, 'pass', minT, minP);
                minT++;
            }

            let min = +(Math.max(datas[index][1], 100*minT/minP/2)).toFixed(0); //保存值或最小票反推一半中的大值作为起始
            const max = 1e6; //6位精度最大只能计算到100W
            console.log(index, +minP.toFixed(4), minT, min, max)
            for (let value=min; value<max; value++) {
                if (recount(value/head.percent, true)) {
                    finsh = true;
                    datas[index] = [+tail.value.toFixed(0), +head.value.toFixed(0)];
                    console.log(index, minT, value, value-min)
                    save(datas);
                    show();
                    break;
                }
            }
            console.timeEnd(index);
            container.children[0].onclick = ()=>copy(votes.map(v=>`${v.input.nextElementSibling.textContent}\t${v.input.previousSibling.textContent}\t${v.value.toFixed(1)}\t${v.input.previousSibling.querySelector('span.progress-line').style.width}`).join('\r\n'));
        });
        if (qa('.handled').length==6) clearInterval(timmer);
    },1000);
})();
