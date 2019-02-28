// ==UserScript==
// @name        bilibili直播间助手
// @namespace   indefined
// @supportURL  https://github.com/indefined/UserScripts/issues
// @version     0.5.0
// @author      indefined
// @description 可配置 直播间切换勋章/头衔、硬币/银瓜子直接购买勋章、礼物包裹替换为大图标、网页全屏自动隐藏礼物栏/全屏发送弹幕(仅限HTML5)、轮播显示链接(仅限HTML5)
// @include     /^https?:\/\/live\.bilibili\.com\/(blanc\/)?\d/
// @grant       GM_getValue
// @grant       GM_setValue
// @license     MIT
// @run-at      document-idle
// ==/UserScript==

'use strict';
const helper = {
    create(nodeType,config,appendTo){
        const element = document.createElement(nodeType);
        config&&this.set(element,config);
        if(appendTo) appendTo.appendChild(element);
        return element;
    },
    set(element,config,appendTo){
        if(config){
            for(const [key, value] of Object.entries(config)){
                element[key] = value;
            }
        }
        if(appendTo) appendTo.appendChild(element);
        return element;
    },
    get(selector){
        if(selector instanceof Array) {
            return selector.map(item=>this.get(item));
        }
        return document.body.querySelector(selector);
    },
    replace(oldItem,newItem){
        oldItem.parentNode.replaceChild(newItem,oldItem);
    },
    xhr(url,data){
        return fetch(url, {
            method: data?'POST':'GET',
            credentials: 'include',
            body: data&&(typeof(data)=='string'?data:encodeURI(Object.entries(data).map(([k,v])=>`${k}=${v}`).join('&'))),
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        }).then(res => res.json());
    },
    toast(msg){
        let toast = this.create('div',{
            innerHTML:`<div class="link-toast fixed success" style="left: 40%;top: 50%;"><span class="toast-text">${msg}</span></div>`
        });
        document.body.appendChild(toast);
        setTimeout(()=>document.body.removeChild(toast),3000);
    }
};

const LiveHelper = {
    settingInfos:{
        fullScreenPanel:{
            name:'全屏礼物栏/全屏弹幕发送框',
            group:'elementAdjuster'
        },
        showVideoLink:{
            name:'轮播显示链接',
            group:'elementAdjuster'
        },
        replaceMedalTitle:{
            name:'勋章/头衔扩展',
            group:'advancedSwitcher'
        },
        showOtherGift:{
            name:'显示其它礼物',
            group:'otherGift'
        },
    },
    //页面元素调整
    elementAdjuster:{
        initStyle(){
            helper.create('style',{
                type:'text/css',
                innerHTML:`
/*礼物包裹图标*/
.gift-package.live-skin-highlight-bg {
    bottom:0px!important;
    background: url(//s1.hdslb.com/bfs/live/d57afb7c5596359970eb430655c6aef501a268ab.png)!important;
    width: 48px!important;
    height: 48px!important;
    background-size: cover!important;
    margin-right: 10px!important;
}

.gift-package.live-skin-highlight-bg>*{
    display:none!important;
}

.gift-package.live-skin-highlight-bg:after {
    content: '道具包裹';
    position: relative;
    bottom: -55px;
    left: 4px;
}

/*礼物包裹内样式*/
.gift-item-wrap .expiration {
    padding: 1px 5px!important;
    border-radius: 15px!important;
    text-align: center!important;
    right: 50%!important;
    transform: translate(50%);
    line-height: 1.35;
    word-break: keep-all!important;
}

.gift-item-wrap {
    margin: 10px 0px 0px 5px!important;
    width: unset!important;
}

.bilibili-live-player.relative {
    overflow: visible;
}

.gift-item-wrap:nth-of-type(-n+5) {
    margin-top: 5px!important;
}

.common-popup-wrap.arrow-bottom.popup {
    min-width: 274px!important;
}

.item-box {
    width: 100%!important;
}

.gift-presets >div .wrap {
    bottom: 50px!important;
    right: -10px!important;
}

.gift-item .info .label {
    color: unset!important;
}

/*全屏礼物栏样式*/
body.fullscreen-fix div#gift-control-vm {
    display: block!important;
}

.bilibili-live-player-video-controller #gift-control-vm {
    background: rgba(0, 0, 0, 0.7)!important;
    position: relative!important;
    width: 100%!important;
    border: none!important;
    border-radius: 0!important;
    height: unset!important;
    display: block!important;
}

.bilibili-live-player-video-controller .gift-control-panel .chat-input-ctnr{
    display: inline-block!important;
    vertical-align: middle!important;
    width:300px;
    margin-right: 5px;
    margin-top: 0px;
}

.bilibili-live-player-video-controller .gift-control-panel .right-action.p-absolute{
    position: relative!important;
    display: inline-block!important;
    vertical-align: middle!important;
}

.bilibili-live-player-video-controller .gift-control-panel .chat-input.border-box>span{
    right: 90px;
}

.bilibili-live-player-video-controller .gift-control-panel .right-part .gift-presets {
    height: unset!important;
    margin: 0!important;
    bottom: -5px;
}

.bilibili-live-player-video-controller .gift-control-panel {
    height: unset!important;
}

.bilibili-live-player-video-controller .supporting-info {
    display: none!important;
}

.bilibili-live-player-video-controller .gift-section.gift-list{
    vertical-align: middle!important;
}

.bilibili-live-player-video-controller .gift-panel-box ,
.bilibili-live-player-video-controller .outer-drawer[data-v-fd126f5a]{
    background: none!important;
    border: none!important;
}

.bilibili-live-player-video-controller .count-down {
    margin-top: -10px!important;
}
/*右侧弹幕池展开手柄会挡到网页全屏礼物栏*/
.aside-area-toggle-btn.dp-none.p-absolute {
    height: 25%;
}`
            },document.head);
        },
        initValues(){
            this.leftContainer = helper.get('.left-container');
            this.toolBar = helper.get('#gift-control-vm');
            this.giftPanel = helper.get('div.gift-presets.p-relative.t-right');
            this.giftPackage = helper.get('.item.z-gift-package');
            this.playerPanel = helper.get('.bilibili-live-player.relative');
            this.screenPanel = helper.get('.bilibili-live-player-video-controller');
            this.inputPanel = helper.get('div.chat-input-ctnr.p-relative');
            this.titlePanel = helper.get('div.normal-mode');
            this.controlPanel = this.inputPanel.parentNode;
            this.bottomPanel = this.inputPanel.nextSibling;
            this.sendButton = this.bottomPanel.lastChild;
            this.title = helper.create('a',{
                target:'_blank',
                className:'info-section dp-i-block v-middle title-link',
                style:'margin-left:16px;font-size:16px'
            });
            this.observer = new MutationObserver(mutations => {
                mutations.forEach((mutation)=>{
                    if (mutation.attributeName=='data-player-state') {
                        this.handleFullScreenPanel(this.playerPanel.getAttribute('data-player-state'),mutation.oldValue);
                    }
                    else if (mutation.target.className==="bilibili-live-player-video-round-title") {
                        this.updateVideoLink();
                    }
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.className==="bilibili-live-player-video-round-title") {
                            this.updateVideoLink();
                        }
                    }
                });
            });
        },
        //礼物包裹
        initGiftPackage(){
            if (this.giftPackage&&this.giftPanel){
                helper.set(this.giftPackage,{
                    className:"dp-i-block v-top pointer p-relative bg-cover",
                    id:"giftPackage"
                },this.giftPanel);
                const guardIcon = helper.get('div.m-guard-ent.gift-section.guard-ent');
                if (guardIcon) guardIcon.parentNode.removeChild(guardIcon);
            }
        },
        //轮播链接
        updateVideoLink(){
            if(!this.settings.showVideoLink) {
                if(this.title&&this.titlePanel.contains(this.title)){
                    this.titlePanel.removeChild(this.title);
                }
            }
            else{
                const target = helper.get('.bilibili-live-player-video-round-title'),
                      match = target&&target.innerText.match(/(av\d+).+(P(\d))+?/);
                match&&helper.set(this.title,{
                    innerText:match[1],
                    href:`//www.bilibili.com/video/${match[1]}${match[3]&&`?p=${match[3]}`}`
                },this.titlePanel);
            }
        },
        //全屏礼物面板调整
        //value='web-fullscreen'|'normal'|'fullscreen'
        handleFullScreenPanel(newValue,oldValue){
            if (newValue=='normal'){
                this.leftContainer.appendChild(this.toolBar);
            }else{
                this.screenPanel.appendChild(this.toolBar);
            }
            if (newValue=='fullscreen'){
                this.giftPanel.appendChild(this.inputPanel);
                this.giftPanel.appendChild(this.sendButton);
            }else if(oldValue=='fullscreen'){
                this.controlPanel.insertBefore(this.inputPanel,this.bottomPanel);
                this.bottomPanel.appendChild(this.sendButton);
            }
        },
        update(item,value){
            if(item=='showVideoLink') {
                this.updateVideoLink();
            }
            else if(item=='fullScreenPanel') {
                if(value==false) {
                    this.handleFullScreenPanel('normal','fullscreen');
                }
                else{
                    const nowValue = this.playerPanel.getAttribute('data-player-state')||'normal',
                          oldValue = nowValue=='normal'?'fullscreen':'normal';
                    this.handleFullScreenPanel(nowValue,oldValue);
                }
            }
            this.observer.disconnect();
            if(!this.settings.showVideoTitle&&!this.settings.fullScreenPanel) return;
            const config = {subtree:true};
            if(this.settings.showVideoLink) {
                config.childList = true;
            }
            if(this.settings.fullScreenPanel){
                config.attributes = true;
                config.attributeOldValue = true;
                config.attributeFilter = ['data-player-state'];
            }
            this.observer.observe(this.playerPanel, config);
        },
        init(settings){
            this.settings = settings;
            this.initStyle();
            this.initValues();
            this.initGiftPackage();
            this.update();
            this.updateVideoLink();
        }
    },

    //勋章/头衔扩展
    advancedSwitcher:{
        room:unsafeWindow?unsafeWindow.BilibiliLive:window.BilibiliLive,
        titleInfos:undefined,
        oldMedalButton:undefined,
        oldTitleButton:undefined,
        medalButton:undefined,
        titleButton:undefined,
        dialog:undefined,
        strings:{
            medal:{
                header:`
                    <div data-v-0ebe36b2="" class="arrow p-absolute" style="left: 56px;"></div>
                    <div data-v-0c0ef647="" data-v-0ebe36b2="" class="medal-ctnr">
                      <h1 class="title" data-v-0c0ef647="">我的勋章</h1>
                      <div data-v-ec1c3b2e="" class="tv">
                        <div data-v-4df82965="" data-v-ec1c3b2e="" role="progress" class="link-progress-tv"></div>
                      </div>
                      <a data-v-0c0ef647="" href="//link.bilibili.com/p/center/index#/user-center/wearing-center/my-medal" target="_blank"
                      class="bili-link bottom-link dp-block">
                        <span data-v-0c0ef647="" title="前往勋章管理页面" class="v-middle">管理我的勋章</span>
                      </a>
                    </div>`,
                style:'transform-origin: 56px bottom 0px;',
                url:'//api.live.bilibili.com/i/api/medal?page=1&pageSize=25'
            },
            title:{
                header:`
                    <div data-v-0ebe36b2="" class="arrow p-absolute" style="left: 78px;"></div>
                    <h1 data-v-6cf0c8b2="" class="title">我的头衔</h1>
                    <div id="title-list" style="max-height: 410px;overflow: auto;">
                      <div data-v-ec1c3b2e="" class="tv">
                        <div data-v-4df82965="" data-v-ec1c3b2e="" role="progress" class="link-progress-tv"></div>
                      </div>
                    </div>
                    <a data-v-6cf0c8b2="" href="//link.bilibili.com/p/center/index#/user-center/wearing-center/library" target="_blank"
                    class="bili-link bottom-link dp-block">
                      <span data-v-6cf0c8b2="" title="前往头衔管理页面" class="v-middle">管理我的头衔</span>
                    </a>`,
                style:'transform-origin: 78px bottom 0px;',
                url:'//api.live.bilibili.com/i/api/ajaxTitleInfo?had=1&page=1&pageSize=300'
            }
        },
        initStyle(){
            helper.create('style',{
                innerHTML:`
.title[data-v-6cf0c8b2] ,
.title[data-v-0c0ef647] ,
header[data-v-460dfc36] {
    font-weight: 400;
    font-size: 18px;
    margin: 0;
    color: #23ade5
}

.bottom-link[data-v-6cf0c8b2] ,
.bottom-link[data-v-0c0ef647] {
    margin-top: 16px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0
}

.bottom-link .icon-font[data-v-6cf0c8b2] ,
.bottom-link .icon-font[data-v-0c0ef647] {
    font-size: 12px;
    margin-left: 4px
}

.intimacy-bar[data-v-0c0ef647] {
    height: 8px;
    width: 64px;
    margin: 0 8px;
    border-radius: 2px;
    background-color: #e3e8ec
}

.intimacy-bar>span[data-v-0c0ef647] {
    background-color: #23ade5
}

.lpl-drawer-ctnr[data-v-fd126f5a] {
    padding-right: 0!important;
}

.live-title-icon[data-v-7765e5b3] {
    display: inline-block;
    vertical-align: middle;
    height: 20px
}

.intimacy-text[data-v-0c0ef647] {
    font-size: 12px;
    color: #999;
    line-height: 16px
}

.arrow[data-v-0ebe36b2] {
    top: 100%;
    left: 13px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 8px solid #fff
}`},document.head);
        },
        update(item,value){
            if(value==true){
                this.replaceToNew();
            }
            else{
                this.replaceToOld();
            }
        },
        init(setting){
            this.initStyle();
            const bottomPanel = helper.get('#chat-control-panel-vm .bottom-actions');
            this.oldMedalButton = bottomPanel.querySelector('.action-item.medal');
            this.oldTitleButton = bottomPanel.querySelector('.action-item.title');
            this.medalButton = this.oldMedalButton.cloneNode(true);
            this.medalButton.dataset.name = 'medal';
            this.titleButton = this.oldTitleButton.cloneNode(true);
            this.titleButton.dataset.name = 'title';
            this.dialog = helper.get('.z-chat-control-panel-dialog').cloneNode();
            this.handler = (e)=>this.handleDialog(e.target);
            bottomPanel.parentNode.appendChild(this.dialog);
            if(setting.replaceMedalTitle) this.replaceToNew();
        },
        replaceToNew(){
            helper.replace(this.oldMedalButton,this.medalButton);
            helper.replace(this.oldTitleButton,this.titleButton);
            document.body.addEventListener('click', this.handler);
        },
        replaceToOld(){
            helper.replace(this.medalButton,this.oldMedalButton);
            helper.replace(this.titleButton,this.oldTitleButton);
            document.body.removeEventListener('click', this.handler);
        },
        handleDialog(target){
            if (this.dialog.contains(target)) return;
            const targetName = target.dataset.name;
            if (this.dialog.dataset.name==targetName||
                (target!=this.medalButton&&target!=this.titleButton)) {
                return this.closeDialog();
            }
            this.dialog.dataset.name = targetName;
            helper.set(this.dialog,{
                innerHTML:this.strings[targetName].header,
                style:this.strings[targetName].style
            });
            helper.xhr(this.strings[targetName].url).then(data=>{
                if(targetName=='medal') this.listMedal(data);
                else if(targetName=='title') this.listTitle(data);
            }).catch (e=>{
                //this.loadingDiv.innerHTML = `<p class="des">解析返回错误${e}～</p>`;
                console.error(e);
            });
            this.dialog.className = 'dialog-ctnr common-popup-wrap p-absolute border-box z-chat-control-panel-dialog bottom v-enter a-scale-in-ease v-enter-to';
        },
        closeDialog(){
            if (this.dialog.classList.contains('v-enter')){
                this.dialog.dataset.name = '';
                this.dialog.className = 'dialog-ctnr common-popup-wrap p-absolute border-box z-chat-control-panel-dialog bottom v-leave a-scale-out';
                setTimeout(()=>{this.dialog.style='display:none;';},300);
            }
        },
        doRequire(url,text){
            return helper.xhr(url).then(data=>{
                helper.toast(`${text}${data.code==0?'成功':`失败 code ${data.code} ${data.message}`}`);
            }).catch(e=>{
                helper.toast(`${text}出错${e}`)
            })
        },
        buyMedal(type){
            if (!confirm(`是否确认使用${type=='silver'?'9900银瓜子':'20硬币'}购买本房间勋章？`)){
                return;
            }
            this.doRequire(`//api.vc.bilibili.com/link_group/v1/member/buy_medal?coin_type=${type}&master_uid=${this.room.ANCHOR_UID}&platform=android`,'购买勋章');
        },
        listMedal(data){
            const listPanel = this.dialog.lastChild;
            const point = listPanel.querySelector('.bili-link.bottom-link.dp-block');
            const loadingDiv = this.dialog.querySelector('.tv');
            let hasMedal = false;
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
                if (this.room.ANCHOR_UID==v.target_id) hasMedal = true;
                helper.create('div',{
                    style:'margin-top: 8px',
                    innerHTML:`
                        <div data-v-0c0ef647="" title="主播:${v.uname}\r\n点击${v.status?'取消佩戴':'切换'}勋章" class="fans-medal-item v-middle pointer level-${v.level} ${v.status?' special-medal':''}">
                        <div class="label">${v.status?`<i class="medal-deco union"></i>`:''}<span class="content">${v.medalName}</span></div><span class="level">${v.level}</span>
                        </div>
                        <span data-v-0c0ef647="" title="升级进度：${v.intimacy}/${v.next_intimacy}\r\n升级还差：${v.next_intimacy-v.intimacy}" class="intimacy-bar dp-i-block v-center over-hidden p-relative">
                        <span data-v-0c0ef647="" class="dp-i-block v-top h-100" style="width: ${v.intimacy/v.next_intimacy*100}%;"></span>
                        </span>
                        <a data-v-0c0ef647="" href="/${v.roomid}" target="_blank"  title="今日亲密度剩余${v.dayLimit-v.todayFeed}\r\n点击前往主播房间" class="intimacy-text">${v.todayFeed}/${v.dayLimit}</a>`
                },listPanel).querySelector('.fans-medal-item').addEventListener('click', ()=>{
                    this.doRequire(`//api.live.bilibili.com/i/${v.status?`ajaxCancelWear`:`ajaxWearFansMedal?medal_id=${v.medal_id}`}`,v.status?'取消佩戴勋章':'切换勋章');
                    this.oldMedalButton.click()&this.oldMedalButton.click();
                    this.closeDialog();
                });
            });
            if (this.room.ANCHOR_UID&&!hasMedal){
                const buy = helper.create('div',{
                    style:'display: inline-block;margin-right: 10px;',
                    innerHTML : `
                        <div title="使用20硬币购买本房间勋章" class="dp-i-block pointer">
                        <a style="border: 1.8px solid #c8c8c8;border-radius: 50%;border-color: #23ade5;">硬</a>
                        <span>20</span>
                        </div>
                        <span title="使用9900银瓜子购买本房间勋章" class="pointer dp-i-block">
                        <i class="svg-icon silver-seed" style="font-size: 15px;"></i>
                        <span>9900</span>
                        </span>`,
                    onclick : e=>false
                });
                buy.firstElementChild.addEventListener('click',()=>this.buyMedal('metal'));
                buy.lastChild.addEventListener('click',()=>this.buyMedal('silver'));
                point.insertBefore(buy,point.firstElementChild);
            }
            listPanel.appendChild(point);
        },
        async listTitle(data){
            const listPanel = this.dialog.querySelector('#title-list');
            const loadingDiv = this.dialog.querySelector('.tv');
            if (data.code!=0||!data.data||!data.data.list){
                loadingDiv.innerHTML = `<p class="des">查询头衔失败 code:${data.code}\r\n${data.message}</p>`;
                return;
            }
            if (data.data.list.length==0){
                loadingDiv.innerHTML = `<p class="des">没有头衔哦～</p>`;
                return;
            }
            if (!this.titleInfos){
                await helper.xhr('//api.live.bilibili.com/rc/v1/Title/webTitles').then(data => {
                    if (data.code!=0||!(data.data instanceof Array)) throw(`code:${data.code}\r\n${data.message}`);
                    this.titleInfos = {};
                    data.data.forEach(title=>{
                        this.titleInfos[title.identification] = title.web_pic_url;
                    });
                }).catch(e=>{
                    console.error(e);
                });
            }
            listPanel.removeChild(loadingDiv);
            data.data.list.forEach((v)=>{
                helper.create('div',{
                    style : 'margin-top: 12px',
                    innerHTML : `<img alt="${v.name}" title="${v.name} ${v.source}\r\n${v.wear?'当前佩戴头衔，点击取消佩戴':'点击佩戴'}"
                        src="${this.titleInfos&&this.titleInfos[v.css]}" class="live-title-icon pointer">`
                        /*<span title="升级进度：${0}/3500000000 升级还差：${0}" class="intimacy-bar dp-i-block v-center over-hidden p-relative">
                        <span class="dp-i-block v-top h-100" style="width: ${0}%;"></span></span><span title="头衔经验" class="intimacy-text">${0}/${3500000000}</span>`;*/
                },listPanel).firstElementChild.addEventListener('click',()=>{
                    this.doRequire(`//api.live.bilibili.com/i/${v.wear?`ajaxCancelWearTitle`:`ajaxWearTitle?id=${v.id}&cid=${v.cid}`}`,`${v.wear?'取消佩戴':'切换'}头衔`);
                });
            });
        }
    },

    otherGift:{
        init (settings){
            const bottomPanel = helper.get('#chat-control-panel-vm .bottom-actions');
            this.panel = bottomPanel.firstElementChild;
            this.newGift = helper.set(bottomPanel.querySelector('.action-item.title').cloneNode(),{
                innerText:'礼',
                title:'其它礼物'
            });
            this.handler = (ev)=>this.showGift(ev.target);
            if(settings.showOtherGift) this.append();
        },
        append(){
            this.panel.appendChild(this.newGift);
            document.body.addEventListener('click',this.handler);
        },
        remove(){
            document.body.removeEventListener('click',this.handler);
            this.panel.removeChild(this.newGift);
        },
        update(item,value){
            if(value){
                this.append();
            }else{
                this.remove();
            }
        },
        token:(()=>{
            try{
                return document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/)[1];
            }catch(e){
                return undefined;
            }
        })(),
        imgType:(()=>{
            try{
                return 0==document.createElement('canvas').toDataURL("image/webp").indexOf("data:image/webp")?'webp':'gif';
            }catch(e){
                return 'gif';
            }
        })(),
        newGift:undefined,
        gift:[],
        room:unsafeWindow?unsafeWindow.BilibiliLive:window.BilibiliLive,
        sendGift(index){
            let type = 'gold';
            let num = 1;
            this.newGift.lastChild.style.display = 'none';
            const target = this.gifts[index];
            const sendPanel = helper.create('div',{
                className : 'bilibili-live-player-gfs-give-float',
                style:"position:fixed;",
                innerHTML : `
                <div class="bilibili-live-player-gfs-give-wrap">
                    <div class="bilibili-live-player-gfs-give-close"></div>
                    <h2>赠送礼物</h2>
                    <div class="clearfix">
                        <div class="bilibili-live-player-gfs-give-gif" style="background-image: url(${target[this.imgType]})"></div>
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
                </div>`
            },document.body);
            sendPanel.querySelector('input[value="silver"]').onchange = ()=>{type='silver';};
            sendPanel.querySelector('input[value="gold"]').onchange = ()=>{type='gold';};
            sendPanel.querySelector('.bilibili-live-player-gfs-give-counter').onchange = (ev)=>{num=ev.target.value;};
            sendPanel.querySelector('.bilibili-live-player-gfs-give-close').onclick = ()=>document.body.removeChild(sendPanel);
            sendPanel.querySelector('.bilibili-live-player-gfs-give-confirm').onclick = ()=>{
                document.body.removeChild(sendPanel);
                if (!this.room){
                    return helper.toast('无法找到房间信息，赠送失败');
                }
                helper.xhr('//api.live.bilibili.com/gift/v2/gift/send',{
                    gift_id:target.id,
                    ruid:this.room.ANCHOR_UID,
                    gift_num:num,
                    coin_type:type,
                    biz_id:this.room.ROOMID,
                    csrf_token:this.token
                }).then(data=>{
                    helper.toast(`赠送礼物${data.code==0?'成功':`失败 code ${data.code} ${data.message}`}`);
                }).catch(error=>{
                    helper.toast(`赠送礼物$出错${error}`);
                });
            };
        },
        showGift(target){
            if (!this.newGift.contains(target)){
                if (this.newGift.lastChild.style) this.newGift.lastChild.style.display = 'none';
            }else if (target==this.newGift){
                if (this.newGift.lastChild.style&&this.newGift.lastChild.style.display!='none') {
                    return (this.newGift.lastChild.style.display = 'none');
                }
                else if (this.gifts) {
                    return (this.newGift.lastChild.style.display = 'unset');
                }
                const list = document.createElement('div');
                const items = document.createElement('div');
                items.innerHTML = '<div data-v-ec1c3b2e="" class="tv"><div data-v-4df82965="" data-v-ec1c3b2e="" role="progress" class="link-progress-tv"></div></div>';
                list.className = 'common-popup-wrap t-left';
                list.style = 'position: absolute;width: 276px;bottom: 30px;left: 0px;cursor: auto;animation:scale-in-ease 0.4s;transform-origin: 90px bottom 0px;';
                list.innerHTML = `<div data-v-0ebe36b2="" class="arrow p-absolute" style="left: 90px;"></div><header data-v-460dfc36="">其它礼物</header>`;
                list.appendChild(items);
                this.newGift.appendChild(list);
                helper.xhr('//api.live.bilibili.com/gift/v3/live/gift_config').then(data=>{
                    this.gifts = data.data;
                    items.innerHTML = '';
                    items.style = 'height:233px;overflow: auto;'
                    for (let i=0;i<this.gifts.length;i++){
                        const g = this.gifts[i];
                        items.innerHTML += `<div data-index="${i}" style="background-image: url(${g.img_basic});width: 45px;height: 45px;" class="bg-cover dp-i-block pointer" title="${g.name}"></div>`;
                    }
                    [].forEach.call(items.childNodes,c=>{
                        c.onclick = (ev) => this.sendGift(ev.target.dataset.index);
                    });
                });
            }
        }
    },

    changeSetting(target){
        try{
            this.settings[target.id] = target.checked;
            GM_setValue('BilibiliLiveHelper',JSON.stringify(this.settings));
            this[this.settingInfos[target.id].group].update(target.id,target.checked);
        }
        catch(e){
            console.error(e);
        }
    },
    initSetting(){
        this.settings = JSON.parse(GM_getValue('BilibiliLiveHelper','{}'));
        const button = helper.get('.bilibili-live-player-video-controller-block-btn'),
              settingPanel = helper.create('div',{
                  className:"bilibili-live-player-video-controller-hide-danmaku-container t-left",
                  innerHTML:`<div>直播间助手设置</div>`,
              },button);
        helper.create('style',{
            innerHTML:`.bilibili-live-player-video-controller-block-btn:hover .bilibili-live-player-video-controller-hide-danmaku-container\
                  {padding: 10px 15px;overflow: visible;height: auto;"}</style>`
        },settingPanel);
        for(const key in this.settingInfos){
            if(this.settings[key]==undefined) this.settings[key] = true;
            const item = helper.create('div',{className:'blpui-checkbox-container'},settingPanel);
            helper.create('input',{
                type:'checkbox',
                className:'blpui-checkbox',
                id:key,
                checked:this.settings[key],
                onchange:({target})=>this.changeSetting(target)
            },item);
            helper.create('label',{
                className:'blpui-checkbox-span no-select',
                innerText:this.settingInfos[key].name
            },item).setAttribute('for',key);
        }
    },

    doInit(){
        try{
            if(!helper.get('.gift-package')) return false;
            this.initSetting();
            this.elementAdjuster.init(this.settings);
            this.advancedSwitcher.init(this.settings);
            this.otherGift.init(this.settings);
        } catch (e){
            console.error('bilibili直播间助手执行错误',e);
        }
    },
    init(){
        if(this.doInit()) return;
        new MutationObserver((mutations,observer) => {
            mutations.forEach((mutation)=>{
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.id == 'chat-control-panel-vm'){
                        observer.disconnect();
                        this.doInit();
                        return;
                    }
                }
            });
        }).observe(helper.get('#aside-area-vm')||document.body, {
            childList: true,
            subtree: true
        });
    }
};
LiveHelper.init();
