// ==UserScript==
// @name         网易CC直播净化
// @namespace    indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @version      0.1.1
// @description  自定义屏蔽CC直播HTML5网页大部分不想看到的东西
// @author       indefined
// @match        *://cc.163.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==
(function() {
    'use strict';
    const configList = {
        noWaterMask:{
            title:'去除LOGO水印',
            style:`
/*LOGO水印*/
.video-watermask {
    display: none;
}
`
        },
        miniBorder:{
            title:'缩小播放器边距',
            style:`
/*网页标题栏高度*/
div#header {
    height: 30px !important;
}
.header-center {
    height: 30px !important;
}
.hover-list {
    top: 30px;
}
.padding-block .location-item {
    margin: 0 5px;
    font-size: 15px;
}
.padding-block .menu-classification {
    padding: 0;
}
.menu-location {
    height: 30px !important;
}
div#searchBoss {
    margin: 0;
}
.user-do-item {
    line-height: 30px !important;
}
.anchor-live {
    margin: 0 10px;
}
.header-match-rcm-imgs,
.header-match-rcm-imgs .match-rcm-imgs-list .match-rcm-imgs-item,
.header-match-rcm-imgs .match-rcm-imgs-list .match-rcm-imgs-item a,
.header-match-rcm-imgs .match-rcm-imgs-list .match-rcm-imgs-item img {
    height: 16px;
    width: 25px;
}
.header-match-rcm-imgs .match-rcm-imgs-list .match-rcm-imgs-item img {
    background-size: cover;
}
.header-match-rcm-imgswrap .match-arrow-left {
    margin-top: 6px !important;
}
/*缩小标题栏高度后增加主框体高度*/
body:not(.blizzardtv-iframe-body) .main-container {
    height: calc(100% - 30px) !important;
}
/*主框体对齐到顶部*/
body:not(.blizzardtv-iframe-body) .main-wrapper {
    margin-top: 0px !important;
}
/*左侧栏，平时隐藏，同时播放器往左靠*/
.collapse .side-nav-collapse {
    display: none;
}
.collapse .side-nav-container {
    width: 0;
}
.collapse .side-nav-container+.main-container {
    padding-left: 20px;
}
`
        },
        noFriendRooms:{
            title:'去除好友房间',
            style:`
/*播放器上方好友房间*/
ul.friend-rooms {
    display: none;
}
`
        },
        noWebchat:{
            title:'去除好友聊天',
            style:`
/*好友聊天*/
div#webChat {
    display: none;
}
`
        },
        noLimitAlert:{
            title:'去除清晰度登录提醒',
            action:'unloginUnlimit',
            style:`
/*登录提醒*/
div#vbr-limit-alert {
    display: none!important;
}
`
        },
        noLuckGift:{
            title:'去除幸运抽奖',
            style:`
/*幸运抽奖*/
#lucky-lottery-modal{
    display: none;
}
`
        },
        noPlayerHeightLimit:{
            title:'解除播放器高度限制',
            style:`
/*解除播放器高度锁定，根据网页宽度自动缩放*/
body:not(.blizzardtv-iframe-body) div#live_player {
    height: unset !important;
}
/*解除高度限制后停播状态的聊天区高度竟然需要手动指定，醉了
#chat {
    height: calc(100% - 88px);
}
#chat>div {
    height: 100%;
}
.chat-list {
    height: calc(100% - 100px) !important;
}*/
`
        },
        noDynamicMsg:{
            title:'去除千里传音',
            default:true,
            style:`
/*网页千里传音*/
div#js-dynamic-msg-container {
    display: none;
}
/*播放器内千里传音横幅*/
.qianli-banner-item.js-qianli-banner-item {
    display: none;
}
/*播放器内的横幅，似乎有很多种*/
div#player-banner {
    display: none;
}
/*去除千里传音后关注对齐到右侧*/
.follow-tool{
    right: 10px !important;
}
/*工具对齐到左侧*/
.right-tools {
    float: none;
    position: static;
    margin-left: 10px;
    display: inline-block;
}
/*解除标题宽度限制*/
.anchor-nick,
span.js-live-title.nick{
    max-width: unset !important;
}
.live-title .nick {
    width: calc(100% - 230px) !important;
}
/*强制显示头像*/
.anchor-portrait-wrapper.anchor-portrait {
    display: block !important;
}
`
        },
        noPlayerBanner:{
            title:'去除播放器内横幅',
            default:true,
            style:`
/*播放器内的横幅，似乎有很多种*/
div#player-banner,
/*<!-- 贵族视频区进场横幅 -->*/
div#nobility_screen_enter,
/*<!-- 坐骑动效和横幅动效 -->*/
div#mounts_player,
div#mounts_banner,
div#mounts_player_png,
/*<!-- 贵族开通升级续费动效 -->*/
div#nobility_upgrade,
/*<!-- 新游戏类型坐骑上线提醒弹窗 -->*/
div#newMountRemindWin {
    display: none !important;
}
`
        },
        foldRank:{
            title:'自动折叠榜单区',
            default:true,
            style:`
/*右侧榜单区，平时折叠*/
div#room-tabs {
    height: 40px;
}
#room-tabs>div>div:not(:first-child) {
    display: none !important;
}

/*鼠标悬停时展开榜单*/
div#room-tabs:hover>div>div[style*="display: block;"]{
    display: block !important;
}
div#room-tabs:hover {
    height: 190px;
}
.chat-list {
    height: calc(100% - 46px) !important;
}
div#room-tabs:hover+.chat-list {
    height: calc(100% - 190px);
}
/*网页全屏时隐藏公告*/
.gameH5TheaterBar .room-boardcast {
    display: none;
}
.gameH5TheaterBar .room-tabs-chat-list {
    height: calc(100% - 104px) !important;
}
`
        },
        noThreaterRank:{
            title:'去除网页全屏榜单',
            default:true,
            style:`
/*网页全屏时隐藏公告和榜单*/
.gameH5TheaterBar .room-boardcast,
.gameH5TheaterBar #room-tabs{
    display: none;
}
.gameH5TheaterBar .chat-list {
    height: calc(100% - 4px)  !important;
}
/*隐藏公告和榜单后*/
.gameH5TheaterBar .room-tabs-chat-list {
    height: calc(100% - 104px);
}
`
        },
        noTheaterGiftBar:{
            title:'去除网页全屏/全屏礼物栏',
            style:`
/*网页全屏/全屏礼物栏*/
.gameH5Theater .user-tool-bar,
.gameH5FullScreen .user-tool-bar {
    display: none !important;
}
.gameH5Theater div#live-wrapper ,
.gameH5FullScreen div#live-wrapper {
    height: 100% !important;
}
.gameH5FullScreen .show-controls {
    bottom: 0 !important;
}
`
        },
        noFullAnchor:{
            title:'去除全屏主播信息',
            style:`
/*全屏关注消息*/
div#fullscreen-anchorInfo {
    display: none !important;
}
`
        },
        noGiftBanner:{
            title:'去除聊天区礼物横幅',
            style:`
/*<!-- 礼物大动效展示区 -->*/
div#giftBigEffectWrap,
/*第一次*/
div#first-reward-panel,#first-reward-entry,
/*聊天区礼物连击*/
.gift-simp-banner.js-gift-simp-banner,
/*聊天区感谢礼物栏*/
div#gift-banner {
    display: none !important;
}
`
        },
        noBoxDrop:{
            title:'去除抢宝箱消息',
            style:`
/*<!-- 圣旨礼物掉落区 -->*/
div#decreeBoxDropWrap,
/*<!-- 圣旨礼物点击区 -->*/
div#decreeBoxShowWrap,
/*<!-- 周星宝箱掉落区 -->*/
div#weekStarBoxDropWrap,
/*<!-- 周星宝箱点击区 -->*/
div#weekStarBoxShowWrap,
/*<!-- 礼物宝箱掉落区 -->*/
div#giftBoxDropWrap,
/*<!-- 礼物宝箱点击区 -->*/
div#giftBoxShowWrap {
    display: none !important;
}
`
        },
        noChatTip:{
            title:'去除粉丝勋章',
            style:`
/*粉丝勋章*/
span.chat-tip-container{
    display: none
}
`
        },
        noIcon:{
            title:'去除用户前缀图标',
            style:`
/*用户前缀图标*/
.chat_item .chat_priv_img img,
.chat_item.notify>img{
    display: none;
}
`
        },
        noMsgImg:{
            title:'去除聊天图片',
            style:`
/*聊天图片*/
.chat_msg_content img {
    display: none !important;
}
.chat_msg>img {
    display: none !important;
}
`
        },
        noChatPriv:{
            title:'去除聊天气泡',
            style:`
/*聊天气泡同行*/
.chat_info,
.chat_msg_con,
.chat_msg_normal{
    display: inline !important;
}
/*去除聊天气泡*/
.chat_msg>div {
    display: none !important;
}
.chat_msg,
.chat_msg_normal>span{
    display: inline !important;
    background: none !important;
    color: #000 !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}
`
        },
        noSendGift:{
            title:'去除送礼消息',
            style:`
/*聊天区礼物*/
li.gift_item {
    display: none;
}
`
        },
        noWelcome:{
            title:'去除欢迎消息',
            style:`
/*进入房间欢迎消息*/
li.chat_item.notify.enter-room-notify,
/*骑士欢迎消息*/
.chat_item.activity-notify-nobility,
/*<!-- 贵族视频区进场横幅 -->*/
div#nobility_screen_enter,
/*<!-- 坐骑动效和横幅动效 -->*/
div#mounts_player,
div#mounts_banner,
div#mounts_player_png,
/*聊天区贵族欢迎消息*/
div#nobility_chat_enter {
    display: none !important;
}
`
        },
        noFollow:{
            title:'去除关注消息',
            style:`
/*关注消息*/
.follow-anchor-notify {
    display: none;
}
`
        },
        noSysMsg:{
            title:'去除系统消息',
            style:`
/*管理员消息*/
li.chat_item.admin-notify {
    display: none;
}
/*活动消息*/
li.chat_item.notify.activity-notify {
    display: none;
}
`
        },
        noShout:{
            title:'去除喇叭消息',
            style:`
/*聊天区喇叭消息*/
.bun-shout-dynamic-area {
    display: none !important;
}
`
        },
        noDMColor:{
            title:'去除弹幕颜色',
            style:`
/*弹幕*/
.cmt {
    color: #fff !important;
}
`
        },
        noDMBullet:{
            title:'去除弹幕气泡',
            style:`
/*弹幕气泡*/
.nobility_bulletScreen {
    display: inline !important;
    background: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}
.nobility_bulletScreen img,
span.nobility_bulletScreen_adrom {
    display: none
}
/*喊话气泡，不知道内部怎么样的*/
div#bunShoutDynamic{}
`
        },
    };
    const CCLiveCleaner = {
        styleDiv:undefined,
        configDiv:document.querySelector('ul.ban-effect-list'),
        config:(()=>{
            try{
                if('undefined'!=typeof(GM_info)&&'undefined'!=typeof(GM_getValue)) {
                    return JSON.parse(GM_getValue('ccLiveConfig','{}'));
                }
                else {
                    return JSON.parse(localStorage.getItem('ccLiveConfig')||'{}');
                }
            }catch(e){
                console.error('CC直播净化:读取配置失败，使用默认配置',e);
                return {};
            }
        })(),
        saveConfig(){
            for(const i in this.config) {
                if(!configList[i]) delete this.config[i];
            }
            try{
                if('undefined'!=typeof(GM_info)&&'undefined'!=typeof(GM_setValue)){
                    GM_setValue('ccLiveConfig',JSON.stringify(this.config));
                }
                else {
                    localStorage.setItem('ccLiveConfig',JSON.stringify(this.config));
                }
            }catch(e){
                console.error('CC直播净化:存储配置失败',e);
            }
        },
        applyConfig(){
            let styleContent = '';
            for(const i in configList) {
                if(
                    this.config[i] ||
                    (this.config[i]==undefined&&configList[i].default)
                ) styleContent += configList[i].style;
            }
            this.styleDiv.innerHTML = styleContent;
        },
        changeConfig(target){
            target.classList.toggle('selected');
            this.config[target.id] = target.classList.contains('selected');
            this.applyConfig();
            this.saveConfig();
        },
        createItem(id,config){
            const item = document.createElement('li');
            item.id = id;
            item.innerHTML = '<i></i>'+config.title;
            item.className = (this.config[id]||(this.config[id]==undefined&&config.default))?'selected':'';
            item.onclick = ({target})=>this.changeConfig(target);
            this.configDiv.appendChild(item);
        },
        init(){
            if(this.configDiv) {
                this.styleDiv = document.createElement('style');
                document.head.appendChild(this.styleDiv);
                this.applyConfig();
                this.configDiv.style = "max-height:calc(100vh - 200px);overflow:auto";
                for(const id in configList) {
                    this.createItem(id,configList[id]);
                }
            }
        }
    };
    CCLiveCleaner.init();
})();
