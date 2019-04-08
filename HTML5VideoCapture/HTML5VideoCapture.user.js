// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @version      0.3.3
// @description  基于HTML5的简单原生视频截图，可简单控制视频快进/步进
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

    function videoPlay(id){
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
        if (childs.length){
            [].forEach.call(childs,(w,i)=>w.postMessage({
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
        if (window==top) {
            play.value = video.paused?"播放":"暂停";
            speed.value = video.playbackRate;
        }
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
                    case 'speed':
                        videoSelect(ev.data.value);
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
                    speed.value = video.playbackRate;
                }
                break;
        }
    });
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
            panel.tOffset = ev.pageY-panel.offsetTop;
            panel.lOffset = ev.pageX-panel.offsetLeft;
            document.body.addEventListener('mousemove',dialogMove);
        }
        else if (ev.type=='mouseup'){
            document.body.removeEventListener('mousemove',dialogMove);
        }
        else{
            panel.style.top = ev.pageY-panel.tOffset+'px';
            panel.style.left = ev.pageX-panel.lOffset+'px';
        }
    }
    const panel = document.createElement('div');
    panel.id = "HTML5VideoCapture";
    panel.style = `position: fixed; top: 257px; left: 323px; z-index: 2147483647; padding: 5px 0; background: darkcyan; font-family: initial; border-radius: 4px;`;
    panel.innerHTML = `<div style="cursor:move;user-select:none;color:#fff;border: none;">HTML5视频截图器</div>\
<input type="button" value="检测" title="重新检测页面中的视频"><select title="选择视频"></select>\
<input type="number" value="1" step=0.25 title="视频速度,双击恢复原速" style="width:40px;height:18px"><input type="button" value="播放">\
<input type="button" value="<<" title="后退1s,按住shift 5s,ctrl 10s,alt 60s,多按相乘"><input type="button" value="<" title="后退1帧(1/30s)" style="margin-left: 0;">\
<input type="button" value="截图" title="新建标签页打开截屏图片"><input type="button" value="↓" style="margin-left: 0;" title="直接下载截图（如果可用）">\
<input type="button" value=">" title="前进1帧(1/30s)"><input type="button" value=">>" title="前进1s,按住shift 5s,ctrl 10s,alt 60s,多按相乘" style="margin-left: 0;">\
<input type="button" value="关闭" style="margin-right:10px;"><style>div#HTML5VideoCapture>*\
{line-height:20px;border-radius:2px;height:24px;border:1px solid  #ccd0d7;margin:0 0 5px 10px;padding:2px 6px;vertical-align:bottom;font-family:initial;}</style>`
    const [title,detech,selector,speed,play,preS,preFrame,capture,captureDown,nextFrame,nextS,close] = panel.childNodes;
    title.onmousedown = dialogMove;
    title.onmouseup = dialogMove;
    selector.onchange = ()=>videoSelect(selector.value);
    detech.onclick = videoDetech;
    play.onclick = videoPlay;
    speed.ondblclick = ()=>videoSpeedChange(speed.value=1);
    speed.oninput = ()=>videoSpeedChange(+speed.value);
    preS.onclick = e=>{
        let offset = -1;
        if(e.ctrlKey) offset *= 5;
        if(e.shiftKey) offset *= 10;
        if(e.altKey) offset *= 20;
        videoStep(offset);
    };
    preFrame.onclick = ()=>videoStep(1/30);
    nextS.onclick = e=>{
        let offset = 1;
        if(e.ctrlKey) offset *= 5;
        if(e.shiftKey) offset *= 10;
        if(e.altKey) offset *= 60;
        videoStep(offset);
    };
    nextFrame.onclick = ()=>videoStep(-1/30);
    capture.onclick = ()=>videoShot();
    captureDown.onclick = ()=>videoShot(true);
    close.onclick = ()=>panel.remove();
    document.body.appendChild(panel);
    videoDetech();
}
if ('function'==typeof(GM_registerMenuCommand) && window==top){
    GM_registerMenuCommand('启用HTML5视频截图器',HTML5VideoCapturer);
}else HTML5VideoCapturer();