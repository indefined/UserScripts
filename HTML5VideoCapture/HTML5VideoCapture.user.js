// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @version      0.4.0
// @description  基于HTML5的简单任意原生视频截图，可控制快进/逐帧/视频调速
// @author       indefined
// @include      *://*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

(function HTML5VideoCapturer(){
    'use strict';
    if (document.querySelector('#HTML5VideoCapture')) return;
    const childs = "undefined"==typeof(unsafeWindow)?window.frames:unsafeWindow.frames;
    let videos,video,selectId,hoverItem;
    const configList = {
        active:{
            content:'开启/关闭工具栏',
            title:'全局工具栏快捷键开关，必须至少同时按下ctrl/shift/alt之一，尽量避免常用快捷键以免冲突',
            key:'K',
            ctrlKey:true,
            shiftKey:true,
            altKey:false
        },
        forward:{
            content:'前进',
            title:'使视频前进1秒，按住ctrl/shift/alt快进倍率等同工具栏按钮说明',
            key:'ArrowRight'
        },
        backward:{
            content:'后退',
            title:'使视频后退1秒，按住ctrl/shift/alt快退倍率等同工具栏按钮说明',
            key:'ArrowLeft'
        },
        nextFrame:{
            content:'下一帧',
            title:'使视频前进一帧（最小分辨率1/60秒）',
            key:'f'
        },
        preFrame:{
            content:'上一帧',
            title:'使视频后退一帧（最小分辨率1/60秒）',
            key:'d'
        },
        play:{
            content:'播放/暂停',
            key:'Space'
        },
        speedUp:{
            content:'加速',
            title:'使视频加速，大于1倍速时步长0.25倍速，最大有效值大概为16倍',
            key:'c'
        },
        speedDown:{
            content:'减速',
            title:'使视频减速，小于1倍速时步长为0.1倍速，最小有效值为0.1倍',
            key:'x'
        },
        speedOri:{
            content:'原速',
            title:'恢复1倍速播放视频',
            key:'z',
        },
        capture:{
            content:'截图',
            title:'按下该按键打开新窗口显示截图，同时按住ctrl会尝试直接下载，如果直接下载失败也会打开新窗口',
            key:'s'
        },
        panelActive:{
            content:'截图工具栏有效',
            title:'当鼠标悬停在工具栏上或者光标焦点在工具栏上时快捷键有效，光标在输入框中例外，快捷键会操作选中视频',
            type:'checkbox',
            disabled:true,
            key:'',
            value:true
        },
        playerActive:{
            content:'播放器悬停有效',
            title:'当鼠标悬停在视频上时快捷键有效，无论工具栏是否打开，快捷键会直接操作被悬停视频且不会有提示。'
            + '\n由于各种播放器外壳影响该功能可能不会生效，且可能和播放器外壳自身快捷键冲突，建议针对网页保存，不建议全局开启',
            type:'checkbox',
            key:'',
            value:true
        }
    },
          config = configList;
    function videoShot(down){
        if (!video) return postMsg('shot',down);
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height);
        try{
            if (!down) throw `i don't want to do it.`;
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.95);
            a.download = `${document.title}_${Math.floor(video.currentTime/60)}'${(video.currentTime%60).toFixed(3)}''.jpg`;
            document.head.appendChild(a);
            a.click();
            document.head.removeChild(a);
        }catch(e){
            const imgWin = open("",'_blank');
            canvas.style = "max-width:100%";
            imgWin.document.body.appendChild(canvas);
        }
    }

    function videoPlay(){
        if (!video) return postMsg('play');
        video.paused?video.play():video.pause();
    }

    function videoSpeedChange(speed){
        if (!video) return postMsg('speed',speed);
        video.playbackRate = speed;
    }

    function videoStep(offset){
        if (!video) return postMsg('step',offset);
        if (Math.abs(offset)<1&&!video.paused) videoPlay();
        video.currentTime += offset;
        if(video.currentTime<0) video.currentTime = 0;
    }

    function videoDetech(){
        videos = document.querySelectorAll('video');
        if (window!=top){
            top.postMessage({
                action:'captureReport',
                about:'videoNums',
                length:videos.length,
                id:window.captureId
            },'*');
        }else{
            while(selector.firstChild) selector.removeChild(selector.firstChild);
            appendVideo(videos);
            setTimeout(()=>{
                if (selector.childNodes.length) return videoSelect(selector.value);
                const toast = document.createElement('div');
                toast.style = `position: fixed;top: 50%;left: 50%;z-index: 999999;padding: 10px;background: darkcyan;transform: translate(-50%);color: #fff;border-radius: 6px;`
                toast.innerText = '当前页面没有检测到HTML5视频';
                document.body.appendChild(toast);
                setTimeout(()=>toast.remove(),2000);
            },100);
        }
        if (childs.length){
            [].forEach.call(childs,(w,i)=>w.postMessage({
                action:'captureDetech',
                id:window.captureId==undefined?i:window.captureId+'-'+i
            },'*'));
        }
        console.log(window.captureId,videos);
    }
    function videoSelect(id){
        selectId = id;
        if(video) {
            video.removeEventListener('play',videoStatusUpdate);
            video.removeEventListener('pause',videoStatusUpdate);
            video.removeEventListener('ratechange',videoStatusUpdate);
        }
        if (videos[id]){
            video = videos[id];
            video.addEventListener('play',videoStatusUpdate);
            video.addEventListener('pause',videoStatusUpdate);
            video.addEventListener('ratechange',videoStatusUpdate);
            video.scrollIntoView();
            videoStatusUpdate();
        }
        else {
            video = undefined;
            postMsg('select');
        }
    }
    function videoStatusUpdate(){
        if (window==top) {
            play.innerText = video.paused?"播放":"暂停";
            speed.value = video.playbackRate;
        }
        else{
            top.postMessage({
                action:'captureReport',
                about:'videoStatus',
                paused:video.paused,
                speed:video.playbackRate,
                id:window.captureId
            },'*');
        }
    }
    function postMsg(type,data){
        if (selectId==undefined||selectId=='') return;
        const ids = selectId.split('-');
        if (ids.length>1){
            const target = ids.shift();
            if (!childs[target]) return;
            childs[target].postMessage({
                action:'captureControl',
                target:window.captureId==undefined?target:window.captureId+'-'+target,
                todo:type,
                id:ids.join('-'),
                value:data
            },'*');
        }
    }
    //监听鼠标移动并保存被悬停视频或工具栏……极其低效却很简单通用的实现
    //不需要监听视频悬停时应当移除（工具栏自带悬停检测，但作用会被该函数覆盖）
    function hoverListener(ev) {
        if (ev.target instanceof HTMLVideoElement || (panel&&panel.contains(ev.target))) hoverItem = ev.target;
        else hoverItem = undefined;
    }
    if(config.playerActive.value) document.addEventListener('mousemove',hoverListener);
    //快捷键处理函数
    function keyHandler(ev,key) {
        let value;
        switch(key) {
            case 'speedUp':
                if(video) value = video.playbackRate+(video.playbackRate<1?0.1:0.25);
                else if(speed) {
                    speed.step = speed.value<1?0.1:0.25;;
                    value = speed.value;
                }
                videoSpeedChange(value);
                break;
            case 'speedDown':
                if(video) {
                    value = video.playbackRate - (video.playbackRate>1?0.25:0.1);
                    if(value<0.1) video.playbackRate = 0.1;
                }
                else if(speed) {
                    speed.step = speed.value<1?0.1:0.25;;
                    value = speed.value;
                }
                videoSpeedChange(value);
                break;
            case 'speedOri':
                videoSpeedChange(1);
                break;
            case 'play':
                videoPlay();
                break;
            case 'nextFrame':
                videoStep(1/60);
                break;
            case 'perFrame':
                videoStep(-1/60);
                break;
            case 'forward':
                value = 1;
                if(ev.ctrlKey) value *= 5;
                if(ev.shiftKey) value *= 10;
                if(ev.altKey) value *= 60;
                videoStep(value);
                break;
            case 'backward':
                value = -1;
                if(ev.ctrlKey) value *= 5;
                if(ev.shiftKey) value *= 10;
                if(ev.altKey) value *= 60;
                videoStep(value);
                break;
            case 'capture':
                videoShot(ev.ctrlKey);
                break;
            default:
                break;
        }
    }
    //全局快捷键监听函数
    function keyListener(ev) {
        console.log(ev);
        if (
            config.active.key == ev.key
            &&config.active.shiftKey == ev.shiftKey
            &&config.active.ctrlKey == ev.ctrlKey
            &&config.active.altKey == ev.altKey
        ) {
            top.postMessage({
                action:'captureReport',
                about:'panelActive',
                id:window.captureId
            },'*');
        }
        else if (!hoverItem||ev.target instanceof HTMLInputElement) return;
        let value;
        if(value = Object.entries(config).find(([k,v])=>v.key.toLowerCase()==ev.key.toLowerCase())){
            //将待操作视频暂时替换为鼠标悬停视频，并保存原视频备份
            const videoBk = video;
            if(hoverItem instanceof HTMLVideoElement) video = hoverItem;
            try{
                keyHandler(ev,value[0]);
            }catch(e){
                console.error(e);
            }
            //操作完成将待操作视频还原为备份视频
            if(videoBk) video = videoBk;
        }
    }
    document.addEventListener('keydown',keyListener);
    //控制事件接收仅在iframe中执行
    if (window!=top) {
        window.addEventListener('message', function(ev) {
            //console.info('frame recive:',ev.data);
            if (ev.source!=window.parent || !ev.data.action) return;
            else if(ev.data.action=='captureDetech'){
                window.captureId = ev.data.id;
                videoDetech();
            }else if(ev.data.action=='captureControl' && ev.data.target==window.captureId){
                switch (ev.data.todo){
                    case 'play':
                        videoPlay(ev.data.value);
                        break;
                    case 'shot':
                        videoShot(ev.data.value);
                        break;
                    case 'step':
                        videoStep(ev.data.value);
                        break;
                    case 'speed':
                        videoSpeedChange(ev.data.value);
                        break;
                    case 'select':
                        videoSelect(ev.data.id);
                        break;
                    default:
                        break;
                }
            }
        });
        return;
    }

    //以下UI控制界面及事件在iframe中不执行
    let panel,selector,speed,play;
    function topReciver(ev) {
        //console.info('top recive:',ev.data);
        if (ev.data.action!='captureReport') return;
        if (ev.data.about=='videoNums') appendVideo(ev.data);
        else if (ev.data.about=='panelActive') panelActive();
        else if (ev.data.about=='videoStatus'&&selector.value.startsWith(ev.data.id)){
            play.innerText = ev.data.paused?"播放":"暂停";;
            speed.value = ev.data.speed;
        }
    }
    window.addEventListener('message', topReciver);
    function _c(config){
        if(config instanceof Array) return config.map(_c);
        const item = document.createElement(config.nodeType);
        for(const i in config){
            if(i=='nodeType') continue;
            if(i=='childs' && config.childs instanceof Array) {
                config.childs.forEach(child=>{
                    if(child instanceof HTMLElement) item.appendChild(child);
                    else item.appendChild(_c(child));
                })
                continue;
            }
            else if(i=='parent') {
                config.parent.appendChild(item);
                continue;
            }
            item[i] = config[i];
        }
        return item;
    }
    function appendVideo(v){
        if (v&&v.length){
            for (let i=0;i<v.length;i++){
                _c({
                    nodeType:'option',
                    value:v.id!=undefined?v.id+'-'+i:i,
                    innerText:v.id!=undefined?v.id+'-'+i:i,
                    parent:selector
                })
            }
        }
    }
    function dialogMove(ev){
        if (ev.type=='mousedown'){
            panel.tOffset = ev.pageY-panel.offsetTop;
            panel.lOffset = ev.pageX-panel.offsetLeft;
            document.body.addEventListener('mousemove',dialogMove);
            document.body.addEventListener('mouseup',dialogMove);
        }
        else if (ev.type=='mouseup'){
            document.body.removeEventListener('mousemove',dialogMove);
            document.body.removeEventListener('mouseup',dialogMove);
        }
        else{
            panel.style.top = ev.pageY-panel.tOffset+'px';
            panel.style.left = ev.pageX-panel.lOffset+'px';
        }
    }
    function createPanel(){panel = _c({
        nodeType:'div',id:'HTML5VideoCapture',
        style:'position:fixed;top:40px;left:30px;z-index:2147483647;padding:5px 0;background:darkcyan;font-family:initial;border-radius:4px;font-size:12px;text-align:left',
        onmouseenter:()=>(hoverItem = panel),
        onmouseleave:()=>(hoverItem = undefined),
        childs:[
            {
                nodeType:'style',
                innerHTML:'div#HTML5VideoCapture option{color:#000;}'
                + 'div#HTML5VideoCapture>*{margin:0 0 5px 10px;}'
                + 'div#HTML5VideoCapture>span,div#HTML5VideoCapture>span>*{white-space:nowrap;}'
                + 'div#HTML5VideoCapture *{font-family:initial;color:#fff;background:transparent;line-height:20px;height:20px;box-sizing:content-box;vertical-align:top;}'
                + 'div#HTML5VideoCapture .h5vc-block {border:1px solid #ffffff99;border-radius:2px;padding:1px 4px;min-width:unset;}'
                + 'div#HTML5VideoCapture .h5vc-block:hover {border-color: #fff;}'
            },
            {
                nodeType:'div',
                innerText:'HTML5视频截图工具',
                style:'cursor:move;user-select:none;font-size:14px;height:auto;padding-left:0;min-width:60px;margin-right:10px;',
                onmousedown:dialogMove,
                ondblclick:()=>{
                    speed.step = 0.25;
                    videoSpeedChange(speed.value=1);
                }
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'检测',
                title:'重新检测页面中的视频',
                onclick:videoDetech
            },
            selector = _c({
                nodeType:'select',
                className:'h5vc-block',
                title:'选择视频',
                style:'width:unset;min-width:30px',
                onchange: ()=>videoSelect(selector.value)
            }),
            speed = _c({
                nodeType:'input',
                className:'h5vc-block',
                type:'number',step:0.25,min:0,
                title:'视频速度,双击截图工具标题恢复原速',
                style:'width:40px;',
                oninput:()=>{
                    speed.step = speed.value<1?0.1:0.25;
                    videoSpeedChange(+speed.value);
                }
            }),
            play = _c({
                nodeType:'button',
                className:'h5vc-block',
                innerText:'播放',
                onclick:videoPlay
            }),
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'<<',
                title:'后退1秒,按住shift 5倍,ctrl 10倍,alt 60倍,多按相乘',
                onclick:e=>keyHandler(e,'backward')
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-left:0',
                innerText:'<',
                title:'上一帧(1/60秒)',
                onclick:()=>videoStep(-1/60)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'截图',
                title:'新建标签页打开视频截图',
                onclick:()=>videoShot()
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-left:0',
                innerText:'↓',
                title:'直接下载截图（如果可用）',
                onclick:()=>videoShot(true)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'>',
                title:'下一帧(1/60秒)',
                onclick:()=>videoStep(1/60)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-left:0',
                innerText:'>>',
                title:'前进1秒,按住shift 5倍,ctrl 10倍,alt 60倍,多按相乘',
                onclick:e=>keyHandler(e,'forward')
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'关闭',
                title:'关闭截图工具栏',
                style:'margin-right:10px;',
                onclick:panelActive
            }
        ]
    })};
    function panelActive(){
        if(document.body.contains(panel)) document.body.removeChild(panel);
        else {
            if(!panel) createPanel();
            document.body.appendChild(panel);
            if(!selector.length) videoDetech();
        }
    }
    if ('function'==typeof(GM_registerMenuCommand) && window==top){
        GM_registerMenuCommand('启用HTML5视频截图器',panelActive);
    }
})();