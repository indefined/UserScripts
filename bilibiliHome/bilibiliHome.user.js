// ==UserScript==
// @name         bilibili网页端添加APP首页推荐
// @namespace    indefined
// @version      0.4.2
// @description  添加APP首页数据、可选提交不喜欢的视频
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
</style>`;

    function Setting() {
        let actionButton;
        element._c({
            nodeType:'div',
            id:'biliAppHomeSetting',
            style:'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: rgba(0,0,0,0.4);z-index: 10000;',
            childs:[{
                nodeType:'div',
                style:'width:400px;right:0;left:0;position:absolute;padding:20px;background:#fff;border-radius:8px;margin:auto;transform:translate(0,50%);',
                childs:[
                    '<h2 style="font-size: 20px;color: #4fc1e9;font-weight: 400;">APP首页推荐设置</h2>',
                    {
                        nodeType:'span',innerText:'Ｘ',
                        style:"position: absolute;right: 15px;top: 15px;cursor: pointer;font-size: 20px;",
                        onclick:()=>document.body.removeChild(document.getElementById('biliAppHomeSetting'))
                    },
                    {
                        nodeType:'div',style:'margin: 10px 0;',
                        childs:[
                            [
                                '目前获取根据个人观看喜好的APP首页数据和提交定制不喜欢的视频需要获取授权key。',
                                '点击获取授权将从官方授权接口获取一个授权key，获取的key保存在脚本管理器内。',
                                '如果不想使用授权，脚本仍然能从官方接口获取随机推荐视频，但内容可能不再根据个人喜好且无法提交不喜欢内容。',
                                '点击删除授权可从脚本管理器中删除已获取授权key，脚本将按照没有获取授权的情况执行。',
                                '授权key有效期大约一个月，如果看到奇怪的推荐提交不喜欢时遇到奇怪的错误可以尝试删除授权重新获取。'
                            ].join('</br></br>')
                        ]
                    },
                    {
                        nodeType:'div',
                        style:'text-align: right;line-height: 30px;',
                        childs:[
                            (actionButton = element._c({
                                nodeType:'button',
                                style:'padding:0 20px;height:30px;background:#4fc1e9;color:white;border-radius:5px;border:none;cursor:pointer;left:20px;position:absolute;',
                                innerText:tools.accessKey?'删除授权':'获取授权',
                                onclick:handleKey
                            })),
                            '<a href="https://github.com/indefined/UserScripts/issues" target="_blank" style="padding-left:20px;">github问题反馈</a>',
                            `<a href="https://greasyfork.org/scripts/368446" target="_blank" style="padding-left:20px;">当前版本:${GM_info.script.version}</a>`
                        ]
                    }
                ]
            }],
            parent:document.body
        });
        function handleKey(){
            if (actionButton.innerText === '删除授权') {
                tools.storageAccessKey(undefined);
                actionButton.innerText = '获取授权';
                tools.toast('删除授权成功');
                return;
            }
            else {
                actionButton.innerText = '获取中...';
                actionButton.onclick = undefined;
                new Promise((resolve,reject)=>{
                    GM_xmlhttpRequest({
                        method: 'GET',timeout:5000,
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
                        method: 'GET',url,timeout:5000,
                        onload: res=> {
                            try{
                                const key = res.finalUrl.match(/access_key=([0-9a-z]{32})/);
                                if (key) {
                                    tools.storageAccessKey(key[1]);
                                    tools.toast('获取授权成功');
                                    actionButton.innerText = '删除授权';
                                }
                                resolve();
                            }catch(e){reject(e)}
                        },
                        onerror: e=>reject({msg:e.error,toString:()=>'获取授权错误'}),
                        ontimeout: e=>reject({msg:e.error,toString:()=>'获取授权超时'})
                    });
                })).catch(error=> {
                    actionButton.innerText = '获取授权';
                    tools.toast('获取授权失败:'+error,error);
                }).then(()=>{
                    actionButton.onclick = handleKey;
                });
            }
        }
    }

    function InitRecommend () {
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
                            className:'link-more',
                            innerHTML:'<span>设置  </span><i class="icon"></i>',
                            onclick:Setting
                        },
                        {
                            nodeType:'div',
                            className:'read-push',
                            innerHTML:'<i class="icon icon_read"></i><span class="info">换一批</span>',
                            onclick:updateRecommend
                        },
                    ]
                }
            ]
        });
        document.querySelector('#home_popularize').insertAdjacentElement('afterend',element.mainDiv);
        const listBox = element.mainDiv.querySelector('div.storey-box.clearfix');
        updateRecommend();
        function updateRecommend () {
            let loading;
            element._s(listBox,{
                innerHTML:'',
                childs:[loading=element.getLoadingDiv()]
            });
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://app.bilibili.com/x/feed/index?build=1&mobi_app=android&idx='
                + (Date.now()/1000).toFixed(0) + (tools.accessKey?'&access_key='+tools.accessKey:''),
                onload: res=>{
                    try {
                        const rep = JSON.parse(res.response);
                        if (rep.code!=0){
                            loading.firstChild.innerText = `请求app首页失败 code ${rep.code}</br>msg ${rep.message}`;
                            return console.error('请求app首页失败',rep);
                        }
                        element._s(listBox,{
                            innerHTML:'',
                            childs:rep.data.map(data=>createItem(data))
                        });
                    } catch (e){
                        loading.firstChild.innerText = `请求app首页发生错误 ${e}`;
                        console.error(e,'请求app首页发生错误');
                    }
                },
                onerror: e=>{
                    loading.firstChild.innerText = `请求app首页发生错误 ${e}`;
                    console.error(e,'请求app首页发生错误');
                }
            });
        }

        function createItem (data){
            return element._c({
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
                                (data.dislike_reasons&&tools.accessKey)?{
                                    nodeType:'div',innerText:'Ｘ',
                                    className:'dislike-botton',
                                    childs:[{
                                        nodeType:'div',
                                        className:'dislike-list',
                                        childs:data.dislike_reasons.map(reason=>({
                                            nodeType:'div',
                                            dataset:{reason_id:reason.reason_id},
                                            innerText:reason.reason_name,
                                            title:`标记因为【${reason.reason_name}】不喜欢`,
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
                }],
            });
        }

        function dislike (ev) {
            let target=ev.target,parent=target.parentNode;
            let cancel;
            let url = `${document.location.protocol}//app.bilibili.com/x/feed/dislike`;
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
            if (tools.accessKey) url += '&access_key='+ tools.accessKey;
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
                            tools.storageAccessKey(undefined);
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

    function InitRanking(){
        const rankingAll = element.mainDiv.querySelector('#ranking_douga');
        rankingAll.id = 'ranking-all';
        const rankingHead = rankingAll.querySelector('.rank-head');
        rankingHead.firstChild.innerText = '全站排行';
        const tab = rankingHead.querySelector('.bili-tab.rank-tab');
        const dropDown = rankingHead.querySelector('.bili-dropdown.rank-dropdown');
        const warp = rankingAll.querySelector('.rank-list-wrap');
        let type = 1;
        let day = 3;
        const data = {1:{},2:{}};
        const loading = element.getLoadingDiv();
        const updateItems = target =>{
            target.removeChild(loading);
            for (let i = 0;i<7;i++){
                const itemData = data[type][day][i];
                element._c({
                    nodeType:'li',
                    className:i==0?'rank-item show-detail first highlight':i<3?'rank-item highlight':'rank-item',
                    childs:[
                        `<i class="ri-num">${i+1}</i>`,
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
        const updateRanking = ()=>{
            const target = type==1?warp.firstChild:warp.lastChild;
            while(target.firstChild) target.removeChild(target.firstChild);
            loading.firstChild.innerText = '正在加载...';
            target.appendChild(loading);
            rankingAll.lastChild.href = `/ranking/${type==1?'all':'origin'}/0/0/${day}/`;
            if (!data[type][day]){
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `${document.location.protocol}//api.bilibili.com/x/web-interface/ranking?rid=0&day=${day}&type=${type}&arc_type=0`,
                    onload: res=>{
                        try {
                            const rep = JSON.parse(res.response);
                            if (rep.code!=0){
                                loading.firstChild.innerText = `请求排行榜失败 code ${rep.code}</br>msg ${rep.message}`;
                                return console.log('请求app首页失败',rep);
                            }
                            data[type][day] = rep.data.list;
                            updateItems(target);
                        } catch (e){
                            loading.firstChild.innerText = `请求排行榜发生错误 ${e}`;
                            console.error('请求排行榜发生错误',e);
                        }
                    }
                });
            }else updateItems(target);
        };
        const updateStatus = ev=>{
            if (ev.target.className =='dropdown-item'){
                dropDown.firstChild.innerText = ev.target.innerText;
                [].forEach.call(dropDown.lastChild.childNodes,c => {c.style.display=c.style.display=='none'?'unset':'none';});
                day = ev.target.innerText=='三日'?3:7;
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

    const element = {
        mainDiv:(()=>{
            try{
                return document.querySelector('#bili_douga').cloneNode(true);
            }catch(e){
                console.error('添加APP首页推荐找不到动画版块');
                return undefined;
            }
        })(),
        getLoadingDiv(){
            return this._c({
                nodeType:'div',
                className:'load-state',
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

    const tools = {
        accessKey:GM_getValue('biliAppHomeKey'),
        storageAccessKey(key){
            if(key) {
                this.accessKey = key;
                GM_setValue('biliAppHomeKey',key);
            }
            else {
                delete this.accessKey;
                GM_deleteValue('biliAppHomeKey');
            }
        },
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

    if (element.mainDiv){
        try{
            InitRecommend();
            InitRanking();
        }catch(e){
            console.error(e);
        }
    }
})();
