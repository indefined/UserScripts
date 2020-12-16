// ==UserScript==
// @name        bilibili直播间工具
// @namespace   indefined
// @supportURL  https://github.com/indefined/UserScripts/issues
// @version     0.5.28
// @author      indefined
// @description 可配置 直播间切换勋章/头衔、硬币直接购买勋章、礼物包裹替换为大图标、网页全屏自动隐藏礼物栏/全屏发送弹幕(仅限HTML5)、轮播显示链接(仅限HTML5)
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
    isFirefox:navigator.userAgent.indexOf('Firefox')!=-1
};

const LiveHelper = {
    settingInfos:{
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
            name:'全屏弹幕发送框',
            group:'elementAdjuster'
        },
        chatInGiftPanel:{
            name:'全屏弹幕发送框放入礼物栏',
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
body.fullscreen-fix div#gift-control-vm {
    display: block!important;
}

.bilibili-live-player-video-controller .gift-item .info .label,
.bilibili-live-player-video-controller #gift-control-vm .gift-package {
    color: unset!important;
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

/*直接放在控制栏上的全屏发送框*/
.bilibili-live-player-video-controller-content .chat-input-ctnr.p-relative {
    display: inline-block;
    right: 0;
    margin-top: 0;
    float: right;
    vertical-align: sub
}
.bilibili-live-player-video-controller-content textarea.chat-input{
    height:25px;
    width: 355px;
    padding:0;
    color: #fff;
    background: rgba(0,0,0,.6);
}
.bilibili-live-player-video-controller-content textarea.chat-input .input-limit-hint{
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
    height: 26px;
}
.live-web-player-controller .chat-input-ctnr,
.live-web-player-controller .right-action.p-absolute {
    margin-top: 11px;
}
.live-web-player-controller .chat-input {
    height: 24px;
    padding: 2px 8px 2px;
}
/*放在礼物栏上的全屏弹幕发送框*/
.bilibili-live-player-video-controller .gift-control-panel .chat-input-ctnr{
    display: inline-block!important;
    vertical-align: middle!important;
    width:300px;
    margin-right: 5px;
    margin-top: 0px;
}

.bilibili-live-player-video-controller .chat-input-ctnr.p-relative>div {
    float: left;
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
            if(this.giftPackage) {
                this.giftPackage.id = 'giftPackage';
                this.giftPackageContainer = this.giftPackage.parentNode;
            }
            this.playerPanel = helper.get('.bilibili-live-player.relative');
            this.screenPanel = helper.get('.bilibili-live-player-video-controller');
            this.controller = helper.get('.control-area .right-area');
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
            this.titleObserver = new MutationObserver(mutations => {
                mutations.forEach((mutation)=>{
                    if (mutation.target.className==="bilibili-live-player-video-round-title") {
                        this.updateVideoLink();
                    }
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.className==="bilibili-live-player-video-round-title") {
                            this.updateVideoLink();
                        }
                    }
                });
            });
            this.bodyObserver = new MutationObserver(mutations => {
                mutations.forEach((mutation)=>{
                    if(!mutation.attributeName) return;
                    this.handleFullScreenPanel();
                });
            });
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
        //轮播链接
        updateVideoLink(){
            if(!this.settings.showVideoLink) {
                if(this.title&&this.titlePanel.contains(this.title)){
                    this.titlePanel.removeChild(this.title);
                }
            }
            else{
                const target = helper.get('.bilibili-live-player-video-round-title'),
                      match = target&&target.innerText.match(/((av\d+)|(bv[a-zA-Z0-9]+)).+(P(\d+))+?/i);
                match&&helper.set(this.title,{
                    innerText:match[1],
                    href:`//www.bilibili.com/video/${match[1]}${match[5]&&match[5]!=1&&`?p=${match[5]}`||''}`
                },this.titlePanel);
            }
        },
        //全屏礼物面板调整
        handleFullScreenPanel(){
            const className = document.body.className,
                  status = !className ? 'normal' : className.includes('player-full-win') && !className.includes('hide-aside-area')?
                  'web-fullscreen' : className.includes('full') ?
                  'fullscreen' : 'normal';
            if((status=='normal'||!this.settings.fullScreenPanel)&&this.screenPanel.contains(this.toolBar)){
                this.leftContainer.appendChild(this.toolBar);
            }
            else if (status!='normal'&&this.settings.fullScreenPanel&&!this.screenPanel.contains(this.toolBar)){
                this.screenPanel.appendChild(this.toolBar);
            }
            if (status=='fullscreen'&&this.settings.fullScreenChat){
                if(this.settings.chatInGiftPanel&&this.settings.fullScreenPanel&&!this.giftPanel.contains(this.sendButton)){
                    this.giftPanel.appendChild(this.inputPanel);
                    this.giftPanel.appendChild(this.sendButton);
                }
                else if((!this.settings.chatInGiftPanel||!this.settings.fullScreenPanel)&&!this.controller.contains(this.sendButton)){
                    this.controller.appendChild(this.sendButton);
                    this.controller.appendChild(this.inputPanel);
                }
            }else if((status!='fullscreen'||!this.settings.fullScreenChat)&&!this.bottomPanel.contains(this.sendButton)){
                this.controlPanel.insertBefore(this.inputPanel,this.bottomPanel);
                this.bottomPanel.appendChild(this.sendButton);
            }
        },
        update(item,value){
            if(!this.playerPanel) return;
            if(item=='showVideoLink') {
                this.updateVideoLink();
            }
            else if(item=='giftInPanel'||item=='oldGiftStyle') {
                return this.updateGiftPackage();
            }
            else if(item=='fullScreenPanel'||item=='fullScreenChat'||item=='chatInGiftPanel') {
                this.handleFullScreenPanel();
            }
            if(this.settings.showVideoLink) {
                this.titleObserver.observe(this.playerPanel, {subtree:true,childList:true});
            }
            else {
                this.titleObserver.disconnect();
            }
            if(this.settings.fullScreenPanel||this.settings.fullScreenChat){
                this.bodyObserver.observe(document.body,{
                    attributes: true,
                    attributeOldValue: true,
                    attributeFilter: ['class']
                });
            }
            else {
                this.bodyObserver.disconnect();
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

    //勋章/头衔扩展
    advancedSwitcher:{
        room:typeof(unsafeWindow)!="undefined"?unsafeWindow.BilibiliLive:window.BilibiliLive,
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
                if(targetName=='medal') this.listMedal(data);
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
        listMedal(data){
            let hasMedal = false;
            if (data.code!=0||!data.data||!(data.data.fansMedalList instanceof Array)) {
                console.error(data);
                throw(`查询勋章失败 code:${data.code}</br>${data.message}`);
            }
            data.data.fansMedalList.forEach((v)=>{
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
                    innerText:`${v.today_feed}/${v.day_limit}`
                },itemDiv);
            });
            if (this.room.ANCHOR_UID&&!hasMedal){
                const buyDiv = helper.create('div',{style:'display: inline-block;'},this.dialogBottom);
                helper.create('div',{
                    title:"使用20硬币购买本房间勋章",
                    style:"margin-left: 10px;",
                    className:"dp-i-block pointer",
                    onclick:()=>this.buyMedal('metal'),
                    innerHTML:`<span style="border: 1.8px solid #c8c8c8;border-radius: 50%;border-color: #23ade5;">硬</span><span>20</span>`
                },buyDiv);
            }
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
        const settingBtn = helper.get('.bilibili-live-player-video-controller .setting'),
              button = settingBtn&&settingBtn.cloneNode(true),
              panel = helper.create('div',{
                  className:"panel setting-panel",
                  style: 'width: max-content;display: none;'
              },button),
              settingPanel = helper.create('div',{
                  className: 'player-type',
                  innerHTML:`<div>直播间助手设置</div><style>.blive-setting-btn:hover .panel.setting-panel{display: block!important}<.style>`,
              },panel);
        for(const key in this.settingInfos){
            if(this.settings[key]==undefined) this.settings[key] = true;
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
        if (settingBtn) {
            button.insertAdjacentElement('afterbegin', panel);
            helper.set(button, {
                className: 'blive-setting-btn',
                style: 'position: relative;'
            });
            settingBtn.insertAdjacentElement('afterend', button);
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
