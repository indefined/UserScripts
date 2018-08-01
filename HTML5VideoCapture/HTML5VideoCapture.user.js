// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @version      0.1
// @description  基于HTML5的原生javascript视频截图器
// @author       indefined
// @include      *://*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// ==/UserScript==

function init(){
    'use strict';
    if (document.querySelector('#HTML5VideoCapture')) return;
    let videos,video,panel;
    function shot(){
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style = "max-width:100%";
        canvas.getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height);
        try{
            throw `i don't want to do it.`;
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.95);
            a.download = 'capture.jpg';
            a.click();
        }catch(e){
            const imgWin = open("",'_blank');
            imgWin.document.body.appendChild(canvas);
        }
    }
    function detachVideo(){
        videos = document.querySelectorAll('video');
        return videos.length;
    }
    function videoPlay(){
        this.value = video.paused?'暂停':'播放';
        video.paused?video.play():video.pause();
    }
    function videoStep(){
        if (!video.paused){
            video.pause();
            panel.childNodes[2].value='播放';
        }
        if (this.value=='上一帧') video.currentTime -= 1/30;
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
    if (detachVideo()){
        video = videos[0];
        console.log(videos);
        panel = document.createElement('div');
        panel.id = "HTML5VideoCapture";
        panel.style = `position: fixed;top: 50px;left: 20px;z-index: 999999;padding: 10px;background: darkcyan;`
        panel.innerHTML = `<div style="margin-bottom: 5px;cursor:move;user-select:none;line-height:1;color:#fff">HTML5视频截图器</div>\
<select title="选择视频"></select><input type="button" value=${video.paused?"播放":"暂停"} style="margin-left: 10px;">\
<input type="button" value="上一帧" style="margin-left: 10px;"><input type="button" value="截图" style="margin-left: 10px;">\
<input type="button" value="下一帧" style="margin-left: 10px;"><input type="button" value="关闭" style="margin-left: 10px;">`
        const {0:title,1:selector,2:play,3:preFrame,4:capture,5:nextFrame,6:close} = panel.childNodes;
        title.onmousedown = dialogMove;
        title.onmouseup = dialogMove;
        for (let i=0;i<videos.length;i++){
            const item = document.createElement('option');
            item.value = i;
            item.innerText = i;
            selector.appendChild(item);
        }
        selector.onchange = function(){
            video = videos[this.value]||video;
            video.scrollIntoView()
        };
        play.onclick = videoPlay;
        preFrame.onclick = videoStep;
        nextFrame.onclick = videoStep;
        capture.onclick = shot;
        close.onclick = ()=>panel.remove();
        document.body.appendChild(panel);
    }else{
        const toast = document.createElement('div');
        toast.style = `position: fixed;top: 50%;left: 50%;z-index: 999999;padding: 10px;background: darkcyan;transform: translate(-50%);color: #fff;border-radius: 6px;`
        toast.innerText = '当前页面没有检测到HTML5视频';
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),2000);
    }
}
if ('function'==typeof(GM_registerMenuCommand)){
    if (top!=window) return; //todo:解决子窗口中的视频处理并不覆盖父窗口
    GM_registerMenuCommand('启用HTML5视频截图器',init);
}else init();