// ==UserScript==
// @name         Bilibili CC字幕助手
// @namespace    indefined
// @version      0.3.5.2
// @description  旧版播放器可用CC字幕，ASS/SRT/LRC格式字幕下载，本地ASS/SRT/LRC格式字幕加载
// @author       indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @include      https://www.bilibili.com/video/av*
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const elements = {
        oldUIElement:`
<div class="bilibili-player-video-btn" id="bilibili-player-subtitle-btn" style="display: block;">
    <span id="subtitle-icon"></span>
    <style type="text/css" id="subtitle-font-setting-style"></style>
    <style type="text/css">
#bilibili-player-subtitle-btn:hover>#subtitle-setting-panel {
  display: block!important;
}
.subtitle-color-select-item {
  width: 15px;
  height: 15px;
  float: left;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,.3);
  margin-right: 10px;
}
#subtitle-setting-panel input[type="range"] {
  background-color: #ebeff4;
  -webkit-appearance: none;
  height:4px;
  transform: translateY(-4px);
}
#subtitle-setting-panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 15px;
  width: 15px;
  background: #fff;
  border-radius: 15px;
  border: 1px solid;
}
</style>
<div id="subtitle-setting-panel" style="position: absolute;bottom: 28px;right: 30px;background: white;\
    border-radius: 4px;text-align: left;padding: 13px;display: none;cursor:default;width:220px">
    <div>
        <div>字幕</div><select style="width: 50%;" id="subtitle-language">
        <option value="close">关闭</option></select>
        <button id="subtitle-download">下载字幕</button>
        <button id="subtitle-upload" style="margin-right: 13px;">添加字幕</button>
    </div><div>
        <div>字体大小</div>
        <input style="width: 70%;" type="range" id="subtitle-font-size" step="25">
        <input type="checkbox" id="subtitle-auto-resize">
        <label for="subtitle-auto-resize" style="cursor:pointer">自动缩放</label>
    </div><div>
        <div>字幕颜色</div><div>
        <ul id="subtitle-color" style="list-style: none;white-space: normal;">
        <li class="subtitle-color-select-item" data-value="16777215" style="background: #ffffff;" title="白色"></li>
        <li class="subtitle-color-select-item" data-value="16007990" style="background: #F44336;" title="红色"></li>
        <li class="subtitle-color-select-item" data-value="10233776" style="background: #9C27B0;" title="紫色"></li>
        <li class="subtitle-color-select-item" data-value="6765239" style="background: #673AB7;" title="深紫色"></li>
        <li class="subtitle-color-select-item" data-value="4149685" style="background: #3F51B5;" title="靛青色"></li>
        <li class="subtitle-color-select-item" data-value="2201331" style="background: #2196F3;" title="蓝色"></li>
        <li class="subtitle-color-select-item" data-value="240116" style="background: #03A9F4;" title="亮蓝色"></li>
        </ul><br></div>
    <div><span>位置</span>
        <select id="subtitle-position" style="width: 35%;">
        <option value="bl">左下角</option>
        <option value="bc">底部居中</option>
        <option value="br">右下角</option>
        <option value="tl">左上角</option>
        <option value="tc">顶部居中</option>
        <option value="tr">右上角</option></select>
        <span>描边</span>
        <select id="subtitle-shadow" style="width: 35%;">
        <option value="0">无描边</option>
        <option value="1">重墨</option>
        <option value="2">描边</option>
        <option value="3">45°投影</option>
        </select>
    </div>
    </div><div>
        <div>背景不透明度</div>
        <input style="width: 100%;" type="range" id="subtitle-background-opacity">
    </div>
</div></div>
`,
        oldEnableIcon:`
<svg width="22" height="28" viewbox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
  <path id="svg_1" fill-rule="evenodd" fill="#99a2aa" d="m4.07787,6.88102l14,0a2,2 0 0 1 2,2l0,10a2,2 0 0 \
1 -2,2l-14,0a2,2 0 0 1 -2,-2l0,-10a2,2 0 0 1 2,-2zm5,5.5a1,1 0 1 0 0,-2l-3,0a2,2 0 0 0 -2,2l0,3a2,2 0 0 0 \
2,2l3,0a1,1 0 0 0 0,-2l-2,0a1,1 0 0 1 -1,-1l0,-1a1,1 0 0 1 1,-1l2,0zm8,0a1,1 0 0 0 0,-2l-3,0a2,2 0 0 0 -2,2l0\
,3a2,2 0 0 0 2,2l3,0a1,1 0 0 0 0,-2l-2,0a1,1 0 0 1 -1,-1l0,-1a1,1 0 0 1 1,-1l2,0z"/></svg>`,
        oldDisableIcon:`
<svg width="22" height="28" viewBox="0 0 22 32" xmlns="http://www.w3.org/2000/svg">
  <path id="svg_1" fill-rule="evenodd" fill="#99a2aa" d="m15.172,21.87103l-11.172,0a2,2 0 0 1 -2,-2l0,-10c0,\
-0.34 0.084,-0.658 0.233,-0.938l-0.425,-0.426a1,1 0 1 1 1.414,-1.414l15.556,15.556a1,1 0 0 1 -1.414,1.414l-2.192,\
-2.192zm-10.21,-10.21c-0.577,0.351 -0.962,0.986 -0.962,1.71l0,3a2,2 0 0 0 2,2l3,0a1,1 0 0 0 0,-2l-2,0a1,1 0 0 1 -1,\
-1l0,-1a1,1 0 0 1 0.713,-0.958l-1.751,-1.752zm1.866,-3.79l11.172,0a2,2 0 0 1 2,2l0,10c0,0.34 -0.084,0.658 -0.233,\
0.938l-2.48,-2.48a1,1 0 0 0 -0.287,-1.958l-1.672,0l-1.328,-1.328l0,-0.672a1,1 0 0 1 1,-1l2,0a1,1 0 0 0 0,-2l-3,\
0a2,2 0 0 0 -1.977,1.695l-5.195,-5.195z"/></svg>
`,
        downloadPanel:`
<div style="left: 50%;top: 50%;position: absolute;padding: 20px;background:\
white;border-radius: 8px;margin: auto;transform: translate(-50%,-50%);">
<h2 style="font-size: 20px;color: #4fc1e9;font-weight: 400;margin-bottom: 10px;">字幕下载</h2>
<a href="https://greasyfork.org/scripts/378513" target="_blank" style="position: absolute;\
right: 20px;top:30px">当前版本：${typeof(GM_info)!="undefined"&&GM_info.script.version||'unknow'}</a>
<textarea id="subtitle-download-area" style="width:350px;height: 320px;rsize:both;" readonly></textarea>
<div style="line-height: 30px;">
<input id="subtitle-download-ASS" type="radio" name="subtitle-type" value="ASS" style="cursor:pointer">
<label for="subtitle-download-ASS" style="cursor:pointer">ASS</label>
<input id="subtitle-download-SRT" type="radio" name="subtitle-type" value="SRT" style="cursor:pointer">
<label for="subtitle-download-SRT" style="cursor:pointer">SRT</label>
<input id="subtitle-download-LRC" type="radio" name="subtitle-type" value="LRC" style="cursor:pointer">
<label for="subtitle-download-LRC" style="cursor:pointer">LRC</label>
<a id="subtitle-download-action" style="padding: 5px 10px;background:#4fc1e9;color:white;border-radius:5px;\
margin-left: 10px;">下载</a>
<a id="subtitle-download-close" style="padding: 5px 10px;background:#4fc1e9;color:white;border-radius:5px;\
cursor:pointer;margin-left: 10px;">关闭</a></div></div>`,
        shadowStyle:{
            "0":'',
            "1":`text-shadow: #000 1px 0px 1px, #000 0px 1px 1px, #000 0px -1px 1px,#000 -1px 0px 1px;`,
            "2":`text-shadow: #000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px;`,
            "3":`text-shadow: #000 1px 1px 2px, #000 0px 0px 1px;`
        },
        assHead:`\
[Script Info]
Title: ${document.title}
ScriptType: v4.00+
Collisions: Reverse
PlayResX: 1280
PlayResY: 720
WrapStyle: 3
ScaledBorderAndShadow: yes
; ----------------------
; 本字幕由CC字幕助手自动转换
; 字幕来源${document.location}
; 脚本地址https://greasyfork.org/scripts/378513
; 设置了字幕过长自动换行，但若字幕中没有空格换行将无效
; 字体大小依据720p 48号字体等比缩放
; 如显示不正常请尝试使用SRT格式

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, \
StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Segoe UI,48,&H00FFFFFF,&HF0000000,&H00000000,&HF0000000,1,0,0,0,100,100,0,0.00,1,1,3,2,30,30,20,1

[Events]
Format: Layer, Start, End, Style, Actor, MarginL, MarginR, MarginV, Effect, Text
`
    };

    //编码器，用于将B站BCC字幕编码为常见字幕格式下载
    class Encoder{
        constructor(data){
            if(!data||!data.body instanceof Array){
                throw '数据错误';
            }
            this.data = data.body;
            this.type = undefined;
            this.showDialog();
        }
        showDialog(){
            const settingDiv = document.createElement('div');
            settingDiv.style = 'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: rgba(0,0,0,0.4);z-index: 1048576;';
            settingDiv.innerHTML = elements.downloadPanel;
            this.actionButton = settingDiv.querySelector('#subtitle-download-action');
            this.textArea = settingDiv.querySelector('#subtitle-download-area');
            settingDiv.querySelector('#subtitle-download-close').onclick = ()=>{
                document.body.removeChild(settingDiv);
            };
            settingDiv.querySelector('#subtitle-download-SRT').onchange = ()=>{
                this.encodeToSRT();
            };
            settingDiv.querySelector('#subtitle-download-LRC').onchange = ()=>{
                this.encodeToLRC();
            };
            settingDiv.querySelector('#subtitle-download-ASS').onchange = ()=>{
                this.encodeToASS();
            };
            document.body.appendChild(settingDiv);
        }
        updateDownload(result,type){
            this.textArea.value = result;
            URL.revokeObjectURL(this.actionButton.href);
            this.actionButton.href = URL.createObjectURL(new Blob([result]));
            this.actionButton.download = `${document.title}.${type}`;
        }
        encodeToLRC(){
            this.updateDownload(this.data.map(({from,to,content})=>{
                return `${this.encodeTime(from,'LRC')} ${content.replace(/\n/g,' ')}`;
            }).join('\r\n'),'lrc');
        }
        encodeToSRT(){
            this.updateDownload(this.data.reduce((accumulator,{from,to,content},index)=>{
                return `${accumulator}${index+1}\r\n${this.encodeTime(from)} --> ${this.encodeTime(to)}\r\n${content}\r\n\r\n`;
            },''),'srt');
        }
        encodeToASS(){
            this.updateDownload(elements.assHead + this.data.map(({from,to,content})=>{
                return `Dialogue: 0,${this.encodeTime(from,'ASS')},${this.encodeTime(to,'ASS')},*Default,NTP,0000,0000,0000,,${content.replace(/\n/g,'\\N')}`;
            }).join('\r\n'),'ass');
        }
        encodeTime(input,format='SRT'){
            let time = new Date(input*1000),
                ms = time.getMilliseconds(),
                second = time.getSeconds(),
                minute = time.getMinutes(),
                hour = Math.floor(input/60/60);
            if (format=='SRT'){
                if (hour<10) hour = '0'+hour;
                if (minute<10) minute = '0'+minute;
                if (second<10) second = '0'+second;
                if (ms<10) ms = '00'+ms;
                else if (ms<100) ms = '0'+ms;
                return `${hour}:${minute}:${second},${ms}`;
            }
            else if(format=='ASS'){
                ms = (ms/10).toFixed(0);
                if (minute<10) minute = '0'+minute;
                if (second<10) second = '0'+second;
                if (ms<10) ms = '0'+ms;
                return `${hour}:${minute}:${second}.${ms}`;
            }
            else{
                ms = (ms/10).toFixed(0);
                minute += hour*60;
                if (minute<10) minute = '0'+minute;
                if (second<10) second = '0'+second;
                if (ms<10) ms = '0'+ms;
                return `[${minute}:${second}.${ms}]`;
            }
        }
    };

    //解码器，用于读取常见格式字幕并将其转换为B站可以读取BCC格式字幕
    const decoder = {
        srtReg:/(\d+):(\d{1,2}):(\d{1,2}),(\d{1,3})\s*-->\s*(\d+):(\d{1,2}):(\d{1,2}),(\d{1,3})\r?\n([.\s\S]+)/,
        assReg:/Dialogue:.*,(\d+):(\d{1,2}):(\d{1,2}\.?\d*),\s*?(\d+):(\d{1,2}):(\d{1,2}\.?\d*)(?:.*?,){7}(.+)/,
        selectFile(){
            const fileSelector = document.createElement('input')
            fileSelector.type = 'file';
            fileSelector.accept = '.lrc,.ass,.srt';
            fileSelector.oninput = ()=>{
                this.readFile(fileSelector.files&&fileSelector.files[0]);
            };
            fileSelector.click();
        },
        readFile(file){
            if(!file) {
                bilibiliCCHelper.toast('文件获取失败');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = ()=> {
                try{
                    let data,name = file.name.toLowerCase();
                    if(name.endsWith('.lrc')) data = this.decodeFromLRC(reader.result);
                    else if(name.endsWith('.ass')) data = this.decodeFromASS(reader.result);
                    else if(name.endsWith('.srt')) data = this.decodeFromSRT(reader.result);
                    console.log(data);
                    player.updateSubtitle(data);
                    bilibiliCCHelper.toast(`载入本地字幕${file.name}`);
                }
                catch(e){
                    bilibiliCCHelper.toast('载入字幕失败',e);
                };
            };
            reader.onerror = e=>{
                bilibiliCCHelper.toast('载入字幕失败',e);
            }
            reader.readAsText(file);
        },
        decodeFromLRC(input){
            if(!input) return;
            const data = [];
            input.split('\n').forEach(line=>{
                const match = line.match(/((\[\d+:\d+\.?\d*\])+)(.*)/);
                if (!match||match[3].trim().replace('\r','')=='') {
                    //console.log('跳过非正文行',line);
                    return;
                }
                const times = match[1].match(/\d+:\d+\.?\d*/g);
                times.forEach(time=>{
                    const t = time.split(':');
                    data.push({
                        time:t[0]*60 + (+t[1]),
                        content:match[3]
                    });
                });
            });
            return {
                body:data.sort((a,b)=>a.time-b.time).map(({time,content},index)=>({
                    from:time,
                    to:index==data.length-1?time+20:data[index+1].time,
                    content:content
                }))
            };
        },
        decodeFromSRT(input){
            if(!input) return;
            const data = [];
            let split = input.split('\n\n');
            if(split.length==1) split = input.split('\r\n\r\n');
            split.forEach(item=>{
                const match = item.match(this.srtReg);
                if (!match){
                    //console.log('跳过非正文行',item);
                    return;
                }
                data.push({
                    from:match[1]*60*60 + match[2]*60 + (+match[3]) + (match[4]/1000),
                    to:match[5]*60*60 + match[5]*60 + (+match[7]) + (match[8]/1000),
                    content:match[9].trim().replace(/{\\.+?}/g,'').replace(/\\N/gi,'\n').replace(/\\h/g,' ')
                });
            });
            return {body:data.sort((a,b)=>a.from-b.from)};
        },
        decodeFromASS(input){
            if(!input) return;
            const data = [];
            let split = input.split('\n');
            split.forEach(line=>{
                const match = line.match(this.assReg);
                if (!match){
                    //console.log('跳过非正文行',line);
                    return;
                }
                data.push({
                    from:match[1]*60*60 + match[2]*60 + (+match[3]),
                    to:match[4]*60*60 + match[5]*60 + (+match[6]),
                    content:match[7].trim().replace(/{\\.+?}/g,'').replace(/\\N/gi,'\n').replace(/\\h/g,' ')
                });
            });
            return {body:data.sort((a,b)=>a.from-b.from)};
        }
    };

    //旧版播放器CC字幕助手，需要维护整个设置面板和字幕逻辑
    const oldPlayerHelper = {
        setting:undefined,
        subtitle:undefined,
        selectedLan:undefined,
        resizeRate: 100,
        languagesCount:0,
        saveSetting(){
            try{
                const playerSetting = JSON.parse(localStorage.bilibili_player_settings);
                playerSetting.subtitle = this.setting;
                localStorage.bilibili_player_settings = JSON.stringify(playerSetting);
            }catch(e){
                bilibiliCCHelper.toast('保存字幕设置错误',e);
            }
        },
        changeStyle(){
            this.fontStyle.innerHTML = `
                span.subtitle-item-background{
                    opacity: ${this.setting.backgroundopacity};
                }
                span.subtitle-item-text {
                    color:#${("000000"+this.setting.color.toString(16)).slice(-6)};
                }
                span.subtitle-item {
                    font-size: ${this.setting.fontsize*this.resizeRate}%;
                    line-height: ${this.setting.fontsize*this.resizeRate*1.1}%;
                    ${elements.shadowStyle[this.setting.shadow]}
                }`;
        },
        changePosition(){
            this.subtitleContainer.className = 'subtitle-position subtitle-position-'
                 +(this.setting.position||'bc');
            this.subtitleContainer.style = '';
        },
        changeResizeStatus(state){
            if(state){
                this.changeResize();
            }else{
                this.resizeRate = 100;
                this.changeStyle();
            }
        },
        changeResize(state){
            if (this.setting.scale) {
                this.resizeRate = player.getWidth()/1280*100;
                this.changeStyle();
            }
        },
        changeSubtitle(value = this.languages[0].value){
            if(value=='close'){
                if(this.selectedLan&&this.selectedLan!='close') {
                    bilibiliCCHelper.loadSubtitle('close');
                    this.setting.isclosed = true;
                }
                this.downloadBtn.disabled = true;
                this.languages[this.languagesCount-1].selected = true;
                this.icon.innerHTML = elements.oldDisableIcon;
            }
            else{
                this.setting.isclosed = false;
                [].find.call(this.languages,(item=>item.value==value))
                    .selected = true;
                this.icon.innerHTML = elements.oldEnableIcon;
                this.selectedLan = value;
                if(value=='local') {
                    decoder.selectFile();
                    this.downloadBtn.disabled = true;
                }
                else {
                    bilibiliCCHelper.loadSubtitle(value);
                    this.downloadBtn.disabled = false;
                }
            }
        },
        toggleSubtitle(){
            if(!this.setting.isclosed){
                this.changeSubtitle('close');
            }else{
                this.changeSubtitle(this.selectedLan);
            }
        },
        initSubtitle(){
            if(this.setting.isclosed) {
                this.changeSubtitle('close');
            }
            else{
                this.changeSubtitle(this.selectedLan);
            }
            this.changeStyle();
            this.changeResize();
        },
        initUI(){
            const preBtn = bilibiliCCHelper.get('.bilibili-player-video-btn-quality');
            if(!preBtn) throw('没有找到视频清晰度按钮');
            preBtn.insertAdjacentHTML('afterEnd',elements.oldUIElement);
            const [
                subtitleContainer,
                icon,
                panel,
                fontStyle,
                languageSelector,
                btn,
                fontsize,
                scale,
                upload,
                downloadBtn,
                color,
                shadow,
                position,
                opacity] = bilibiliCCHelper.get([
                '.bilibili-player-video-subtitle>div',
                '#subtitle-icon',
                '#subtitle-setting-panel',
                '#subtitle-font-setting-style',
                '#subtitle-language',
                '#bilibili-player-subtitle-btn',
                '#subtitle-font-size',
                '#subtitle-auto-resize',
                '#subtitle-upload',
                '#subtitle-download',
                '#subtitle-color',
                '#subtitle-shadow',
                '#subtitle-position',
                '#subtitle-background-opacity'
            ]);
            const languages = this.languages = languageSelector.options;
            this.subtitleContainer = subtitleContainer;
            this.icon = icon;
            this.panel = panel;
            this.fontStyle = fontStyle;
            this.languageSelector = languageSelector;
            this.downloadBtn = downloadBtn;
            //按钮
            if(this.setting.isclosed){
                icon.innerHTML = elements.oldDisableIcon;
            }else{
                icon.innerHTML = elements.oldEnableIcon;
            }
            btn.addEventListener('click',(e)=>{
                if(!this.panel.contains(e.target)) this.toggleSubtitle();
            });
            //字幕语言
            languages.length = this.languagesCount+1;
            for(let i=0;i<languages.length-2;i++){
                languages[i].text = this.subtitle.subtitles[i].lan_doc;
                languages[i].value = this.subtitle.subtitles[i].lan;
            }
            languages[languages.length-1].text = '本地字幕';
            languages[languages.length-1].value = 'local';
            languages[languages.length-2].text = '关闭';
            languages[languages.length-2].value = 'close';
            languageSelector.addEventListener('change',(e)=>{
                this.changeSubtitle(e.target.value);
            });
            //下载字幕
            downloadBtn.addEventListener('click',()=>{
                if(this.selectedLan=='closed') return;
                bilibiliCCHelper.getSubtitle(this.selectedLan).then(data=>{
                    new Encoder(data);
                }).catch(e=>{
                    bilibiliCCHelper.toast('获取字幕失败',e);
                });
            });
            //上传字幕
            if( this.subtitle.allow_submit){
                upload.addEventListener('click',()=>{
                    open(`https://member.bilibili.com/v2#/zimu/my-zimu/zimu-editor?aid=${window.aid}&cid=${window.cid}`,'blank');
                });
            }
            else{
                upload.title = '本视频无法添加字幕，可能原因是:\r\n·UP主未允许观众投稿字幕\r\n·您未达到UP主设置的投稿字幕条件';
                upload.disabled = true;
            }
            //字体大小
            fontsize.value = this.setting.fontsize==0.6?
                0:this.setting.fontsize==0.8?
                25:this.setting.fontsize==1.3?
                75:this.setting.fontsize==1.6?
                100:50;
            fontsize.addEventListener('input',(e)=>{
                const v = e.target.value/25;
                this.setting.fontsize = v>2?(v-2)*0.3+1:v*0.2+0.6;
                this.changeStyle();
            });
            //自动缩放
            scale.checked = true;
            scale.addEventListener('change',(e)=>{
                this.changeResizeStatus(this.setting.scale = e.target.checked);
            });
            //字幕颜色
            color.addEventListener('click',(e)=>{
                this.changeStyle(this.setting.color = parseInt(e.target.dataset.value));
            });
            //字幕阴影
            [].forEach.call(shadow.options,item=>{
                if(item.value==this.setting.shadow) item.selected = true;
            });
            shadow.addEventListener('change',(e)=>{
                this.changeStyle(this.setting.shadow = e.target.value);
            });
            //字幕位置
            [].forEach.call(position.options,item=>{
                if(item.value==this.setting.position) item.selected = true;
            });
            position.addEventListener('change',(e)=>{
                this.changePosition(this.setting.position = e.target.value);
            });
            //背景透明度
            opacity.value = this.setting.backgroundopacity*100;
            opacity.addEventListener('input',(e)=>{
                this.changeStyle(this.setting.backgroundopacity = e.target.value/100);
            });
            //播放器缩放
            player.addEventListener('video_resize', (event) => {
                this.changeResize(event);
            });
            //退出页面保存配置
            window.addEventListener("beforeunload", (event) => {
                this.saveSetting();
            });
            //初始化字幕
            this.initSubtitle();
            console.log('init cc helper button done');
        },
        init(subtitle){
            this.subtitle = subtitle;
            this.languagesCount = subtitle.subtitles&&subtitle.subtitles.length+1;
            this.setting = JSON.parse(localStorage.bilibili_player_settings).subtitle;
            if(!this.setting) throw('获取设置失败');
            this.initUI();
        }
    };//oldPlayerHelper END

    //新版播放器CC字幕助手，需要维护下载按钮/本地字幕选项/关闭选项/需要时监听CC字幕按钮
    const newPlayerHelper = {
        iconBtn:undefined,
        panel:undefined,
        downloadBtn:undefined,
        selectedLan:undefined,
        selectedLocal:false,
        hasSubtitles:false,
        updateDownloadBtn(value='closed'){
            this.selectedLan = value;
            if(value=='close'){
                this.downloadBtn.style['pointer-events'] = 'none';
                this.downloadBtn.classList.add('bui-button-disabled');
            }
            else{
                this.selectedLocal = false;
                this.downloadBtn.style['pointer-events'] = 'all';
                this.downloadBtn.classList.remove('bui-button-disabled');
            }
        },
        initUI(){
            const downloadBtn = this.downloadBtn = this.panel.nextElementSibling.cloneNode(),
                  selector = this.panel.querySelector('ul'),
                  nowSelect = selector.querySelector('li.bui-select-item.bui-select-item-active'),
                  closeItem = selector.querySelector('li.bui-select-item.bui-select-item-active'),
                  localItem = closeItem.cloneNode();
            downloadBtn.style = 'min-width:unset!important'
            downloadBtn.innerText = '下载';
            downloadBtn.addEventListener('click',()=>{
                if(this.selectedLan=='close') return;
                bilibiliCCHelper.getSubtitle(this.selectedLan).then(data=>{
                    new Encoder(data);
                }).catch(e=>{
                    bilibiliCCHelper.toast('获取字幕失败',e);
                });
            });
            this.updateDownloadBtn(nowSelect&&nowSelect.dataset.value);
            this.panel.insertAdjacentElement('afterend',downloadBtn);
            //本地字幕
            localItem.innerText = '本地字幕';
            localItem.addEventListener('click',()=>{
                this.selectedLocal = true;
                decoder.selectFile();
            });
            selector.appendChild(localItem);
            //选中本地字幕后关闭需要手动执行
            closeItem.addEventListener('click',()=>{
                if(!this.selectedLocal) return;
                this.selectedLocal = false;
                bilibiliCCHelper.loadSubtitle('close');
            });
            //视频本身没有字幕时，点击CC字幕按钮切换本地字幕和关闭
            //视频本身有字幕时播放器自身会切换到视频自身字幕
            if(!this.hasSubtitles){
                const icon = this.iconBtn.querySelector('.bilibili-player-iconfont-subtitle');
                icon&&icon.addEventListener('click',({target})=>{
                    if(!this.selectedLocal) localItem.click();
                    else closeItem.click();
                });
            }
            new MutationObserver((mutations,observer)=>{
                mutations.forEach(mutation=>{
                    if(!mutation.target||mutation.type!='attributes') return;
                    if(mutation.target.classList.contains('bui-select-item-active')&&mutation.target.dataset.value){
                        this.updateDownloadBtn(mutation.target.dataset.value);
                    }
                });
            }).observe(selector,{
                subtree: true,
                attributes: true,
                attributeOldValue: true ,
                attributeFilter: ['class']
            });
            console.log('Bilibili CC Helper init new UI success.');
        },
        init(subtitle){
            this.hasSubtitles = subtitle.subtitles && subtitle.subtitles.length;
            this.selectedLocal = undefined;
            this.selectedLan = undefined;
            [this.iconBtn,this.panel] = bilibiliCCHelper.get(['.bilibili-player-video-btn-subtitle','.bilibili-player-video-subtitle-setting-lan']);
            if(this.panel){
                this.initUI();
            }
            else if(this.iconBtn){
                //强制显示新版播放器CC字幕按钮，不管视频有没有字幕，反正可以选择本地字幕
                this.iconBtn.style = 'display:block';
                new MutationObserver((mutations,observer)=>{
                    mutations.forEach(mutation=>{
                        if(!mutation.target) return;
                        if(mutation.target.classList.contains('bilibili-player-video-subtitle-setting-lan')){
                            observer.disconnect();
                            this.panel = mutation.target;
                            this.initUI();
                        }
                    });
                }).observe(this.iconBtn,{
                    childList: true,
                    subtree: true
                });
            }
            else{
                throw('找不到新播放器按钮');
            }
        },
    };//newPlayerHelper END

    //启动器
    const bilibiliCCHelper = {
        subtitle:undefined,
        datas:undefined,
        isOldPlayer:undefined,
        get(selectors){
            //数组递归，可一次查询一个列表页面元素
            if(selectors instanceof Array) {
                return selectors.map(selector=>this.get(selector));
            }
            return document.body.querySelector(selectors);
        },
        toast(msg,error){
            if(error) console.error(error);
            if(!this.toastDiv){
                this.toastDiv = document.createElement('div');
                this.toastDiv.className = 'bilibili-player-video-toast-item';
            }
            const panel = this.get('.bilibili-player-video-toast-top');
            if(!panel) return;
            clearTimeout(this.removeTimmer);
            this.toastDiv.innerText = msg + (error||'');
            panel.appendChild(this.toastDiv);
            this.removeTimmer = setTimeout(()=>panel.removeChild(this.toastDiv),3000);
        },
        loadSubtitle(lan){
            this.getSubtitle(lan).then(data=>{
                player.updateSubtitle(data);
                this.toast(lan=='close'?
                           '字幕已关闭':
                           `载入字幕${this.subtitle.subtitles.find(item=>item.lan==lan).lan_doc}`);
            }).catch(e=>{
                this.toast('载入字幕失败',e);
            });
        },
        async getSubtitle(lan){
            if(this.datas[lan]) return this.datas[lan];
            const item = this.subtitle.subtitles.find(item=>item.lan==lan);
            if(!item) throw('找不到所选语言字幕',lan);
            return fetch(item.subtitle_url)
                .then(res=>res.json())
                .then(data=>(this.datas[lan] = data));
        },
        setupData(data){
            this.datas = {
                close:{
                    body:[]
                }
            };
            fetch(`//api.bilibili.com/x/player.so?id=cid:${window.cid}&aid=${window.aid}`)
                .then(res=>res.text()).then(data=>{
                const match = data.match(/(?:<subtitle>)(.+)(?:<\/subtitle>)/);
                this.subtitle = match&&JSON.parse(match[1]);
                if(this.isOldPlayer){
                    oldPlayerHelper.init(this.subtitle);
                }else{
                    newPlayerHelper.init(this.subtitle);
                }
            }).catch(e=>{
                this.toast('CC字幕助手配置失败',e);
            });
        },
        observerNew(){
            new MutationObserver((mutations, observer)=>{
                mutations.forEach(mutation=>{
                    if(!mutation.target) return;
                    if(mutation.target.getAttribute('stage')==1){
                        this.setupData();
                    }
                });
            }).observe(this.get('#bofqi'),{
                childList: true,
                subtree: true,
            });
        },
        tryInit(){
            if(this.get('#entryNew')){
                this.isOldPlayer = true;
                this.setupData();
                return true;
            }
            else if(this.get('.bilibili-player-video-danmaku-setting')){
                this.isOldPlayer = false;
                this.setupData();
                this.observerNew();
                return true;
            }
        },
        init(){
            if(this.tryInit()) return;
            let i=0;
            new MutationObserver((mutations, observer)=>{
                if(i++>200) {
                    observer.disconnect();
                    if(!this.tryInit()) {
                        this.toast('CC字幕助手似乎没有初始化成功，页面定义可能更改了，取消初始化');
                    }
                }
                mutations.forEach(mutation=>{
                    if(!mutation.target) return;
                    if(mutation.target.getAttribute('stage')==1){
                        observer.disconnect();
                        this.tryInit();
                    }
                });
            }).observe(document.body,{
                childList: true,
                subtree: true,
            });
        }
    };
    bilibiliCCHelper.init();
})();