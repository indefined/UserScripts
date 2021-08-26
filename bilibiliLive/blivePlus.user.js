// ==UserScript==
// @name        bilibili直播间工具
// @namespace   indefined
// @supportURL  https://github.com/indefined/UserScripts/issues
// @version     0.5.44
// @author      indefined
// @description 可配置 直播间切换勋章/头衔、礼物包裹替换为大图标、网页全屏自动隐藏礼物栏/全屏发送弹幕(仅限HTML5)、轮播显示链接(仅限HTML5)
// @include     /^https?:\/\/live\.bilibili\.com\/(blanc\/)?\d/
// @grant       GM_getValue
// @grant       GM_setValue
// @license     MIT
// @run-at      document-idle
// ==/UserScript==

(function(){
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
    encodeURIC(data){
        return (
            (data==undefined)?data:
            !(data instanceof Object)?encodeURIComponent(data):
            Object.entries(data).map(([k,v])=>{
                return (v instanceof Array)?
                    v.map(i=>encodeURIComponent(k+'[]')+'='+encodeURIComponent(i)).join('&'):
                (v instanceof Object)?
                    Object.entries(v).map(([k1,v1])=>`${encodeURIComponent(`${k}[${k1}]`)}=${encodeURIComponent(v1)}`)
                :(encodeURIComponent(k)+'='+encodeURIComponent(v))
            }).join('&')
        );
    },
    xhr(url,data){
        return fetch(url, {
            method: data?'POST':'GET',
            credentials: 'include',
            body: this.encodeURIC(data),
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        }).then(res => res.json());
    },
    toast(msg,error){
        if(error) console.error(error);
        let toast = this.create('div',{
            innerHTML:`<div class="link-toast fixed success" style="left: 40%;top: 50%;"><span class="toast-text">${msg} ${error||''}</span></div>`
        });
        document.body.appendChild(toast);
        setTimeout(()=>document.body.removeChild(toast),3000);
    },
    window:typeof(unsafeWindow)!="undefined"?unsafeWindow:window,
    roomInfo:typeof(unsafeWindow)!="undefined"?unsafeWindow.BilibiliLive:window.BilibiliLive,
    isFirefox:navigator.userAgent.indexOf('Firefox')!=-1
};

const LiveHelper = {
    settingInfos:{
        timeSync:{
            name:'直播时间同步',
            group:'timeSync'
        },
        giftInPanel:{
            name:'礼物栏道具包裹',
            group:'elementAdjuster'
        },
        oldGiftStyle:{
            name:'旧版道具包裹样式',
            group:'elementAdjuster'
        },
        fullScreenPanel:{
            name:'全屏/网页全屏礼物栏',
            group:'elementAdjuster'
        },
        fullScreenChat:{
            name:'无侧边网页全屏弹幕发送框',
            group:'elementAdjuster'
        },
        /*
        chatInGiftPanel:{
            name:'全屏弹幕发送框放入礼物栏',
            group:'elementAdjuster'
        },*/
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
.gift-presets .z-gift-package {
    display: inline-block !important;
    vertical-align: top !important;
    cursor: pointer !important;
    position: relative! important;
}
.gift-presets .gift-package {
    bottom:-2px!important;
    background: url(//s1.hdslb.com/bfs/live/d57afb7c5596359970eb430655c6aef501a268ab.png)!important;
    width: 48px!important;
    height: 48px!important;
    background-size: cover!important;
    margin-right: 10px!important;
    color: black;
}

.gift-presets .gift-package>*{
    display:none!important;
}

.gift-presets .gift-package:after {
    content: '道具包裹';
    position: relative;
    bottom: -55px;
    left: 4px;
    white-space: nowrap;
}

/*礼物包裹放到礼物栏上后辣条购买悬浮面板需要提高*/
.z-gift-sender-panel {
    z-index: 1048576;
}

/*礼物包裹内样式*/
.gift-style-modify .gift-item-wrap .expiration {
    padding: 1px 5px!important;
    border-radius: 15px!important;
    text-align: center!important;
    right: 50%!important;
    transform: translate(50%);
    line-height: 1.35;
    word-break: keep-all!important;
}

.gift-style-modify .gift-item-wrap {
    margin: 10px 0px 0px 5px!important;
    width: unset!important;
}

.gift-style-modify .gift-item-wrap:nth-of-type(-n+5) {
    margin-top: 5px!important;
}

.gift-style-modify .common-popup-wrap.arrow-bottom.popup {
    min-width: 274px!important;
}

.gift-style-modify .item-box {
    width: 100%!important;
}

.gift-presets >div .wrap {
    bottom: 50px!important;
    right: -10px!important;
}

/*全屏礼物栏样式*/
body.fullscreen-fix #live-player div~div#gift-control-vm,
#live-player div~div#gift-control-vm {
    display: block!important;
}

#live-player .gift-item .info .label,
#live-player #gift-control-vm .gift-package {
    color: unset!important;
}

#live-player #gift-control-vm {
    background: none!important;
    position: relative!important;
    width: 100%!important;
    border: none!important;
    border-radius: 0!important;
    height: unset!important;
}

/*控制栏背景现在分离了，礼物栏放在控制栏上后会挤掉原来背景，补上*/
.live-web-player-controller {
    background: none !important;
}
.web-player-controller-wrap {
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7));
}
.web-player-controller-wrap>:first-child{
    height: 56px;
}

/*提高添加了礼物栏的播放器内弹幕发送框高度*/
#gift-control-vm .fullscreen-danmaku {
    bottom: 80px !important;
}
/*强制显示网页全屏弹幕发送框*/
.player-full-win.hide-aside-area .showdm div:not(.fullscreen-danmaku)~.fullscreen-danmaku{
    display: flex !important;
}

/*以下样式已暂时弃用*/
/*直接放在控制栏上的全屏发送框*/
#live-player-content .chat-input-ctnr.p-relative {
    display: inline-block;
    right: 0;
    margin-top: 0;
    float: right;
    vertical-align: sub
}
#live-player-content textarea.chat-input{
    height:25px;
    width: 355px;
    padding:0;
    color: #fff;
    background: rgba(0,0,0,.6);
}
#live-player-content textarea.chat-input .input-limit-hint{
    right: 0;
    bottom: unset;
}

.live-web-player-controller .right-action.p-absolute{
    position: relative!important;
    display: inline-block!important;
    vertical-align: super;
    float: right;
}
.live-web-player-controller .chat-input-ctnr.p-relative>div,
.live-web-player-controller .right-action.p-absolute {
    height: 24px;
}
.live-web-player-controller .chat-input-ctnr,
.live-web-player-controller .right-action.p-absolute {
    margin: 5px 0;
}
.live-web-player-controller .input-limit-hint {
    line-height: 12px;
}
.live-web-player-controller .right-action>button{
    height: 25px;
}
.live-web-player-controller .chat-input {
    height: 24px;
    width: 250px;
    padding: 2px 8px 2px;
}
/*放在礼物栏上的全屏弹幕发送框*/
#live-player .gift-control-panel .chat-input-ctnr{
    display: inline-block!important;
    vertical-align: middle!important;
    width:300px;
    margin-right: 5px;
    margin-top: 0px;
}

#live-player .chat-input-ctnr.p-relative>div {
    float: left;
}

#live-player .gift-control-panel .right-action.p-absolute{
    position: relative!important;
    display: inline-block!important;
    vertical-align: middle!important;
}

#live-player .gift-control-panel .chat-input.border-box>span{
    right: 90px;
}

#live-player .gift-control-panel .right-part .gift-presets {
    height: unset!important;
    margin: 0!important;
    bottom: -5px;
}

#live-player .gift-control-panel {
    height: unset!important;
}

#live-player .supporting-info {
    display: none!important;
}

#live-player .gift-section.gift-list{
    vertical-align: middle!important;
}

#live-player .gift-panel-box ,
#live-player .outer-drawer[data-v-fd126f5a]{
    background: none!important;
    border: none!important;
}

#live-player .count-down {
    margin-top: -10px!important;
}`
            },document.head);
        },
        initValues(){
            this.leftContainer = helper.get('.left-container');
            this.giftBar = helper.get('#gift-control-vm');
            this.giftPanel = helper.get('div.gift-presets.p-relative.t-right');
            this.giftPackage = helper.get('.item.z-gift-package');
            if(this.giftPackage) {
                this.giftPackage.id = 'giftPackage';
                this.giftPackageContainer = this.giftPackage.parentNode;
            }
            /*
            this.inputPanel = helper.get('div.chat-input-ctnr.p-relative');
            this.chatControlPanel = this.inputPanel.parentNode;
            this.bottomPanel = this.inputPanel.nextSibling;
            this.sendButton = this.bottomPanel.lastChild;
            */
            this.asideCss = helper.create('style', {innerHTML: '/*右侧弹幕池展开手柄会挡到网页全屏礼物栏*/.aside-area-toggle-btn.dp-none.p-absolute {height: 25%;}'});
            this.title = helper.create('a',{
                target:'_blank',
                className:'info-section dp-i-block v-middle title-link',
                style:'margin-left:16px;font-size:16px'
            });
            this.titleObserver = new MutationObserver(mutations => {
                //console.log(mutations);
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node instanceof HTMLVideoElement) {
                            this.updateVideoLink();
                            return;
                        }
                    }
                }
            });
            this.controllerObserver = new MutationObserver(mutations => this.handlerControllerPanel());
        },
        //礼物包裹
        updateGiftPackage(){
            if (this.giftPackage&&this.giftPanel){
                if(this.settings.giftInPanel) {
                    this.giftPanel.appendChild(this.giftPackage);
                    helper.get('.gift-package').className = 'gift-package live-skin-main-text';
                    const guardIcon = helper.get('div.m-guard-ent.gift-section.guard-ent');
                    if (guardIcon) guardIcon.parentNode.removeChild(guardIcon);
                }
                else if(this.giftPackage.parentNode!=this.giftPackageContainer) {
                    this.giftPackageContainer.appendChild(this.giftPackage);
                    helper.get('.gift-package').className = 'gift-package live-skin-highlight-bg';
                }
                if(this.settings.oldGiftStyle) {
                    this.giftPackage.classList.add('gift-style-modify');
                }
                else {
                    this.giftPackage.classList.remove('gift-style-modify');
                }
            }
        },
        getRoomID() {
            if (helper.roomInfo) return Promise.resolve(helper.roomInfo.ROOMID);
            const roomid = document.URL.match('[0-9]+')[0];
            return helper.xhr('https://api.live.bilibili.com/room/v1/Room/room_init?id='+roomid).then(roominfo =>roominfo.data && roominfo.data.room_id);
        },
        //轮播链接
        updateVideoLink(){
            const titlePanel = helper.get('div.normal-mode');
            if(!this.settings.showVideoLink) {
                if(this.title&&titlePanel.contains(this.title)){
                    titlePanel.removeChild(this.title);
                }
            }
            else{
                this.getRoomID().then(id=> {
                    if (!id) return;
                    helper.xhr('https://api.live.bilibili.com/live/getRoundPlayVideo?room_id='+id+'?type=flv').then(resp => {
                        console.log(resp.data);
                        resp.data.bvid && helper.set(this.title, {
                            innerText: resp.data.bvid,
                            href:`${resp.data.bvid_url}?p=${resp.data.pid}`
                        }, titlePanel);
                    });
                });
            }
        },
        //全屏礼物面板调整
        handlerControllerPanel(){
            const className = document.body.className,
                  status = !className ?
                  'normal' : className.includes('player-full-win') && !className.includes('hide-aside-area') ?
                  'web-fullscreen' : className.includes('full') ?
                  'fullscreen' : 'normal';
            if(status=='normal'){
                if (this.giftBar.parentNode != this.leftContainer) this.leftContainer.appendChild(this.giftBar);
                //if (this.danmuBar && this.giftBar.contains(this.danmuBar)) this.controllerPanel.appendChild(this.danmuBar);
            }
            else{
                this.controllerPanel = helper.get('.web-player-controller-wrap+.web-player-controller-wrap');
                this.danmuBar = helper.get('.fullscreen-danmaku');
                if (this.settings.fullScreenPanel && this.controllerPanel) {
                    if (!this.controllerPanel.contains(this.giftBar)) {
                        this.controllerPanel.appendChild(this.giftBar);
                    }
                    if (this.settings.fullScreenChat && this.danmuBar) {
                        this.controllerPanel.classList.add('showdm');
                        this.giftBar.appendChild(this.danmuBar);
                    }
                    else this.controllerPanel.classList.remove('showdm');
                }
                else {
                    if (this.giftBar.parentNode != this.leftContainer) this.leftContainer.appendChild(this.giftBar);
                    if (this.danmuBar && this.controllerPanel) {
                        if (this.settings.fullScreenChat) {
                            this.controllerPanel.classList.add('showdm');
                            this.controllerPanel.appendChild(this.danmuBar);
                        }
                        else this.controllerPanel.classList.remove('showdm');
                    }
                }
            }
            /*
            if (status=='web-fullscreen-hide'&&this.settings.fullScreenChat){
                if(this.settings.chatInGiftPanel&&this.settings.fullScreenPanel&&!this.giftPanel.contains(this.sendButton)){
                    this.giftPanel.appendChild(this.inputPanel);
                    this.giftPanel.appendChild(this.sendButton);
                }
                else if(!this.settings.chatInGiftPanel||!this.settings.fullScreenPanel) {
                    const controller = helper.get('.live-web-player-controller .right-area');
                    if (!controller || controller.contains(this.sendButton)) return;
                    controller.appendChild(this.sendButton);
                    controller.appendChild(this.inputPanel);
                }
            }else if((status!='web-fullscreen-hide'||!this.settings.fullScreenChat)&&!this.bottomPanel.contains(this.sendButton)){
                this.chatControlPanel.insertBefore(this.inputPanel,this.bottomPanel);
                this.bottomPanel.appendChild(this.sendButton);
            }
            */
        },
        update(item,value){
            if(item=='showVideoLink') {
                this.updateVideoLink();
            }
            else if(item=='giftInPanel'||item=='oldGiftStyle') {
                return this.updateGiftPackage();
            }
            else if(item=='fullScreenPanel'||item=='fullScreenChat'||item=='chatInGiftPanel') {
                this.handlerControllerPanel();
            }
            if (this.settings.fullScreenPanel) {
                this.giftPanel.appendChild(this.asideCss);
            }
            else if (this.asideCss.parentNode){
                this.asideCss.parentNode.removeChild(this.asideCss);
            }
            this.titleObserver.disconnect();
            if(this.settings.showVideoLink) {
                this.titleObserver.observe(helper.get('#live-player'), {childList:true});
            }
            this.controllerObserver.disconnect();
            if(this.settings.fullScreenPanel||this.settings.fullScreenChat){
                this.controllerObserver.observe(document.body,{
                    attributes: true,
                    attributeOldValue: true,
                    attributeFilter: ['class']
                });
            }
        },
        init(settings){
            this.settings = settings;
            this.initValues();
            this.initStyle();
            this.update();
            this.updateVideoLink();
            this.updateGiftPackage();
        }
    },

    timeSync: {
        status: false,
        init(settings) {
            try{if (!helper.window.livePlayer && !helper.window.top.livePlayer) return;}catch(e){return console.error(e);}
            this.icon = helper.create('span',{
                title: "同步时间",
                className: 'icon',
                innerHTML: `<svg t="1595680402158" style="width: 22px; height: 36px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7532" width="22" height="22"><path d="M938.1888 534.016h-80.7936c0.4096-7.3728 0.6144-14.6432 0.6144-22.016 0-218.624-176.8448-400.7936-389.12-400.7936C257.024 111.2064 80.6912 293.1712 80.6912 512c0 218.7264 176.4352 400.7936 388.1984 400.7936 74.752 0 149.0944-22.016 208.1792-60.0064l42.7008 68.608c-75.0592 48.9472-161.9968 74.8544-250.7776 74.752C209.8176 996.1472 0 779.264 0 512S209.8176 27.8528 468.8896 27.8528C728.3712 27.8528 938.7008 244.736 938.7008 512c0 7.3728-0.2048 14.6432-0.512 22.016z m-261.12 318.7712z m-26.4192-158.1056L426.7008 556.032V291.9424h64v226.5088L689.5616 635.904l-38.912 58.7776z m245.3504-6.656L768 512h256L896 688.0256z" fill="#ffffff" p-id="7533"></path></svg>`,
                onclick: this.setVideoSync
            });
            (helper.window.livePlayer||helper.window.top.livePlayer).on('ctrlVisibleChange', status=>{
                if (status && this.status) this.append();
            });
            this.update('timeSync', settings.timeSync);
        },
        update(item, status) {
            if (item != 'timeSync' || this.status == status) return;
            this.status = status;
            if (status) {
                this.append();
            }
            else {
                this.remove();
            }
        },
        append() {
            const area = helper.get('.live-web-player-controller .left-area');
            if (area) {
                area.appendChild(this.icon);
            }
        },
        remove() {
            if (this.icon.parentNode) this.icon.parentNode.removeChild(this.icon);
        },
        setVideoSync() {
            const video = (helper.window.livePlayer||helper.window.top.livePlayer).getVideoEl
            && (helper.window.livePlayer||helper.window.top.livePlayer).getVideoEl()
            || helper.get('video');
            if (video && video.buffered.length) {
                video.currentTime = video.buffered.end(0);
            }
        },
    },

    //勋章/头衔扩展
    advancedSwitcher:{
        room:helper.roomInfo,
        titleInfos:undefined,
        oldMedalButton:undefined,
        oldTitleButton:undefined,
        medalButton:undefined,
        titleButton:undefined,
        dialog:undefined,
        strings:{
            medal:{
                name:'勋章',
                link:'//link.bilibili.com/p/center/index#/user-center/wearing-center/my-medal',
                dataUrl:'//api.live.bilibili.com/i/api/medal?page=1&pageSize=1000'
            },
            title:{
                name:'头衔',
                link:'//link.bilibili.com/p/center/index#/user-center/wearing-center/library',
                dataUrl:'//api.live.bilibili.com/appUser/myTitleList'
            }
        },
        update(item,value){
            if(value==true){
                this.replaceToNew();
            }
            else{
                this.replaceToOld();
                this.closeDialog();
            }
        },
        init(setting){
            //各种按钮
            const bottomPanel = helper.get('#chat-control-panel-vm .bottom-actions');
            this.container = helper.get('#chat-control-panel-vm .left-action') || bottomPanel;
            this.oldMedalButton = helper.get('#chat-control-panel-vm .medal-item-margin');
            //this.oldMedalButton = bottomPanel.querySelector('.action-item.medal');
            this.oldTitleButton = bottomPanel.querySelector('.action-item.title');
            this.medalButton = helper.create('div', {
                style: "display: inline-block;height: 16px;width: 16px;background: blue;text-align: center;color: white;cursor: pointer;font-size: 12px;line-height:16px; margin: 0 1px;",
                innerText: '勋',
            });
            this.titleButton = helper.create('div', {
                style: "display: inline-block;height: 16px;width: 16px;background: #f76e9e;text-align: center;color: white;cursor: pointer;font-size: 12px;line-height:16px; margin: 0 1px;",
                innerText: '衔',
            });
            this.medalButton.dataset.name = 'medal';
            this.titleButton.dataset.name = 'title';
            //对话框点击事件处理句柄
            this.handler = (e)=>this.handleDialog(e.target);
            //创建对话框
            this.dialog = helper.create('div',{
                id:'title-medal-dialog',
                style:'display:none;bottom:50px',
                //innerHTML:`<style>#title-medal-dialog a{color: #23ade5;}</style>`
            },bottomPanel.parentNode);
            //样式
            helper.create('style',{
                innerHTML:'#title-medal-dialog>div>div:nth-child(odd){background-color: #f1f2f4;}'
                +'#title-medal-dialog .title-medal-selected-line{background: #e4f12699 !important;}'
                +'#title-medal-dialog .fans-medal-item{cursor:pointer}'
                +'#title-medal-dialog .fans-medal-item .label{width: 35px;display: inline-block;text-align: center;padding: 0 3px;}'
                +'#title-medal-dialog .fans-medal-item .level{display: inline-block;width: 16px;text-align: center;background:#fff}'
                +'#title-medal-dialog .gray span.h-100.v-top{background:#c0c0c0 !important}'
                //*//以下是旧版勋章样式，大概用不到了
                +'#title-medal-dialog .fans-medal-item.gray .level{color:#c0c0c0}'
                +'#title-medal-dialog .fans-medal-item.gray .label{background:#c0c0c0}'
                +'#title-medal-dialog .fans-medal-item.gray{border-color:#c0c0c0}'
                +['#61DDCB','#5896DE','#A068F1','#FF86B2','#f6be18'].map((color,lv)=>[1,2,3,4].map(add=>{
                    return `#title-medal-dialog .level-${lv*4+add}{border-color: ${color}}`
                        + `#title-medal-dialog .level-${lv*4+add} .label{background-color: ${color}}`
                        + `#title-medal-dialog .level-${lv*4+add} .level{color: ${color}}`;
                }).join('')).join('')
                //*/
            },this.dialog);
            //对话框箭头
            this.dialogArraw = helper.create('div',{
                className:"p-absolute",
                style:"top: 100%;border-left: 4px solid transparent;border-right: 4px solid transparent;border-top: 8px solid #fff;"
            },this.dialog);
            //对话框标题
            this.dialogTitle = helper.create('div',{style:"font-weight: 400;font-size: 18px;"},this.dialog);
            //对话框内容本体
            this.dialogPanel = helper.create('div',{style:'max-height: 400px;overflow: auto;'},this.dialog);
            //对话框正在载入面板
            this.loadingDiv = helper.create('div',{className:"tv"},this.dialog);
            //对话框底部面板
            this.dialogBottom = helper.create('div',{style:"margin-top: 10px;text-align: center;"},this.dialog);
            if(setting.replaceMedalTitle) this.replaceToNew();
        },
        replaceToNew(){
            this.container.appendChild(this.medalButton);
            this.oldTitleButton && helper.replace(this.oldTitleButton, this.titleButton) || this.container.appendChild(this.titleButton);
            document.body.addEventListener('click', this.handler);
        },
        replaceToOld(){
            this.container.contains(this.medalButton)&&this.container.removeChild(this.medalButton);
            this.oldTitleButton && helper.replace(this.titleButton, this.oldTitleButton) ||
                (this.container.contains(this.titleButton)&&this.container.removeChild(this.titleButton));
            document.body.removeEventListener('click', this.handler);
        },
        handleDialog(target){
            if (this.dialog.contains(target)) return;
            const targetName = target.dataset.name;
            if (
                !targetName ||
                this.dialog.dataset.name==targetName ||
                (target!=this.medalButton&&target!=this.titleButton)
            ) {
                return this.closeDialog();
            }
            const targetConfig = this.strings[targetName];
            //设置当前对话框目标
            this.dialog.dataset.name = targetName;
            this.dialogTitle.innerText = '我的'+targetConfig.name;
            //设置对话框位置
            this.dialog.style = `transform-origin: ${target.offsetLeft+3}px bottom 0px;position:absolute;bottom:50px;color: #23ade5;`;
            this.dialogArraw.style.left = target.offsetLeft+3 + 'px';
            //显示正在加载面板
            helper.set(this.loadingDiv,{
                style:"height:100px",
                innerHTML:`<span data-v-ec1c3b2e="" role="progress" class="link-progress-tv" data-v-4df82965=""></span>`
            })
            //清空对话框本体
            this.dialogPanel.innerHTML = '';
            //底部面板初始化为目标链接
            this.dialogBottom.innerHTML = `<a href="${targetConfig.link}" target="_blank" title="前往${
                targetConfig.name}管理页面" style="color: #23ade5;">管理我的${targetConfig.name}</a>`;
            //获取数据并调用显示处理
            helper.xhr(targetConfig.dataUrl).then(async data=>{
                if(targetName=='medal') await this.listMedal(data);
                else if(targetName=='title') await this.listTitle(data);
            }).then(()=>{
                this.loadingDiv.style = 'display:none';
                if(helper.isFirefox && (this.dialogPanel.scrollHeight>this.dialogPanel.clientHeight)) {
                    this.dialogPanel.style.width = this.dialogPanel.offsetWidth + 20 + 'px';
                }
                else {
                    this.dialogPanel.style.width = 'unset';
                }
            }).catch (e=>{
                this.loadingDiv.innerHTML = `<p class="des">解析返回错误${e}～</p>`;
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
        doRequire(url,text,data){
            if (data) {
                let token = document.cookie.match(/bili_jct=([0-9a-fA-F]{32})/);
                if (!token) return helper.toast('找不到令牌');
                data.csrf_token = data.csrf = token[1];
                data.visit_id = '';
            }
            return helper.xhr(url,data).then(data=>{
                helper.toast(`${text}${data.code==0?'成功':`失败 code ${data.code} ${data.message}`}`);
            }).catch(e=>{
                helper.toast(`${text}出错${e}`)
            })
        },
        buyMedal(type){
            if (!confirm(`是否确认使用${type=='silver'?'9900银瓜子':'20硬币'}购买本房间勋章？`)){
                return;
            }
            return this.doRequire(`//api.vc.bilibili.com/link_group/v1/member/buy_medal`, `购买勋章`, {
                coin_type: type,
                master_uid: this.room.ANCHOR_UID,
                platform: 'android'
            });
        },
        async listMedal(data){
            let hasMedal = false;
            if (data.code!=0||!data.data||!(data.data.fansMedalList instanceof Array)) {
                console.error(data);
                throw(`查询勋章失败 code:${data.code}</br>${data.message}`);
            }
            const medalList = data.data.fansMedalList;
            if (this.room && this.room.UID) {
                const wall = await helper.xhr('//api.live.bilibili.com/xlive/web-ucenter/user/MedalWall?target_id='+this.room.UID);
                if (wall.code ==0 && wall.data && (wall.data.list instanceof Array)) {
                    for (let item of wall.data.list) {
                        let medal = medalList.find(i=>i.target_name == item.target_name);
                        if (medal) medal.live_stream_status = item.live_status;
                    }
                }
            }
            medalList.forEach((v)=>{
                if (this.room.ANCHOR_UID==v.target_id) hasMedal = true;
                const itemDiv = helper.create('div',{
                    style:'margin-top: 8px',
                    className:v.status&&'title-medal-selected-line'||''
                },this.dialogPanel);
                helper.create('div',{
                    title:`主播:${v.target_name}\n${v.status?'当前佩戴勋章，点击取消佩戴':'点击佩戴此'}勋章${!v.is_lighted?'\n已熄灭，投喂金瓜子礼物或者小心心点亮':''}`,
                    style:`border-color: #${v.medal_color_border.toString(16)}`,
                    innerHTML:`<div class="label" style="background:linear-gradient(45deg, #${v.medal_color_start.toString(16)}, #${v.medal_color_end.toString(16)})"><span class="content">${v.medal_name}</span></div>`
                    +`<span class="level" style="color:#${v.medal_color_start.toString(16)}">${v.level}</span>`,
                    className:`fans-medal-item v-middle level-${v.level} ${!v.is_lighted?'gray':''}`,
                    onclick:()=>{
                        if (v.status) this.doRequire('//api.live.bilibili.com/xlive/web-room/v1/fansMedal/take_off','取消佩戴勋章', {});
                        else this.doRequire('//api.live.bilibili.com/xlive/web-room/v1/fansMedal/wear', '切换勋章', {medal_id: v.medal_id});
                        this.closeDialog();
                        setTimeout(()=>this.oldMedalButton&&this.oldMedalButton.click()&setTimeout(()=>this.oldMedalButton.click()),200);
                    }
                },itemDiv);
                helper.create('span',{
                    title:`升级进度：${v.intimacy}/${v.next_intimacy}\r\n升级还差：${v.next_intimacy-v.intimacy}`,
                    className:`dp-i-block over-hidden v-middle ${!v.is_lighted?'gray':''}`,
                    style:"height: 8px;width: 64px;margin: 0 8px;border-radius: 3px;background-color: #e3e8ec;",
                    innerHTML:`<span class="dp-i-block h-100 v-top" style="width: ${v.intimacy/v.next_intimacy*100}%;background-color: #23ade5;"></span>`
                },itemDiv);
                helper.create('a',{
                    style:'color:#999;min-width:50px',
                    href:`/${v.room_id||v.roomid}`,target:"_blank",className:"intimacy-text v-middle dp-i-block",
                    title:`今日上限剩余${v.day_limit-v.today_feed}\n点击前往主播房间`,
                    innerHTML:`${v.today_feed}/${v.day_limit}${v.live_stream_status==1 ?'<img src="//s1.hdslb.com/bfs/static/blive/blfe-live-room/static/img/living.44021fe..gif" style="height: 12px;vertical-align: middle;" title="正在直播">':''}`
                },itemDiv);
            });
            if (data.data.fansMedalList.length==0) {
                helper.create('p',{
                    innerHTML:'<p data-v-17cf8b1e="" class="empty-hint-text">你还没有勋章哦～</p>'
                    +'<div data-v-17cf8b1e="" class="empty-image"></div>'
                },this.dialogPanel);
            }
        },
        async listTitle(data){
            if (data.code!=0||!data.data||!(data.data.list instanceof Array)) {
                console.error(data);
                throw(`查询头衔失败 code:${data.code}</br>${data.message}`);
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
            data.data.list.forEach((v)=>{
                const lvMax = v.level.length&&v.level[v.level.length-1],
                      unLimit = v.expire_time == "0000-00-00 00:00:00",
                      outOfDate = (new Date(v.expire_time)-Date.now())/1000/60/60/24<4;
                const itemDiv = helper.create('div',{style: 'margin-top: 12px',className:v.status?'title-medal-selected-line':''},this.dialogPanel);
                helper.create('a',{
                    className:"live-title-icon pointer v-middle dp-i-block",
                    href:v.url==''?'javascript:':v.url,target:'_blank',
                    title:`${v.name} ${v.activity}\r\n${v.description}\r\n${v.url!=''?'点击前往头衔活动页面':''}`,
                    innerHTML: `<img alt="${v.name}" src="${(this.titleInfos&&this.titleInfos[v.title])||v.title_pic&&v.title_pic.img}" class="live-title-icon pointer">`,
                    style:`min-width:88px;`
                },itemDiv);
                helper.create('span',{
                    title:`头衔经验：${v.score}\r\n${lvMax?`满级还差${v.score-lvMax}`:''}`,
                    className:"dp-i-block v-center over-hidden v-middle",
                    style:"height: 8px;width: 64px;margin: 0 8px;border-radius: 3px;background-color: #e3e8ec;",
                    innerHTML:`<span class="dp-i-block h-100 v-top" style="width: ${lvMax?v.score/lvMax*100:100}%;background-color: #23ade5;"></span>`
                },itemDiv);
                helper.create('span',{
                    style:`color:${outOfDate?'#f00':unLimit?'#c0c0c0':'#29abe1'};border:1px solid ${unLimit?'#c0c0c0':'#a068f1'};border-radius:3px;cursor:pointer;padding:3px;`,
                    onclick: ()=>{
                        //if (unLimit) return;
                        if (v.status) this.doRequire('//api.live.bilibili.com/xlive/web-ucenter/v1/user_title/CancelTitle','取消佩戴头衔', {});
                        else this.doRequire('//api.live.bilibili.com/appUser/wearTitle', '切换头衔', {title: v.title});
                        this.closeDialog();
                    },
                    className:'v-middle dp-i-block',
                    title:unLimit?'不可佩戴':`可佩戴时间至${v.expire_time}\r\n点击${v.status?'取消佩戴':'佩戴'}`,
                    innerText:v.status?'取消':'佩戴'
                },itemDiv);
            });
            if (data.data.list.length==0) {
                helper.create('p',{
                    innerHTML:'<p data-v-17cf8b1e="" class="empty-hint-text">你还没有头衔哦～</p>'
                    +'<div data-v-17cf8b1e="" class="empty-image"></div>'
                },this.dialogPanel);
            }
        }
    },

    otherGift:{
        init (settings){
            const bottomPanel = helper.get('#chat-control-panel-vm .bottom-actions');
            this.panel = bottomPanel.querySelector('.left-action')|| bottomPanel;
            this.newGift = helper.create('div', {
                style: "display: inline-block;height: 16px;width: 16px;background: pink;text-align: center;color: white;cursor: pointer;font-size: 12px;line-height: 16px; margin: 0 1px;",
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
        room:typeof(unsafeWindow)!="undefined"?unsafeWindow.BilibiliLive:window.BilibiliLive,
        sendGift(index){
            let type = 'gold';
            let num = 1;
            this.newGift.lastChild.style.display = 'none';
            const target = this.gifts[index];
            const sendPanel = helper.create('div',{
                style:"position: fixed;top: 0px;bottom: 0px;left: 0px;right: 0px;background: rgba(0, 0, 0, 0.4);z-index: 10000;",
                innerHTML : `
                <div style="width: 298px;right: 0px;left: 0px;position: absolute;padding: 20px;background: rgb(255, 255, 255);
                    border-radius: 8px;margin: auto;transform: translate(0px, 50%);box-sizing: content-box;">
                    <h2 style="font-size: 20px;color: rgb(79, 193, 233);font-weight: 400;padding-bottom: 10px;margin: 0;">赠送礼物
                    <span style="float: right;cursor: pointer;font-size: 15px;" class="bilibili-live-player-gfs-give-close">Ｘ</span></h2>
                    <div>
                        <div style="background-image: url(${target[this.imgType]});width: 72px;height: 72px;background-size: cover;display: inline-block;"></div>
                        <div class="bilibili-live-player-gfs-give-info" style="display: inline-block;vertical-align: top;">
                            <span>${target.name}</span>
                            <span class="bilibili-live-player-gfs-give-cost-gold"><i data-v-13895867="" class="svg-icon gold-seed v-middle"></i><span>${target.price}</span></span>
                        <p class="gift-info-desc" data-v-33a72392="" style="margin-top: 4px;color: #666;max-width: 215px;">${target.desc}</p></div>
                    </div>
                    <div style="border-top: 1px solid #f0f0f0;padding-top: 10px;margin-top: 10px;">
                        <label>
                            <span>选择：</span>
                            <input name="send_gift_type" type="radio" value="gold" checked id="send_gold" style="vertical-align: text-top;margin: 0 2px;"><label for="send_gold">金瓜子</label>
                            <input name="send_gift_type" type="radio" value="silver" id="send_silver" style="vertical-align: text-top;margin: 0 2px;"><label for="send_silver">银瓜子</label>
                        </label>
                        <input class="bilibili-live-player-gfs-give-counter" type="text" value="1" placeholder="赠送数量" style="width: 50px;box-sizing: border-box;margin: 0 10px;
                            border-color: #d0d7dd;vertical-align: bottom;text-align: center;height: 24px;padding: 2px 8px;line-height: 25px;
                            border: 1px solid #aaa;border-radius: 4px;background-color: #fff;outline: none;">
                        <button class="bilibili-live-player-gfs-give-confirm" style="position: relative;box-sizing: border-box;line-height: 1;min-width: 0;width: 60px;
                            height: 24px;background-color: #23ade5;color: #fff;font-size: 14px;border: 0;border-radius: 4px;cursor: pointer;outline: none;overflow: hidden;">赠送</button>
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
                items.innerHTML = '<div data-v-ec1c3b2e="" class="tv" style="height:100px"><div data-v-4df82965="" data-v-ec1c3b2e="" role="progress" class="link-progress-tv"></div></div>';
                list.className = 'common-popup-wrap t-left';
                list.style = 'position: absolute;width: 276px;bottom: 30px;left: 0px;cursor: auto;animation:scale-in-ease 0.4s;transform-origin: 90px bottom 0px;';
                list.innerHTML = `<div style="position: absolute;left: ${target.offsetLeft+3}px;top: 100%;width: 0;height: 0;border-left: 4px solid transparent;
                    border-right: 4px solid transparent;border-top: 8px solid #fff;"></div><header style="font-size:18px;color:#23ade5;margin-bottom:10px;">其它礼物</header>`;
                list.appendChild(items);
                this.newGift.appendChild(list);
                helper.xhr('//api.live.bilibili.com/gift/v3/live/gift_config').then(data=>{
                    this.gifts = data.data;
                    items.innerHTML = '';
                    items.style = 'height:233px;overflow: auto;'
                    for (let i=0;i<this.gifts.length;i++){
                        const g = this.gifts[i];
                        items.innerHTML += `<div data-index="${i}" style="background-image: url(${g.img_basic});width: 45px;height: 45px;"
                            class="bg-cover dp-i-block pointer" title="${g.name}"></div>`;
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
            this[this.settingInfos[target.id].group].update(target.id,target.checked);
            typeof(GM_setValue)!='undefined'?GM_setValue('BilibiliLiveHelper',JSON.stringify(this.settings))
            :localStorage.BilibiliLiveHelper = JSON.stringify(this.settings);
        }
        catch(e){
            console.error(e);
        }
    },
    initSetting(){
        this.settings = (()=>{
            try{
                const str = typeof(GM_setValue)!='undefined'?
                      GM_getValue('BilibiliLiveHelper','{}'):localStorage.BilibiliLiveHelper;
                return JSON.parse(str);
            }catch(e){
                return {};
            }
        })();
        for(const key in this.settingInfos){
            if(this.settings[key]==undefined) this.settings[key] = true;
        }
        let controller = helper.get('.web-player-controller-wrap+.web-player-controller-wrap');
        if (!controller) return;
        const settingPanel = helper.create('div',{
                  className: 'player-type',
                  style: 'padding-top: 5px;line-height: 14px;',
                  innerHTML:`<div>直播间助手设置</div>`,
              });
        new MutationObserver((mutations, observer)=>{
            //return console.log(mutations);
            if (!controller.parentNode) {
                console.log('reload?');
                observer.disconnect();
                controller = helper.get('.web-player-controller-wrap+.web-player-controller-wrap');
                if (controller) observer.observe(controller, {childList:true, subtree:true});
            }
            for (const mutation of mutations) {
                for (const panel of mutation.addedNodes) {
                    if (panel.classList && panel.classList.contains('danmaku-control')) {
                        return panel.appendChild(settingPanel);
                    }
                }
            }
        }).observe(controller, {childList:true, subtree:true});
        //helper.create('style',{innerHTML:'.setting-panel{width:max-content!important}'}, document.head);
        for(const key in this.settingInfos){
            const item = helper.create('div',{className:'blpui-checkbox-container'},settingPanel);
            helper.create('input',{
                type:'checkbox',
                className:'player-type',
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
            //已经有一个礼物包裹的ID说明脚本运行过返回true防止二次初始化
            if(helper.get('#giftPackage')) return true;
            //页面中没有礼物包裹说明页面没有加载完成返回false继续监听页面加载
            if(!helper.get('.gift-package')) return false;
            this.initSetting();
            this.elementAdjuster.init(this.settings);
            this.advancedSwitcher.init(this.settings);
            this.otherGift.init(this.settings);
            this.timeSync.init(this.settings);
            //初始化成功返回true不用监听页面加载
            return true;
        } catch (e){
            helper.toast('bilibili直播间助手执行错误',e);
            //初始化异常，返回true放弃继续监听页面
            return true;
        }
    },
    init(){
        if(this.doInit()) return;
        new MutationObserver((mutations,observer) => {
            //console.log(mutations)
            if(helper.get('.gift-package')){
                observer.disconnect();
                this.doInit();
                return;
            }
        }).observe(helper.get('#aside-area-vm')||document.body, {
            childList: true,
            subtree: true
        });
    }
};
LiveHelper.init();
})();
