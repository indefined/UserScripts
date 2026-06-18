// ==UserScript==
// @name         HV 物品装备汉化
// @namespace    hentaiverse.org
// @author       ggxxsol & mbbdzz & indefined & etc.
// @updateURL    https://github.com/WayneFerdon/UserScripts/raw/refs/heads/master/HVTranslate/HV%20%E7%89%A9%E5%93%81%E8%A3%85%E5%A4%87%E6%B1%89%E5%8C%96.user.js
// @downloadURL  https://github.com/WayneFerdon/UserScripts/raw/refs/heads/master/HVTranslate/HV%20%E7%89%A9%E5%93%81%E8%A3%85%E5%A4%87%E6%B1%89%E5%8C%96.user.js
// @description  汉化Hentaiverse及EH论坛、拍卖网站里的物品、装备名，带装备高亮/装备店隐藏锁定装备，带翻译原文切换功能。论坛购物请切换到英文原文再复制内容
// @notice       此修改版大幅度乱重构了原有脚本执行逻辑，翻译效果和兼容性有一定提升，但失去原脚本装备后缀语序倒转功能和物品悬浮窗窗说明汉化
// @notice       如有同时使用其它汉化，需要先于其它汉化脚本安装运行才会生效
// @notice       如与其它脚本同时使用冲突，可尝试调整脚本运行顺序，但无法保证完全兼容，或者将冲突的页面链接添加用户排除(@exclude)
// @notice       如果你要在论坛买东西，挑好东西之后最好切换到原文再复制内容，因为别人并不一定看得懂经过翻译过后的东西
// @icon         https://hentaiverse.org/y/favicon.png
// @include      *://*hentaiverse.org/*
// @exclude      *://*hentaiverse.org/*pages/showequip.php?*
// @include      *://forums.e-hentai.org/*showtopic=*
// @include      *://reasoningtheory.net/*
// @version      2026.06.10.1
// @run-at         document-end
// ==/UserScript==

unsafeWindow.isEquipTranslateSeparately = true;

if (document.location.href.match(/ss=iw/)&&!document.getElementById('item_pane'))return
if (document.getElementById('riddlemaster')||document.getElementById('textlog')) return;
function pauseAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// 切换原文使用的变量
var translatedList = new Map(), translated = true, changer;
var tagsWhitelist = ['TEXTAREA','SCRIPT','STYLE'],
    rIsRegexp = /^\/(.+)\/([gim]+)?$/;
//执行查找的xpath表达式，查找目标元素下的所有文本
var pathExpre = new XPathEvaluator().createExpression('.//text()[ normalize-space(.) != "" ]', null);

// 物品字典、装备字典、装备属性字典、额外内容字典，提供给translate方法第二参数做翻译字典
// 可以调用对应translateItems/translateEquips/translateEquipsInfo/translateExtra方法直接翻译页面元素
// 否则需要先调用loadItems/loadEquips/loadEquipsInfo/loadExtra加载对应字典之后才能使用translate方法
var dictItems, dictEquips, dictEquipsInfo, dictExtra;

main();//执行汉化

function main(){
    var lklist = [
        'Bazaar&ss=ib', //采购机器人0
        'Bazaar&ss=is', //道具店1
        'Character&ss=it', //道具仓库2
        'Bazaar&ss=ss', //祭坛3
        'Character&ss=in', //装备仓库4
        'Character&ss=eq', //更换装备5
        'Battle&ss=iw', //iw 6
        'Bazaar&ss=es', //装备店7
        'showtopic=', //论坛汉化8
        'Forge&ss=', //锻造9
        'Bazaar&ss=mm', //邮件10
        'Bazaar&ss=lt', //武器彩票11
        'Bazaar&ss=la', //防具彩票12
        'equip', //装备属性页13
        'hvmarket.xyz', //hvmarket14
        'reasoningtheory.net', //拍卖15
        'Bazaar&ss=mk', //交易市场16
        'Bazaar&ss=am', //武器17
    ];
    translateOnChange('#popup_box');
    translateOnChange('.hvut-lt-div');
    translateOnChange('#hvut-bt-div', translateItems);
    translateOnLoaded('.hvut-bt-equip', '...');

    var location;
    for(location = 0; location < lklist.length; location++){
        // 匹配当前网址位置，lklist里面的网址顺序和下面case对应，更改顺序需要同时更改case
        if(document.location.href.match(lklist[location])){
            break;
        }
    }

    switch (location){
        case 0: //采购机器人
            translateItems('#bot_item');
            /* eslint-disable-next-line */// 右侧已提交采购列表跳入下方物品列表等同处理
        case 1: //道具店
        case 2: //道具仓库
        case 3: //祭坛
            //只会翻译物品名称
            translateItems(".itemlist>tbody>tr>td>div");
            translateItems(".sa>div:last-child>div");

            translateOnChange('.hvut-ss-results', [translateItems, translateEquips]);
            translateOnChange('.hvut-ss-log', [translateItems, translateEquips]);
            break;

        case 4: //装备仓库
        case 5: //更换装备页
        case 6: //iw
            translateEquipsList();
            break;

        case 7: //装备店
            translateEquipsList();
            var equipdiv, i;
            var equhide = document.createElement('span');
            equhide.style.cssText = "cursor: pointer;z-index: 1000;font-size: 16px;position: fixed;top: 180px;left: 0px;color: red;background: black;user-select: none;";
            try{
                if(!localStorage.hideflag) localStorage.hideflag = "隐藏锁定装备";
                if(localStorage.hideflag=="隐藏锁定装备"){
                    equhide.title = "点击显示锁定装备";
                    equipdiv = document.querySelectorAll(".il");
                    for(i = 0 ;i <equipdiv.length;i++) {
                        equipdiv[i].parentNode.style.display = "none";
                    }
                    equhide.innerHTML = "显";
                }
                else {
                    equhide.title = "点击隐藏锁定装备";
                    equhide.innerHTML = "隐";
                }
            }
            catch(e){alert(e)}
            equhide.onclick = function(){
                equipdiv = document.querySelectorAll(".il");
                this.title = "点击"+localStorage.hideflag;
                if(localStorage.hideflag=="隐藏锁定装备"){
                    equhide.innerHTML = "隐";
                    localStorage.hideflag = "显示锁定装备";
                    for(i = 0 ;i <equipdiv.length;i++) {
                        equipdiv[i].parentNode.style.display = "";
                    }
                }
                else{
                    equhide.innerHTML = "显";
                    localStorage.hideflag = "隐藏锁定装备";
                    for(i = 0 ;i <equipdiv.length;i++) {
                        equipdiv[i].parentNode.style.display = "none";
                    }
                }
            }
            document.body.appendChild(equhide);
            break;

        case 8: //论坛
            initRestore(); //原文切换按钮
            if (!+localStorage.comfimTranslateAlert) {
                //切换原文强提示
                changer.style.width = "1em";
                changer.style.cursor = "help";
                changer.textContent = "点击切换到原文再复制内容";
                changer.title = "论坛购物务必切换回原文再复制，因为别人不一定能看懂翻译过的东西\n如果不想每次看到整句提示可以按住Ctrl双击切换按钮";
            }
            changer.ondblclick = function(ev){ev.ctrlKey && (localStorage.comfimTranslateAlert = +!+localStorage.comfimTranslateAlert)}

            loadItems(); //加载道具字典
            loadEquips(); //加载装备字典
            loadExtra(); //加载额外的论坛翻译字典
            var links = []; //用于暂存避免翻译的链接
            Array.from(document.getElementsByClassName('postcolor')).forEach(post=>{
                let html = post.innerHTML;
                translatedList.set(post, html); //保存原内容
                //下面一行内容为去除论坛发帖格式，对当前脚本汉化逻辑没有用处，如果想要去除的话删除下一行前面的//
                //html = html.replace(/<span [^>]+>[^>]+>/g,"").replace(/<!--[/]?color[^>]+>/g,"").replace(/<[/]*b>/g,"")
                html = html.replace(/(href|src)=".+?"/g, src=>{
                    links.push(src);
                    return 'HTRANSLATE_PLACEHOLDER_' + (links.length - 1); // 去除掉网页中的链接并暂存起来防止错误翻译
                });
                html = translate(html, dictItems); //翻译物品
                html = translate(html, dictEquips); //翻译装备名
                html = translate(html, dictExtra); //翻译论坛额外内容
                html = html.replace(/HTRANSLATE_PLACEHOLDER_(\d+)/g, (match, p1)=>{
                    return links[p1]; // 还原备份的原网页中链接
                });
                post.innerHTML = html;
            });
            return; //此处直接结束翻译方法，其它case结束后会检查是否有原文需要切换，论坛原文切换已经默认执行
            break;

        case 9: //锻造
            if (document.querySelector('#equip_extended')) {
                //左侧装备名
                translateEquips("#leftpane>div:not([id])");
                //强化所需材料
                translateItems('#rightpane>div[id^="costpane"]>table :first-child>.fc2');
            }
            else {
                translateEquipsList();
            }
            break;

        case 10: //邮件
            translateEquips('div[onmouseover*="equips"]');//装备附件
            translateItems('div[onmouseover*="show_item"]');//物品附件
            break;

        case 11: //武器彩卷
        case 12: //防具彩卷
            translateEquips("#lottery_eqname");
            break;

        case 13: //装备属性页
                    translateOnChange('#equipselect_right', ()=>{
              translateOnLoaded('.showequip', 'hv-quality-compare',undefined,undefined,true);
            });
            // translateEquips('.showequip');//装备名
            break;

        case 14: //hvmarket
            translateItems('td:nth-child(2)>a'); //物品列表
            translateExtra('div.cs'); //物品分类
            translateItems('.main_content>h1'); //购买页面标头
            translateItems('h2.exch'); //购买页面的购买描述
            break;

        case 15: //拍卖
            var table = document.querySelector('table.bidlog>:nth-child(2)');
            if (table) {
                // 翻译拍卖记录
                translateItems('td:nth-child(6)');
                translateEquips('td:nth-child(6)');
                new MutationObserver(function(){
                    // 拍卖记录自动刷新
                    translatedList.clear(); // 清空旧翻译记录
                    if (!translated) translated = -1;
                    // 重新翻译
                    translateItems('td:nth-child(6)');
                    translateEquips('td:nth-child(6)');
                    if (translated == -1) restore();
                }).observe(table, {childList:true});
            }
            else if (table = document.getElementById('itemSections')) {
                // 拍卖列表
                translateItems('td:nth-child(2)');
                translateEquips('td:nth-child(2)');
                new MutationObserver(function(){
                    // 拍卖列表自动刷新
                    translatedList.clear(); // 清空旧翻译记录
                    if (!translated) translated = -1;
                    // 重新翻译
                    translateItems('td:nth-child(2)');
                    translateEquips('td:nth-child(2)');
                    if (translated == -1) restore();
                }).observe(table, {childList:true});
            }
            else if (document.getElementById('draw')) {
                // 拍卖时间
                translateItems('.itemHeader>span>span:nth-child(2)');
                translateEquips('.itemHeader>span>span:nth-child(2)');
            }
            break;

        case 16: //交易市场
            translateItems('#market_right');
            break;

        case 17: //武器
            translateOnChange('#equipselect_right', ()=>{
              translateOnLoaded('.showequip', 'hv-quality-compare',undefined,undefined,true);
            });
            translateOnLoaded('#equiplist', '...');
            translateEquipsList();
            break;

        default: //没有匹配命中需要翻译的网页
            break;
    }

    if (translatedList.size) {
        initRestore();//原文切换按钮
    }
}
function restore() {
    translatedList.forEach((data, elem) => {
        for (var item in data) {
            [elem[item], data[item]] = [data[item], elem[item]];
        }
    });
    translated = !translated;
    changer.innerHTML = translated?'英':'中';
}

// prepareRegex by JoeSimmons
// used to take a string and ready it for use in new RegExp()
function prepareRegex(string) {
  return string.replace(/([\[\]\^\&\$\.\(\)\?\/\\\+\{\}\|])/g, '\\$1');
}

// function to decide whether a parent tag will have its text replaced or not
function isTagOk(tag) {
  return !tagsWhitelist.includes(tag);
}

//翻译表单按钮
function translateButton(elem, dict, isDynamic) {
  var value = elem.value;
  for(var item of dict){
    value = value.replace(item.reg??item[0], item.value??item[1]);
  }
  value = value.replace(/<.*?>/g,'');
  if(value!=elem.value) {
    if (!translatedList.has(elem)) translatedList.set(elem, {value: elem.value});
    elem.value = value;
  }
}

// 翻译文本，使用指定字典对指定元素下的所有文字进行翻译
// elem: 待翻译的页面元素, dict: 使用的翻译字典, dynamic: 是否动态元素
// 动态元素将不会检查内容直接翻译
function translateText(elem, dict, dynamic) {
  if (!elem || !dict) return;
  if (elem.tagName === 'INPUT') return translateButton(elem, dict, dynamic);
  var temp, item;
  var texts = pathExpre.evaluate(elem, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var i = 0, text; text = texts.snapshotItem(i); i += 1) {
    if (dynamic || isTagOk(text.parentNode.tagName) ) {
      temp = text.data;
      for(item of dict){
        temp = temp.replace(item.reg??item[0], item.value??item[1]);
      }
      if(temp===text.data) continue;
      const parent = text.parentNode;
      const span = document.createElement('span');
      parent.appendChild(span);
      span.innerHTML = temp;
      var spanTexts = pathExpre.evaluate(elem, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      var spanText;
      for (var j = 0, t; t = spanTexts.snapshotItem(j); j += 1) {
        if (!isTagOk(t.parentNode.tagName) ) continue;
        spanText = t;
      }
      if (!translatedList.has(spanText)) {
        translatedList.set(spanText, {data: text.data});
      }
      text.data = '';
    }
  }
}

async function translateOnLoaded(selector, loadingText = '...', method = undefined, selectorTrans = undefined, invertLoadingText=false) {
    if (Array.isArray(method)) {
      method.forEach(m=>translateOnLoaded(selector, loadingText, m, selectorTrans, invertLoadingText));
      return;
    }
    method = method ?? translateEquips;
    if (loadingText) { // Type 1 : 通过加载中的文本判断
        //查找页面元素并调用翻译
        let done = false;
        while (!done) {
            await pauseAsync(0);
            done = true;
            const all = document.querySelectorAll(selector);
            if (!all) return;
            for (const item of all) {
                if (invertLoadingText ^ !item.innerHTML.includes(loadingText)) continue;
                done = false;
              break;
            }
        }
        method(selectorTrans ?? selector);
        return;
    }
}
function translateOnChange(selector, method = undefined, translateSelector = undefined, doInInit=true) {
    if (Array.isArray(method)) {
      method.forEach(m=>translateOnChange(selector, m, translateSelector));
      return;
    }
    method ??= translateEquips;
    translateSelector ??= selector;
    const observer = new MutationObserver((mutations, observer) => {
        if (!translated) return;
        mutations.forEach(mutation => {
            const nodes = Array.from(mutation.addedNodes);
            nodes.push(mutation.target);
            nodes.forEach(node => {
                if (!(node instanceof Element)) return;
                method(translateSelector);
                observer.observe(node, { subtree: true, childList: true, attribute: true, attributeFilter: ['value', 'title'] });
            })
        });
    });
    if (doInInit) method(translateSelector);
    Array.from(document.querySelectorAll(selector)).forEach(elem => observer.observe(elem, { subtree: true, childList: true, attribute: true, attributeFilter: ['value', 'title'] })); //监听翻译动态内容
}

//原文切换
function restoreLegacy() {
    for(var elem of translatedList) {
        translatedList.set(elem[0], elem[0].innerHTML);
        elem[0].innerHTML = elem[1];
    }
    translated = !translated;
    changer.innerHTML = translated?'英':'中';
}
function initRestore() {
    document.addEventListener('keydown',(ev)=>{
        if(ev.altKey&&(ev.key=='a'||ev.key=='A')) {
            restore();
        }
    });
    if(changer=document.getElementById('change-translate')) {
        return changer.addEventListener('click',restore);
    }
    changer = document.createElement('span');
    changer.innerHTML = "英";
    changer.title = '点击切换翻译';
    changer.id = 'change-translate';
    changer.addEventListener('click',restore);
    changer.style.cssText = "cursor:pointer;z-index:1000;font-size: 16px;position:fixed; top:200px; left:0px; color: white;background : black";
    document.body.appendChild(changer);
}

/**
 * 核心翻译方法
 * 参数 target: 待翻译的页面元素或者字符串，如果是页面元素会保存原文并翻译整个元素内部，否则直接翻译字符串
 * 参数 dicts: 翻译字典，一个Map，key值为匹配表达式，value为翻译结果。
 */
function translate(target, dicts) {
    return translateText(target, dicts, false);
    if (!target || !dicts) return;
    let html, isElem = target instanceof Element;
    if (isElem) {
        html = target.innerHTML;
        if (!translatedList.has(target)) translatedList.set(target, html); //保存原文
    }
    else html = target;
    for (var dict of dicts){ //遍历字典并翻译
        html = html.replace(dict[0], dict[1]);
    }
    if (isElem) {
        target.innerHTML = html;
        return target;
    }
    else return html;
}

//翻译Hentaiverse内装备列表
function translateEquipsList(){
    if (document.querySelector('#equiplist')){
        translateEquips('tr[onmouseover]>td:first-child');
        document.head.insertAdjacentHTML('beforeend', `<style>.lc>span{left:unset;position:unset;background:unset;border:unset}.lc>span:nth-child(2){position:absolute;top:0;left:0;height:20px;width:20px;background-color:#EDEADA;border:2px solid #B5A4A4;border-radius:3px}`);
    }
    else {
        translateEquips(".equiplist div[id^='e'][onmouseover]");
    }
    translateEquips(".hvut-eqp-scroll>input");
    translateEquips(".hvut-eqp-type");
    translateEquips(".eqb>div");
}

//翻译装备名。参数: 待翻译的页面元素css选择器
function translateEquips(selector){
    if(!selector) return;
    if (!dictEquips) loadEquips();//加载字典
    //查找页面元素并调用翻译
    Array.from(document.querySelectorAll(selector)).forEach(elem=>translate(elem, dictEquips));
}

//翻译物品
function translateItems(selector){
    if(!selector) return;
    if (!dictItems) loadItems();
    Array.from(document.querySelectorAll(selector)).forEach(elem=>translate(elem, dictItems));
}

//翻译额外内容
function translateExtra(selector){
    if(!selector) return;
    if (!dictExtra) loadExtra();
    Array.from(document.querySelectorAll(selector)).forEach(elem=>translate(elem, dictExtra));
}

function loadItems(){
    if (dictItems) return dictItems;
    //道具字典
    var items = {
        //道具翻译
        'Health Potion' : '体力药水',
        'Health Draught' : '体力长效药',
        'Health Elixir' : '终极体力药',
        'Mana Potion' : '法力药水',
        'Mana Draught' : '法力长效药',
        'Mana Elixir' : '终极法力药',
        'Spirit Potion' : '灵力药水',
        'Spirit Draught' : '灵力长效药',
        'Spirit Elixir' : '终极灵力药',
        'Monster Chow' : '怪物饲料',
        'Last Elixir' : '终极秘药',
        'Energy Drink' : '能量饮料',
        'Caffeinated Candy' : '咖啡因糖果',
        'Golden Lottery Ticket' : '黄金彩票券',
        'Soul Stone' : '灵魂石',
        'Flower Vase' : '花瓶',
        'Bubble-Gum' : '泡泡糖',
        'Binding of Slaughter':  '粘合剂 基础物理伤害',
        'Binding of Balance':  '粘合剂 物理命中率',
        'Binding of Isaac':  '粘合剂 物理暴击率',
        'Binding of Destruction':  '粘合剂 基础魔法伤害',
        'Binding of Focus':  '粘合剂 魔法命中率',
        'Binding of Friendship':  '粘合剂 魔法暴击率',
        'Binding of Protection':  '粘合剂 物理减伤',
        'Binding of Warding':  '粘合剂 魔法减伤',
        'Binding of the Fleet':  '粘合剂 回避率',
        'Binding of the Barrier':  '粘合剂 格挡率',
        'Binding of the Nimble':  '粘合剂 招架率',
        'Binding of Negation':  '粘合剂 抵抗率',
        'Binding of the Ox':  '粘合剂 力量',
        'Binding of the Raccoon':  '粘合剂 灵巧',
        'Binding of the Cheetah':  '粘合剂 敏捷',
        'Binding of the Turtle':  '粘合剂 体质',
        'Binding of the Fox':  '粘合剂 智力',
        'Binding of the Owl':  '粘合剂 感知',
        'Binding of the Elementalist':  '粘合剂 元素魔法熟练度',
        'Binding of the Heaven-sent':  '粘合剂 神圣魔法熟练度',
        'Binding of the Demon-fiend':  '粘合剂 黑暗魔法熟练度',
        'Binding of the Curse-weaver':  '粘合剂 减益魔法熟练度',
        'Binding of the Earth-walker':  '粘合剂 增益魔法熟练度',
        'Binding of Surtr':  '粘合剂 火属性咒语伤害',
        'Binding of Niflheim':  '粘合剂 冰属性咒语伤害',
        'Binding of Mjolnir':  '粘合剂 雷属性咒语伤害',
        'Binding of Freyr':  '粘合剂 风属性咒语伤害',
        'Binding of Heimdall':  '粘合剂 圣属性咒语伤害',
        'Binding of Fenrir':  '粘合剂 暗属性咒语伤害',
        'Binding of Dampening':  '粘合剂 敲击减伤',
        'Binding of Stoneskin':  '粘合剂 斩击减伤',
        'Binding of Deflection':  '粘合剂 刺击减伤',
        'Binding of the Fire-eater':  '粘合剂 火属性减伤',
        'Binding of the Frost-born':  '粘合剂 冰属性减伤',
        'Binding of the Thunder-child':  '粘合剂 雷属性减伤',
        'Binding of the Wind-waker':  '粘合剂 风属性减伤',
        'Binding of the Thrice-blessed':  '粘合剂 圣属性减伤',
        'Binding of the Spirit-ward':  '粘合剂 暗属性减伤',

        'Infusion of Darkness' : '黑暗魔药',
        'Infusion of Divinity' : '神圣魔药',
        'Infusion of Storms' : '风暴魔药',
        'Infusion of Lightning' : '闪电魔药',
        'Infusion of Frost' : '冰冷魔药',
        'Infusion of Flames' : '火焰魔药',
        'Infusion of Gaia' : '盖亚魔药',
        'Scroll of Swiftness' : '加速卷轴',
        'Scroll of the Avatar' : '化身卷轴',
        'Scroll of Shadows' : '幻影卷轴',
        'Scroll of Absorption' : '吸收卷轴',
        'Scroll of Life' : '生命卷轴',
        'Scroll of Protection' : '保护卷轴',
        'Scroll of the Gods' : '神之卷轴',
        'Crystal of Vigor' : '力量水晶',
        'Crystal of Finesse' : '灵巧水晶',
        'Crystal of Swiftness' : '敏捷水晶',
        'Crystal of Fortitude' : '体质水晶',
        'Crystal of Cunning' : '智力水晶',
        'Crystal of Knowledge' : '感知水晶',
        'Crystal of Flames' : '火焰水晶',
        'Crystal of Frost' : '冰冻水晶',
        'Crystal of Lightning' : '闪电水晶',
        'Crystal of Tempest' : '疾风水晶',
        'Crystal of Devotion' : '神圣水晶',
        'Crystal of Corruption' : '暗黑水晶',
        'Crystal of Quintessence' : '灵魂水晶',

        'Monster Edibles' : '怪物食品',
        'Monster Cuisine' : '怪物料理',
        'Happy Pills' : '快乐药丸',

        'Wispy Catalyst' : '纤小 催化剂',
        'Diluted Catalyst' : '稀释 催化剂',
        'Regular Catalyst' : '平凡 催化剂',
        'Robust Catalyst' : '充沛 催化剂',
        'Vibrant Catalyst' : '活力 催化剂',
        'Coruscating Catalyst' : '闪耀 催化剂',
        'Low-Grade Cloth': '低级布料',
        'Mid-Grade Cloth': '中级布料',
        'High-Grade Cloth': '高级布料',
        'Low-Grade Leather': '低级皮革',
        'Mid-Grade Leather': '中级皮革',
        'High-Grade Leather': '高级皮革',
        'Low-Grade Metals': '低级金属',
        'Mid-Grade Metals': '中级金属',
        'High-Grade Metals': '高级金属',
        'Low-Grade Wood': '低级木头',
        'Mid-Grade Wood': '中级木头',
        'High-Grade Wood': '高级木头',
        'Scrap Metal' : '金属废料',
        'Scrap Leather' : '皮革废料',
        'Scrap Wood' : '木材废料',
        'Scrap Cloth' : '布制废料',
        'Energy Cell' : '能量元',
        'Defense Matrix Modulator' : '力场碎片(盾)',
        'Repurposed Actuator' : '动力碎片(重)',
        'Shade Fragment' : '暗影碎片(轻)',
        'Crystallized Phazon' : '相位碎片(布)',
        'Legendary Weapon Core' : '传奇武器核心',
        'Peerless Weapon Core' : '无双武器核心',
        'Legendary Staff Core' : '传奇法杖核心',
        'Peerless Staff Core' : '无双法杖核心',
        'Legendary Armor Core' : '传奇护甲核心',
        'Peerless Armor Core' : '无双护甲核心',
        'Voidseeker Shard' : '虚空碎片',
        'Featherweight Shard' : '羽毛碎片',
        'Aether Shard' : '以太碎片',
        'Amnesia Shard' : '重铸碎片',
        'Soul Fragment' : '灵魂碎片',
        'Blood Token' : '鲜血令牌',
        'Token of Blood' : '鲜血令牌',
        'Chaos Token' : '混沌令牌',

        'Pouches': '护符带',
        'Charms': '护符',

        "Silk Charm Pouch": "丝绸护符袋",
        "Kevlar Charm Pouch": "凯夫拉护符袋",
        "Mithril Charm Pouch": "秘银护符袋",
        "Lesser Featherweight Charm": "次级轻羽护符",
        "Greater Featherweight Charm": "强效轻羽护符",
        "Lesser Hollowforged Charm": "次级虚空升华护符",
        "Greater Hollowforged Charm": "强效虚空升华护符",
        "Lesser Fire Strike Charm": "次级火焰打击护符",
        "Greater Fire Strike Charm": "强效火焰打击护符",
        "Lesser Cold Strike Charm": "次级寒冰打击护符",
        "Greater Cold Strike Charm": "强效寒冰打击护符",
        "Lesser Lightning Strike Charm": "次级闪电打击护符",
        "Greater Lightning Strike Charm": "强效闪电打击护符",
        "Lesser Wind Strike Charm": "次级狂风打击护符",
        "Greater Wind Strike Charm": "强效狂风打击护符",
        "Lesser Holy Strike Charm": "次级神圣打击护符",
        "Greater Holy Strike Charm": "强效神圣打击护符",
        "Lesser Dark Strike Charm": "次级黑暗打击护符",
        "Greater Dark Strike Charm": "强效黑暗打击护符",
        "Lesser Butcher Charm": "次级物理伤害加成护符",
        "Greater Butcher Charm": "强效物理伤害加成护符",
        "Lesser Swiftness Charm": "次级迅捷护符",
        "Greater Swiftness Charm": "强效迅捷护符",
        "Lesser Fatality Charm": "次级物理暴击护符",
        "Greater Fatality Charm": "强效物理暴击护符",
        "Lesser Overpower Charm": "次级反招架护符",
        "Greater Overpower Charm": "强效反招架护符",
        "Lesser Voidseeker Charm": "次级虚空护符",
        "Greater Voidseeker Charm": "强效虚空护符",
        "Lesser Archmage Charm": "次级魔法伤害加成护符",
        "Greater Archmage Charm": "强效魔法伤害加成护符",
        "Lesser Economizer Charm": "次级节能护符",
        "Greater Economizer Charm": "强效节能护符",
        "Lesser Spellweaver Charm": "次级高速咏唱护符",
        "Greater Spellweaver Charm": "强效高速咏唱护符",
        "Lesser Annihilator Charm": "次级魔法暴击护符",
        "Greater Annihilator Charm": "强效魔法暴击护符",
        "Lesser Penetrator Charm": "次级反魔法抵抗护符",
        "Greater Penetrator Charm": "强效反魔法抵抗护符",
        "Lesser Aether Charm": "次级以太护符",
        "Greater Aether Charm": "强效以太护符",
        "Lesser Fire-proof Charm": "次级火焰抗性护符",
        "Greater Fire-proof Charm": "强效火焰抗性护符",
        "Lesser Cold-proof Charm": "次级寒冰抗性护符",
        "Greater Cold-proof Charm": "强效寒冰抗性护符",
        "Lesser Lightning-proof Charm": "次级闪电抗性护符",
        "Greater Lightning-proof Charm": "强效闪电抗性护符",
        "Lesser Wind-proof Charm": "次级狂风抗性护符",
        "Greater Wind-proof Charm": "强效狂风抗性护符",
        "Lesser Holy-proof Charm": "次级神圣抗性护符",
        "Greater Holy-proof Charm": "强效神圣抗性护符",
        "Lesser Dark-proof Charm": "次级黑暗抗性护符",
        "Greater Dark-proof Charm": "强效黑暗抗性护符",
        "Lesser Juggernaut Charm": "次级生命加成护符",
        "Greater Juggernaut Charm": "强效生命加成护符",
        "Lesser Capacitor Charm": "次级魔力加成护符",
        "Greater Capacitor Charm": "强效魔力加成护符",
        "World Seed": "世界种子",

        'Precursor Artifact' : '古遗物',
        'ManBearPig Tail' : '人熊猪的尾巴(等级2)',
        'Mithra\'s Flower' : '猫人族的花(等级2)',
        'Holy Hand Grenade of Antioch' : '安提阿的神圣手榴弹(等级2)',
        'Dalek Voicebox' : '戴立克音箱(等级2)',
        'Lock of Blue Hair' : '一绺蓝发(等级2)',
        'Bunny-Girl Costume' : '兔女郎装(等级3)',
        'Hinamatsuri Doll' : '雏人形(等级3)',
        'Broken Glasses' : '破碎的眼镜(等级3)',
        'Sapling' : '树苗(等级4)',
        'Black T-Shirt' : '黑色Ｔ恤(等级4)',
        'Unicorn Horn' : '独角兽的角(等级5)',
        'Noodly Appendage' : '面条般的附肢(等级6)',

        'Bronze Coupon' : '铜礼券(等级3)',
        'Silver Coupon' : '银礼券(等级5)',
        'Gold Coupon' : '黄金礼券(等级7)',
        'Platinum Coupon' : '白金礼券(等级8)',
        'Peerless Voucher' : '无双凭证',


        //节日及特殊奖杯
        'Mysterious Box' : '神秘宝盒(等级9)', // 在‘训练：技能推广’调整价格后赠予某些玩家。
        'Solstice Gift' : '冬至赠礼(等级7)', //  2009 冬至
        'Stocking Stuffers' : '圣诞袜小礼物(等级7)', // 2009年以来每年圣诞节礼物。
        'Tenbora\'s Box' : '天菠拉的盒子(等级9)', // 年度榜单或者年度活动奖品
        'Shimmering Present' : '微光闪动的礼品(等级8)', //  2010 圣诞节
        'Potato Battery' : '马铃薯电池(等级7)', // 《传送门 2》发售日
        'RealPervert Badge' : '真-变态胸章(等级7)', // 2011 愚人节
        'Rainbow Egg' : '彩虹蛋(等级8)', //  2011 复活节
        'Colored Egg' : '彩绘蛋(等级7)', //  2011 复活节
        'Raptor Jesus' : '猛禽耶稣(等级7)', //  哈罗德·康平的被提预言
        'Gift Pony' : '礼品小马(等级8)', // 2011 圣诞节
        'Faux Rainbow Mane Cap' : '人造彩虹鬃毛帽(等级8)', //  2012 复活节
        'Pegasopolis Emblem' : '天马族徽(等级7)', // 2012 复活节
        'Fire Keeper Soul' : '防火女的灵魂(等级8)', // 2012 圣诞节
        'Crystalline Galanthus' : '结晶雪花莲(等级8)', // 2013 复活节
        'Sense of Self-Satisfaction' : '自我满足感(等级7)', // 2013 复活节
        'Six-Lock Box' : '六道锁盒子(等级8)', // 2013 圣诞节
        'Golden One-Bit Coin' : '金色一比特硬币(等级8)', // 2014 复活节
        'USB ASIC Miner' : '随身型特定应用积体电路挖矿机(等级7)', // 2014 复活节
        'Reindeer Antlers' : '驯鹿鹿角(等级8)', // 2014 圣诞节
        'Ancient Porn Stash' : '古老的色情隐藏档案(等级8)', // 2015 复活节
        'VPS Hosting Coupon' : '虚拟专用服务器代管优惠券(等级7)', // 2015 复活节
        'Heart Locket' : '心型盒坠(等级8)', // 2015 圣诞节
        'Holographic Rainbow Projector' : '全像式彩虹投影机(等级8)', // 2016 复活节
        'Pot of Gold' : '黄金罐(等级7)', // 2016 复活节
        'Dinosaur Egg' : '恐龙蛋(等级8)', // 2016 圣诞节
        'Precursor Smoothie Blender' : '旧世界冰沙机(等级8)', // 2017 复活节
        'Rainbow Smoothie' : '彩虹冰沙(等级7)', // 2017 复活节
        'Mysterious Tooth' : '神秘的牙齿(等级8)', // 2017 圣诞节
        'Grammar Nazi Armband' : '语法纳粹臂章(等级7)', // 2018 复活节
        'Abstract Wire Sculpture' : '抽象线雕(等级8)', // 2018 复活节
        'Delicate Flower' : '娇嫩的花朵(等级8)', // 2018 圣诞节
        'Assorted Coins' : '什锦硬币(等级7)', // 2019 复活节
        'Coin Collector\'s Guide' : '硬币收藏家指南(等级8)', // 2019 复活节
        'Iron Heart' : '钢铁之心(等级8)', // 2019 圣诞节
        'Shrine Fortune' : '神社灵签(等级7)', // 2020起复活节
        'Plague Mask' : '瘟疫面具(等级8)', // 2020 复活节
        'Festival Coupon' : '节日礼券(等级7)', //2020起收获节（中秋？）
        'Annoying Gun' : '烦人的枪(等级8)', //2020 圣诞节
        'Vaccine Certificate' : '疫苗证明(等级8)', //2021 复活节
        'Barrel' : '酒桶(等级8)', //2021 圣诞节
        'CoreCare Starter Kit' : '核心服务工具套件(等级8)', //2022 复活节
        'Star Compass' : '星罗盘(等级8)', //2022 圣诞节
        'Museum Ticket' : '博物馆门票(等级8)', // 2023 复活节
        'Idol Fan Starter Pack' : '偶像粉丝入门包(等级8)', //2023 圣诞节
        'AI-Based Captcha Solver' : '人工智能验证码破解器(等级8)', //2024 复活节
        'Marten Pelt' : '貂皮(等级8)', //2024 圣诞节
        'Snowflake Bunny Girl Figure' : '雪花兔女郎玩偶(等级8)', //2025 复活节
        'Collector\'s Catalyst Cabinet' : '收藏家的催化剂陈列柜(等级8)', // 2026 复活节


        //旧旧古董
        'Priceless Ming Vase' : '无价的明朝瓷器',
        'Grue' : '格鲁',
        'Seven-Leafed Clover' : '七叶幸运草',
        'Rabbit\'s Foot' : '幸运兔脚',
        'Wirt\'s Leg' : '维特之脚',
        'Wirts Leg' : '维特之脚',
        'Shark-Mounted Laser' : '装在鲨鱼头上的激光枪',
        'BFG9000' : 'BFG9000',
        'Railgun' : '磁道炮',
        'Flame Thrower' : '火焰喷射器',
        'Small Nuke' : '小型核武',
        'Chainsaw Oil' : '电锯油',
        'Chainsaw Fuel' : '电锯燃油',
        'Chainsaw Chain' : '电锯链',
        'Chainsaw Safety Manual' : '电锯安全手册',
        'Chainsaw Repair Guide' : '电锯维修指南',
        'Chainsaw Guide Bar' : '电锯导板',
        'ASHPD Portal Gun' : '光圈科技传送门手持发射器',
        'Smart Bomb' : '炸弹机器人',
        'Tesla Coil' : '电光塔',
        'Vorpal Blade Hilt' : '斩龙剑的剑柄',
        'Crystal Jiggy' : '水晶拼图',

        //圣诞文物
        'Fiber-Optic Xmas Tree' : '光纤圣诞树',
        'Decorative Pony Sled' : '小马雪橇装饰品',
        'Hearth Warming Lantern' : '暖心节灯笼',
        'Mayan Desk Calendar' : '马雅桌历',
        'Fiber-Optic Tree of Harmony' : '光纤谐律之树',
        'Crystal Snowman' : '水晶雪人',
        'Annoying Dog' : '烦人的狗',
        'Iridium Sprinkler' : '铱制洒水器',
        'Robo Rabbit Head' : '机器兔子头',

        //复活节文物
        //2011
        'Easter Egg' : '复活节彩蛋',
        //S、N、O、W、F、L、A、K、E。
        //2012
        'Red Ponyfeather' : '红色天马羽毛',
        'Orange Ponyfeather' : '橙色天马羽毛',
        'Yellow Ponyfeather' : '黄色天马羽毛',
        'Green Ponyfeather' : '绿色天马羽毛',
        'Blue Ponyfeather' : '蓝色天马羽毛',
        'Indigo Ponyfeather' : '靛色天马羽毛',
        'Violet Ponyfeather' : '紫色天马羽毛',
        //2013
        'Twinkling Snowflake' : '闪闪发光(Twinkling)的雪花',
        'Glittering Snowflake' : '闪闪发光(Glittering)的雪花',
        'Shimmering Snowflake' : '闪闪发光(Shimmering)的雪花',
        'Gleaming Snowflake' : '闪闪发光(Gleaming)的雪花',
        'Sparkling Snowflake' : '闪闪发光(Sparkling)的雪花',
        'Glinting Snowflake' : '闪闪发光(Glinting)的雪花',
        'Scintillating Snowflake' : '闪闪发光(Scintillating)的雪花',
        //2014
        'Altcoin' : '山寨币',
        'LiteCoin' : '莱特币',
        'DogeCoin' : '多吉币',
        'PeerCoin' : '点点币',
        'FlappyCoin' : '象素鸟币',
        'VertCoin' : '绿币',
        'AuroraCoin' : '极光币',
        'DarkCoin' : '暗黑币',
        //2015
        'Ancient Server Part' : '古老的服务器零组件',
        'Server Motherboard' : '服务器主板',
        'Server CPU Module' : '服务器中央处理器模组',
        'Server RAM Module' : '服务器主内存模组',
        'Server Chassis' : '服务器机壳',
        'Server Network Card' : '服务器网络卡',
        'Server Hard Drive' : '服务器硬盘',
        'Server Power Supply' : '服务器电源供应器',
        //2016
        'Chicken Figurines' : '小鸡公仔',
        'Red Chicken Figurine' : '红色小鸡公仔',
        'Orange Chicken Figurine' : '橙色小鸡公仔',
        'Yellow Chicken Figurine' : '黄色小鸡公仔',
        'Green Chicken Figurine' : '绿色小鸡公仔',
        'Blue Chicken Figurine' : '蓝色小鸡公仔',
        'Indigo Chicken Figurine' : '靛色小鸡公仔',
        'Violet Chicken Figurine' : '紫色小鸡公仔',
        //2017
        'Ancient Fruit Smoothies' : '古老的水果冰沙',
        'Ancient Lemon' : '古代柠檬',
        'Ancient Plum' : '古代李子',
        'Ancient Kiwi' : '古代奇异果',
        'Ancient Mulberry' : '古代桑葚',
        'Ancient Blueberry' : '古代蓝莓',
        'Ancient Strawberry' : '古代草莓',
        'Ancient Orange' : '古代橙子',
        //2018
        'Aggravating Spelling Error' : '严重的拼写错误',
        'Exasperating Spelling Error' : '恼人的拼写错误',
        'Galling Spelling Error' : '恼怒的拼写错误',
        'Infuriating Spelling Error' : '激怒的拼写错误',
        'Irking Spelling Error' : '忿怒的拼写错误',
        'Vexing Spelling Error' : '烦恼的拼写错误',
        'Riling Spelling Error' : '愤怒的拼写错误',
        //2019
        'Manga Category Button' : '漫画类别按钮',
        'Doujinshi Category Button' : '同人志类别按钮',
        'Artist CG Category Button' : '画师CG类别按钮',
        'Western Category Button' : '西方类别按钮',
        'Image Set Category Button' : '图集类别按钮',
        'Game CG Category Button' : '游戏CG类别按钮',
        'Non-H Category Button' : '非H类别按钮',
        'Cosplay Category Button' : 'Cosplay类别按钮',
        'Asian Porn Category Button' : '亚洲色情类别按钮',
        'Misc Category Button' : '杂项类别按钮',
        //2020
        'Hoarded Hand Sanitizer' : '库存的洗手液',
        'Hoarded Disinfecting Wipes' : '库存的消毒湿巾',
        'Hoarded Face Masks' : '库存的口罩',
        'Hoarded Toilet Paper' : '库存的厕纸',
        'Hoarded Dried Pasta' : '库存的干面',
        'Hoarded Canned Goods' : '库存的罐头',
        'Hoarded Powdered Milk' : '库存的奶粉',
        //2021
        'Red Vaccine Vial' : '红色疫苗瓶',
        'Orange Vaccine Vial' : '橙色疫苗瓶',
        'Yellow Vaccine Vial' : '黄色疫苗瓶',
        'Green Vaccine Vial' : '绿色疫苗瓶',
        'Blue Vaccine Vial' : '蓝色疫苗瓶',
        'Indigo Vaccine Vial' : '靛色疫苗瓶',
        'Violet Vaccine Vial' : '紫色疫苗瓶',
        //2022
        'Core Carrying Bag' : '核心携带包',
        'Core Display Stand' : '核心展示架',
        'Core Ornament Set' : '核心饰品套装',
        'Core Maintenance Set' : '核心维护套装',
        'Core Wall-Mount Display' : '核心壁挂显示器',
        'Core LED Illumination' : '核心LED照明',
        //2023
        'Search Engine Crankshaft': '搜索引擎曲轴',
        'Search Engine Carburetor': '搜索引擎化油器',
        'Search Engine Piston': '搜索引擎活塞',
        'Search Engine Manifold': '搜索引擎歧管',
        'Search Engine Distributor': '搜索引擎分电器',
        'Search Engine Water Pump': '搜索引擎水泵',
        'Search Engine Oil Filter': '搜索引擎机油滤清器',
        'Search Engine Spark Plug': '搜索引擎火花塞',
        'Search Engine Valve': '搜索引擎气门',
        //2024
        'Abstract Art of Fire Hydrants': '消防栓抽象艺术品',
        'Abstract Art of Staircases': '楼梯抽象艺术品',
        'Abstract Art of Bridges': '桥梁抽象艺术品',
        'Abstract Art of Crosswalks': '斑马线抽象艺术品',
        'Abstract Art of Traffic Lights': '红绿灯抽象艺术品',
        'Abstract Art of Bicycles': '自行车抽象艺术品',
        'Abstract Art of Tractors': '拖拉机抽象艺术品',
        'Abstract Art of Busses': '公交车抽象艺术品',
        'Abstract Art of Motorcycles': '摩托车抽象艺术品',
        //2025
        "Bunny Girl: Fluffy Ear Headband": "兔女郎：毛绒耳朵头饰",
        "Bunny Girl: White Fluffy Tail": "兔女郎：白色蓬松尾巴",
        "Bunny Girl: Black Latex Top": "兔女郎：黑色乳胶上衣",
        "Bunny Girl: Black Latex Gloves": "兔女郎：黑色乳胶手套",
        "Bunny Girl: Black High Heels": "兔女郎：黑色高跟鞋",
        "Bunny Girl: Black Fishnet Stockings": "兔女郎：黑色渔网袜",
        "Bunny Girl: Black Underwear": "兔女郎：黑色内衣",
        "Bunny Girl: Choker and Bowtie": "兔女郎：项圈与领结",
        //2026
        'Wispy Catalyst (Final Edition)' : '纤小催化剂(最终版)',
        'Diluted Catalyst (Final Edition)' : '稀释催化剂(最终版)',
        'Regular Catalyst (Final Edition)' : '平凡催化剂(最终版)',
        'Robust Catalyst (Final Edition)' : '充沛催化剂(最终版)',
        'Vibrant Catalyst (Final Edition)' : '活力催化剂(最终版)',
        'Coruscating Catalyst (Final Edition)' : '闪耀催化剂(最终版)',
        '(Final Edition)' : '(最终版)',
    };

    dictItems = new Map();
    for(var i in items) {
        dictItems.set(new RegExp(i,'g'), items[i]);
    }
    return dictItems;
};

function loadEquips(){
    if (dictEquips) return dictEquips;
    //装备名
    var equips = {
        ///////////////////////////////////////////武器种类
        // 单手武器类
        'Dagger':'*匕首(单)',
        'Sword Chucks' : '*锁链双剑（单）',
        'Swordchucks' : '*锁链双剑（双）',
        'Shortsword':'短剑(单)',
        'Wakizashi':'脇差(单)',
        'Axe':'斧(单)',
        'Club':'棍(单)',
        'Rapier':'<span style=\"background:#ffa500\" >西洋剑</span>(单)',
        //双手
        'Great Mace' : '重锤(双)',
        'Scythe':'*镰刀(双)',
        'Longsword':'长剑(双)',
        'Katana':'太刀(双)',
        'Mace':'重槌(双)',
        'Estoc':'刺剑(双)',
        //法杖
        'Staff':'法杖(双)',
        //布甲
        'Cap ':'兜帽 ',
        'Cap$':'兜帽',
        'Cap/':'兜帽/',
        'Cap<':'兜帽<',
        'Robe':'长袍',
        'Gloves':'手套',
        'Pants':'短裤',
        'Shoes':'鞋',
        //轻甲
        'Helmet':'头盔',
        'Breastplate':'护胸',
        'Gauntlets':'手甲',
        'Leggings':'护腿',
        //重甲
        'Cuirass':'胸甲',
        'Power Armor':'<span style=\"background:#ffa500\" >动力</span><span style=\"background:#000000;color:#FFFFFF\" >(重)</span> 盔甲',
        'Sabatons':'铁靴',
        'Boots':'靴子',
        'Greaves':'护胫',
        //锁子甲
        'Coif' : '头巾',
        'Mitons' : '护手',
        'Hauberk' : '装甲',
        'Chausses' : '裤',

        /////////////////////////////盾或者材料,武器不会出现这个
        'Buckler':'圆盾',
        'Kite Shield':'鸢盾',
        'Tower Shield':'*塔盾',
        'Force Shield':'<span style=\"background:#ffa500\" >力场盾</span>',

        ////////////////////////材质前缀////////////////////////
        //布甲
        'Cotton':'棉质<span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        'Gossamer':'*薄纱<span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        'Silk' : '*丝绸<span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        'Ironsilk' : '*铁绸<span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        'Phase':'<span style=\"background:#ffa500\" >相位</span><span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        //轻甲
        'Leather':'皮革<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Kevlar':'*凯夫拉<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Dragon Hide' : '*龙皮<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Drakehide' : '*龙皮<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Shade':'<span style=\"background:#ffa500\" >暗影</span><span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        //重甲
        'Chainmail' : '*锁子甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Chain' : '*锁子甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Reactive' : '*反应装甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Plate':'板甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Power':'<span style=\"background:#ffa500\" >动力</span><span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        //法杖
        'Ebony':'*乌木',
        'Redwood':'红木',
        'Willow':'<span style=\"background:#ffa500\">柳木</span>',
        'Oak':'橡木',
        'Katalox':'铁木',

        ///////////////////////////////////////////防具后缀////////////////////////////////////////////
        'of Negation':'否定(抵抗)',
        'of the Shadowdancer':'影舞者(攻暴/回避)',
        'of the Arcanist':'奥术师(法命/双智)',
        'of the Fleet':'迅捷(回避)',
        'of the Fire-eater':'噬火者(火抗)',
        'of the Thunder-child':'雷之子(雷抗)',
        'of the Wind-waker':'驭风者(风抗)',
        'of the Frost-born':'冰诞者(冰抗)',
        'of the Spirit-ward':'幽冥结界(暗抗)',
        'of the Thrice-blessed':'三重祝福(圣抗)',
        'of the Stone-skinned':'硬肤者(免伤)',
        'of Dampening':'抑制(免敲)',
        'of Stoneskin':'石肤(免斩)',
        'of Deflection':'偏转(免刺)',
        'of the Nimble':'灵活(招架)',
        'of the Barrier':'屏障(格挡)',
        'of Protection':'守护(物防)',
        'of Warding':'保卫(魔防)',

        'of the Ox' :  '公牛(力量)',
        'of the Raccoon' :  '浣熊(灵巧)',
        'of the Cheetah' :  '猎豹(敏捷)',
        'of the Turtle' :  '乌龟(体质)',
        'of the Fox' :  '狐狸(智力)',
        'of the Owl' :  '夜枭(感知)',
        'of the Hulk' :  '浩克',
        'of the Shielding Aura' :  '守护光环',

        ////////////////////////////////////////////////////武器后缀/////////////////////////////////
        'of Slaughter':'<span style=\"background:#FF0000;color:#FFFFFF\" >杀戮(攻伤)</span>',
        'of Swiftness':'快速(攻速)',
        'of Balance':'平衡(攻命/攻暴)',
        'of the Battlecaster':'战法师(法命/魔耗/干涉)',
        'of the Banshee':'报丧女妖(吸灵)',
        'of the Illithid':'夺心魔(吸魔)',
        'of the Vampire':'吸血鬼(吸血)',
        'of Destruction':'<span style=\"background:#9400d3;color:#FFFFFF\" >毁灭(法伤)</span>',
        'of Surtr':'<span style=\"background:#f97c7c\" >苏尔特(火伤)</span>',
        'of Niflheim':'<span style=\"background:#94c2f5\" >尼芙菲姆(冰伤)</span>',
        'of Mjolnir':'<span style=\"background:#f4f375\" >姆乔尔尼尔(雷伤)</span>',
        'of Freyr':'<span style=\"background:#7ff97c\" >弗瑞尔(风伤)</span>',
        'of Heimdall':'<span style=\"background:#ffffff\;color:#000000\" >海姆达(圣伤)</span>',
        'of Fenrir':'<span style=\"background:#000000\;color:#ffffff" >芬里尔(暗伤)</span>',
        'of Focus':'专注(法命/魔耗/法暴)',
        'of the Elementalist':'元素使(元素)',
        'of the Heaven-sent':'天堂(神授)',
        'of the Demon-fiend':'恶魔(禁忌)',
        'of the Earth-walker':'地行者(辅助)',
        'of the Priestess':'牧师',
        'of the Curse-weaver':'咒术师(衰折)',

        ///////////////武器或者防具属性/////////////////
        'Radiant':'<span style=\"background:#ffffff\;color:#000000" >✪魔光的✪(法伤)</span>',
        'Mystic':'神秘的(法暴)',
        'Charged':'<span style=\"color:red\" >充能的(法速)</span>',
        'Amber':'<span style=\"background:#ffff00\;color:#9f9f16" >琥珀的(电抗)</span>',
        'Mithril':'<span style=\"color:red\" >秘银的(低重)</span>',
        'Agile':'俊敏的(攻速)',
        'Zircon':'<span style=\"background:#ffffff\;color:#5c5a5a" >锆石的(圣抗)</span>',
        'Frugal':'<span style=\"color:red\" >节能的(省魔)</span>',
        'Jade':'<span style=\"background:#b1f9b1\" >翡翠的(风抗)</span>',
        'Cobalt':'<span style=\"background:#a0f4f4\" >钴石的(冰抗)</span>',
        'Ruby':'<span style=\"background:#ffa6a6\" >红宝石(火抗)</span>',
        'Onyx':'<span style=\"background:#cccccc\" >缟玛瑙(暗抗)</span>',
        'Savage':'<span style=\"color:red\" >残暴的(物暴)</span>',
        'Reinforced':'加固的(减伤)',
        'Shielding':'盾化的(格挡)',
        'Arctic':'<span style=\"background:#94c2f5\" >极寒之</span>',
        'Fiery':'<span style=\"background:#f97c7c\" >灼热之</span>',
        'Shocking':'<span style=\"background:#f4f375\" >闪电之</span>',
        'Tempestuous':'<span style=\"background:#7ff97c\" >风暴之</span>',
        'Hallowed':'<span style=\"background:#ffffff\;color:#000000" >神圣之</span>',
        'Demonic':'<span style=\"background:#000000\;color:#ffffff" >恶魔之</span>',
        'Ethereal':'<span style=\"background:#ffffff\;color:#5c5a5a" >虚空之</span>',

        'Bronze ' : '铜 ',
        'Iron ' : '铁 ',
        'Silver ' : '银 ',
        'Steel ' : '钢 ',
        'Gold ' : '金 ',
        'Bronze-' : '铜-',
        'Iron-' : '铁-',
        'Silver-' : '银-',
        'Steel-' : '钢-',
        'Gold-' : '金-',
        'Platinum' : '白金',
        'Titanium' : '钛',
        'Emerald' : '祖母绿',
        'Sapphire' : '蓝宝石',
        'Diamond' : '金刚石',
        'Prism' : '光棱',
        '-trimmed' : '-镶边',
        '-adorned' : '-装饰',
        '-tipped' : '-前端',
        'Astral' : '五芒星',
        'Quintessential' : '第五元素',

        /////////////////品质//////////
        'Flimsy' : '薄弱',
        'Crude':'<span style=\"background:#acacac\" >劣质</span>',
        'Fair':'<span style=\"background:#c1c1c1\" >一般</span>',
        'Average':'<span style=\"background:#dfdfdf\" >中等</span>',
        'Superior':'<span style=\"background:#fbf9f9\" >上等</span>',
        'Fine':'<span style=\"background:#b9ffb9\" >优质</span>',
        'Exquisite':'<span style=\"background:#d7e698\" >✧精良✧</span>',
        'Magnificent':'<span style=\"background:#a6daf6\" >☆史诗☆</span>',
        'Legendary':'<span style=\"background:#ffbbff\" >✪传奇✪</span>',
        'Peerless':'<span style=\"background:#ffd760\" >☯无双☯</span>',

        /////////////////装备部位，更换装备列表用的//////////
        'Empty':'空',
        'Main Hand':'主手',
        'Off Hand':'副手',
        'Helmet':'头盔',
        'Body':'身体',
        'Hands':'手部',
        'Legs(\\W)':'腿部$1',
        'Feet(\\W)':'脚部$1',

        'Current Owner':'持有者',
    };

    dictEquips = new Map();
    for(var j in equips) {
        //此处弱化忽略词典里的of/the/-连词大小写匹配，同时将装备名中所有空格替换为为混沌的通配，忽略单词之间的所有纯HTML代码
        //这将忽略论坛里给装备名增加的颜色格式代码从而使翻译可以正确进行，同时装备信息页中被换行截断的装备名也会被正确拼接
        var vj = j.replace(/of (the )?/,'([oO]f )?([tT]he )?').replace(/-./,function(k){return '-['+k[1]+k[1].toUpperCase()+']'}).replace(/\s(.)/g,'\\s*(<[^<]+>\\s*)*$1');
        dictEquips.set(new RegExp(vj,'g'), equips[j]);
    }
    return dictEquips;
}

//论坛用的额外内容字典
function loadExtra() {
    var dict = {
        ///////////////装备类型，论坛用的
        'One-handed':'单手',
        'Two-handed':'双手',
        'One-Handed':'单手',
        'Two-Handed':'双手',
        'One Handed':'单手',
        'Two Handed':'双手',
        'Weapons?':'武器',
        '法杖s':'法杖',
        'Shields?([^a-z])':'盾$1',
        'Cloth Armor':'布甲',
        'Light Armor':'轻甲',
        'Heavy Armor':'重甲',
        'Cloth':'布',
        '([^a-z])Light([^a-z])':'$1轻$2',
        'Heavy':'重',
        //论坛里的彩虹无双品质名
        'P(<[^<]+>)+e(<[^<]+>)+e(<[^<]+>)+r(<[^<]+>)+l(<[^<]+>)+e(<[^<]+>)+s(<[^<]+>)+s':'<span style=\"background:#ffd760\" >☯无双☯</span>',

        //照顾论坛的材料列表，为了避免误翻译到装备名，皮革和布料只匹配复数（完整物品名字物品字典里有）
        'Leathers': '皮革',
        'Clothes': '布料',
        'Metals?': '金属',
        'Woods?': '木头',
        'Scraps?': '废料',
        'Low-Grade': '低级',
        'Mid-Grade': '中级',
        'High-Grade': '高级',
        //物品类型
        'Tokens' : '令牌',
        'Consumables?' : '消耗品',
        'Crystals' : '水晶',
        'Artifacts?' : '文物',
        'Materials?' : '材料',
        'Trophy' : '奖杯',
        'Monster Foods?|Foods?' : '怪物食品',
        'Monster Lab' : '怪物实验室',
        'Repair' : '维修',
        'Forge' : '锻造',
        'Obsolete' : '过时',
        'Collectables?' : '收藏品',
        'Crystal Packs?' : '水晶包',
        'Catalysts' : '催化剂',
        'Potions' : '药品',
        'Trophies' : '奖杯',
        'Shards?': '碎片',
        'Infusions?' : '魔药',
        'Scrolls?' : '卷轴',
        'Bindings?' : '粘合剂',
        'Restoratives?' : '回复品',
        'Specials?' : '特殊',
        'Pony Figurines?|Figurines' : '小马公仔',
        //修正一些论坛误翻译的东西
        '金 Star' : 'Gold Star',
        '银 Star' : 'Silver Star',
        '铜 Star' : 'Bronze Star',
        'Extra \\(力量\\)' : 'Extra Strength',
        '神圣 Warmage' : 'Divine Warmage',
        'Eminent 元素使' : 'Eminent Elementalist',
        'Thinking 兜帽' : 'Thinking Cap',
        '黑暗 Descent' : 'Dark Descent',
        '生命加成 Santa' : 'Juggernaut Santa',
        'Arcane 专注' : 'Arcane Focus',
        'Spirit 盾' : 'Spirit Shield',
        'Spike 盾' : 'Spike Shield',
        '熟练度加成 Factor' : 'Proficiency Factor',
    };
    dictExtra = new Map();
    for (var i in dict) {
        dictExtra.set(new RegExp(i,'g'), dict[i]);
    }
}
