// ==UserScript==
// @name         HTML5视频截图器
// @namespace    indefined
// @supportURL   https://github.com/indefined/UserScripts/issues
// @version      0.4.9
// @description  基于HTML5的简单任意原生视频截图，可控制快进/逐帧/视频调速，支持自定义快捷键
// @author       indefined
// @include      *://*
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @license      MIT
// ==/UserScript==

(async function HTML5VideoCapturer(){
    'use strict';
    let allConfigs,config;
    if(typeof(GM)!='undefined') {
        GM_getValue = GM.getValue;
        GM_setValue = GM.setValue;
    }
    //设置保存读取相关配置和逻辑
    const configList = {
        active:{
            content:'开启/关闭工具栏',
            title:'全局工具栏快捷键开关，必须至少同时按下ctrl/shift/alt之一，尽量避免常用快捷键以免冲突',
            key:'A',
            ctrlKey:true,
            shiftKey:false,
            altKey:true
        },
        capture:{
            content:'截图',
            title:'按下该按键打开新窗口显示截图，同时按住shift会尝试直接下载，如果直接下载失败也会打开新窗口',
            key:'s'
        },
        downCapture:{
            content:'直接下载截图',
            title:'按下该按键会尝试直接下载，如果直接下载失败效果等同于按下截图',
            key:'q'
        },
        preFrame:{
            content:'上一帧',
            title:'使视频后退一帧（最小分辨率1/60秒）',
            key:'d'
        },
        nextFrame:{
            content:'下一帧',
            title:'使视频前进一帧（最小分辨率1/60秒）',
            key:'f'
        },
        backward:{
            content:'后退',
            title:'使视频后退1秒，按住ctrl/shift/alt快退倍率等同工具栏按钮说明',
            key:'ArrowLeft'
        },
        forward:{
            content:'前进',
            title:'使视频前进1秒，按住ctrl/shift/alt快进倍率等同工具栏按钮说明',
            key:'ArrowRight'
        },
        play:{
            content:'播放/暂停',
            title:'切换视频播放/暂停状态，由于大部分视频自带空格播放暂停功能，不建议全局设置为空格以免冲突',
            key:''
        },
        speedOri:{
            content:'原速',
            title:'恢复1倍速播放视频',
            key:'z',
        },
        speedDown:{
            content:'减速',
            title:'使视频减速，小于1倍速时步长为0.1倍速，最小有效值为0.1倍',
            key:'x'
        },
        speedUp:{
            content:'加速',
            title:'使视频加速，大于1倍速时步长0.25倍速，最大有效值大概为16倍',
            key:'c'
        },
        panelActive:{
            content:'快捷键在截图工具栏上有效',
            title:'当鼠标光标在工具栏上非输入区域时快捷键会生效，快捷键作用与点击操作按钮相同会操作选中视频',
            type:'checkbox',
            key:'',
            checked:true,
            disabled:true
        },
        playerActive:{
            content:'启用播放器悬停快捷键支持',
            title:'勾选时当鼠标悬停在视频上时快捷键会生效，无论工具栏是否打开，快捷键会直接操作被悬停视频且不会有提示。'
            + '\n由于各种播放器外壳影响该功能可能不会生效，且可能和播放器外壳自身快捷键冲突，建议针对网站设置是否开启',
            type:'checkbox',
            key:'',
            checked:false
        },
        saveAsTimeStamp:{
            content:'截图文件名按照当前时间保存',
            title:'勾选此项则下载的截图文件名按照当前时间戳保存，否则按照视频播放时间保存',
            type:'checkbox',
            key:'',
            checked:false
        },
        crossOrigin:{
            content:'视频匿名跨域',
            title:'如果此选项被勾选，则网页打开时加载的非本网站视频会匿名访问。\n'
            +'此操作可以解决部分视频无法直接下载截图问题，但可能导致更多视频无法播放，建议仅在无法截图网站尝试设置。\n'
            +'注意此功能是一次性静态执行的，只会在网站刚加载时运行一次，后续加载的视频无效，且更改后需刷新生效。',
            type:'checkbox',
            key:'',
            checked:false
        }
    };
    /**
    深拷贝一个配置，并检查缺失配置项和无效项
    value: 待检查/拷贝的配置，可为空。
    return: 深拷贝的配置对象，去除无效项并添加缺失项默认值。当value为空时返回默认配置的克隆
    **/
    function cloneConfig(value) {
        const clone = {};
        if(!value) value = configList;
        for(const item in configList) {
            clone[item] = {};
            for(const i in configList[item]) {
                if(value[item]) clone[item][i] = value[item][i];
                else clone[item][i] = configList[item][i];
            }
        }
        for (const i in clone) {
            clone[i].key = clone[i].key.toUpperCase();
        }
        return clone;
    }
    //读取全部设置，赋值本网站生效配置的全局变量，并返回指定域名的单独配置
    async function getConfig(site){
        try{
            allConfigs = await GM_getValue('config','{}');
            if(allConfigs) allConfigs = JSON.parse(allConfigs);
        }catch(e){
            toast('读取配置错误，将使用默认配置',e);
            allConfigs = {};
            GM_setValue('config',JSON.stringify(allConfigs));
        }
        //使用深拷贝方法查缺和去无效
        config = cloneConfig(allConfigs[document.location.host] || allConfigs.default);
        //如果没有开启全局播放器快捷键则关闭悬停监听，这函数挺神经病的
        document.removeEventListener('mousemove',hoverListener);
        if(config.playerActive.checked) document.addEventListener('mousemove',hoverListener);
        //有要求读取的网站配置时，返回要求的配置，否则返回默认配置，否则（全空，初次运行）返回初始配置
        return allConfigs[site]||allConfigs.default||config;
    }
    /**
    保存某个网站设置
    value: 待保存的网站配置值，如为空则会删除该网站设置
    site: 待保存的网站
    **/
    async function saveConfig(value,site) {
        if(!value) {
            if(site&&site!='default') delete allConfigs[site];
            else {
                allConfigs.default = cloneConfig();
            }
        }
        else {
            allConfigs[site||'default'] = value;
        }
        //删除没必要保存的额外成员
        Object.values(allConfigs).forEach(config=>{
            Object.values(config).forEach(item=>{
                delete item.title;
                delete item.content;
            });
        });
        await GM_setValue('config',JSON.stringify(allConfigs));
        await getConfig(document.location.host);
        //通知iframe重新加载设置
        [].forEach.call(childs,(w,i)=>w.postMessage({action:'reload'},'*'));
    }

    //读取加载配置
    await getConfig();

    //匿名跨域，仅在启动时检查并操作一遍，实际作用有限
    if (config.crossOrigin.checked) {
        Array.from(document.querySelectorAll('video')).forEach(v=>{
            if(!v.src||v.src.indexOf(location.host)==-1) {
                v.setAttribute('crossorigin','anonymous');
            }
        });
    }

    //截图和视频操作相关函数从以下开始
    const childs = "undefined"==typeof(unsafeWindow)?window.frames:unsafeWindow.frames;
    let videos,video,selectId,hoverItem;
    function videoShot(down){
        if (!video) return postMsg('shot',down);
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const timestamp = config.saveAsTimeStamp.checked?
              new Date().toLocaleString('zh', {hour12: false}):
        `${Math.floor(video.currentTime/60)}'${(video.currentTime%60).toFixed(3)}''`;
        const name = `${document.title}_${timestamp}.jpg`;
        try{
            if (!down) throw `i don't want to do it.`;
            canvas.toBlob(blob=>{
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = name;
                document.head.appendChild(a);
                a.click();
                document.head.removeChild(a);
            },'image/jpeg', 0.95);
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
                host:location.host,
                id:window.captureId
            },'*');
        }else{
            while(selector.firstChild) selector.removeChild(selector.firstChild);
            appendVideo(videos);
            setTimeout(()=>{
                if (selector.childNodes.length) return videoSelect(selector.value);
                toast('当前页面没有检测到HTML5视频');
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
    //向包含目标视频的子窗体发送控制信息，全局变量selectId逐层往下层递归
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
    //监听鼠标是否悬停在视频或工具栏……极其低效却很简单通用的实现，开启关闭判断放在getConfig中
    //不需要监听视频悬停时应当移除（工具栏自带悬停检测，但作用会被该函数覆盖）
    function hoverListener(ev) {
        if (ev.target instanceof HTMLVideoElement || (window==top&&panel&&panel.contains(ev.target))) hoverItem = ev.target;
        else hoverItem = undefined;
    }
    //快捷键处理函数
    function keyHandler(ev,key) {
        //console.log(ev,key)
        let value;
        switch(key) {
            case 'speedUp':
                if(video) value = video.playbackRate+(video.playbackRate<1?0.1:0.25);
                else if(speed) {
                    speed.step = speed.value<1?0.1:0.25;
                    value = +speed.value + (+speed.step);
                }
                videoSpeedChange(value);
                break;
            case 'speedDown':
                if(video) {
                    value = video.playbackRate - (video.playbackRate>1?0.25:0.1);
                    if(value<0.1) video.playbackRate = 0.1;
                }
                else if(speed) {
                    speed.step = speed.value>1?0.25:0.1;
                    value = +speed.value - speed.step;
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
            case 'preFrame':
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
                videoShot(ev.shiftKey);
                break;
            case 'downCapture':
                videoShot(true);
                break;
            default:
                break;
        }
    }
    //全局快捷键监听函数
    function keyListener(ev) {
        //console.log(ev,hoverItem);
        if (ev.target instanceof HTMLTextAreaElement||ev.target instanceof HTMLInputElement) return;
        const key = ev.key.toUpperCase();
        if (
            config.active.key == key
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
        else if (!hoverItem) return;
        let value;
        if(value = Object.entries(config).find(([k,v])=>k!='active'&&v.key==key)){
            //将待操作视频暂时替换为鼠标悬停视频，并保存原视频备份
            const videoBk = video;
            if(hoverItem instanceof HTMLVideoElement) video = hoverItem;
            try{
                keyHandler(ev,value[0]);
            }catch(e){
                console.error(e);
            }
            //操作完成将待操作视频还原为备份视频
            video = videoBk;
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
            }
            else if(ev.data.action=='reload'){
                getConfig();
                [].forEach.call(childs,(w,i)=>w.postMessage({action:'reload'},'*'));
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
    function toast(text,error){
        if(error) console.error(error);
        const toast = document.createElement('div');
        toast.style = `position: fixed;top: 50%;left: 50%;z-index: 2147483647;padding: 10px;background: darkcyan;transform: translate(-50%);color: #fff;border-radius: 6px;`
        toast.innerText = text + (error||'');
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),1000);
    }
    let panel,selector,speed,play,settingForm;
    let loadSite, saveSite, clearSite;
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
            else if(i=='for') {
                item.setAttribute('for',config[i]);
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
        if (v.host) {
            let op = Array.from(loadSite.options).find(option=>option.value==v.host);
            if (op) {
                op.innerHTML = `【${v.id}】${op.value}`;
            }
            op = Array.from(clearSite.options).find(option=>option.value==v.host);
            if (op) {
                op.innerHTML = `【${v.id}】${op.value}`;
            }
            op = Array.from(saveSite.options).find(option=>option.value==v.host);
            if (op) {
                op.innerHTML = `【${v.id}】${op.value}`;
            }
            else {
                saveSite.add(_c({
                    nodeType: 'option',
                    value: v.host,
                    innerHTML: `【${v.id}】${v.host}`
                }));
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
        style:'position:fixed;top:40px;left:30px;z-index:2147483647;padding:5px 10px;background:darkcyan;font-family:initial;border-radius:4px;font-size:12px;text-align:left',
        onmouseenter:()=>(hoverItem = panel),
        onmouseleave:()=>(hoverItem = undefined),
        childs:[
            {
                nodeType:'style',
                innerHTML:'div#HTML5VideoCapture option{color:#000;}'
                + 'div#HTML5VideoCapture>*{margin:0 10px 5px 0}'
                + 'div#HTML5VideoCapture>span,div#HTML5VideoCapture>span>*{white-space:nowrap;}'
                + 'div#HTML5VideoCapture *{font-family:initial;color:#fff;background:transparent;line-height:20px;height:20px;box-sizing:content-box;vertical-align:top;}'
                + 'div#HTML5VideoCapture .h5vc-block {border:1px solid #ffffff99;border-radius:2px;padding:1px 4px;min-width:unset;margin-top:0}'
                + 'div#HTML5VideoCapture .h5vc-block:hover {border-color: #fff;}'
                + 'div#HTML5VideoCapture .setting-switcher:before {content:"﹀"}'
                + 'div#HTML5VideoCapture .setting-switcher.setting-open:before {content:"︿"}'
                + 'div#HTML5VideoCapture .setting-switcher:not(.setting-open)+form {display:none}'
            },
            {
                nodeType:'div',
                innerText:'HTML5视频截图工具',
                style:'cursor:move;user-select:none;font-size:14px;height:auto;min-width:60px;margin-right:0',
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
                style:'margin-right:0',
                innerText:'<<',
                title:'后退1秒,按住shift 5倍,ctrl 10倍,alt 60倍,多按相乘',
                onclick:e=>keyHandler(e,'backward')
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'<',
                title:'上一帧(1/60秒)',
                onclick:()=>videoStep(-1/60)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-right:0',
                innerText:'截图',
                title:'新建标签页打开视频截图',
                onclick:()=>videoShot()
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'↓',
                title:'直接下载截图（如果可用）',
                onclick:()=>videoShot(true)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                style:'margin-right:0',
                innerText:'>',
                title:'下一帧(1/60秒)',
                onclick:()=>videoStep(1/60)
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'>>',
                title:'前进1秒,按住shift 5倍,ctrl 10倍,alt 60倍,多按相乘',
                onclick:e=>keyHandler(e,'forward')
            },
            {
                nodeType:'button',
                className:'h5vc-block',
                innerText:'关闭',
                title:'关闭截图工具栏',
                style:'margin-right:0',
                onclick:panelActive
            },
            //以下为快捷键设置和相关控制逻辑
            {
                nodeType:'div',className:'setting-switcher',
                style:'text-align: center;cursor: pointer;user-select: none;margin-bottom:0',
                onclick:(ev)=>ev.target.classList.toggle('setting-open')
            },
            settingForm = _c({
                nodeType:'form',
                style:'user-select: none;height: auto;overflow: hidden;margin-right: 0; font-size:12px',
                childs:[
                    ...Object.entries(configList).map(([k,v])=>([
                        {
                            nodeType:'input',className:'h5vc-block',name:k,type:v.type,
                            title:v.title,id:'h5vc-setting-'+k,style:'display:inline-block',
                            disabled:v.disabled,
                            onclick:function(ev){this.select()&&ev.preventDefault()},
                            onkeydown:function(ev){
                                const key = ev.key;
                                if (key!='Control' && key!='Shift' && key!='Alt') {
                                    if(this.name=='active') this.value = (ev.ctrlKey&&'Ctrl+'||'')+(ev.shiftKey&&'Shift+'||'')+(ev.altKey&&'Alt+'||'')+ev.key.toUpperCase();
                                    else this.value = key.toUpperCase();
                                }
                                if(key!='Backspace' && key != 'Delete') ev.preventDefault();
                                else this.value = '';
                            },
                        },
                        {nodeType:'label',innerHTML:v.content,title:v.title,for:'h5vc-setting-'+k,style:'display:inline-block'},
                        {nodeType:'br'}
                    ])).flat(),
                    {
                        nodeType:'button',
                        className:'h5vc-block',
                        innerHTML:'保存默认',
                        title:'保存通用默认设置，默认设置将在没有设置专用设置的网站生效',
                        onclick:(ev)=> confirm('是否确认保存默认设置') &&
                        checkSettingFrom()
                            .then(config=>saveConfig(config,'default')&toast('保存成功'))
                            .catch(e=>toast('保存错误',e))&ev.preventDefault()
                    },
                    {
                        nodeType:'button',
                        className:'h5vc-block',
                        innerHTML:'重设默认',
                        title:'重设默认设置为原始值，此操作不会改变其它专用网站设置',
                        onclick:(ev)=> confirm('是否确认清除默认设置') &&
                        saveConfig(undefined,'default')
                            .then(()=>loadSettingForm(configList)&toast('重设成功'))
                            .catch(e=>toast('重设错误',e))&ev.preventDefault()
                    },
                    loadSite = _c({
                        nodeType:'select',className:'h5vc-block',
                        style:'width:55px;',
                        innerHTML:'<option value="">查看...</option>',
                        title:'显示保存的设置内容，此网站中的内嵌网页域名会有与视频编号对应的标识',
                        onchange:(ev)=>getConfig(ev.target.value).then(loadSettingForm)
                    }),
                    saveSite = _c({
                        nodeType:'select', className:'h5vc-block',
                        style:'width:70px;',
                        innerHTML:'<option value="">保存为...</option><option value="'+location.host+'">'+location.host+'</option>',
                        title:'保存网站专用设置，专用设置在该网站内将覆盖默认设置\n'
                            +'仅显示在本网页上加载的域名，带有编号的是内嵌网页的域名，可根据视频编号识别',
                        onchange:(ev)=> {
                            const value = ev.target.value;
                            ev.target.value = '';
                            if (value=='' || !confirm('是否确认保存'+value+'设置')) {
                                return;
                            }
                            checkSettingFrom()
                                .then(config=>saveConfig(config,value)&loadSettingForm(config)&toast('保存成功'))
                                .then(()=>clearSite.querySelector(`[value="${ev.target.value}"]`))
                                .then(find=>{
                                if (find) return;
                                loadSite.add(_c({nodeType:'option',value:value,innerHTML:value}));
                                clearSite.add(_c({nodeType:'option',value:value,innerHTML:value}))
                            })
                                .catch(e=>toast('保存错误',e))
                        }
                    }),
                    clearSite = _c({
                        nodeType:'select', className:'h5vc-block',
                        style:'width:55px;',
                        innerHTML:'<option value="">清除...</option>',
                        title:'清除网站专用设置，清除之后默认设置内容将在该网站生效',
                        onchange:(ev)=> {
                            const value = ev.target.value;
                            ev.target.value = '';
                            if (!confirm('是否确认清除'+value+'设置')) return;
                            saveConfig(undefined, value)
                                .then(()=>loadSite.querySelector(`[value="${value}"]`))
                                .then(find=>find&&loadSite.removeChild(find))
                                .then(()=>clearSite.querySelector(`[value="${value}"]`))
                                .then(find=>find&&clearSite.removeChild(find))
                                .then(()=>loadSettingForm(config)&toast('清除成功'))
                                .catch(e=>toast('清除错误',e))
                        }
                    }),
                ]
            })
        ]
    })};

    //初始化设置面板的配置，仅在创建设置面板时调用
    function initSettingFrom() {
        loadSite.add(_c({
            nodeType: 'option',
            innerHTML: '默认',
        }));
        for (const item in allConfigs) {
            if (item=='default') continue;
            loadSite.add(_c({
                nodeType: 'option',
                value: item,
                innerHTML: item==location.host?'【△】'+item:item,
            }));
            clearSite.add(_c({
                nodeType: 'option',
                value: item,
                innerHTML: item==location.host?'【△】'+item:item,
            }));
        }
        loadSettingForm(config);
    }

    //检查并返回设置窗口中的设置，实际方法是同步的，设置成异步是为了方便.then
    //throw: 检查设置不符合要求时抛出错误string，目前仅检测全局启动快捷键
    async function checkSettingFrom() {
        let keys = settingForm[0].value.split('+');
        let value = cloneConfig(config);
        if(keys.length<2&&keys[0]!='') throw '全局快捷键至少应当同时按下ctrl/shift/alt之一';
        value.active.key = keys[keys.length-1];
        value.active.ctrlKey = keys.indexOf('Ctrl')!=-1;
        value.active.shiftKey = keys.indexOf('Shift')!=-1;
        value.active.altKey = keys.indexOf('Alt')!=-1;
        for(let item of settingForm) {
            if(value[item.name]) {
                if(item.type=='checkbox') {
                    value[item.name].checked = item.checked;
                }
                else if(item.name!='active'){
                    value[item.name].key = item.value;
                }
            }
        }
        return value;
    }

    //给定一个设置，显示在设置面板中，读取设置时使用
    function loadSettingForm(value) {
        for(let item of settingForm) {
            if(value[item.name]) {
                if(item.type=='checkbox') {
                    item.checked = value[item.name].checked;
                }
                else if(item.name!='active'){
                    item.value = value[item.name].key.toUpperCase()
                }
                else {
                    let v = value.active;
                    item.value = v.ctrlKey!=undefined?(v.ctrlKey&&'Ctrl+'||'')+(v.shiftKey&&'Shift+'||'')+(v.altKey&&'Alt+'||'')+v.key:v.key.toUpperCase()
                }
            }
            else {
                if(item.type=='checkbox') {
                    item.checked = false;
                }
                else{
                    item.value = '';
                }
            }
        }
    }

    function panelActive(){
        if(document.body.contains(panel)) document.body.removeChild(panel);
        else {
            if(!panel) {
                createPanel();
                initSettingFrom();
            }
            document.body.appendChild(panel);
            if(!selector.length) videoDetech();
        }
    }
    if ('function'==typeof(GM_registerMenuCommand) && window==top){
        GM_registerMenuCommand('启用HTML5视频截图器',panelActive);
    }
})();