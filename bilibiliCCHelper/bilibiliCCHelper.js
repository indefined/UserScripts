// ==UserScript==
// @name         Bilibili CC字幕助手
// @namespace    indefined
// @version      0.2.1
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
right: 20px;top:30px">当前版本：${GM_info&&GM_info.script.version||'unknow'}</a>
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
            "1":`text-shadow: rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0)0px -1px 1px,\
 rgb(0, 0, 0) -1px 0px 1px;`,
            "2":`text-shadow: rgb(0, 0, 0) 0px 0px 1px, rgb(0, 0, 0) 0px 0px 1px, rgb(0, 0, 0) 0px 0px 1px;`,
            "3":`text-shadow: rgb(0, 0, 0) 1px 1px 2px, rgb(0, 0, 0) 0px 0px 1px;`
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
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Segoe UI,48,&H00FFFFFF,&HF0000000,&H00000000,&HF0000000,1,0,0,0,100,100,0,0.00,1,1,3,2,30,30,20,1

[Events]
Format: Layer, Start, End, Style, Actor, MarginL, MarginR, MarginV, Effect, Text
`
    };
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
    const bilibiliCCHelper = {
        isNew:undefined,
        setting:undefined,
        subtitle:undefined,
        currentIndex:undefined,
        currentData:undefined,
        elements:{},
        resizeRate: 100,
        languagesCount:0,
        datas:{
            close:{
                body:[]
            }
        },
        decoder:{
            srtReg:/(\d+):(\d{1,2}):(\d{1,2}),(\d{1,3})\s*-->\s*(\d+):(\d{1,2}):(\d{1,2}),(\d{1,3})\r?\n([.\s\S]+)/,
            assReg:/Dialogue:.*,(\d+):(\d{1,2}):(\d{1,2}\.?\d*),\s*?(\d+):(\d{1,2}):(\d{1,2}\.?\d*).*?,.*?,.*?,.*?,.*?,.*?,.*?,(.+)/,
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
                if(!file) return;
                const reader = new FileReader();
                reader.onload = ()=> {
                    let data;
                    if(file.name.endsWith('.lrc')) data = this.decodeFromLRC(reader.result);
                    else if(file.name.endsWith('.ass')) data = this.decodeFromASS(reader.result);
                    else if(file.name.endsWith('.srt')) data = this.decodeFromSRT(reader.result);
                    console.log(data);
                    player.updateSubtitle(data);
                };
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
                    body:data.map(({time,content},index)=>{
                    return {
                        from:time,
                        to:index==data.length-1?time+5:data[index+1].time,
                        content:content
                    }
                })};
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
                        content:match[9].trim().replace(/{\\.+?}/g,'').replace(/\\N/g,'\n')
                    });
                });
                return {body:data};
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
                        content:match[7].trim().replace(/{\\.+?}/g,'').replace(/\\N/g,'\n')
                    });
                });
                return {body:data};
            }
        },
        get(id,name){
            const item = document.body.querySelector(id);
            if(name) this.elements[name] = item;
            return item;
        },
        saveSetting(){
            try{
                const playerSetting = JSON.parse(localStorage.bilibili_player_settings);
                playerSetting.subtitle = this.setting;
                localStorage.bilibili_player_settings = JSON.stringify(playerSetting);
            }catch(e){
                console.log('加载字幕设置错误');
            }
        },
        changeStyle(){
            this.elements.fontStyle.innerHTML = `
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
}
`;
        },
        changePosition(){
            this.elements.subtitleContainer.className = 'subtitle-position subtitle-position-'
                 +(this.setting.position||'bc');
            this.elements.subtitleContainer.style = '';
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
        getSubtitle(item){
            return fetch(item.subtitle_url)
                .then(res=>res.json())
                .then(data=>(this.datas[item.lan] = data))
                .catch(e=>{
                console.error('cc字幕助手下载字幕失败'+e);
            });
        },
        loadSubtitle(data){
            if(!data) return;
            player.updateSubtitle(data);
            if(!this.isNew){
                this.setting.isclosed = false;
                this.elements.download.disabled = false;
                this.elements.icon.innerHTML = elements.oldEnableIcon;
            }
        },
        changeSubtitle(index=0){
            if(index>this.languagesCount){
                throw('下标异常');
            }
            else if(index>=this.languagesCount-1){
                if(!this.setting.isclosed&&this.subtitle.subtitles&&this.subtitle.subtitles.length){
                    //只有在有字幕的前提下才使用空字幕关闭字幕，否则不需要操作
                    player.updateSubtitle(this.datas.close);
                }
                this.setting.isclosed = true;
                this.elements.download.disabled = true;
                this.elements.languages[index].selected = true;
                this.elements.icon.innerHTML = elements.oldDisableIcon;
                if(index==this.languagesCount-1) this.decoder.selectFile();
            }
            else{
                const item = this.subtitle.subtitles[index];
                this.currentIndex = index;
                this.currentData = this.datas[item.lan];
                if(this.currentData){
                    this.loadSubtitle(this.currentData);
                    this.elements.languages[index].selected = true;
                }
                else if(item.subtitle_url){
                    this.getSubtitle(item)
                        .then((data)=>{
                        this.loadSubtitle(data);
                        this.currentData = data;
                        this.elements.languages[index].selected = true;
                    });
                }
            }
        },
        toggleSubtitle(){
            if(!this.setting.isclosed){
                this.changeSubtitle(this.languagesCount);
            }else{
                this.changeSubtitle(this.currentIndex);
            }
        },
        initSubtitle(){
            if(this.setting.isclosed) {
                this.changeSubtitle(this.languagesCount);
            }
            else{
                this.changeSubtitle();
            }
            if(this.languagesCount){
                this.changeStyle();
                this.changeResize();
            }
        },
        initOldUI(){
            this.setting = JSON.parse(localStorage.bilibili_player_settings).subtitle;
            if(!this.setting) throw('获取设置失败');
            const preBtn = this.get('.bilibili-player-video-btn-quality');
            if(!preBtn) {
                throw('没有找到视频清晰度按钮');
            }
            preBtn.insertAdjacentHTML('afterEnd',elements.oldUIElement);
            const subtitleContainer = this.get('.bilibili-player-video-subtitle>div','subtitleContainer'),
                  icon = this.get('#subtitle-icon','icon'),
                  panel = this.get('#subtitle-setting-panel','panel'),
                  fontStyle = this.get('#subtitle-font-setting-style','fontStyle'),
                  languageSelector = this.get('#subtitle-language','languageSelector'),
                  languages = this.elements.languages = languageSelector.options,
                  btn = this.get('#bilibili-player-subtitle-btn'),
                  fontsize = this.get('#subtitle-font-size'),
                  scale = this.get('#subtitle-auto-resize'),
                  upload = this.get('#subtitle-upload'),
                  download = this.get('#subtitle-download','download'),
                  color = this.get('#subtitle-color'),
                  shadow = this.get('#subtitle-shadow'),
                  position = this.get('#subtitle-position'),
                  opacity = this.get('#subtitle-background-opacity');
            //按钮
            if(this.setting.isclosed){
                icon.innerHTML = elements.oldDisableIcon;
            }else{
                icon.innerHTML = elements.oldEnableIcon;
            }
            btn.addEventListener('click',(e)=>{
                if(!this.elements.panel.contains(e.target)) this.toggleSubtitle();
            });
            //字幕语言
            languages.length = this.languagesCount+1;
            for(let i=0;i<languages.length-2;i++){
                languages[i].text = this.subtitle.subtitles[i].lan_doc;
                languages[i].value = this.subtitle.subtitles[i].lan;
            }
            languages[languages.length-2].text = '本地字幕';
            languages[languages.length-2].value = 'close';
            languages[languages.length-1].text = '关闭';
            languages[languages.length-1].value = 'close';
            languageSelector.addEventListener('change',(e)=>{
                this.changeSubtitle(e.target.selectedIndex);
            });
            //下载字幕
            download.addEventListener('click',()=>{
                new Encoder(this.currentData);
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
        updateDownloadBtn(value){
            if(!value||value=='close'){
                this.elements.downloadBtn.disabled = true;
                this.elements.downloadBtn.classList.add('bui-button-disabled');
                this.currentIndex = -1;
            }
            else{
                this.elements.downloadBtn.disabled = false;
                this.elements.downloadBtn.classList.remove('bui-button-disabled');
                this.currentIndex = this.subtitle.subtitles.findIndex(item=>item.lan==value);
            }
        },
        initNewUI(){
            const downloadBtn = this.elements.downloadBtn = this.elements.panel.nextElementSibling.cloneNode(),
                  selector = this.elements.panel.querySelector('ul'),
                  nowSelect = selector.querySelector('li.bui-select-item.bui-select-item-active'),
                  localSelect = nowSelect.cloneNode();
            downloadBtn.style = 'min-width:unset!important'
            downloadBtn.innerText = '下载';
            downloadBtn.addEventListener('click',()=>{
                if(this.currentIndex===undefined||this.currentIndex==-1) return;
                const item = this.subtitle.subtitles[this.currentIndex];
                if(!item) return;
                if(this.datas[item.lan]){
                    new Encoder(this.datas[item.lan]);
                }
                else{
                    this.getSubtitle(item).then(data=>{
                        new Encoder(data);
                    });
                }
            });
            this.updateDownloadBtn(nowSelect&&nowSelect.dataset.value);
            this.elements.panel.insertAdjacentElement('afterend',downloadBtn);
            //本地字幕
            localSelect.dataset.value = 'close';
            localSelect.innerText = '本地字幕';
            localSelect.addEventListener('click',()=>{
                this.decoder.selectFile();
            });
            selector.appendChild(localSelect);
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
            console.log('Bilibili CC Helper init newUI success.');
        },
        tryInitNewUI(){
            const btn = this.get('.bilibili-player-video-btn-subtitle','btn'),
                  panel = this.get('.bilibili-player-video-subtitle-setting-lan','panel');
            if(panel){
                this.initNewUI();
            }
            else if(btn){
                //强制显示新版播放器CC字幕按钮，不管视频有没有字幕，反正可以选择本地字幕
                btn.style = 'display:block';
                new MutationObserver((mutations,observer)=>{
                    mutations.forEach(mutation=>{
                        if(!mutation.target) return;
                        if(mutation.target.classList.contains('bilibili-player-video-subtitle-setting-lan')){
                            observer.disconnect();
                            this.elements.panel = mutation.target;
                            this.initNewUI();
                        }
                    });
                }).observe(btn,{
                    childList: true,
                    subtree: true
                });
            }
            else{
                throw('找不到新播放器按钮');
            }
        },
        setupData(data){
            try{
                fetch(`//api.bilibili.com/x/player.so?id=cid:${window.cid}&aid=${window.aid}`)
                    .then(res=>res.text()).then(data=>{
                    const subtitle = data.match(/(?:<subtitle>)(.+)(?:<\/subtitle>)/);
                    if (subtitle) this.subtitle = JSON.parse(subtitle[1]);
                    this.languagesCount = this.subtitle.subtitles&&this.subtitle.subtitles.length+1;
                    if(this.isNew){
                        this.tryInitNewUI();
                    }else{
                        this.initOldUI();
                    }
                });
            }catch(e){
                console.error(e,'CC字幕助手配置失败');
            }
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
                this.isNew = false;
                this.setupData();
                return true;
            }
            else if(this.get('.bilibili-player-video-danmaku-setting')){
                this.isNew = true;
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
                    if(!this.tryInit()) console.log('CC字幕助手似乎没有初始化成功，页面定义可能更改了，取消初始化');
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