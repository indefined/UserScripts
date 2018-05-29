// ==UserScript==
// @name        bilibili直播间功能增强
// @namespace   indefined
// @version     0.1.8
// @author      indefined
// @description 直播间切换勋章/头衔、硬币/银瓜子直接购买勋章、礼物包裹替换为大图标，全屏可用礼物包裹/全屏发送弹幕(仅限HTML5)，轮播显示链接(仅限HTML5)
// @supportURL  https://github.com/indefined/UserScript-for-Bilibili/issues
// @include     /^https?:\/\/live\.bilibili\.com\/\d/
// @license     MIT
// @run-at      document-idle
// ==/UserScript==
try{
    document.querySelector('.aside-area.p-absolute.border-box.z-aside-area')
        .addEventListener('DOMNodeInserted',function (e){
        if (e.target.id == 'chat-control-panel-vm'){
            e.relatedNode.removeEventListener('DOMNodeInserted',arguments.callee);
            FeaturesPlus();
        }
    });
}
catch (e){console.error('bilibili直播间功能增强脚本执行错误',e);}

function FeaturesPlus(){
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
        giftPackage.addEventListener('DOMNodeInserted',()=>{giftPackage.lastChild.style+=';bottom:50px';});
        giftPanel.appendChild(giftPackage);
    }
    if (giftPackage&&giftPanel&&playerPanel){
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
            const screenPanel = document.querySelector('div.bilibili-live-player-gfs-staple.no-select');
            if (newValue=='normal'){
                giftPanel.appendChild(giftPackage);
            }else{
                screenPanel.appendChild(giftPackage);
            }
            if (newValue=='fullscreen'){
                sendButton.className = 'dp-i-block v-center';
                sendButton.style = 'margin-left: 5px;';
                inputBox.className = 'dp-i-block v-bottom';
                inputBox.style = 'width:300px;margin-left: 5px;height: 45px;';
                inputBox.lastChild.style = 'right: 110px;';
                screenPanel.insertBefore(sendButton,screenPanel.fristChild);
                screenPanel.insertBefore(inputBox,sendButton);
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
        if (cover&&cover.href)
            owner = cover.href.match(/\d+/)[0];
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
            if (dialog.dataset.name==target.dataset.name||(target!=m&&target!=t))
                return closeDialog();
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
<div data-v-0ebe36b2="" class="arrow p-absolute" style="left: 78px;"></div>
<div id="title-list" style="max-height: 410px;overflow: auto;"><h1 data-v-6cf0c8b2="" class="title">我的头衔</h1>
  <style type="text/css">#title-list::-webkit-scrollbar{width: 6px;}::-webkit-scrollbar-thumb{border-radius: 10px;background-color: #ccc;}</style--></style>
  <div data-v-460dfc36="" class="tv"><div data-v-551093aa="" data-v-460dfc36="" role="progress" class="link-progress-tv"></div></div>
  <a data-v-6cf0c8b2="" href="//link.bilibili.com/p/center/index#/user-center/wearing-center/library" target="_blank" class="bili-link bottom-link dp-block">
   <span data-v-6cf0c8b2="" title="前往头衔管理页面" class="v-middle">管理我的头衔</span><i data-v-6cf0c8b2="" class="icon-font icon-arrow-right v-middle"></i></a>
</div>`;
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
                setTimeout(()=>dialog.style='display:none;',300);
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
            const listPanel = dialog.lastElementChild;
            const point = listPanel.lastElementChild;
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
                    listPanel.insertBefore(item,point);
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
                    if (owner==v.target_id)  hasMedal = true;
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
}