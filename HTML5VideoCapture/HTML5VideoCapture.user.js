// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @version      0.3.7
// @description  基于HTML5的简单原生视频截图，可简单控制快进/逐帧/视频调速
// @author       indefined
// @include      *://*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

function HTML5VideoCapturer(){
    'use strict';
    if (document.querySelector('#HTML5VideoCapture')) return;
    const childs = "undefined"==typeof(unsafeWindow)?window.frames:unsafeWindow.frames;
    let videos,video,selectId;
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
            a.remove();
        }catch(e){
            const imgWin = open("",'_blank');
            canvas.style = "max-width:100%";
            imgWin.document.body.appendChild(canvas);
        }
    }

    function videoPlay(){
        if (!video) return postMsg('play');
        video.paused?video.play():video.pause();
        videoStatusUpdate();
    }

    function videoSpeedChange(speed){
        if (!video) return postMsg('speed',speed);
        video.playbackRate = speed;
        videoStatusUpdate();
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
        if (videos[id]){
            video = videos[id];
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
        else if (ev.data.about=='videoStatus'&&selector.value.startsWith(ev.data.id)){
            play.innerText = ev.data.paused?"播放":"暂停";;
            speed.value = ev.data.speed;
        }
    }
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
    panel = _c({
        nodeType:'div',id:'HTML5VideoCapture',
        style:'position:fixed;top:40px;left:30px;z-index:2147483647;padding:5px 0;background:darkcyan;font-family:initial;border-radius:4px;font-size:12px;text-align:left',
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
                style:'width:unset',
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
                title:'后退1s,按住shift 5s,ctrl 10s,alt 60s,多按相乘',
                onclick:e=>{
                    let offset = -1;
                    if(e.ctrlKey) offset *= 5;
                    if(e.shiftKey) offset *= 10;
                    if(e.altKey) offset *= 60;
                    videoStep(offset);
                }
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-left:0',
                innerText:'<',
                title:'上一帧(1/60s)',
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
                title:'下一帧(1/60s)',
                onclick:()=>videoStep(1/60)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-left:0',
                innerText:'>>',
                title:'前进1s,按住shift 5s,ctrl 10s,alt 60s,多按相乘',
                onclick:e=>{
                    let offset = 1;
                    if(e.ctrlKey) offset *= 5;
                    if(e.shiftKey) offset *= 10;
                    if(e.altKey) offset *= 60;
                    videoStep(offset);
                }
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'关闭',
                title:'关闭截图工具栏',
                style:'margin-right:10px;',
                onclick:()=> {
                    document.body.removeChild(panel);
                    window.removeEventListener('message', topReciver);
                }
            }
        ],
        parent:document.body
    });
    window.addEventListener('message', topReciver);
    videoDetech();
}
if ('function'==typeof(GM_registerMenuCommand) && window==top){
    GM_registerMenuCommand('启用HTML5视频截图器',HTML5VideoCapturer);
}else HTML5VideoCapturer();