// ==UserScript==
// @name         bilibili网页端添加APP首页推荐
// @namespace    indefined
// @version      0.5.5
// @description  网页端首页添加APP首页推荐、全站排行、可选提交不喜欢的视频
// @author       indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @match        *://www.bilibili.com/
// @license      MIT
// @connect      app.bilibili.com
// @connect      api.bilibili.com
// @connect      passport.bilibili.com
// @connect      link.acg.tv
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const style = `<style>
.dislike-botton,.tname {
    position: absolute;
    top: 2px;
    opacity: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: right;
    font-weight: bold;
    transition: all .3s;
    text-shadow: 0 1px black, 1px 0 black, -1px 0 black, 0 -1px black;
    color: white;
}
.spread-module .tname {
    left: 6px;
}
.spread-module .dislike-botton {
    right: 6px;
    font-size: 14px;
}
.dislike-list {
    display:none;
}
.dislike-list>div:hover {
    text-decoration: line-through;
}
.spread-module:hover .pic .tname
,.spread-module .pic:hover .dislike-botton{
    opacity: 1;
}
.dislike-botton:hover .dislike-list{
    display:unset;
}
.dislike-cover {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
    background:hsla(0,0%,100%,.9);
    text-align: center;
    font-size: 15px;
    z-index: 2;
}
#ranking-all ul.rank-list {
    overflow-y: auto;
}
#ranking-all .rank-list .rank-item.show-detail .ri-detail{
    width: calc(100% - 90px) !important;
}
</style>`;

    //APP首页推荐
    function InitRecommend () {
        //初始化标题栏并注入推荐下方
        element.mainDiv.id = 'recommend';
        element._s(element.mainDiv.querySelector('div.zone-title'),{
            innerHTML:style,
            childs:[
                {
                    nodeType:'div',
                    className:'headline clearfix',
                    innerHTML:'<i class="icon icon_t icon-douga"></i><span class="name">猜你喜欢</span>',
                    childs:[
                        {
                            nodeType:'div',
                            className:'link-more',style:'cursor:pointer;user-select: none;',
                            innerHTML:'<span>设置  </span><i class="icon"></i>',
                            onclick:()=>setting.show()
                        },
                        {
                            nodeType:'div',
                            className:'read-push',style:'cursor:pointer;user-select: none;',
                            innerHTML:'<i class="icon icon_read"></i><span class="info">加载更多</span>',
                            onclick:getRecommend
                        }
                    ]
                }
            ]
        });
        const scrollBox = element.mainDiv.querySelector('div.storey-box.clearfix');
        let listBox;
        element._s(scrollBox,{
            innerHTML:'',style:'overflow-y: auto;',
            childs:[listBox = element._c({
                nodeType:'div',className:scrollBox.className,
                id:'recommend-list',style:'overflow-y: visible;width:calc(100% + 20px)',
                innerHTML:'<span style="display:none">empty</span>'
            })]
        });
        const moreButton = element._c({
            nodeType:'div',className:"clearfix",
            innerHTML:'<div class="load-state" style="cursor: pointer;padding:4px">回到推荐顶部</div>',
            onclick:()=>{
                listBox.scrollTop = 0;
                scrollBox.scrollTop = 0;
                element.mainDiv.scrollIntoView();
            }
        });
        scrollBox.insertAdjacentElement('afterend',moreButton);
        document.querySelector('#home_popularize').insertAdjacentElement('afterend',element.mainDiv);

        const recommends = [];//保存当前页面中的推荐元素，用于清除多余内容
        //显示历史推荐
        if(setting.historyData) updateRecommend(setting.historyData);
        //加载新推荐
        for(let i=0;i<setting.autoFreshCount;i++) getRecommend();

        //获取推荐视频数据
        function getRecommend () {
            let loadingDiv;
            listBox.insertAdjacentElement('afterBegin',loadingDiv=element.getLoadingDiv('recommend'));
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://app.bilibili.com/x/feed/index?build=1&mobi_app=android&idx='
                + (Date.now()/1000).toFixed(0) + (setting.accessKey?'&access_key='+setting.accessKey:''),
                onload: res=>{
                    try {
                        const rep = JSON.parse(res.response);
                        if (rep.code!=0){
                            loadingDiv.firstChild.innerText = `请求app首页失败 code ${rep.code}</br>msg ${rep.message}`;
                            return console.error('请求app首页失败',rep);
                        }
                        setting.pushHistory(rep.data);
                        updateRecommend(rep.data);
                        loadingDiv.style.display = 'none';
                    } catch (e){
                        loadingDiv.firstChild.innerText = `请求app首页发生错误 ${e}`;
                        console.error(e,'请求app首页发生错误');
                    }
                },
                onerror: e=>{
                    loadingDiv.firstChild.innerText = `请求app首页发生错误 ${e}`;
                    console.error(e,'请求app首页发生错误');
                }
            });
        }

        //显示推荐视频
        function updateRecommend (datas){
            const point = listBox.firstChild;
            datas.forEach(data=>recommends.push(point.insertAdjacentElement('beforeBegin',element._c({
                nodeType:'div',
                className:'spread-module',
                childs:[{
                    nodeType:'a',target:'_blank',
                    href:'/video/av'+data.param,
                    dataset:{
                        tag_id:data.tag?data.tag.tag_id:'',
                        id:data.param,goto:data.goto,mid:data.mid,rid:data.tid
                    },
                    childs:[
                        {
                            nodeType:'div',className:'pic',
                            childs:[
                                `<div class="lazy-img"><img alt="${data.title}" src="${data.cover}@160w_100h.${tools.imgType}" /></div>`,
                                `<span title="分区：${data.tname}" class="tname">${data.tname}</span>`,
                                `<span class="dur">${tools.formatNumber(data.duration,'time')}</span>`,
                                {
                                    nodeType:'div',
                                    dataset:{aid:data.param},title:'稍后再看',
                                    className:'watch-later-trigger w-later',
                                    onclick:tools.watchLater
                                },
                                (data.dislike_reasons&&setting.accessKey)?{
                                    nodeType:'div',innerText:'Ｘ',
                                    className:'dislike-botton',
                                    childs:[{
                                        nodeType:'div',
                                        className:'dislike-list',
                                        childs:data.dislike_reasons.map(reason=>({
                                            nodeType:'div',
                                            dataset:{reason_id:reason.reason_id},
                                            innerText:reason.reason_name,
                                            title:`提交因为【${reason.reason_name}】不喜欢`,
                                            onclick:dislike,
                                        }))
                                    }]
                                }:''
                            ]
                        },
                        `<p title="${data.title}" class="t">${data.title}</p>`,
                        `<p class="num"><span class="play"><i class="icon"></i>${tools.formatNumber(data.play)}</span>`
                        +`<span class="danmu"><i class="icon"></i>${tools.formatNumber(data.danmaku)}</span>`
                    ]
                }]
            }))));
            //移除多余的显示内容
            while(setting.pageLimit && recommends.length>setting.pageLimit) listBox.removeChild(recommends.shift());
            listBox.scrollTop = 0;
            scrollBox.scrollTop = 0;
        }

        //提交不喜欢视频，视频数据提前绑定在页面元素上
        function dislike (ev) {
            let target=ev.target,parent=target.parentNode;
            let cancel;
            let url = `https://app.bilibili.com/x/feed/dislike`;
            if (parent.className!='dislike-list'){
                cancel = true;
                let deep = 1;
                while(parent.nodeName!='A'&&deep++<4){
                    target = parent;
                    parent=target.parentNode;
                }
                if (parent.nodeName!='A'){
                    tools.toast('请求撤销稍后再看失败：页面元素异常',ev);
                    return false;
                }
                url += `/cancel`;
            }else{
                parent = parent.parentNode.parentNode.parentNode;
            }
            url += `?goto=${parent.dataset.goto}&id=${parent.dataset.id}&mid=${parent.dataset.mid}`
                +`&reason_id=${target.dataset.reason_id}&rid=${parent.dataset.rid}&tag_id=${parent.dataset.tag_id}`;
            if (setting.accessKey) url += '&access_key='+ setting.accessKey;
            const handleCover = ()=>{
                if (cancel){
                    parent.removeChild(target);
                }else{
                    const cover = document.createElement('div');
                    cover.className = 'dislike-cover';
                    cover.dataset.reason_id = target.dataset.reason_id;
                    cover.innerHTML = `<div class="lazy-img"><br><br>提交成功，但愿服务器以后少给点这种东西。<br><br><b>点击撤销操作</b></div>`;
                    cover.onclick = dislike;
                    parent.appendChild(cover);
                }
            };
            //console.log(url);
            GM_xmlhttpRequest({
                method: 'GET',url,
                onload: res=>{
                    try {
                        const par = JSON.parse(res.response);
                        if (par.code == 0){
                            handleCover();
                        }else if((par.code==-101 && par.message=='账号未登录') || par.code==-400){
                            setting.storageAccessKey(undefined);
                            tools.toast(`未获取授权或者授权失效，请点击设置重新获取授权`);
                        }
                        else{
                            tools.toast(`请求不喜欢错误 code ${par.code}</br>msg ${par.message}`,{par,url});
                        }
                    } catch (e){
                        tools.toast(`请求不喜欢发生错错误${e}`,e);
                    }
                },
                onerror: e=>{
                    tools.toast(`请求不喜欢发生错误`,e);
                }
            });
            return false;
        }
    }

    //全站排行榜
    function InitRanking(){
        const rankingAll = element.mainDiv.querySelector('#ranking_douga');
        rankingAll.id = 'ranking-all';
        const rankingHead = rankingAll.querySelector('.rank-head');
        rankingHead.firstChild.innerText = '全站排行';
        const tab = rankingHead.querySelector('.bili-tab.rank-tab');
        const dropDown = rankingHead.querySelector('.bili-dropdown.rank-dropdown');
        const warp = rankingAll.querySelector('.rank-list-wrap');
        let type = 1,day = setting.rankingDay;
        const data = {1:{},2:{}};
        const loading = element.getLoadingDiv();
        const detail = {};
        dropDown.firstChild.innerText = setting.rankingDays[day];
        element._s(dropDown.lastChild,{
            innerHTML:'',
            childs:Object.entries(setting.rankingDays).map(([value,text])=>({
                nodeType:'li',innerText:text,
                dataset:{day:value},
                style:value==day?'display:none':'',
                className:'dropdown-item'
            }))
        });
        //创建一个显示详情的浮窗
        detail.div = element._c({
            nodeType:'div',style:'display:none',
            className:'video-info-module',
            onmouseenter: ()=> (detail.div.style.display = 'block'),
            onmouseleave: ()=> (detail.div.style.display = 'none'),
            childs:[
                '<style>.clearfix.v-data>div>span{display: block;margin-bottom: 4px;width: 100%;}',
                (detail.title = element._c({nodeType:'a',className:'v-title',target:'_blank',style:'color:#000'})),
                {
                    nodeType:'div',
                    className:'clearfix v-data',
                    childs:[
                        {
                            nodeType:'span',
                            className:'lazy-img',
                            style:'width: 160px;',
                            childs:[detail.img = element._c({nodeType:'img'})]
                        },
                        detail.watchLater = element._c({
                            nodeType:'div',title:'添加到稍后再看',
                            className:"watch-later-trigger w-later",
                            style:'display: block; left: 14px; top: 44px;',
                            onclick:tools.watchLater
                        }),
                        {
                            nodeType:'div',
                            style:'display: inline-block;vertical-align: top;width: 130px;margin-left:3px',
                            childs:[
                                {
                                    nodeType:'span',className:'name',
                                    childs:[
                                        '<i class="icon" style="background-position: -282px -154px;"></i>',
                                        detail.author = element._c({nodeType:'span'}),
                                    ]
                                },
                                {
                                    nodeType:'span',className:'play',
                                    childs:[
                                        '<i class="icon"></i>',
                                        detail.play = element._c({nodeType:'span'}),
                                    ]
                                },
                                {
                                    nodeType:'span',className:'danmu',
                                    childs:[
                                        '<i class="icon"></i>',
                                        detail.video_review = element._c({nodeType:'span'}),
                                    ]
                                },
                                {
                                    nodeType:'span',className:'coin',
                                    childs:[
                                        '<i class="icon"></i>',
                                        detail.coins = element._c({nodeType:'span'}),
                                    ]
                                },
                                {
                                    nodeType:'span',
                                    childs:[
                                        '时长:',
                                        detail.duration = element._c({nodeType:'span',style:'vertical-align:top'}),
                                    ]
                                },
                                {
                                    nodeType:'span',
                                    childs:[
                                        '综合评分:',
                                        detail.pts = element._c({nodeType:'span',style:'vertical-align:top'}),
                                    ]
                                },
                            ]
                        },
                    ]
                }
            ]
        });
        warp.insertBefore(detail.div,warp.lastChild);

        //更新显示详情浮窗内容
        function updateDetail(itemData,offsetTop){
            Object.entries(detail).forEach(([key,item])=>{
                if(key=='div') {
                    item.style.top = offsetTop + 'px';
                    item.style.display = 'block';
                    item.style.left = rankingAll.offsetLeft + 'px';
                }
                else if(key=='img') item.src = `${itemData.pic.replace(/https?:/,'')}@160w_100h.${tools.imgType}`;
                else if(key=='watchLater') item.dataset.aid = itemData.aid;
                else {
                    item.innerText = tools.formatNumber(itemData[key]);
                    item.title = itemData[key];
                }
                if(key=='title') item.href = `/video/av${itemData.aid}/`;
            })
        };
        //将排行数据显示到指定目标中
        function showData(target){
            target.removeChild(loading);
            for (let i = 0;i<data[type][day].length;i++){
                const itemData = data[type][day][i];
                element._c({
                    nodeType:'li',
                    className:i==0?'rank-item show-detail first highlight':i<3?'rank-item highlight':'rank-item',
                    childs:[
                        {
                            nodeType:'i',className:'ri-num',innerText:i+1,
                            onmouseenter: (ev)=> updateDetail(itemData,ev.pageY),
                            onmouseleave: ()=> (detail.div.style.display = 'none'),
                        },
                        {
                            nodeType:'a', target:"_blank",
                            href:`/video/av${itemData.aid}/`,
                            title:`${itemData.title}\r\n播放:${itemData.play} ${itemData.duration}`,
                            className:'ri-info-wrap clearfix',
                            childs:[
                                (i==0?`<div class="lazy-img ri-preview"><img alt="${itemData.title}" src="${itemData.pic.split(':')[1]}@72w_45h.${tools.imgType}"></div>`:''),
                                `<div class="ri-detail"><p class="ri-title">${itemData.title}</p><p class="ri-point">综合评分：${tools.formatNumber(itemData.pts)}</p></div>`,
                                (i==0?{
                                    nodeType:'div',title:'添加到稍后再看',
                                    dataset:{aid:itemData.aid},className:"watch-later-trigger w-later",
                                    onclick:tools.watchLater
                                }:'')
                            ]
                        }
                    ],
                    parent:target
                });
            }
        };
        //获取排行数据，并调用显示内容
        function updateRanking(){
            const target = type==1?warp.firstChild:warp.lastChild;
            while(target.firstChild) target.removeChild(target.firstChild);
            loading.firstChild.innerText = '正在加载...';
            target.appendChild(loading);
            rankingAll.lastChild.href = `/ranking/${type==1?'all':'origin'}/0/0/${day}/`;
            if (data[type][day]) return showData(target);
            GM_xmlhttpRequest({
                method: 'GET',
                url: `https://api.bilibili.com/x/web-interface/ranking?rid=0&day=${day}&type=${type}&arc_type=0`,
                onload: res=>{
                    try {
                        const rep = JSON.parse(res.response);
                        if (rep.code!=0){
                            loading.firstChild.innerText = `请求排行榜失败 code ${rep.code}</br>msg ${rep.message}`;
                            return console.log('请求app首页失败',rep);
                        }
                        data[type][day] = rep.data.list;
                        showData(target);
                    } catch (e){
                        loading.firstChild.innerText = `请求排行榜发生错误 ${e}`;
                        console.error('请求排行榜发生错误',e);
                    }
                }
            });
        };
        //更新页面排行显示状态，并调用更新显示视频
        function updateStatus(ev){
            if (ev.target.className =='dropdown-item'){
                dropDown.firstChild.innerText = ev.target.innerText;
                [].forEach.call(dropDown.lastChild.childNodes,c => {c.style.display=c==ev.target?'none':'unset';});
                day = ev.target.dataset.day;
            }else{
                [].forEach.call(tab.childNodes,c=>{
                    if (c==ev.target) c.removeEventListener('mouseover',updateStatus);
                    else c.addEventListener('mouseover',updateStatus);
                    c.classList.toggle('on');
                });
                type = ev.target.innerText=='全部'?1:2;
                warp.classList.toggle('show-origin');
            }
            updateRanking();
        };
        [].forEach.call(dropDown.lastChild.childNodes,c => {c.onclick = updateStatus;});
        tab.lastChild.addEventListener('mouseover',updateStatus);
        updateRanking();
    }

    //设置，包含设置变量以及设置窗口和对应的方法
    const setting = {
        dialog:undefined,
        historyData:JSON.parse(GM_getValue('historyRecommend','[]')),
        historyLimit:isNaN(+GM_getValue('historyLimit'))?10:+GM_getValue('historyLimit'),
        pageLimit:+GM_getValue('pageLimit')||0,
        autoFreshCount:isNaN(+GM_getValue('autoFreshCount'))?1:+GM_getValue('autoFreshCount'),
        boxHeight:+GM_getValue('boxHeight')||2,
        noScrollBar:!!GM_getValue('noScrollBar'),
        rankingDays:{1:'昨天',3:'三日',7:'一周',30:'一月'},
        rankingDay:GM_getValue('rankingDay',3),
        accessKey:GM_getValue('biliAppHomeKey'),
        storageAccessKey(key){
            if(key) {
                GM_setValue('biliAppHomeKey',this.accessKey = key);
            }
            else {
                delete this.accessKey;
                GM_deleteValue('biliAppHomeKey');
            }
        },
        pushHistory(data){
            this.historyData.unshift(...data);
        },
        saveHistory(){
            while(this.historyData.length>this.historyLimit) this.historyData.pop();
            GM_setValue('historyRecommend',JSON.stringify(this.historyData));
        },
        setHistoryLimit(limit){
            GM_setValue('historyLimit',this.historyLimit = +limit);
        },
        setPageLimit(limit){
            GM_setValue('pageLimit',this.pageLimit = +limit);
        },
        setAutoFreshCount(count){
            GM_setValue('autoFreshCount',this.autoFreshCount = +count);
        },
        setBoxHeight(line){
            GM_setValue('boxHeight',this.boxHeight=+line);
            this.setStyle();
        },
        setScrollBar(status){
            GM_setValue('noScrollBar',this.noScrollBar=+status);
            this.setStyle();
        },
        setStyle(){
            if(!this.styleDiv) {
                this.styleDiv = element._c({
                    nodeType:'style',
                    parent:document.head
                });
            }
            if(this.noScrollBar) {
                this.styleDiv.innerHTML = '#ranking-all .rank-list-wrap{width:calc(200% + 40px)}'
                    + '#ranking-all .rank-list-wrap.show-origin{margin-left:calc(-100% - 20px)}';
            }
            else {
                this.styleDiv.innerHTML = '#recommend #recommend-list{height:unset!important}';
            }
            this.styleDiv.innerHTML += `#recommend  .storey-box {height:calc(336px / 2 * ${this.boxHeight})}`
                + `#ranking-all ul.rank-list{height:calc(336px / 2 * ${this.boxHeight} - 16px)}`;
        },
        show(){
            if(this.dialog) return document.body.appendChild(this.dialog);
            this.dialog = element._c({
                nodeType:'div',
                id:'biliAppHomeSetting',
                style:'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: rgba(0,0,0,0.4);z-index: 10000;',
                childs:[{
                    nodeType:'div',
                    style:'width:200px;right:0;left:0;position:absolute;padding:20px;background:#fff;border-radius:8px;margin:auto;transform:translate(0,50%);',
                    childs:[
                        {
                            nodeType:'h2',innerText:'APP首页推荐设置',
                            style:"font-size: 20px;color: #4fc1e9;font-weight: 400;",
                            childs: [{
                                nodeType:'span',innerText:'Ｘ',
                                style:"float:right;cursor: pointer;",
                                onclick:()=>document.body.removeChild(this.dialog)
                            }]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">全站排行默认显示:</label>',
                                {
                                    nodeType:'select',
                                    style:'vertical-align: top',
                                    onchange:({target})=>GM_setValue('rankingDay',(this.rankingDay = target.value)),
                                    childs:Object.entries(this.rankingDays).map(([day,text])=>({
                                        nodeType:'option',value:day,innerText:text,
                                    })),
                                    value:this.rankingDay
                                }
                            ]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">保存推荐数量:</label>',
                                `<span style="margin-right: 5px;color:#00f" title="${[
                                    '页面关闭时会保存此数量的最新推荐，保存的推荐下次打开首页时会显示在新推荐的下方',
                                    '提交不喜欢的状态不会被保存在本地，但是已经提交给服务器所以没有必要再次提交',
                                    '每10条推荐占用空间约2KB，注意不要保存太多以免拖慢脚本管理器'
                                ].join('\r\n')}">(?)</span>`,
                                {
                                    nodeType:'input',type:'number',value:this.historyLimit,min:0,step:10,
                                    onchange:({target})=>this.setHistoryLimit(target.value),
                                    style:'width:50px'
                                },
                            ]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">页面显示限制:</label>',
                                `<span style="margin-right: 5px;color:#00f" title="${[
                                    '页面中显示的推荐数量限制，超出的旧推荐会从推荐框中清除',
                                    '0表示无限制，更改设置后需要点击加载更多才会生效',
                                    '应当比保存推荐设置的数量大，否则保存的推荐不会全部被显示没有意义'
                                ].join('\r\n')}">(?)</span>`,
                                {
                                    nodeType:'input',type:'number',value:this.pageLimit,min:0,step:10,
                                    onchange:({target})=>this.setPageLimit(+target.value),
                                    style:'width:50px'
                                }
                            ]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">自动刷新页数:</label>',
                                '<span style="margin-right: 5px;color:#00f" title="每次打开首页时自动加载的新推荐页数，每页10条">(?)</span>',
                                {
                                    nodeType:'input',type:'number',value:this.autoFreshCount,min:0,step:1,
                                    onchange:({target})=>this.setAutoFreshCount(+target.value),
                                    style:'width:50px'
                                }
                            ]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">显示推荐高度:</label>',
                                '<span style="margin-right: 5px;color:#00f" title="显示推荐框的行数，超出的推荐内容会产生滚动条来容纳">(?)</span>',
                                {
                                    nodeType:'input',type:'number',value:this.boxHeight,min:2,step:2,
                                    onchange:({target})=>this.setBoxHeight(+target.value),
                                    style:'width:50px'
                                }
                            ]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">不显示滚动条:</label>',
                                '<span style="margin-right: 5px;color:#00f" title="勾选此项将不显示滚动条，但是列表仍然可以滚动">(?)</span>',
                                {
                                    nodeType:'input',type:'checkbox',checked:this.noScrollBar,
                                    onchange:({target})=>this.setScrollBar(target.checked),
                                    style:'vertical-align: bottom',
                                },
                            ]
                        },
                        {
                            nodeType:'div',style:'margin: 10px 0;',
                            childs: [
                                '<label style="margin-right: 5px;">APP接口授权:</label>',
                                `<span style="margin-right: 5px;color:#00f" title="${
                                [
                                    '目前获取根据个人观看喜好的APP首页数据和提交定制不喜欢的视频需要获取授权key。',
                                    '点击获取授权将从官方授权接口获取一个授权key，获取的key保存在脚本管理器内。',
                                    '如果不想使用授权，脚本仍然能从官方接口获取随机推荐视频，但内容可能不再根据个人喜好且无法提交不喜欢内容。',
                                    '点击删除授权可从脚本管理器中删除已获取授权key，脚本将按照没有获取授权的情况执行。',
                                    '授权key有效期大约一个月，如果看到奇怪的推荐提交不喜欢时遇到奇怪的错误可以尝试删除授权重新获取。'
                                ].join('\r\n')}">(?)</span>`,
                                {
                                    nodeType:'button',
                                    style:'padding:0 15px;height:30px;background:#4fc1e9;color:white;border-radius:5px;border:none;cursor:pointer;',
                                    innerText:this.accessKey?'删除授权':'获取授权',
                                    onclick:({target})=>this.handleKey(target)
                                },
                            ]
                        },
                        {
                            nodeType:'div',
                            childs:[
                                '<a href="https://github.com/indefined/UserScripts/issues" target="_blank">github问题反馈</a>',
                                `<a href="https://greasyfork.org/scripts/368446" target="_blank" style="padding-left:20px;">当前版本:${GM_info.script.version}</a>`
                            ]
                        }
                    ]
                }],
                parent:document.body
            });
        },
        handleKey(target){
            if (target.innerText === '删除授权') {
                this.storageAccessKey(undefined);
                target.innerText = '获取授权';
                tools.toast('删除授权成功');
                return;
            }
            else {
                target.innerText = '获取中...';
                target.style['pointer-events'] = 'none';
                new Promise((resolve,reject)=>{
                    GM_xmlhttpRequest({
                        method: 'GET',timeout:10000,
                        url:'https://passport.bilibili.com/login/app/third?appkey=27eb53fc9058f8c3'
                        +'&api=http%3A%2F%2Flink.acg.tv%2Fsearch.php%3Fmod%3Dforum&sign=3c7f7018a38a3e674a8a778c97d44e67',
                        onload: res=> {
                            try{
                                resolve(JSON.parse(res.response).data.confirm_uri)
                            }
                            catch(e){reject(e)}
                        },
                        onerror: e=>reject({msg:e.error,toString:()=>'请求接口错误'}),
                        ontimeout: e=>reject({msg:e.error,toString:()=>'请求接口超时'})
                    });
                }).then(url=>new Promise((resolve,reject)=>{
                    GM_xmlhttpRequest({
                        method: 'GET',url,timeout:10000,
                        onload: res=> {
                            try{
                                const key = res.finalUrl.match(/access_key=([0-9a-z]{32})/);
                                if (key) {
                                    this.storageAccessKey(key[1]);
                                    tools.toast('获取授权成功');
                                    target.innerText = '删除授权';
                                }
                                resolve();
                            }catch(e){reject(e)}
                        },
                        onerror: e=>reject({msg:e.error,toString:()=>'获取授权错误'}),
                        ontimeout: e=>reject({msg:e.error,toString:()=>'获取授权超时'})
                    });
                })).catch(error=> {
                    target.innerText = '获取授权';
                    tools.toast('获取授权失败:'+error,error);
                }).then(()=>{
                    target.style['pointer-events'] = 'unset';
                });
            }
        }
    };

    //页面元素助手，包含克隆的一个未初始化版块和创建、设置页面元素的简单封装
    const element = {
        mainDiv:(()=>{
            try{
                return document.querySelector('#bili_douga').cloneNode(true);
            }catch(e){
                console.error('添加APP首页推荐找不到动画版块');
                return undefined;
            }
        })(),
        getLoadingDiv(target){
            return this._c({
                nodeType:'div',style:target=='recommend'?'padding:0':'',
                className:target=='recommend'?'load-state spread-module':'load-state',
                innerHTML:'<span class="loading">正在加载...</span>'
            });
        },
        _c(config){
            if(config instanceof Array) return config.map(item=>this._c(item));
            const item = document.createElement(config.nodeType);
            return this._s(item,config);
        },
        _s(item,config){
            for(const i in config){
                if(i=='nodeType') continue;
                if(i=='childs' && config.childs instanceof Array) {
                    config.childs.forEach(child=>{
                        if(child instanceof HTMLElement) item.appendChild(child);
                        else if (typeof(child)=='string') item.insertAdjacentHTML('beforeend',child);
                        else item.appendChild(this._c(child));
                    });
                }
                else if(i=='parent') {
                    config.parent.appendChild(item);
                }
                else if(config[i] instanceof Object && item[i]){
                    Object.entries(config[i]).forEach(([k,v])=>{
                        item[i][k] = v;
                    });
                }
                else{
                    item[i] = config[i];
                }
            }
            return item;
        }
    };

    //一些通用模块
    const tools = {
        token:(()=>{
            try{
                return document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/)[1];
            }catch(e){
                console.error('添加APP首页推荐找不到token，请检查是否登录');
                return undefined;
            }
        })(),
        imgType:(()=>{
            try{
                return 0==document.createElement('canvas').toDataURL("image/webp").indexOf("data:image/webp")?'webp':'jpg';
            }catch(e){
                return 'jpg';
            }
        })(),
        toast(msg,error){
            if(error) console.error(msg,error);
            const div = element._c({
                nodeType:'div',
                style:'position: fixed;top: 50%;left: 50%;z-index: 999999;padding: 12px 24px;font-size: 14px;'
                +'width: 240px; margin-left: -120px;background: #ffb243;color: #fff;border-radius: 6px;',
                innerHTML:msg,
                parent:document.body
            });
            setTimeout(()=>document.body.removeChild(div),3000);
            return false;
        },
        formatNumber (input,format='number'){
            if (format=='time'){
                let second = input%60;
                let minute = Math.floor(input/60);
                let hour;
                if (minute>60){
                    hour = Math.floor(minute/60);
                    minute = minute%60;
                }
                if (second<10) second='0'+second;
                if (minute<10) minute='0'+minute;
                return hour?`${hour}:${minute}:${second}`:`${minute}:${second}`;
            }else{
                return input>9999?`${(input/10000).toFixed(1)}万`:input||0;
            }
        },
        watchLater (ev){
            const target = ev.target;
            const req = new XMLHttpRequest();
            const action = target.classList.contains('added')?'del':'add';
            req.open('POST','//api.bilibili.com/x/v2/history/toview/'+action);
            req.withCredentials = true;
            req.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
            req.onload = res=>{
                try{
                    var list = JSON.parse(res.target.response);
                    if (list.code!=0){
                        tools.toast(`请求稍后再看错误 code ${list.code}</br>msg:${list.message}`,{list,target});
                        return;
                    }
                    target.classList.toggle('added');
                    target.title = target.classList.contains('added')?'移除稍后再看':'稍后再看';
                }catch(e){
                    tools.toast('请求稍后再看发生错误',e);
                }
            };
            req.send(`aid=${target.dataset.aid}&csrf=${tools.token}`);
            return false;
        }
    };

    //初始化
    if (element.mainDiv){
        try{
            setting.setStyle();
            InitRecommend();
            window.addEventListener("beforeunload", ()=>setting.saveHistory());
            InitRanking();
        }catch(e){
            console.error(e);
        }
    }
})();
