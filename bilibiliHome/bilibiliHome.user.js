// ==UserScript==
// @name         bilibili网页端添加APP首页推荐
// @namespace    indefined
// @version      0.6.7
// @description  网页端首页添加APP首页推荐、全站排行、可选提交不喜欢的视频
// @author       indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @match        *://www.bilibili.com/*
// @license      MIT
// @connect      app.bilibili.com
// @connect      api.bilibili.com
// @connect      passport.bilibili.com
// @connect      link.acg.tv
// @connect      www.mcbbs.net
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const style = `<style>
#recommend .video-card-common {
    margin-bottom: 12px;
}
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
    z-index: 22;
}
.spread-module .tname,
.video-card-common .tname {
    left: 6px;
}
.spread-module .dislike-botton,
.video-card-common .dislike-botton {
    right: 6px;
    font-size: 14px;
}
.dislike-list {
    display:none;
}
.dislike-list>div:hover {
    text-decoration: line-through;
}
.video-card-common:hover .tname,
.video-card-common:hover .dislike-botton,
.spread-module:hover .pic .tname,
.spread-module .pic:hover .dislike-botton{
    opacity: 1;
}
.dislike-botton:hover .dislike-list{
    display:unset;
}
.dislike-cover {
    position: absolute!important;
    top: 0px;
    width: 100%;
    height: 100%;
    background:hsla(0,0%,100%,.9);
    text-align: center;
    font-size: 15px;
    z-index: 22;
}
#ranking-all ul.rank-list {
    overflow-y: auto;
    padding-top: 0 !important;
}
#ranking-all .rank-head {
    margin-bottom: 20px !important;
}
#ranking-all .rank-list .rank-item.show-detail .ri-detail{
    width: calc(100% - 90px) !important;
}
</style>`;

    //APP首页推荐
    function InitRecommend () {
        //初始化标题栏并注入推荐下方
        element.mainDiv.id = 'recommend';
        let scrollBox;
        if(element.isNew){
            element._s(element.mainDiv.querySelector('.storey-title'),{
                innerHTML:style,
                childs:[
                    '<div class="l-con"><svg aria-hidden="true" class="svg-icon"><use xlink:href="#bili-douga"></use></svg><span class="name">猜你喜欢</span></div>',
                    {
                        nodeType:'div',
                        className:'exchange-btn',
                        childs:[
                            {
                                nodeType:'div',
                                style: 'width: 86px;',
                                className:'btn btn-change',
                                innerHTML:'<i class="bilifont bili-icon_caozuo_huanyihuan"></i><span class="info">加载更多</span>',
                                onclick:getRecommend
                            },
                            {
                                nodeType:'span',
                                className:'btn more',
                                innerHTML:'<span>设置</span><i class="bilifont bili-icon_caozuo_qianwang"></i>',
                                onclick:()=>setting.show()
                            }
                        ]
                    }
                ]
            });
            scrollBox = element.mainDiv.querySelector('div.zone-list-box');
            scrollBox.classList.add('storey-box')
        }
        else {
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
            scrollBox = element.mainDiv.querySelector('div.storey-box.clearfix');
        }
        let listBox;
        element._s(scrollBox,{
            innerHTML:'',style:'overflow:hidden auto;display:block',
            childs:[listBox = element._c({
                nodeType:'div',className:scrollBox.className,
                id:'recommend-list',
                innerHTML:'<span style="display:none">empty</span>'
            })]
        });
        const moreButton = element._c({
            nodeType:'div',className:"clearfix",
            innerHTML:'<div class="load-state" style="cursor: pointer;padding: 4px;text-align: center;">回到推荐顶部</div>',
            onclick:()=>{
                listBox.scrollTop = 0;
                scrollBox.scrollTop = 0;
                element.mainDiv.scrollIntoView();
            }
        });
        scrollBox.insertAdjacentElement('afterend',moreButton);
        if(element.isNew) {
            document.querySelector('.proxy-box').insertAdjacentElement('afterbegin',element.mainDiv);
        }
        else {
            document.querySelector('#home_popularize').insertAdjacentElement('afterend',element.mainDiv);
        }

        const recommends = [];//保存当前页面中的推荐元素，用于清除多余内容
        //显示历史推荐
        if(setting.historyData) updateRecommend(setting.historyData);
        //加载新推荐
        for(let i=0;i<setting.autoFreshCount;i++) getRecommend();

        //如果是新版页面，因为弹性布局原因，需要根据情况设置宽度避免因为不显示滚动条干扰溢出
        if(element.isNew) {
            setting.setListWidth = function() {
                if(listBox.scrollHeight>listBox.clientHeight && setting.noScrollBar) {
                    listBox.style = 'overflow-y: auto;align-content: flex-start;width: calc(100% + 20px) !important';
                }
                else {
                    listBox.style = 'overflow-y: auto;align-content: flex-start;width: 100% !important';
                }
            }
            setting.setListWidth();
            new MutationObserver(setting.setListWidth).observe(listBox,{childList:true});
        }
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

        //旧版创建视频卡
        function createOldRecommend(data) {
            return element._c({
                nodeType:'div',
                className:'spread-module',
                childs:[{
                    nodeType:'a',target:'_blank',
                    onmouseenter: data.goto=='av'&&tools.preview,
                    onmouseleave: data.goto=='av'&&tools.preview,
                    onmousemove: data.goto=='av'&&tools.preview,
                    href:data.goto=='av'?`/video/av${data.param}`:data.uri,
                    dataset:{
                        tag_id:data.tag?data.tag.tag_id:'',
                        id:data.param,goto:data.goto,mid:data.mid,rid:data.tid
                    },
                    childs:[
                        {
                            nodeType:'div',className:'pic',
                            childs:[
                                `<div class="lazy-img"><img src="${data.cover}@160w_100h.${tools.imgType}" /></div>`,
                                `<div class="cover-preview-module"></div>`,
                                `<div class="mask-video"></div>`,
                                `<div class="danmu-module"></div>`,
                                `<span title="分区：${data.tname||data.badge}" class="tname">${data.tname||data.badge}</span>`,
                                data.duration&&`<span class="dur">${tools.formatNumber(data.duration,'time')}</span>`||'',
                                data.goto=='av'?{
                                    nodeType:'div',
                                    dataset:{aid:data.param},title:'稍后再看',
                                    className:'watch-later-trigger w-later',
                                    onclick:tools.watchLater
                                }:'',
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
            })
        }
        //新版创建视频卡
        function createNewRecommend(data) {
            return element._c({
                nodeType:'div',style:'display:block',
                className:'video-card-common',
                childs:[
                    {
                        nodeType:'div',className:'card-pic',
                        onmouseenter: data.goto=='av'&&tools.preview,
                        onmouseleave: data.goto=='av'&&tools.preview,
                        onmousemove: data.goto=='av'&&tools.preview,
                        dataset:{
                            tag_id:data.tag?data.tag.tag_id:'',
                            id:data.param,goto:data.goto,mid:data.mid,rid:data.tid
                        },
                        childs:[
                            `<a href="${data.goto=='av'?`/video/av${data.param}`:data.uri}" target="_blank">`
                            + `<img src="${data.cover}@216w_122h_1c_100q.${tools.imgType}"><div class="count">`
                            + `<div class="left"><span><i class="bilifont bili-icon_shipin_bofangshu"></i>${tools.formatNumber(data.play)}</span>`
                            +(data.like&&`<span><i class="bilifont bili-icon_shipin_dianzanshu"></i>${data.like}</span></div>`||'</div>')
                            + `<div class="right"><span>${data.duration&&tools.formatNumber(data.duration,'time')||''}</span></div></div></a>`,
                            `<div class="cover-preview-module van-framepreview"></div>`,
                            `<div class="danmu-module van-danmu"></div>`,
                            `<span title="分区：${data.tname||data.badge}" class="tname">${data.tname||data.badge}</span>`,
                            data.goto=='av'?{
                                nodeType:'div',
                                dataset:{aid:data.param},title:'稍后再看',
                                className:'watch-later-video van-watchlater black',
                                onclick:tools.watchLater
                            }:'',
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
                    `<a href="${data.goto=='av'?`/video/av${data.param}`:data.uri}" target="_blank" title="${data.title}" class="title">${data.title}</a>`,
                    `<a href="//space.bilibili.com/${data.mid}/" target="_blank" class="up"><i class="bilifont bili-icon_xinxi_UPzhu"></i>${data.name||data.badge}</a>`,
                ]
            })
        }
        //显示推荐视频
        function updateRecommend (datas){
            const point = listBox.firstChild;
            datas.forEach(data=>{
                const recommend = element.isNew?createNewRecommend(data):createOldRecommend(data);
                recommends.push(point.insertAdjacentElement('beforeBegin',recommend));
            });
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
                while(!parent.dataset.id&&deep++<4){
                    target = parent;
                    parent=target.parentNode;
                }
                if (!parent.dataset.id){
                    tools.toast('请求撤销稍后再看失败：页面元素异常',ev);
                    return false;
                }
                url += `/cancel`;
            }else{
                parent = parent.parentNode.parentNode;
                if(!element.isNew) parent = parent.parentNode;
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
                    cover.innerHTML = `<a class="lazy-img"><br><br>提交成功，但愿服务器以后少给点这种东西。<br><br><b>点击撤销操作</b></a>`;
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
        let rankingAll;
        if(element.isNew) {
            //……直接把旧版的排行修一修搬过来用吧
            rankingAll = element.mainDiv.querySelector('.rank-list');
            element._s(rankingAll,{
                className:'sec-rank report-wrap-module zone-rank rank-list',
                innerHTML:`
<style>
.bili-dropdown{position:relative;display:inline-block;vertical-align:middle;background-color:#fff;cursor:default;padding:0
7px;height:22px;line-height:22px;border:1px solid #ccd0d7;border-radius:4px}.bili-dropdown:hover{border-radius:4px 4px 0
0;box-shadow:0 2px 4px rgba(0,0,0,.16)}.bili-dropdown:hover .dropdown-list{display:block}.bili-dropdown
.selected{display:inline-block;vertical-align:top}.bili-dropdown .icon-arrow-down{background-position:-475px
-157px;display:inline-block;vertical-align:middle;width:12px;height:6px;margin-left:5px;margin-top:-1px}.bili-dropdown
.dropdown-list{position:absolute;width:100%;background:#fff;border:1px solid
#ccd0d7;border-top:0;left:-1px;top:22px;z-index:10;display:none;border-radius:0 0 4px 4px}.bili-dropdown .dropdown-list
.dropdown-item{cursor:pointer;margin:0;padding:3px 7px}.bili-dropdown .dropdown-list
.dropdown-item:hover{background-color:#e5e9ef}.rank-list
.rank-item{position:relative;padding-left:25px;margin-top:20px;overflow:hidden}.rank-list
.rank-item.first{margin-top:0;margin-bottom:15px}.rank-list .rank-item
.ri-num{position:absolute;color:#999;height:18px;line-height:18px;width:18px;top:0;left:0;font-size:12px;min-width:12px;text-align:center;padding:0
3px;font-weight:bolder;font-style:normal}.rank-list .rank-item.highlight .ri-num{background:#00a1d6;color:#fff}.rank-list
.rank-item .ri-info-wrap{position:relative;display:block;cursor:pointer}.rank-list .rank-item .ri-info-wrap
.w-later{right:160px}.rank-list .rank-item .ri-info-wrap:hover .w-later{display:block}.rank-list .rank-item
.ri-preview{margin-right:5px;width:80px;height:50px;float:left;display:none;border-radius:4px;overflow:hidden}.rank-list
.rank-item.show-detail .ri-preview{display:block}.rank-list .rank-item .ri-detail{float:left}.rank-list .rank-item .ri-detail
.ri-title{line-height:18px;height:18px;overflow:hidden;color:#222}.rank-list .rank-item .ri-detail
.ri-point{line-height:12px;color:#99a2aa;height:12px;margin-top:5px;display:none;overflow:hidden}.rank-list .rank-item.show-detail
.ri-detail .ri-title{height:36px;line-height:18px;margin-top:-3px;width:150px;padding:0}.rank-list .rank-item.show-detail
.ri-point{display:block}.rank-list .rank-item:hover .ri-title{color:#00a1d6}.sec-rank{overflow:hidden}
.sec-rank .rank-head h3{float:left;font-size:18px;font-weight:400}.sec-rank .rank-head
.rank-tab{margin-left:20px;float:left}.sec-rank .rank-head .rank-dropdown{float:right}.sec-rank
.rank-list-wrap{width:200%;overflow:hidden;zoom:1;transition:all .2s linear}.sec-rank .rank-list-wrap
.rank-list{padding-bottom:15px;min-height:278px;width:50%;float:left;padding-top:20px;position:relative}.sec-rank .rank-list-wrap
.rank-list .state{line-height:100px}.sec-rank .rank-list-wrap.show-origin{margin-left:-100%}.sec-rank
.more-link{display:block;height:24px;line-height:24px;background-color:#e5e9ef;text-align:center;border:1px solid
#e0e6ed;color:#222;border-radius:4px;transition:.2s}.sec-rank
.more-link:hover{background-color:#ccd0d7;border-color:#ccd0d7}.sec-rank .more-link
.icon-arrow-r{display:inline-block;vertical-align:middle;background-position:-478px -218px;width:6px;height:12px;margin:-2px 0 0
5px}.bili-tab{overflow:hidden;zoom:1}.bili-tab
.bili-tab-item{float:left;position:relative;height:20px;line-height:20px;cursor:pointer;padding:1px 0 2px;border-bottom:1px solid
transparent;margin-left:12px;transition:.2s;transition-property:border,color}.bili-tab
.bili-tab-item:before{content:&quot;&quot;;display:none;position:absolute;left:50%;margin-left:-3px;bottom:0;width:0;height:0;border-bottom:3px
solid #00a1d6;border-top:0;border-left:3px dashed transparent;border-right:3px dashed transparent}.bili-tab
.bili-tab-item.on{background-color:transparent;border-color:#00a1d6;color:#00a1d6}.bili-tab
.bili-tab-item.on:before{display:block}.bili-tab .bili-tab-item:hover{color:#00a1d6}.bili-tab
.bili-tab-item:first-child{margin-left:0}ul.rank-list{width:50%!important}.video-info-module{position:absolute;top:0;left:0;width:320px;border:1px
solid #ccd0d7;border-radius:4px;box-shadow:0 2px 4px
rgba(0,0,0,.16);box-sizing:border-box;z-index:10020;overflow:hidden;background-color:#fff;padding:12px}.video-info-module
.v-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;height:20px;line-height:12px}.video-info-module
.v-info{color:#99a2aa;padding:4px 0 6px}.video-info-module .v-info
span{display:inline-block;vertical-align:top;height:16px;line-height:12px}.video-info-module .v-info
.name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}.video-info-module .v-info
.line{display:inline-block;border-left:1px solid #99a2aa;height:12px;margin:1px 10px 0}.video-info-module .v-preview{padding:8px 0
12px;border-top:1px solid #e5e9ef;height:64px}.video-info-module .v-preview
.lazy-img{width:auto;float:left;margin-right:8px;margin-top:4px;height:auto;border-radius:4px;overflow:hidden;width:96px;height:60px}.video-info-module
.v-preview
.txt{height:60px;overflow:hidden;line-height:21px;word-wrap:break-word;word-break:break-all;color:#99a2aa}.video-info-module
.v-data{border-top:1px solid #e5e9ef;padding-top:10px}.video-info-module .v-data
span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;width:70px;color:#99a2aa;line-height:12px}.video-info-module
.v-data span .icon{margin-right:4px;vertical-align:top;display:inline-block;width:12px;height:12px}.video-info-module .v-data .play
.icon{background-position:-282px -90px}.video-info-module .v-data .danmu .icon{background-position:-282px -218px}.video-info-module
.v-data .star .icon{background-position:-282px -346px}.video-info-module .v-data .coin .icon{background-position:-282px -410px}
</style>
<header class="rank-head rank-header"><h3 class="name">排行</h3><div class="bili-tab rank-tab"><div class="bili-tab-item on">全部</div><div class="bili-tab-item">原创</div></div>
<div class="bili-dropdown rank-dropdown"><span class="selected">三日</span><i class="icon icon-arrow-down"></i>
<ul class="dropdown-list"><li class="dropdown-item" style="display: none;">三日</li><li class="dropdown-item">一周</li></ul></div></header>
<div class="rank-list-wrap"><ul class="rank-list hot-list"><li class="state"><div class="b-loading"></div></li></ul><ul class="rank-list origin-list">
<li class="state"><div class="b-loading"></div></li></ul></div><a href="/ranking/all/1/1/3/" target="_blank" class="more-link">查看更多<i class="icon icon-arrow-r"></i></a>`
            });
        }
        else {
            rankingAll = element.mainDiv.querySelector('#ranking_douga');
        }
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
                className:'dropdown-item'
            }))
        });
        //创建一个显示详情的浮窗
        detail.div = element._c({
            nodeType:'div',style:'display:none',
            className:'spread-module video-info-module',
            onmouseenter: ()=> (detail.div.style.display = 'block'),
            onmouseleave: ()=> (detail.div.style.display = 'none'),
        });
        warp.insertBefore(detail.div,warp.lastChild);

        //更新显示详情浮窗内容
        function updateDetail(data,offsetTop){
            element._s(detail.div,{
                style: `display:"none";left:${rankingAll.offsetLeft}px;top:${offsetTop}px;`,
                innerHTML:['<style>.clearfix.v-data>div>span{display: block;margin-bottom: 4px;width: 100%;}',
                           '.cover-preview-module.show {opacity: 1}',
                           '.cover-preview-module .cover {position: absolute;left: 0;top: 7px;height: 98px;width: 100%;margin-top: 2px}',
                           '.spread-module .pic {position: relative;display: block;overflow: hidden;border-radius: 4px}</style>',
                          ].join(''),
                childs:[
                    `<a class="v-title" target="_blank" style="color: rgb(0, 0, 0);" title="${data.title}" href="${`/video/av${data.aid}/`}">${data.title}</a>`,
                    {
                        nodeType:'div',
                        className:'clearfix v-data',
                        childs:[
                            {nodeType:'div',style:'display: inline-block;width:160px',
                             childs:[{
                                nodeType:'a',target:'_blank',
                                href: '/video/av'+data.aid,
                                onmouseenter: tools.preview,
                                onmouseleave: tools.preview,
                                onmousemove: tools.preview,
                                dataset:{id:data.aid},
                                childs:[
                                    {
                                        nodeType:'div',className:'pic',
                                        childs:[
                                            `<div class="lazy-img" style="height:100px"><img src="${data.pic.replace(/https?:/,'')}@160w_100h.${tools.imgType}" /></div>`,
                                            `<div class="cover-preview-module ${element.isNew?'van-framepreview':''} ranking"></div>`,
                                            `<div class="mask-video"></div>`,
                                            `<div class="danmu-module van-danmu"></div>`,
                                            //`<span title="分区：${data.tname||data.badge}" class="tname">${data.tname||data.badge}</span>`,
                                            {
                                                nodeType:'div',
                                                dataset:{aid:data.aid},title:'稍后再看',
                                                className:'watch-later-trigger w-later watch-later-video van-watchlater black',
                                                onclick:tools.watchLater
                                            },
                                        ]
                                    },
                                ]
                            }]},
                            {
                                nodeType:'div',
                                style:'display: inline-block;vertical-align: top;width: 130px;margin-left:3px',
                                childs:[
                                    '<span class="name"><i class="icon bilifont bili-icon_xinxi_UPzhu" style="background-position: -282px -154px;"></i>'+
                                    `<a href="//space.bilibili.com/${data.mid}/" target="_blank" title="${data.author}">${data.author}</a></span>`,
                                    '<span class="play"><i class="icon bilifont bili-icon_shipin_bofangshu"></i>'+
                                    `<span title="${data.play}">${tools.formatNumber(data.play)}</span></span>`,
                                    '<span class="danmu"><i class="icon bilifont bili-icon_shipin_danmushu"></i>'+
                                    `<span title="${data.video_review}">${tools.formatNumber(data.video_review)}</span></span>`,
                                    '<span class="coin"><i class="icon bilifont bili-icon_shipin_yingbishu"></i>'+
                                    `<span title="${data.coins}">${tools.formatNumber(data.coins)}</span></span>`,
                                    `<span>时长:<span style="vertical-align: top;" title="${tools.formatNumber(data.duration)}">${tools.formatNumber(data.duration)}</span>`,
                                    `<span>综合评分:<span style="vertical-align: top;" title="${data.pts}">${tools.formatNumber(data.pts)}</span></span>`,
                                ]
                            },
                        ]
                    }
                ]
            });
        };
        //将排行数据显示到指定目标中
        function showData(target,data){
            for (let i = 0;i<data.length;i++){
                const itemData = data[i];
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
                                (i==0?`<div class="lazy-img ri-preview"><img src="${itemData.pic.split(':')[1]}@72w_45h.${tools.imgType}"></div>`:''),
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
        //获取并缓存数据
        async function getData(type,day){
            if (data[type][day]) return data[type][day];
            return fetch(`https://api.bilibili.com/x/web-interface/ranking?rid=0&day=${day}&type=${type}&arc_type=0`)
                .then(res=>res.json())
                .then(list=>{
                if (list.code!=0){
                    throw `请求排行榜失败 code ${list.code}</br>msg ${list.message}`;
                }
                return (data[type][day] = list.data.list);
            });
        };
        //更新页面排行显示状态，并调用更新显示视频
        function update(ev){
            if (ev.target.className =='dropdown-item'){
                dropDown.firstChild.innerText = ev.target.innerText;
                [].forEach.call(dropDown.lastChild.childNodes,c => {c.style.display=c==ev.target?'none':'unset';});
                day = ev.target.dataset.day;
            }else{
                [].forEach.call(tab.childNodes,c=>{
                    if (c==ev.target) c.removeEventListener('mouseover',update);
                    else c.addEventListener('mouseover',update);
                    c.classList.toggle('on');
                });
                type = ev.target.innerText=='全部'?1:2;
                warp.classList.toggle('show-origin');
            }
            const target = type==1?warp.firstChild:warp.lastChild;
            while(target.firstChild) target.removeChild(target.firstChild);
            loading.firstChild.innerText = '正在加载...';
            target.appendChild(loading);
            rankingAll.lastChild.href = `/ranking/${type==1?'all':'origin'}/0/0/${day}/`;
            getData(type,day)
                .then((data)=>showData(target,data))
                .then(()=>target.removeChild(loading))
                .catch(e=>{
                loading.firstChild.innerText = `请求排行榜发生错误 ${e}`;
                console.error('请求排行榜发生错误',e);
            });
        };
        [].forEach.call(dropDown.lastChild.childNodes,c => {c.onclick = update;});
        tab.lastChild.addEventListener('mouseover',update);
        update({target:[].find.call(dropDown.lastChild.childNodes,n=>n.dataset.day==day)});
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
                //不显示滚动条情况下，将内层容器宽度设置为比外层宽度多一个滚动条，则滚动条位置会溢出被遮挡
                this.styleDiv.innerHTML = '#ranking-all .rank-list-wrap{width:calc(200% + 40px)}'
                    + '#ranking-all .rank-list-wrap.show-origin{margin-left:calc(-100% - 20px)}'
                    ;
                //左侧推荐容器本同理，但因为新版弹性布局如果没有滚动条内容会伸展到超出可视范围，需针对设置
            }
            else {
                //显示滚动条情况下，排行榜容器维持原样式，内层容器自带滚动条。
                //左侧推荐容器将内层高度设置为弹性，则外层容器固定高度下如果内容超出会显示滚动条。
                this.styleDiv.innerHTML = '#recommend #recommend-list{height:unset!important;}';
            }

            //设置推荐容器宽高
            if (element.isNew) {
                this.styleDiv.innerHTML += `#recommend  .storey-box {height:calc(404px / 2 * ${this.boxHeight})}`
                    + ` #ranking-all ul.rank-list{height:calc(404px / 2 * ${this.boxHeight})}`
                    + `@media screen and (max-width: 1438px) { #recommend  .storey-box {height:calc(360px / 2 * ${this.boxHeight})}`
                    + `#ranking-all ul.rank-list{height:calc(360px / 2 * ${this.boxHeight})}}`;
                if(this.setListWidth) {
                    //新版的推荐容器宽度针对设置，该方法由初始化推荐容器的方法自行构造，真是深井冰的一团糟乱调用
                    this.setListWidth();
                }
            }
            else {
                //旧版因为固定间隔布局的原因，无论滚动条在内还是在外是否显示均需要维持比外层多一个滚动条宽度
                this.styleDiv.innerHTML += `#recommend  .storey-box {height:calc(336px / 2 * ${this.boxHeight})}`
                    + `#ranking-all ul.rank-list{height:calc(336px / 2 * ${this.boxHeight} - 16px)}`
                    + '#recommend #recommend-list{width:calc(100% + 20px)!important;}';
            }
        },
        show(){
            if(this.dialog) return document.body.appendChild(this.dialog);
            this.dialog = element._c({
                nodeType:'div',
                id:'biliAppHomeSetting',
                style:'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: rgba(0,0,0,0.4);z-index: 10000;',
                childs:[{
                    nodeType:'div',
                    style:'width:200px;right:0;left:0;position:absolute;padding:20px;background:#fff;border-radius:8px;margin:auto;transform:translate(0,50%);box-sizing:content-box',
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
                                `<span style="margin-right: 5px;color:#00f" title="${[
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
                        +'&api=https%3A%2F%2Fwww.mcbbs.net%2Fbilibili_connect.php&sign=78d0f6a90a58e7dc5198f05dc481c06f',
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
                return undefined;
            }
        })(),
        getLoadingDiv(target){
            return this._c({
                nodeType:'div',style:target=='recommend'?'padding:0;width:100%;height:unset;text-align: center;':'text-align: center;',
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
            setTimeout(()=>document.body.removeChild(div),2000);
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
        },
        //视频预览……做得挺深井冰的……
        previewImage (pv,target,width) {
            if(!pv||!target||!target.cover) return;
            let pWidth = target.parentNode.offsetWidth, data = target.cover,
                  percent = +width/pWidth,
                  index = Math.floor(percent*data.index.length),
                  url = data.image[Math.floor(index/data.img_x_len/data.img_y_len)],
                  size = pWidth * data.img_x_len,
                  y = Math.floor(index/data.img_x_len) * -pWidth/data.img_x_size * data.img_y_size,
                  x = (index % target.cover.img_x_len) * -pWidth;
            if(pv.classList.contains('van-framepreview')) {
                if(pv.classList.contains('ranking')) y += 10;
                pv.style = `background-image: url(${url}); background-position: ${x}px ${y}px; background-size: ${size}px;opacity:1;`;
                pv.innerHTML = `<div class="van-fpbar-box"><span style="width: ${percent*100}%;display:block;"></span></div>`;
            }
            else {
                pv.innerHTML = `<div class="cover" style="background-image: url(${url}); background-position: ${x}px ${y}px; background-size: ${size}px;"></div>`
                    + `<div class="progress-bar van-fpbar-box"><span style="width: ${percent*100}%;display:block;"></span></div>`
            }
        },
        previewDanmu (target,status) {
            if(!target||!target.data||!target.data.length||!target.previewDanmu) return;
            clearInterval(target.timmer);
            if(status) {
                target.previewDanmu();
                target.timmer = setInterval(target.previewDanmu, 2.5*1000);
            }
            else {
                target.style.opacity = 0;
            }
        },
        preview (ev){
            if(!ev.target) return;
            let deep = 1,target = ev.target;
            while(!target.dataset.id&&deep++<4){
                target=target.parentNode;
            }
            const pv = target.querySelector('.cover-preview-module'),
                  danmu = target.querySelector('.danmu-module');
            if(!pv||!danmu) return;
            if(ev.type=='mouseenter') {
                target.timmer = setTimeout(()=>{
                    if(!target.timmer) return;
                    pv.classList.add('show');
                    danmu.classList.add('show');
                    if(!target.cover) {
                        fetch(`//api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()}`)
                            .then(res=>res.json())
                            .then(d=>(target.cover = d.data))
                            .then(()=>fetch(`//api.bilibili.com/x/v2/dm/ajax?aid=${target.dataset.id}&_=${Date.now()}`))
                            .then(res=>res.json())
                            .then(d=>{
                            danmu.data = d.data;
                            danmu.count = 0;
                            danmu.previewDanmu = function (){
                                danmu.style.opacity = 1;
                                if(danmu.count%danmu.data.length==0) {
                                    danmu.count = 0;
                                    danmu.innerHTML = danmu.data.map((item,i)=>`<p class="dm van-danmu-item ${i%2?'':'row2'}">${item}</p>`).join('');
                                }
                                const item = danmu.children[danmu.count++];
                                if(!item) return;
                                item.style = `left: -${item.offsetWidth}px; transition: left 5s linear 0s;`;
                            };
                            if(!target.timmer) return;
                            tools.previewImage(pv,target,ev.offsetX);
                            tools.previewDanmu(danmu, true);
                            delete target.timmer;
                        });
                    }
                    else {
                        tools.previewImage(pv,target,ev.offsetX);
                        tools.previewDanmu(danmu, true);
                        delete target.timmer;
                    }
                },100);
            }
            else if(ev.type=='mouseleave') {
                clearTimeout(target.timmer);
                delete target.timmer;
                pv.classList.remove('show');
                if(pv.classList.contains('van-framepreview')) {
                    pv.style.opacity = 0;
                }
                danmu.classList.remove('show');
                tools.previewDanmu(danmu, false);
            }
            else {
                if(!target.cover) return;
                tools.previewImage(pv,target,ev.offsetX);
            }
        }
    };

    //初始化
    function init() {
        if (document.querySelector('.international-home')) element.isNew = true;;
        try{
            setting.setStyle();
            InitRecommend();
            window.addEventListener("beforeunload", ()=>setting.saveHistory());
            InitRanking();
        }catch(e){
            console.error(e);
        }
    }
    if (element.mainDiv){
        init();
    }
    else {
        if(document.head.querySelector('link[href*=home]')) {
            //console.log('observe');
            new MutationObserver((mutations,observer)=>{
                //console.log(mutations)
                for(const mutation of mutations){
                    for (const node of mutation.addedNodes) {
                        if(node.id=='bili_douga') {
                            observer.disconnect();
                            element.mainDiv = node.cloneNode(true);
                            init();
                            return;
                        }
                    }
                }
            }).observe(document.body,{
                childList: true,
                subtree: true,
            });
        }
    }
})();
