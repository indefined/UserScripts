// ==UserScript==
// @name         替换bilibili旧版播放器
// @namespace    indefined
// @version      0.1
// @description  通过替换脚本的方法切换旧版播放器
// @author       indefined
// @match        *://*.bilibili.com/watchlater/*
// @match        *://*.bilibili.com/video/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.stop();
    if(location.pathname.startsWith('/video')) {
        //av页
        fetch(location.href)
            .then(res=>res.text())
            .then(text=>text.match(/<script type="text\/javascript">window.__BILI_CONFIG__.+?<\/script>.+?<\/script>.+?<\/script>/))//从原网页里把原始视频数据扒出来
            .then(match=>{
            if(match){
                document.open();
                document.write(`
<body>
<!--主样式表-->
<link rel="stylesheet" href="https://s1.hdslb.com/bfs/static/jinkela/videoplay/css/video.1.b1b7706abd590dd295794f540f7669a5d8d978b3.css">
<!--jquery-->
<script type="text/javascript" src="https://static.hdslb.com/js/jquery.min.js"></script>
<!--原始视频数据-->
${match[0]}
<!--主框架，由脚本自动填充渲染不需要管它而且里面不能有东西-->
<div id="app" data-server-rendered="true"></div>
<!--播放器框架，这个东西本来在app里面的，但是如果放在里面脚本填充网页会销毁掉……放在外面加载完它会自己跑进去……-->
<div class="bili-wrapper" id="bofqi"></div>
<!--底部框架-->
<div class="footer bili-footer"></div>
<!--播放器脚本-->
<script type="text/javascript" src="https://static.hdslb.com/js/video.min.js"></script>
<script type="text/javascript">
window.getInternetExplorerVersion=function(){var rv=-1;if(navigator.appName=="Microsoft Internet Explorer"){var ua=navigator.userAgent;var re=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");if(re.exec(ua)!=null){rv=parseFloat(RegExp.$1)}}return rv};
function getQueryString(name){var reg=new RegExp("(^|&)"+name+"=([^&]*)(&|$)");var r=window.location.search.substr(1).match(reg);if(r!=null){return unescape(r[2])}return null}var vd=window.__INITIAL_STATE__&&window.__INITIAL_STATE__.videoData;
/*播放器初始化*/
if(vd&&vd.aid&&getInternetExplorerVersion()!==9){$("#__bofqi").innerHTML='<div class="bili-wrapper" id="bofqi"><div id="player_placeholder"></div>';if(vd.embedPlayer){var p=getQueryString("p")?getQueryString("p")-1:0;var player={aid:vd.aid,cid:(vd.pages[p]&&vd.pages[p].cid)||vd.pages[0].cid};EmbedPlayer("player","https://static.hdslb.com/play.swf","cid="+player.cid+"&aid="+player.aid+"&pre_ad=")}if(vd.embed){$("#bofqi").html(vd.embed)}}else{$("#bofqi").remove()};
</script>
<style>/*一点样式修正*/.pop-live{height:162px}</style>
<!--以下脚本从旧版网页直接扒的，会自动填充网页剩余部分-->
<script src="//s1.hdslb.com/bfs/static/jinkela/videoplay/manifest.b1b7706abd590dd295794f540f7669a5d8d978b3.js" crossorigin="" defer="defer"></script>
<script src="//s1.hdslb.com/bfs/static/jinkela/videoplay/vendor.b1b7706abd590dd295794f540f7669a5d8d978b3.js" crossorigin="" defer="defer"></script>
<script src="//s1.hdslb.com/bfs/static/jinkela/videoplay/video.b1b7706abd590dd295794f540f7669a5d8d978b3.js" crossorigin="" defer="defer"></script>
<script type="text/javascript" src="//static.hdslb.com/phoenix/dist/js/comment.min.js"></script>
<script type="text/javascript" src="//static.hdslb.com/js/jquery.qrcode.min.js"></script>
<link rel="stylesheet" href="//static.hdslb.com/phoenix/dist/css/comment.min.css" type="text/css">
<script type="text/javascript" src="//s1.hdslb.com/bfs/cm/st/bundle.js" crossorigin=""></script>
<script type="text/javascript" src="//static.hdslb.com/common/js/footer.js"></script>
</body>`);
                document.close()
            }
        });
    }
    else {
        //稍后播放页
        var xhtml = '<!DOCTYPE html><html><head><meta name="spm_prefix" content="333.881"><link rel="stylesheet" href="//static.hdslb.com/phoenix/dist/css/comment.min.css" type="text/css"><link rel="stylesheet" href="//static.hdslb.com/elec_2/dist/css/later_elec.css" type="text/css"><link rel="stylesheet" href="//static.hdslb.com/tag/css/tag-index2.0.css" type="text/css"><script type="text/javascript">window.__BILI_CONFIG__={"show_bv":false}</script><script type="text/javascript">window.spmReportData={},window.reportConfig={sample:1,scrollTracker:!0,msgObjects:"spmReportData"}</script><script type="text/javascript" src="//s1.hdslb.com/bfs/seed/log/report/log-reporter.js"></script><link href="//s1.hdslb.com/bfs/static/jinkela/watchlater/css/watchlater.1.ba8f2751267792c1f4a5e3a14514e47c34afba61.css" rel="stylesheet"><link href="//s1.hdslb.com/bfs/static/phoenix/viewlater/static/css/main.d9641d2f4dc42228ea8c2650e1b98b0b.css" rel="stylesheet"></head><body><div class="z-top-container has-menu"></div><div id="watchlater-app"></div><div class="footer bili-footer"></div><script type="text/javascript">0</script><script type="text/javascript" src="//static.hdslb.com/js/jquery.min.js"></script><script type="text/javascript" src="//static.hdslb.com/js/jquery.qrcode.min.js"></script><script type="text/javascript" src="//s1.hdslb.com/bfs/seed/jinkela/header/header.js"></script><script type="text/javascript" src="//static.hdslb.com/common/js/footer.js"></script><script type="text/javascript" src="//static.hdslb.com/js/swfobject.js"></script><script type="text/javascript" src="//static.hdslb.com/js/video.min.js"></script><script type="text/javascript" src="//static.hdslb.com/account/bili_quick_login.js"></script><script type="text/javascript" src="//static.hdslb.com/phoenix/dist/js/comment.min.js"></script><script type="text/javascript" src="//static.hdslb.com/mstation/js/upload/moxie.js"></script><script type="text/javascript" src="//static.hdslb.com/mstation/js/upload/plupload.js"></script><script type="text/javascript" src="//static.hdslb.com/elec_2/dist/js/later_elec.js"></script><script type="text/javascript" src="//s1.hdslb.com/bfs/static/jinkela/watchlater/1.watchlater.ba8f2751267792c1f4a5e3a14514e47c34afba61.js"></script><script type="text/javascript" src="//s1.hdslb.com/bfs/static/jinkela/watchlater/watchlater.ba8f2751267792c1f4a5e3a14514e47c34afba61.js"></script></body></html>';
        document.open();
        document.write(xhtml);
        document.close();
    }
})();