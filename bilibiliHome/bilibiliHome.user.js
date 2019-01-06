// ==UserScript==
// @name         bilibili网页端添加APP首页推荐
// @namespace    indefined
// @version      0.3.2
// @description  添加APP首页数据、可选通过鉴权提交不喜欢的视频
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

let accessKey = GM_getValue('biliAppHomeKey');
const storageAccessKey = key => key?GM_setValue('biliAppHomeKey',key):GM_deleteValue('biliAppHomeKey');

const token = (()=>{
    try{
        return document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/)[1];
    }catch(e){
        console.error('添加APP首页推荐找不到token，请检查是否登录');
        return undefined;
    }
})();
const recommend = (()=>{
    try{
        return document.querySelector('#bili_douga').cloneNode(true);
    }catch(e){
        console.error('添加APP首页推荐找不到动画版块，可能是网页加载延迟或者b站改版了，请重试或等待更新');
        return undefined;
    }
})();
const imgType = (()=>{
    try{
        return 0==document.createElement('canvas').toDataURL("image/webp").indexOf("data:image/webp")?'webp':'jpg';
    }catch(e){
        return 'jpg';
    }
})();
if (recommend){
    CreateCss();
    InitRecommend();
    InitRanking();
}

function CreateCss(){
	const css = document.createElement('style');
	css.type = 'text/css';
	css.innerHTML = `
		.dislike-botton,.tname {
		position: absolute;
		top: 2px;
		opacity: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		text-align: right;
		font-weight: bold;
		-webkit-transition: all .3s;
		-o-transition: all .3s;
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
		.toast {
		  position: fixed;
		  padding: 12px 24px;
		  font-size: 14px;
		  border-radius: 8px;
		  left:50%;
		  top:50%;
		  width: 240px;
		  margin-left: -120px;
		  color: #fff;
		  background-color: #ffb243;
		  box-shadow: 0 0.2em 0.1em 0.1em rgba(255,190,68,0.2);
		  transition: transform 0.4s cubic-bezier(0.22, 0.58, 0.12, 0.98);
		  animation: link-msg-move-in-top cubic-bezier(0.22, 0.58, 0.12, 0.98) 0.4s;
		  z-index: 10000;
		}`;
	document.head.appendChild(css);
}

function InitRecommend () {
    recommend.id = 'recommend';
    recommend.querySelector('div.zone-title').innerHTML = `<div class="headline clearfix ">
<i class="icon icon_t icon-douga"></i><span class="name">猜你喜欢</span>
<div class="link-more"><span>设置  </span><i class="icon"></i></div>
<div class="read-push"><i class="icon icon_read"></i><span class="info">换一批</span></div></div>`;
    const popular = document.querySelector('#home_popularize');
    const listBox = recommend.querySelector('div.storey-box.clearfix');
    popular.parentElement.insertBefore(recommend,popular.nextSibling);
    recommend.querySelector('.read-push').onclick = UpdateRecommend;
    UpdateRecommend();
    function UpdateRecommend () {
        while(listBox.firstChild) listBox.removeChild(listBox.firstChild);
        const status = getLoadingDiv();
        listBox.appendChild(status);
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://app.bilibili.com/x/feed/index?build=1&mobi_app=android&idx=${(Date.now()/1000).toFixed(0)}${accessKey?'&access_key='+accessKey:''}`,
            onload: res=>{
                try {
                    const rep = JSON.parse(res.response);
                    if (rep.code!=0){
                        status.firstChild.innerText = `请求app首页失败 code ${rep.code} msg ${rep.message} 请检查问题重试或打开调试终端查看更多信息`;
                        return console.log('请求app首页失败',rep);
                    }
                    listBox.removeChild(status);
                    rep.data.forEach(data=>{
                        const item = CreateItem(data);
                        listBox.appendChild(item);
                    });
                } catch (e){
                    status.firstChild.innerText = `请求app首页发生错误 ${e} 请检查问题重试或打开调试终端查看更多信息`;
                    console.error(e,'请求app首页发生错误');
                }
            }
        });
    }

    recommend.querySelector('div.link-more').onclick = function () {
        const settingDiv = document.createElement('div');
        settingDiv.id = 'biliAppHomeSetting';
        settingDiv.style = 'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: rgba(0,0,0,0.4);z-index: 10000;';
        settingDiv.innerHTML = `
<div style="width: 450px;right: 0;left: 0;position: absolute;padding: 20px;background: white;border-radius: 8px;margin: auto;transform: translate(0,50%);">
<h2 style="font-size: 20px;color: #4fc1e9;font-weight: 400;margin-bottom: 20px;">APP首页推荐设置</h2>
<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" style="position: absolute;right: 10px;top: 10px;cursor: pointer;" \
onclick="javascript:document.body.removeChild(document.getElementById('biliAppHomeSetting'))">
 <g>
  <line y2="20" x2="20" y1="0" x1="0" stroke-width="1.5" stroke="#2d64b3"></line>
  <line y2="0" x2="20" y1="20" x1="0" stroke-width="1.5" stroke="#2d64b3"></line>
 </g>
</svg>
目前获取根据个人观看喜好的APP首页数据和提交定制不喜欢的视频需要获取授权key。
<br><br>点击获取授权将登录bilibili用户反馈论坛从官方授权接口获取一个授权key，获取的key保存在脚本管理器内。
<br><br>如果不想使用反馈论坛可不用获取授权，脚本仍然能从官方接口获取随机推荐视频，但内容可能不再根据个人喜好且无法提交不喜欢内容。
<br><br>点击删除授权可从脚本管理器中删除已获取授权key，脚本将按照没有获取授权的情况执行。
<br><br>
<div style="text-align: right;line-height: 30px;">
<button id="biliAppKeyAction" style="padding:0 20px;height:30px;background:#4fc1e9;color:white;border-radius:5px;border:none;cursor:pointer;left:20px;position:absolute;">获取授权</button>
<a href="https://greasyfork.org/scripts/368446" target="_blank" style="padding-left: 20px;">脚本发布页</a>
<a href="https://github.com/indefined/UserScripts/issues" target="_blank" style="padding-left: 20px;">github问题反馈</a>
<span style="padding-left: 20px;margin-right: 10px;">当前版本：${GM_info.script.version}</span></div></div>`;
        const actionButton = settingDiv.querySelector('#biliAppKeyAction');
        document.body.appendChild(settingDiv);
        if (accessKey) {
            actionButton.innerText = '删除授权';
        }
        actionButton.onclick = ()=>{
            if (actionButton.innerText === '删除授权') {
                storageAccessKey(accessKey = undefined);
                actionButton.innerText = '获取授权';
                Toast('删除授权成功');
                return;
            }
            else {
                const timeout = setTimeout(()=>Toast('获取授权超时'),5000);
                const getKey = url => GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    onload: res=> {
                        clearTimeout(timeout);
                        const key = res.finalUrl.match(/access_key=([0-9a-z]{32})/);
                        if (key) {
                            storageAccessKey(accessKey = key[1]);
                            Toast('获取授权成功');
                            actionButton.innerText = '删除授权';
                        }
                    },
                    onerror: error=> {
                        clearTimeout(timeout);
                        Toast('获取授权失败'+error);
                        console.error(error);
                    }
                });
                GM_xmlhttpRequest({
                    method: 'GET',
                    url:`https://passport.bilibili.com/login/app/third?appkey=27eb53fc9058f8c3&api=http%3A%2F%2Flink.acg.tv%2Fsearch.php%3Fmod%3Dforum&sign=3c7f7018a38a3e674a8a778c97d44e67`,
                    onload: res=> {
                        try {
                            const data = JSON.parse(res.response);
                            getKey(data.data.confirm_uri);
                        }catch(error){
                            clearTimeout(timeout);
                            Toast('获取授权失败'+error);
                            console.error(error);
                        }
                    },
                    onerror: error=> {
                        clearTimeout(timeout);
                        Toast('获取授权失败'+error);
                        console.error(error);
                    }
                });
            }
        }
    }

    function CreateItem (data){
        const item = document.createElement('div');
        item.className = 'spread-module';
        item.innerHTML = `
		  <a href="/video/av${data.param}/" target="_blank" data-tag_id="${data.tag?data.tag.tag_id:''}" data-id="${data.param}" data-goto="${data.goto}" data-mid="${data.mid}" data-rid="${data.tid}">
		  <div class="pic">
		  <div class="lazy-img"><img alt="${data.title}" src="${data.cover}@160w_100h.${imgType}" /></div>
		  <span title="分区：${data.tname}" class="tname">${data.tname}</span>
		  <span class="dur">${formatNumber(data.duration,'time')}</span>
		  <div data-aid=${data.param} title="稍后再看" class="watch-later-trigger w-later"></div>
		  <div class="dislike-botton">Ｘ<div class="dislike-list"></div></div></div>
		  <p title="${data.title}" class="t">${data.title}</p>
		  <p class="num"><span class="play">
		  <i class="icon"></i>${formatNumber(data.play)}</span>
		  <span class="danmu"><i class="icon"></i>${formatNumber(data.danmaku)}</span>
		  </p></a>`;
        item.querySelector('.watch-later-trigger').onclick = WatchLater;
        if (data.dislike_reasons&&accessKey){
            const dislikeList = item.querySelector('.dislike-list');
            for (const reason of data.dislike_reasons){
                const dislikeItem = document.createElement('div');
                dislikeItem.dataset.reason_id = reason.reason_id;
                dislikeItem.innerText = reason.reason_name;
                dislikeItem.title = `标记因为【${reason.reason_name}】不喜欢`;
                dislikeItem.onclick = DisLike;
                dislikeList.appendChild(dislikeItem);
            }
        }else {
            item.querySelector('.dislike-botton').style = 'display:none';
        }
        return item;
    }

    function DisLike (ev) {
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
                Toast('请求撤销稍后再看失败：找不到父节点，查看调试终端获取更多信息');
                console.log('请求撤销稍后再看找不到父节点',ev);
                return false;
            }
            url += `/cancel`;
        }else{
            parent = parent.parentNode.parentNode.parentNode;
        }
        url += `?goto=${parent.dataset.goto}&id=${parent.dataset.id}&mid=${parent.dataset.mid}&reason_id=${target.dataset.reason_id}&rid=${parent.dataset.rid}&tag_id=${parent.dataset.tag_id}`;
        if (accessKey) url += '&access_key='+accessKey;
        const handleCover = ()=>{
            if (cancel){
                parent.removeChild(target);
            }else{
                const cover = document.createElement('div');
                cover.className = 'dislike-cover';
                cover.dataset.reason_id = target.dataset.reason_id;
                cover.innerHTML = `<div class="lazy-img"><br><br>提交成功，但愿服务器以后少给点这种东西。<br><br><b>点击撤销操作</b></div>`;
                cover.onclick = DisLike;
                parent.appendChild(cover);
            }
        };
        //console.log(url);
        GM_xmlhttpRequest({
            method: 'GET',
            url,
            onload: res=>{
                try {
                    const par = JSON.parse(res.response);
                    if (par.code == 0){
                        handleCover();
                    }else if((par.code==-101 && par.message=='账号未登录') || par.code==-400){
                        storageAccessKey(accessKey = undefined);
                        Toast(`未获取授权或者授权失效，请点击设置重新获取授权`);
                    }
                    else{
                        Toast(`请求不喜欢错误 code ${par.code} msg ${par.message} 请检查问题重试或打开调试终端查看更多信息`);
                        console.log('请求不喜欢发生错误',par,url);
                    }
                } catch (e){
                    Toast(`请求不喜欢发生错误，请检查问题重试或打开调试终端查看更多信息`);
                    console.error(e,'请求不喜欢发生错误');
                }
            }
        });
        return false;
    }

}

function InitRanking(){
    const rankingAll = recommend.querySelector('#ranking_douga');
    rankingAll.id = 'ranking-all';
    const rankingHead = rankingAll.querySelector('.rank-head');
    rankingHead.firstChild.innerText = '全站排行';
    const tab = rankingHead.querySelector('.bili-tab.rank-tab');
    const dropDown = rankingHead.querySelector('.bili-dropdown.rank-dropdown');
    const warp = rankingAll.querySelector('.rank-list-wrap');
    let type = 1;
    let day = 3;
    const data = {1:{},2:{}};
    const status = getLoadingDiv();
    const UpdateItems = target =>{
        target.removeChild(status);
        for (let i = 0;i<7;i++){
            const itemData = data[type][day][i];
            const item = document.createElement('li');
            item.className = 'rank-item';
            if (i<3) item.classList.add('highlight');
            item.innerHTML = `<i class="ri-num">${i+1}</i>
				<a href="/video/av${itemData.aid}/" target="_blank" title="${itemData.title} 播放:${itemData.play} ${itemData.duration}" class="ri-info-wrap clearfix">
				<div class="ri-detail"><p class="ri-title">${itemData.title}</p><p class="ri-point">综合评分：${formatNumber(itemData.pts)}</p></div></a>`;
            if (i==0){
                item.className = 'rank-item show-detail first highlight';
                const a = item.querySelector('a');
                a.innerHTML = `<div class="lazy-img ri-preview"><img alt="${itemData.title}" src="${itemData.pic.split(':')[1]}@72w_45h.${imgType}"></div><div class="ri-detail"><p class="ri-title">${itemData.title}</p>
				<p class="ri-point">综合评分：${formatNumber(itemData.pts)}</p></div><div data-aid="${itemData.aid}" title="添加到稍后再看" class="watch-later-trigger w-later"></div>`;
                a.lastChild.onclick = WatchLater;
            }
            target.appendChild(item);
        }
    };
    const UpdateRanking = ()=>{
        const target = type==1?warp.firstChild:warp.lastChild;
        while(target.firstChild) target.removeChild(target.firstChild);
        status.firstChild.innerText = '正在加载...';
        target.appendChild(status);
        rankingAll.lastChild.href = `/ranking/${type==1?'all':'origin'}/0/0/${day}/`;
        if (!data[type][day]){
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${document.location.protocol}//api.bilibili.com/x/web-interface/ranking?rid=0&day=${day}&type=${type}&arc_type=0`,
                onload: res=>{
                    try {
                        const rep = JSON.parse(res.response);
                        if (rep.code!=0){
                            status.firstChild.innerText = `请求排行榜失败 code ${rep.code} msg ${rep.message} 请检查问题重试或打开调试终端查看更多信息`;
                            return console.log('请求app首页失败',rep);
                        }
                        data[type][day] = rep.data.list;
                        UpdateItems(target);
                    } catch (e){
                        status.firstChild.innerText = `请求排行榜发生错误 ${e} 请检查问题重试或打开调试终端查看更多信息`;
                        console.error(e,'请求排行榜发生错误');
                    }
                }
            });
        }else UpdateItems(target);
    };
    const UpdateStatus = ev=>{
        if (ev.target.className =='dropdown-item'){
            dropDown.firstChild.innerText = ev.target.innerText;
            [].forEach.call(dropDown.lastChild.childNodes,c => {c.style.display=c.style.display=='none'?'unset':'none';});
            day = ev.target.innerText=='三日'?3:7;
        }else{
            [].forEach.call(tab.childNodes,c=>{
                if (c==ev.target) c.removeEventListener('mouseover',UpdateStatus);
                else c.addEventListener('mouseover',UpdateStatus);
                c.classList.toggle('on');
            });
            type = ev.target.innerText=='全部'?1:2;
            warp.classList.toggle('show-origin');
        }
        UpdateRanking();
    };
    [].forEach.call(dropDown.lastChild.childNodes,c => {c.onclick = UpdateStatus;});
    tab.lastChild.addEventListener('mouseover',UpdateStatus);
    UpdateRanking();
}

function WatchLater (ev){
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
                Toast(`请求稍后再看错误 code ${list.code} msg ${list.message} 请检查问题重试或打开调试终端查看更多信息`);
                console.log('请求稍后再看发生错误',list,target);
                return;
            }
            target.classList.toggle('added');
            target.title = target.classList.contains('added')?'移除稍后再看':'稍后再看';
        }catch(e){
            Toast(`请求稍后再看发生错误，请检查问题重试或打开调试终端查看更多信息`);
            console.error(e,'请求稍后再看发生错误');
        }
    };
    req.send(`aid=${target.dataset.aid}&csrf=${token}`);
    return false;
}

function formatNumber (input,format='number'){
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
}

function getLoadingDiv(){
    const loading = document.createElement('div');
    loading.className = 'load-state';
    loading.innerHTML = '<span class="loading">正在加载...</span>';
    return loading;
}

function Toast(msg){
    const toast = document.createElement('div');
    toast.innerHTML = `<div class="toast"><span >${msg}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(()=>document.body.removeChild(toast),4000);
    return false;
}