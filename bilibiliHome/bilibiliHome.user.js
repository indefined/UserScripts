// ==UserScript==
// @name         bilibili网页端添加APP首页推荐
// @namespace    indefined
// @version      0.2.3
// @description  为B站网页端首页添加APP首页推荐内容，提供添加/撤销稍后再看、不喜欢/撤销不喜欢功能，同时提供全站排行榜
// @author       indefined
// @supportURL   https://github.com/indefined/UserScript-for-Bilibili/issues
// @match        *://www.bilibili.com/
// @license      MIT
// @connect      app.bilibili.com
// @connect      api.bilibili.com
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

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
if (token&&recommend){
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
		text-align: -webkit-center;
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
            url: `${document.location.protocol}//app.bilibili.com/x/feed/index?build=1&mobi_app=android`,
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
                    console.error(e,请求app首页发生错误);
                }
            }
        });
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
        if (data.dislike_reasons){
            const dislikeList = item.querySelector('.dislike-list');
            for (const reason of data.dislike_reasons){
                const dislikeItem = document.createElement('div');
                dislikeItem.dataset.reason_id = reason.reason_id;
                dislikeItem.innerText = reason.reason_name;
                dislikeItem.title = `标记因为【${reason.reason_name}】不喜欢`;
                dislikeItem.onclick = DisLike;
                dislikeList.appendChild(dislikeItem);
            }
        }
        return item;
    }

    function DisLike (ev) {
        let target=ev.target,parent=target.parentNode;
        let cancel;
        let url =  `${document.location.protocol}//app.bilibili.com/x/feed/dislike`;
        if (parent.className!='dislike-list'){
            cancel = true;
            let deep = 1;
            while(parent.nodeName!='A'&&deep++<4){
                target = parent;
                parent=target.parentNode;
            }
            if (parent.nodeName!='A'){
                showError('请求撤销稍后再看失败：找不到父节点，查看调试终端获取更多信息');
                console.log('请求撤销稍后再看找不到父节点',ev);
                return false;
            }
            url += `/cancel`;
        }else{
            parent = parent.parentNode.parentNode.parentNode;
        }
        url += `?goto=${parent.dataset.goto}&id=${parent.dataset.id}&mid=${parent.dataset.mid}&reason_id=${target.dataset.reason_id}&rid=${parent.dataset.rid}&tag_id=${parent.dataset.tag_id}`;
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
                    if (par.code!=0){
                        showError(`请求不喜欢错误 code ${par.code} msg ${par.message} 请检查问题重试或打开调试终端查看更多信息`);
                        console.log('请求不喜欢发生错误',par,url);
                    }else{
                        handleCover();
                    }
                } catch (e){
                    showError(`请求不喜欢发生错误，请检查问题重试或打开调试终端查看更多信息`);
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
        rankingAll.lastChild.href = `/ranking/${type==1?'all':'origin'}/0/1/${day}/`;
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
            [].forEach.call(dropDown.lastChild.childNodes,c=>c.style.display=c.style.display=='none'?'unset':'none');
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
    [].forEach.call(dropDown.lastChild.childNodes,c=>c.onclick = UpdateStatus);
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
                showError(`请求稍后再看错误 code ${list.code} msg ${list.message} 请检查问题重试或打开调试终端查看更多信息`);
                console.log('请求稍后再看发生错误',list,target);
                return;
            }
            target.classList.toggle('added');
            target.title = target.classList.contains('added')?'移除稍后再看':'稍后再看';
        }catch(e){
            showError(`请求稍后再看发生错误，请检查问题重试或打开调试终端查看更多信息`);
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

function showError(msg){
    const toast = document.createElement('div');
    toast.innerHTML = `<div class="toast"><span >${msg}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(()=>document.body.removeChild(toast),4000);
    return false;
}