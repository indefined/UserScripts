// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @version      0.3.0
// @description  基于HTML5的原生javascript视频截图器
// @author       indefined
// @include      *://*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

function init(){
    'use strict';
    if (document.querySelector('#HTML5VideoCapture')) return;
    let videos,video,selectId;
    function videoShot(down){
        if (!video) return postMsg('shot',down);
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style = "max-width:100%";
        canvas.getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height);
        try{
            if (!down) throw `i don't want to do it.`;
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.95);
            a.download = 'capture.jpg';
            document.head.appendChild(a);
            a.click();
            a.remove();
        }catch(e){
            const imgWin = open("",'_blank');
            imgWin.document.body.appendChild(canvas);
        }
    }

    function videoPlay(id){
        if (!video) return postMsg('play');
        video.paused?video.play():video.pause();
        videoStatusUpdate();
    }

    function videoStep(action){
        if (!video) return postMsg('step',action);
        if (!video.paused) videoPlay();
        if (action=='pre') video.currentTime -= 1/30;
        else video.currentTime += 1/30;
    }

    function videoDetech(){
        if (window==top){
            while(selector.firstChild) selector.removeChild(selector.firstChild);
        }
        videos = document.querySelectorAll('video');
        if (window!=top){
            top.postMessage({
                action:'captureReport',
                about:'videoNums',
                length:videos.length,
                id:window.captureId
            },'*');
        }else{
            appendSelector(videos);
            setTimeout(()=>{
                if (selector.childNodes.length) return videoSelect(selector.value);
                video = undefined;
                const toast = document.createElement('div');
                toast.style = `position: fixed;top: 50%;left: 50%;z-index: 999999;padding: 10px;background: darkcyan;transform: translate(-50%);color: #fff;border-radius: 6px;`
                toast.innerText = '当前页面没有检测到HTML5视频';
                document.body.appendChild(toast);
                setTimeout(()=>toast.remove(),2000);
            },100);
        }
        if (window.frames.length){
            [].forEach.call(window.frames,(w,i)=>w.postMessage({
                action:'captureDetech',
                id:window.captureId==undefined?i:window.captureId+'-'+i
            },'*'));
        }
        console.log(videos);
    }
    function videoSelect(id){
        selectId = id;
        if (videos[id]){
            video = videos[id];
            video.scrollIntoView();
            videoStatusUpdate();
        }
        else {
            postMsg('select');
        }
    }
    function videoStatusUpdate(){
        if (window==top) play.value = video.paused?"播放":"暂停";
        else{
            top.postMessage({
                action:'captureReport',
                about:'videoStatus',
                value:video.paused,
                id:window.captureId
            },'*');
        }
    }
    window.addEventListener('message', function(ev) {
        //console.info(ev.data);
        if (!ev.data.action) return;
        switch (ev.data.action){
            case 'captureDetech':
                if (ev.source!=window.parent) return;
                window.captureId = ev.data.id;
                videoDetech();
                break;
            case 'captureControl':
                if (ev.source!=window.parent||ev.data.target!=window.captureId) return;
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
                    case 'select':
                        videoSelect(ev.data.id);
                        break;
                    default:
                        break;
                }
                break;
            case 'captureReport':
                if (ev.data.about=='videoNums') appendSelector(ev.data);
                else if (ev.data.about=='videoStatus'&&selector.value.startsWith(ev.data.id)){
                    play.value = ev.data.value?"播放":"暂停";;
                }
                break;
        }
    });
    function postMsg(type,data){
        if (selectId==undefined||selectId=='') return;
        const ids = selectId.split('-');
        if (ids.length>1){
            const target = ids.shift();
            if (!window.frames[target]) return;
            window.frames[target].postMessage({
                action:'captureControl',
                target:window.captureId==undefined?target:window.captureId+'-'+target,
                todo:type,
                id:ids.join('-'),
                value:data
            },'*');
        }
    }
    if (window!=top) return;
    function appendSelector(v){
        if (v&&v.length){
            for (let i=0;i<v.length;i++){
                const item = document.createElement('option');
                item.value = v.id!=undefined?v.id+'-'+i:i;
                item.innerText = v.id!=undefined?v.id+'-'+i:i;
                selector.appendChild(item);
            }
        }
    }
    function dialogMove(ev){
        if (ev.type=='mousedown'){
            panel.t = ev.pageY-panel.offsetTop;
            panel.l = ev.pageX-panel.offsetLeft;
            panel.addEventListener('mousemove',dialogMove);
        }
        else if (ev.type=='mouseup'){
            panel.removeEventListener('mousemove',dialogMove);
        }
        else{
            panel.style.top = ev.pageY-panel.t+'px';
            panel.style.left = ev.pageX-panel.l+'px';
        }
    }
    const panel = document.createElement('div');
    panel.id = "HTML5VideoCapture";
    panel.style = `position: fixed;top: 50px;left: 20px;z-index: 999999;padding: 10px;background: darkcyan;`
    panel.innerHTML = `<div style="margin-bottom: 5px;cursor:move;user-select:none;line-height:1;color:#fff">HTML5视频截图器</div>\
<input type="button" value="检测" style="margin-right: 10px;"><select title="选择视频" style="font-family: initial;"></select>\
<input type="button" value="播放" style="margin-left: 10px;"><input type="button" value="上一帧" style="margin-left: 10px;">\
<input type="button" value="截图" style="margin-left: 10px;"><input type="button" value="↓" style="font-family: initial;">\
<input type="button" value="下一帧" style="margin-left: 10px;"><input type="button" value="关闭" style="margin-left: 10px;">`
    const {0:title,1:detech,2:selector,3:play,4:preFrame,5:capture,6:captureDown,7:nextFrame,8:close} = panel.childNodes;
    title.onmousedown = dialogMove;
    title.onmouseup = dialogMove;
    selector.onchange = ()=>videoSelect(selector.value);
    detech.onclick = videoDetech;
    play.onclick = videoPlay;
    preFrame.onclick = ()=>videoStep('pre');
    nextFrame.onclick = ()=>videoStep('next');
    capture.onclick = ()=>videoShot();
    captureDown.onclick = ()=>videoShot(true);
    close.onclick = ()=>panel.remove();
    document.body.appendChild(panel);
    videoDetech();
}
if ('function'==typeof(GM_registerMenuCommand) && window==top){
    GM_registerMenuCommand('启用HTML5视频截图器',init);
}else init();