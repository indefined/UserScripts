// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @version      0.2
// @description  基于HTML5的原生javascript视频截图器
// @author       indefined
// @include      *://*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// ==/UserScript==

function init(){
    'use strict';
    if (document.querySelector('#HTML5VideoCapture')) return;
    function shot(){
        if (!video) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style = "max-width:100%";
        canvas.getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height);
        try{
            if (captureDown!=this) throw `i don't want to do it.`;
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
    function videoPlay(){
        if (!video) return;
        this.value = video.paused?'暂停':'播放';
        video.paused?video.play():video.pause();
    }
    function videoStep(){
        if (!video) return;
        if (!video.paused){
            video.pause();
            play.value='播放';
        }
        if (preFrame==this) video.currentTime -= 1/30;
        else video.currentTime += 1/30;
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

    function detechVideo(){
        while(selector.firstChild) selector.removeChild(selector.firstChild);
        videos = document.querySelectorAll('video');
        if (videos.length){
            for (let i=0;i<videos.length;i++){
                const item = document.createElement('option');
                item.value = i;
                item.innerText = i;
                selector.appendChild(item);
            }
            video = videos[0];
            play.value = video.paused?"播放":"暂停";
        }
        else{
            video = undefined;
            const toast = document.createElement('div');
            toast.style = `position: fixed;top: 50%;left: 50%;z-index: 999999;padding: 10px;background: darkcyan;transform: translate(-50%);color: #fff;border-radius: 6px;`
            toast.innerText = '当前页面没有检测到HTML5视频';
            document.body.appendChild(toast);
            setTimeout(()=>toast.remove(),2000);
        }
        console.log(videos);
    }
    let videos,video;
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
    selector.onchange = function(){
        video = videos[this.value]||video;
        play.value = video.paused?"播放":"暂停";
        video.scrollIntoView()
    };
    detech.onclick = detechVideo;
    play.onclick = videoPlay;
    preFrame.onclick = videoStep;
    nextFrame.onclick = videoStep;
    capture.onclick = shot;
    captureDown.onclick = shot;
    close.onclick = ()=>panel.remove();
    document.body.appendChild(panel);
    detechVideo();
}
if ('function'==typeof(GM_registerMenuCommand)){
    if (top!=window) return; //todo:解决子窗口中的视频处理并不覆盖父窗口
    GM_registerMenuCommand('启用HTML5视频截图器',init);
}else init();