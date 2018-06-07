// ==UserScript==
// @name        bilibili直播间功能增强
// @namespace   indefined
// @version     0.3.0
// @author      indefined
// @description 直播间切换勋章/头衔、硬币/银瓜子直接购买勋章、其它礼物（测试）、礼物包裹替换为大图标、网页全屏自动隐藏礼物栏/全屏发送弹幕(仅限HTML5)、轮播显示链接(仅限HTML5)
// @supportURL  https://github.com/indefined/UserScript-for-Bilibili/issues
// @include     /^https?:\/\/live\.bilibili\.com\/\d/
// @license     MIT
// @run-at      document-idle
// ==/UserScript==
const showNewGift = true;
try{
	AddStyle();
	if (document.querySelector('.gift-package')) FeaturesPlus();
	else document.querySelector('.aside-area.p-absolute.border-box.z-aside-area')
        .addEventListener('DOMNodeInserted',function listener(e){
        if (e.target.id == 'chat-control-panel-vm'){
            e.relatedNode.removeEventListener('DOMNodeInserted',listener);
            FeaturesPlus();
        }
    });
} catch (e){console.error('bilibili直播间功能增强脚本执行错误',e);}

function AddStyle(){
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
.gift .expires {
    margin-left: -29px!important;
    border-radius: 15px!important;
}

.common-popup-wrap.arrow-bottom.popup {
    min-width: 274px!important;
}

.wrap[data-v-13293d9e] {
    bottom: 50px!important;
}

.bilibili-live-player-video-controller #gift-control-vm {
    background: rgba(0, 0, 0, 0.7)!important;
    position: relative!important;
    width: 100%!important;
    border: none!important;
    height: unset!important;
}

body.fullscreen-fix div#gift-control-vm {
    display: block!important;
}

.bilibili-live-player-video-controller .gift-control-panel .right-part .gift-presets[data-v-fbe31e02] {
    height: unset!important;
    margin: 0!important;
}

.bilibili-live-player-video-controller .gift-control-panel[data-v-fbe31e02] {
    height: unset!important;
}

.p-relative.ts-dot-2.z-gift-sender-panel {
    z-index: 99999999;
}

.bilibili-live-player-video-controller .supporting-info {
    display: none!important;
}

.bilibili-live-player-video-controller .gift-panel-box {
    background: none!important;
    border: none!important;
}

.bilibili-live-player-video-controller .gift-control-panel .gift-left-part[data-v-fbe31e02] {
    padding-top: 0px!important;
}

.bilibili-live-player-video-controller .count-down[data-v-cf847d96] {
    margin-top: -10px!important;
}

.player-section.p-relative.border-box.none-select.z-player-section {
    height: 100%!important;
}
`;
    document.head.appendChild(style);
}

function FeaturesPlus(){
    const leftContainer = document.querySelector('.left-container');
    const toolBar = document.querySelector('#gift-control-vm');
    const giftPanel = document.querySelector('div.gift-presets.p-relative.t-right');
    const giftPackage = document.querySelector('.gift-package');
    const playerPanel = document.querySelector('.bilibili-live-player.relative');
    const inputPanel = document.querySelector('div.chat-input-ctnr.p-relative');
    const inputBox = inputPanel.lastChild;
    const bottomPanel = inputPanel.nextSibling;
    const sendButton = bottomPanel.lastChild;
    if (giftPackage&&giftPanel){
        const guardIcon = document.querySelector('div.m-guard-ent.gift-section.guard-ent');
        giftPackage.className = 'p-relative pointer dp-i-block v-bottom bg-cover box-icon open';
        giftPackage.setAttribute('data-v-cf847d96','');
        giftPackage.style = "background-position: 0 -3px;";
        giftPackage.title = '道具包裹';
        while (giftPackage.firstElementChild) giftPackage.removeChild(giftPackage.firstElementChild);
        if (guardIcon) giftPanel.removeChild(guardIcon);
        giftPanel.appendChild(giftPackage);
    }
    if (giftPackage&&toolBar&&playerPanel){
        const appendTitle = target=>{
            const title = document.querySelector('div.normal-mode');
            if (!title) return;
            const match = target.innerText.match(/av\d+/);
            if (!match) return;
            const link = document.querySelector('.info-section.dp-i-block.v-middle.title-link')||document.createElement('a');
            link.innerText = match[0];
            link.href='//www.bilibili.com/video/'+match[0];
            link.target = '_blank';
            link.className='info-section dp-i-block v-middle title-link';
            link.style = 'margin-left:16px;font-size:16px';
            title.appendChild(link);
        };
        const handleFullScreenPanel = (newValue,oldValue)=>{//value='web-fullscreen'||'normal'||'fullscreen'
            const screenPanel = document.querySelector('.bilibili-live-player-video-controller');
            if (newValue=='normal'){
                leftContainer.appendChild(toolBar);
            }else{
                screenPanel.appendChild(toolBar);
            }
            if (newValue=='fullscreen'){
                sendButton.className = 'dp-i-block v-middle';
                inputBox.className = 'dp-i-block v-bottom';
                inputBox.style = 'width:300px;margin-right: 5px;';
                inputBox.lastChild.style = 'right: 90px;';
                giftPanel.appendChild(inputBox);
                giftPanel.appendChild(sendButton);
            }else if(oldValue=='fullscreen'){
                sendButton.className = 'right-action p-absolute';
                inputBox.className = '';
                inputBox.style = '';
                inputBox.lastChild.style = '';
                inputPanel.appendChild(inputBox);
                bottomPanel.appendChild(sendButton);
            }
        };
        const handleMutation = mutation=>{
            for (const addedNode of mutation.addedNodes) if (addedNode.className==="bilibili-live-player-video-round-title") appendTitle(addedNode);
            if (mutation.target.className==="bilibili-live-player-video-round-title")appendTitle(mutation.target);
            if (mutation.attributeName=='data-player-state') handleFullScreenPanel(playerPanel.getAttribute('data-player-state'),mutation.oldValue);
        };
        const observer = new MutationObserver(mutations => mutations.forEach(handleMutation));
        observer.observe(playerPanel, { attributes: true, attributeOldValue: true ,childList: true, subtree: true, attributeFilter: ['data-player-state']});
    }

    (function strengthSwitcher(){
        const cover = document.querySelector('.room-cover.dp-i-block.p-relative.bg-cover');
        let owner;
        if (cover&&cover.href) owner = cover.href.match(/\d+/)[0];
        const medalButton = bottomPanel.querySelector('.action-item.medal');
        const titleButton = bottomPanel.querySelector('.action-item.title');
        const dialog = document.querySelector('.dialog-ctnr.common-popup-wrap.p-absolute.border-box.z-chat-control-panel-dialog').cloneNode();
        bottomPanel.parentNode.appendChild(dialog);
        const m = medalButton.cloneNode(true);
        m.dataset.name = 'medal';
        bottomPanel.firstChild.replaceChild(m,medalButton);
        const t = titleButton.cloneNode(true);
        t.dataset.name = 'title';
        bottomPanel.firstChild.replaceChild(t,titleButton);
        document.body.addEventListener('click', handleDialog);
        function handleDialog(ev){
            const target = ev.target;
            if (dialog.contains(ev.target)) return;
            if (dialog.dataset.name==target.dataset.name||(target!=m&&target!=t)) return closeDialog();
            dialog.dataset.name = target.dataset.name;
            if (target==m){
                dialog.innerHTML = `
<div data-v-0ebe36b2="" class="arrow p-absolute" style="left: 56px;"></div>
  <div data-v-0c0ef647="" data-v-0ebe36b2="" class="medal-ctnr">
   <h1 class="title" data-v-0c0ef647="">我的勋章</h1>
  <div data-v-460dfc36="" class="tv"><div data-v-551093aa="" data-v-460dfc36="" role="progress" class="link-progress-tv"></div></div>
  <a data-v-0c0ef647="" href="//link.bilibili.com/p/center/index#/user-center/wearing-center/my-medal" target="_blank" class="bili-link bottom-link dp-block">
   <span data-v-0c0ef647="" title="前往勋章管理页面" class="v-middle">管理我的勋章</span><i data-v-0c0ef647="" class="icon-font icon-arrow-right v-middle"></i></a>
</div>`;
                const xhr = new XMLHttpRequest();
                xhr.open('GET','//api.live.bilibili.com/i/api/medal?page=1&pageSize=25');
                xhr.withCredentials = true;
                xhr.onload = listMedal;
                xhr.send(null);
                dialog.style = 'transform-origin: 56px bottom 0px;';
            }else if (ev.target===t){
                dialog.innerHTML = `
<div data-v-0ebe36b2="" class="arrow p-absolute" style="left: 78px;"></div><h1 data-v-6cf0c8b2="" class="title">我的头衔</h1>
<div id="title-list" style="max-height: 410px;overflow: auto;">
  <div data-v-460dfc36="" class="tv"><div data-v-551093aa="" data-v-460dfc36="" role="progress" class="link-progress-tv"></div></div>
</div>
<a data-v-6cf0c8b2="" href="//link.bilibili.com/p/center/index#/user-center/wearing-center/library" target="_blank" class="bili-link bottom-link dp-block">
  <span data-v-6cf0c8b2="" title="前往头衔管理页面" class="v-middle">管理我的头衔</span><i data-v-6cf0c8b2="" class="icon-font icon-arrow-right v-middle"></i></a>`;
                const xhr = new XMLHttpRequest();
                xhr.open('GET','//api.live.bilibili.com/i/api/ajaxTitleInfo?had=1&page=1&pageSize=300');
                xhr.withCredentials = true;
                xhr.onload = listTitle;
                xhr.send(null);
                dialog.style = 'transform-origin: 78px bottom 0px;';
            }
            dialog.className = 'dialog-ctnr common-popup-wrap p-absolute border-box z-chat-control-panel-dialog bottom v-enter a-scale-in-ease v-enter-to';
        }
        const closeDialog = ()=>{
            if (dialog.classList.contains('v-enter')){
                dialog.dataset.name = '';
                dialog.className = 'dialog-ctnr common-popup-wrap p-absolute border-box z-chat-control-panel-dialog bottom v-leave a-scale-out';
                setTimeout(()=>{dialog.style='display:none;';},300);
            }
        };
        const doRequire = (url,text) => {
            const adj = new XMLHttpRequest();
            adj.open('GET',url);
            adj.withCredentials = true;
            adj.onload = res=>{
                let msg = '';
                try{
                    var data = JSON.parse(res.target.response);
                    if (data.code == 0){
                        msg = '成功';
                        closeDialog();
                    }else{
                        msg = `失败 code ${data.code} ${data.message}`;
                    }
                }catch(e){
                    msg = `出错${e}`;
                    console.error(e);
                }finally{
                    let toast = document.createElement('div');
                    toast.innerHTML = `<div class="link-toast fixed success" style="left: 40%;top: 50%;"><span class="toast-text">${text} ${msg}</span></div>`;
                    document.body.appendChild(toast);
                    setTimeout(()=>document.body.removeChild(toast),3000);
                }
            };
            adj.send(null);
        };
        const listTitle =res=>{
            const listPanel = dialog.querySelector('#title-list');
            const loadingDiv = dialog.querySelector('.tv');
            try{
                const data = JSON.parse(res.target.response);
                if (data.code!=0||!data.data||!data.data.list){
                    loadingDiv.innerHTML = `<p class="des">查询头衔失败 code:${data.code}\r\n${data.message}</p>`;
                    return;
                }
                if (data.data.list.length==0){
                    loadingDiv.innerHTML = `<p class="des">没有头衔哦～</p>`;
                    return;
                }
                listPanel.removeChild(loadingDiv);
                data.data.list.forEach((v)=>{
                    const item = document.createElement('div');
                    item.dataset['v-6cf0c8b2'] = '';
                    item.className = 'title-badge-ctnr';
                    item.innerHTML = `<img data-v-7765e5b3="" title="${v.name} ${v.source}\r\n${v.wear?'当前佩戴头衔，点击取消佩戴':'点击佩戴'}" data-v-6cf0c8b2="" src="//s1.hdslb.com/bfs/static/blive/live-assets/title/${v.id}-${v.cid}.png" class="live-title-icon pointer">`;
                    /*item.innerHTML+= `<span data-v-0c0ef647="" title="升级进度：${0}/3500000000 升级还差：${0}" class="intimacy-bar dp-i-block v-center over-hidden p-relative">
                    <span data-v-0c0ef647="" class="dp-i-block v-top h-100" style="width: ${0}%;"></span></span><span title="头衔经验" class="intimacy-text">${0}/${3500000000}</span>`;*/
                    item.firstElementChild.addEventListener('click',()=>doRequire(`//api.live.bilibili.com/i/${v.wear?`ajaxCancelWearTitle`:`ajaxWearTitle?id=${v.id}&cid=${v.cid}`}`,`${v.wear?'取消佩戴':'切换'}头衔`));
                    listPanel.appendChild(item);
                });
            }catch (e){
                loadingDiv.innerHTML = `<p class="des">解析返回错误${e}～</p>`;
                console.error(e);
            }
        };
        const buyMedal = type=>{
            if (!confirm('购买勋章使用的消费不计入亲密度，确认购买本房间勋章吗？')){
                return;
            }
            if (!confirm(`再次确认是否使用${type=='silver'?'9900银瓜子':'20硬币'}购买本房间勋章？`)){
                return;
            }
            doRequire(`//api.vc.bilibili.com/link_group/v1/member/buy_medal?coin_type=${type}&master_uid=${owner}`,'购买勋章');
        };
        const listMedal = res=>{
            const listPanel = dialog.lastChild;
            const point = listPanel.querySelector('.bili-link.bottom-link.dp-block');
            const loadingDiv = dialog.querySelector('.tv');
            let hasMedal = false;
            try{
                const data = JSON.parse(res.target.response);
                if (data.code!=0||!data.data||!data.data.fansMedalList){
                    loadingDiv.innerHTML = `<p class="des">查询勋章失败 code:${data.code}\r\n${data.message}</p>`;
                    return;
                }
                if (data.data.fansMedalList.length==0){
                    loadingDiv.innerHTML = `<p class="des">还没有勋章哦～</p>`;
                    return;
                }
                listPanel.removeChild(loadingDiv);
                data.data.fansMedalList.forEach((v)=>{
                    if (owner==v.target_id) hasMedal = true;
                    const item = document.createElement('div');
                    item.className = 'medal-intimacy';
                    item.dataset['v-0c0ef647'] = "";
                    item.innerHTML = `
<div data-v-0c0ef647="" title="主播:${v.uname}\r\n点击${v.status?'取消佩戴':'切换'}勋章" class="fans-medal-item v-middle pointer level-${v.level} ${v.status?' special-medal':''}">
  <div class="label">${v.status?`<i class="medal-deco union"></i>`:''}<span class="content">${v.medalName}</span></div><span class="level">${v.level}</span>
</div>
<span data-v-0c0ef647="" title="升级进度：${v.intimacy}/${v.next_intimacy}\r\n升级还差：${v.next_intimacy-v.intimacy}" class="intimacy-bar dp-i-block v-center over-hidden p-relative">
  <span data-v-0c0ef647="" class="dp-i-block v-top h-100" style="width: ${v.intimacy/v.next_intimacy*100}%;"></span>
</span>
<a data-v-0c0ef647="" href="/${v.roomid}" target="_blank"  title="今日亲密度剩余${v.dayLimit-v.todayFeed}\r\n点击前往主播房间" class="intimacy-text">${v.todayFeed}/${v.dayLimit}</a>`;
                    item.querySelector('.fans-medal-item').addEventListener('click', ()=>doRequire(`//api.live.bilibili.com/i/${v.status?`ajaxCancelWear`:`ajaxWearFansMedal?medal_id=${v.medal_id}`}`,v.status?'取消佩戴勋章':'切换勋章'));
                    listPanel.insertBefore(item,point);
                });
            }catch (e){
                loadingDiv.innerHTML = `<p class="des">解析返回错误${e}～</p>`;
                console.error(e);
            }finally{
                if (owner&&!hasMedal){
                    const buy = document.createElement('div');
                    buy.style = 'display: inline-block;margin-right: 10px;';
                    buy.innerHTML = `
<div title="使用20硬币购买本房间勋章" class="dp-i-block pointer">
<a style="border: 1.8px solid #c8c8c8;border-radius: 50%;border-color: #23ade5;">硬</a>
<span>20</span>
</div>
<span title="使用9900银瓜子购买本房间勋章" class="pointer dp-i-block">
<i class="svg-icon silver-seed" style="font-size: 15px;"></i>
<span>9900</span>
</span>`;
                    buy.onclick = e=>false;
                    buy.firstElementChild.addEventListener('click',()=>buyMedal('metal'));
                    buy.lastChild.addEventListener('click',()=>buyMedal('silver'));
                    point.insertBefore(buy,point.firstElementChild);
                }
            }
        };
    })();
    if (showNewGift){
        const token = (()=>{
            try{
                return document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/)[1];
            }catch(e){
                return undefined;
            }
        })();
        const imgType = (()=>{
            try{
                return 0==document.createElement('canvas').toDataURL("image/webp").indexOf("data:image/webp")?'webp':'gif';
            }catch(e){
                return 'gif';
            }
        })();
        let room,gifts;
        const newGift = (()=>{
            const appendDiv = document.createElement('div');
            appendDiv.className = 'dp-i-block v-middle';
            appendDiv.innerHTML = `<div class="dp-i-block v-middle pointer p-relative bg-cover" title="其它礼物" style="background-image: url(//s1.hdslb.com/bfs/live/592e81002d20699c7e4dae4480ada79ab3253eae.png);width: 48px;height: 48px;margin-right: 10px;"></div>`;
            giftPanel.insertBefore(appendDiv,giftPackage);
            return appendDiv.firstElementChild;
        })();
        const sendGift = ev =>{
            newGift.firstChild.classList.add('dp-none');
            const target = gifts[ev.target.dataset.index];
            const sendPanel = document.createElement('div');
            sendPanel.className = 'bilibili-live-player-gfs-give-float';
            sendPanel.style="position:fixed;";
            let type = 'gold';
            let num = 1;
            sendPanel.innerHTML = `
	<div class="bilibili-live-player-gfs-give-wrap">
		<div class="bilibili-live-player-gfs-give-close"></div>
		<h2>赠送礼物</h2>
		<div class="clearfix">
			<div class="bilibili-live-player-gfs-give-gif" style="background-image: url(${target[imgType]})"></div>
			<div class="bilibili-live-player-gfs-give-info">
				<div class="bilibili-live-player-gfs-give-name">${target.name}</div>
				<div class="bilibili-live-player-gfs-give-cost">
					<div class="bilibili-live-player-gfs-give-cost-gold">
					<i></i><span>${target.price}</span></div></div>
			</div>
		</div>
		<p class="gift-info-desc" data-v-33a72392="">${target.desc}</p>
		<div>
			<span>选择：</span>
			<div class="bilibili-live-player-gfs-give-type">
				<label class="bilibili-live-player-gfs-give-type-silver">
					<input name="send_gift_type" type="radio" value="gold" checked>金瓜子
					<input name="send_gift_type" type="radio" value="silver">银瓜子
				</label></div>
		</div>
		<div>
			<input class="bilibili-live-player-gfs-give-counter" type="text" value="${num}" placeholder="赠送数量">
			<button class="bilibili-live-player-gfs-give-confirm">赠送</button>
		</div>
	</div>`;
            sendPanel.querySelector('input[value="silver"]').onchange = ()=>{type='silver';};
            sendPanel.querySelector('input[value="gold"]').onchange = ()=>{type='gold';};
            sendPanel.querySelector('.bilibili-live-player-gfs-give-counter').onchange = (ev)=>{num=ev.target.value;};
            sendPanel.querySelector('.bilibili-live-player-gfs-give-close').onclick = ()=>document.body.removeChild(sendPanel);
            sendPanel.querySelector('.bilibili-live-player-gfs-give-confirm').onclick = ()=>{
                document.body.removeChild(sendPanel);
                const req = new XMLHttpRequest();
                req.open('POST','//api.live.bilibili.com/gift/v2/gift/send');
                req.withCredentials = true;
                req.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
                req.onload = res=>{
                    let msg = '赠送礼物';
                    try{
                        var data = JSON.parse(res.target.response);
                        if (data.code == 0){
                            msg += '成功';
                        }else{
                            msg += `失败 code ${data.code} ${data.message}`;
                        }
                    }catch(e){
                        msg += `出错${e}`;
                        console.error(e);
                    }finally{
                        let toast = document.createElement('div');
                        toast.innerHTML = `<div class="link-toast fixed success" style="left: 40%;top: 50%;"><span class="toast-text">${msg}</span></div>`;
                        document.body.appendChild(toast);
                        setTimeout(()=>document.body.removeChild(toast),3000);
                    }
                };
                req.send(`gift_id=${target.id}&ruid=${room.uid}&gift_num=${num}&coin_type=${type}&biz_id=${room.room_id}&csrf_token=${token}`);
                return false;
            };
            document.body.appendChild(sendPanel);
        };
        const showGift = ev=>{
            if (!newGift.contains(ev.target)){
                if (newGift.firstChild) newGift.firstChild.classList.add('dp-none');
            }
            else if (!gifts||!room){
                let xhr = new XMLHttpRequest();
                xhr.open('GET','//api.live.bilibili.com/gift/v3/live/gift_config');
                xhr.withCredentials = true;
                const list = document.createElement('div');
                list.className = 'common-popup-wrap t-left';
                list.style = 'height: 270px;position: absolute;width: 276px;bottom: 50px;right: -22px;overflow: auto;cursor: auto;animation: r .4s;';
                list.innerHTML = `<header data-v-460dfc36="">其它礼物</header>`;
                newGift.appendChild(list);
                xhr.onload = res=>{
                    gifts = JSON.parse(res.target.response).data;
                    const items = document.createElement('div');
                    for (let i=0;i<gifts.length;i++){
                        const g = gifts[i];
                        items.innerHTML += `<div data-index="${i}" style="background-image: url(${g.img_basic});width: 45px;height: 45px;" class="bg-cover dp-i-block pointer" title="${g.name}"></div>`;
                    }
                    [].forEach.call(items.childNodes,c=>{c.onclick = sendGift;});
                    list.appendChild(items);
                };
                xhr.send(null);
                xhr = new XMLHttpRequest();
                xhr.open('GET',`//api.live.bilibili.com/room/v1/Room/room_init?id=${window.location.pathname.slice(1)}`);
                xhr.onload = res=>{
                    room = JSON.parse(res.target.response).data;
                };
                xhr.send(null);
            }else if (ev.target==newGift){
                newGift.firstChild.classList.toggle('dp-none');
            }
        };
        document.body.addEventListener('click',showGift);
    }
}