// ==UserScript==
// @name         HV 物品装备汉化
// @namespace    hentaiverse.org
// @author       ggxxsol & mbbdzz & indefined & etc.
// @updateURL    https://sleazyfork.org/scripts/404119/code/script.meta.js
// @downloadURL  https://sleazyfork.org/scripts/404119/code/script.user.js
// @description  汉化Hentaiverse及EH论坛、HVMarket内的物品、装备及装备属性，带装备高亮/装备店隐藏锁定装备，带翻译原文切换功能。论坛购物请切换到英文原文再复制内容
// @notice       此修改版大幅度乱重构了原有脚本执行逻辑，翻译效果和兼容性有一定提升，但失去原脚本装备后缀语序倒转功能和部分物品悬浮窗窗说明汉化
// @notice       如有同时使用其它汉化，需要先于其它汉化脚本安装运行才会生效
// @notice       与HVtoolBox1.0.7以前版本在大部分装备列表和物品仓库冲突，如需同时使用请更新到新版HVtoolBox并将汉化脚本运行顺序放在HVtoolBox后
// @notice       与Live Percentile Ranges在装备详情页冲突，默认不在装备信息页启用，如需包含可在脚本管理器设置中将原始排除添加为用户包含或者将下方对应@exclude改为@include
// @notice       如与其它脚本同时使用冲突，可尝试调整脚本运行顺序，但无法保证完全兼容，或者将冲突的页面链接添加用户排除(@exclude)
// @notice       如果你要在论坛买东西，挑好东西之后最好切换到原文再复制内容，因为别人并不一定看得懂经过翻译过后的东西
// @icon         https://hentaiverse.org/y/favicon.png
// @include      *://hentaiverse.org/*
// @include      *://alt.hentaiverse.org/*
// @exclude      *://*hentaiverse.org/*equip/*
// @exclude      *://*hentaiverse.org/*pages/showequip.php?*
// @include      *://forums.e-hentai.org/*showtopic=*
// @include      *://hvmarket.xyz/*
// @include      *://reasoningtheory.net/*
// @version      2024.04.04
// ==/UserScript==

if (document.location.href.match(/ss=iw/)&&!document.getElementById('item_pane'))return
if (document.getElementById('riddlemaster')||document.getElementById('textlog')) return;

// 切换原文使用的变量
var translatedList = new Map(), translated = true, changer;

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
    ];
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
            /*//在这一行前面加//可以同时汉化部分物品悬浮窗说明，但是与HVToolbox冲突
            translateItems(".itemlist>tbody>tr>td");
            translateItems(".sa>div:last-child");
            /*///下面两行只会翻译物品名称
            translateItems(".itemlist>tbody>tr>td>div");
            translateItems(".sa>div:last-child>div");
            //*/
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
            loadEquipsInfo(); //加载装备信息字典
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
                html = translate(html, dictEquipsInfo); //翻译装备属性
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
                //左侧的装备详细面板
                translateEquipsInfo('#equip_extended');
                //右侧可强化项目
                translateEquipsInfo('#rightpane>div tr[onmouseover]>td:first-child>.fc2');
                //强化项目的说明文字
                translateEquipsInfo('#rightpane>div[id^="costpane"]>div :first-child>.fc2');
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
            translateEquipsInfo("#lottery_eqstat");
            break;

        case 13: //装备属性页
            translateEquips('#showequip>div:not([id])');//装备名
            translateEquipsInfo('#equip_extended');//装备详细信息
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

        default: //没有匹配命中需要翻译的网页
            break;
    }

    if (translatedList.size) {
        initRestore();//原文切换按钮
    }
}

//原文切换
function restore() {
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
    translateEquips(".equiplist div[id^='e'][onmouseover]");
    translateEquips(".hvut-eq-h5");
    translateEquips(".eqb>div");
}

//翻译装备名。参数: 待翻译的页面元素css选择器
function translateEquips(selector){
    if(!selector) return;
    if (!dictEquips) loadEquips();//加载字典
    //查找页面元素并调用翻译
    Array.from(document.querySelectorAll(selector)).forEach(elem=>translate(elem, dictEquips));
}

//翻译装备属性信息
function translateEquipsInfo(selector){
    if(!selector) return;
    if (!dictEquipsInfo) loadEquipsInfo();
    Array.from(document.querySelectorAll(selector)).forEach(elem=>translate(elem, dictEquipsInfo));
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
        'Binding of the Owl':  '粘合剂 智慧',
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
        'Crystal of Knowledge' : '智慧水晶',
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



        //药品解释
        'Provides a long-lasting health restoration effect.' : '持续回复2%的基础HP,持续50回合.',
        'Instantly restores a large amount of health.' : '立刻回复100%的基础HP.',
        'Fully restores health, and grants a long-lasting health restoration effect.' : 'HP全满,持续100回合2%的基础HP.',
        'Provides a long-lasting mana restoration effect.' : '持续50回合回复1%的基础MP.',
        'Instantly restores a moderate amount of mana.' : '立刻回复50%的基础MP.',
        'Fully restores mana, and grants a long-lasting mana restoration effect.' : 'MP全满,持续100回复1%的基础MP.',
        'Provides a long-lasting spirit restoration effect.' : '持续50回复1%的基础SP.',
        'Instantly restores a moderate amount of spirit.' : '立刻回复50%的基础SP.',
        'Fully restores spirit, and grants a long-lasting spirit restoration effect.' : 'SP全满,持续100回合回复1%的基础SP.',
        'Fully restores all vitals, and grants long-lasting restoration effects.' : '状态全满,产生所有回复药水的效果.',
        'Restores 10 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for ten turns.' : '可在战斗中使用,请在战斗道具栏设置,恢复10点精力，但不超过99。战斗时使用时,每回合增加10%的灵力和Overcharge.',
        //魔药解释
        'You gain +25% resistance to Fire elemental attacks and do 25% more damage with Fire magicks.' : '你获得 +25% 的火系魔法耐性且获得 25% 的额外火系魔法伤害。',
        'You gain +25% resistance to Cold elemental attacks and do 25% more damage with Cold magicks.' : '你获得 +25% 的冰冷魔法耐性且获得 25% 的额外冰系魔法伤害。',
        'You gain +25% resistance to Elec elemental attacks and do 25% more damage with Elec magicks.' : '你获得 +25% 的雷系魔法耐性且获得 25% 的额外雷系魔法伤害。',
        'You gain +25% resistance to Wind elemental attacks and do 25% more damage with Wind magicks.' : '你获得 +25% 的风系魔法耐性且获得 25% 的额外风系魔法伤害。',
        'You gain +25% resistance to Holy elemental attacks and do 25% more damage with Holy magicks.' : '你获得 +25% 的神圣魔法耐性且获得 25% 的额外神圣魔法伤害。',
        'You gain +25% resistance to Dark elemental attacks and do 25% more damage with Dark magicks.' : '你获得 +25% 的黑暗魔法耐性且获得 25% 的额外黑暗魔法伤害。',
        //卷轴解释
        'Grants the Haste effect.' : '使用产生加速效果。',
        'Grants the Protection effect.' : '使用产生保护效果。',
        'Grants the Haste and Protection effects.with twice the normal duration.' : '产生加速和保护的效果。两倍持续时间',
        'Grants the Absorb effect.' : '使用后获得吸收效果。',
        'Grants the Shadow Veil effect.' : '使用产生闪避效果。',
        'Grants the Spark of Life effect.' : '使用产生生命火花效果。',
        'Grants the Absorb, Shadow Veil and Spark of Life effects with twice the normal duration.' : '同时产生吸收，闪避，以及生命火花效果,两倍持续时间.',

        //物品说明
        'Various bits and pieces of scrap cloth. These can be used to mend the condition of an equipment piece.' : '各种零碎的布料，用于修复装备',
        'Various bits and pieces of scrap leather. These can be used to mend the condition of an equipment piece.' : '各种零碎的皮革，用于修复装备',
        'Various bits and pieces of scrap metal. These can be used to mend the condition of an equipment piece.' : '各种零碎的金属，用于修复装备',
        'Various bits and pieces of scrap wood. These can be used to mend the condition of an equipment piece.' : '各种零碎的木材，用于修复装备',
        'Some materials scavenged from fallen adventurers by a monster. Required to reforge and upgrade cloth armor.' : '一些从怪物身上收集到的材料，用于升级布甲',
        'Some materials scavenged from fallen adventurers by a monster. Required to reforge and upgrade staffs and shields.' : '一些从怪物身上收集到的材料，用于升级法杖和盾牌',
        'Some materials scavenged from fallen adventurers by a monster. Required to reforge and upgrade heavy armor and weapons' : '一些从怪物身上收集到的材料，用于升级重甲和武器',
        'Some materials scavenged from fallen adventurers by a monster. Required to reforge and upgrade light armor' : '一些从怪物身上收集到的材料，用于升级轻甲',
        'A cylindrical object filled to the brim with arcano-technological energy. Required to restore advanced armor and shields to full condition.' : '一个边缘充斥着神秘科技能量的圆柱形物体，用于修复高级护甲和盾牌',
        'Some materials scavenged from fallen adventurers by a monster. Required to upgrade equipment bonuses to' : '从怪物身上收集的材料，用于升级装备的',
        'A small vial filled with a catalytic substance necessary for upgrading and repairing equipment in the forge. This is permanently consumed on use.' : '一个装着升级与修复装备必须的催化剂的小瓶子，每使用一次就会消耗一个',
        'When used with a weapon, this shard will temporarily imbue it with the' : '当用在一件装备上时，会临时给予装备',
        'When used with an equipment piece, this shard will temporarily imbue it with the' : '当用在一件装备上时，会临时给予装备',
        'Can be used to reset the unlocked potencies and experience of an equipment piece.' : '可以用于重置装备的潜能等级',
        'Suffused Aether enchantment' : '弥漫的以太的附魔效果',
        'Featherweight Charm enchantment' : '轻如鸿毛的附魔效果',
        'Voidseeker' : '虚空探索者',
        's Blessing enchantment' : '的祝福的附魔效果',
        'These fragments can be used in the forge to permanently soulfuse an equipment piece to you, which will make it level as you do.' : '这个碎片可以将一件装备与你灵魂绑定，灵魂绑定的装备会随着你的等级一同成长。',
        'You can fuse this crystal with a monster in the monster tab to increase its' : '你可以用这种水晶在怪物实验室里面为一个怪物提升它的',
        'Strength\\.' : '力量',
        'Dexterity\\.' : '灵巧',
        'Agility\\.' : '敏捷',
        'Endurance\\.' : '体质',
        'Intelligence\\.' : '智力',
        'Wisdom\\.' : '智慧',
        'Fire Resistance' : '火属性抗性',
        'Cold Resistance' : '冰属性抗性',
        'Electrical Resistance' : '电属性抗性',
        'Wind Resistance' : '风属性抗性',
        'Holy Resistance' : '圣属性抗性',
        'Dark Resistance' : '暗属性抗性',
        'Non-discerning monsters like to munch on this chow.' : '不挑食的初级怪物喜欢吃这种食物',
        'Mid-level monsters like to feed on something slightly more palatable, like these scrumptious edibles.' : '中级怪物喜欢吃更好吃的食物，比如这种',
        'High-level monsters would very much prefer this highly refined level of dining if you wish to parlay their favor.' : '如果你想受高等级怪物的青睐的话，请喂它们吃这种精致的食物吧',
        'Tiny pills filled with delicious artificial happiness. Use on monsters to restore morale if you cannot keep them happy. It beats leaving them sad and miserable.' : '美味的人造药丸，满溢着的幸福，没法让怪物开心的话，就用它来恢复怪物的士气，赶走怪物的悲伤和沮丧吧',
        'An advanced technological artifact from an ancient and long-lost civilization. Handing these in at the Shrine of Snowflake will grant you a reward.' : '一个发达古文明的技术结晶，把它交给雪花神殿的雪花女神来获得你的奖励',
        'You can exchange this token for the chance to face a legendary monster by itself in the Ring of Blood.' : '你可以用这些令牌在浴血擂台里面换取与传奇怪物对阵的机会',
        'You can use this token to unlock monster slots in the Monster Lab, as well as to upgrade your monsters.' : '你可以用这些令牌开启额外的怪物实验室槽位，也可以升级你的怪物',
        'A sapling from Yggdrasil, the World Tree' : '一棵来自世界树的树苗',
        'A plain black 100% cotton T-Shirt. On the front, an inscription in white letters reads' : '一件平凡无奇的100%纯棉T恤衫，在前面用白色的字母写着',
        'I defeated Real Life, and all I got was this lousy T-Shirt.' : '战胜了现实后，我就得到了这么一件恶心的T恤衫',
        'No longer will MBP spread havoc, destruction, and melted polar ice caps.' : '不会再有人熊猪扩散浩劫、破坏、和融化的极地冰帽了。',
        'You found this item in the lair of a White Bunneh. It appears to be a dud.' : '这似乎是你在一只杀人兔的巢穴里发现的一颗未爆弹。',
        'A Lilac flower given to you by a Mithra when you defeated her. Apparently, this type was her favorite.' : '击败小猫娘后她送你的紫丁香。很显然这品种是她的最爱。',
        'Taken from the destroyed remains of a Dalek shell.' : '从戴立克的残骸里取出来的音箱。',
        'Given to you by Konata when you defeated her. It smells of Timotei.' : '击败泉此方后获得的蓝发。闻起来有 Timotei 洗发精的味道',
        'Given to you by Mikuru when you defeated her. If you wear it, keep it to yourself.' : '击败朝比奈实玖瑠后获得的兔女郎装。不要告诉别人你有穿过。',
        'Given to you by Ryouko when you defeated her. You decided to name it Achakura, for no particular reason.' : '击败朝仓凉子后获得的人形。你决定取名叫朝仓，这没什么特别的理由。',
        'Given to you by Yuki when you defeated her. She looked better without them anyway.' : '击败长门有希后获得的眼镜。她不戴眼镜时看起来好多了。',
        'An Invisible Pink' : '从隐形粉红独角兽头上取下来的',
        'taken from the Invisible Pink Unicorn.' : ' ',
        'It doesn&amp;#039;t weigh anything and has the consistency of air' : '它很像空气一样轻，几乎没有重量',
        'but you&amp;#039;re quite sure it&amp;#039;s real' : '但是你很确定它是真实存在的',
        'A nutritious pasta-based appendage from the Flying Spaghetti Monster.' : '一条用飞行意大利面怪物身上的面团做成的营养附肢。',
        'You found these in your Xmas stocking when you woke up. Maybe Snowflake will give you something for them.' : '你醒来时,在你的圣诞袜里发现这些东西。说不定用它可以和雪花女神交换礼物。',
        'This box is said to contain an item of immense power. You should get Snowflake to open it.' : '传说此盒子封印了一件拥有巨大力量的装备。你应该找雪花女神去打开它。',
        'A 1/10th scale figurine of Twilight Sparkle, the cutest, smartest, all-around best pony. According to Pinkie Pie, anyway.' : 'NO.1 暮光闪闪的 1/10 比例缩放公仔。最可爱、最聪明，最全能的小马。(根据萍琪的说法，嗯…) ',
        'A 1/10th scale figurine of Rainbow Dash, flier extraordinaire. Owning this will make you about 20% cooler, but it probably took more than 10 seconds to get one.' : 'NO.2 云宝黛西的 1/10 比例缩放公仔。杰出的飞行员。拥有这个公仔可以让你多酷大约 20%，但为了得到她你得多花 10 秒！ ',
        'A 1/10th scale figurine of Applejack, the loyalest of friends and most dependable of ponies. Equestria&amp;#039;s best applebucker, and founder of Appleholics Anonymous.' : 'NO.3 苹果杰克的 1/10 比例缩放公仔。最忠诚的朋友，最可靠的小马。阿奎斯陲亚最好的苹果采收员，同时也是苹果农庄的创始马。 ',
        'A 1/10th scale figurine of Fluttershy, resident animal caretaker. You&amp;#039;re going to love her. Likes baby dragons; Hates grown up could-eat-a-pony-in-one-bite dragons.' : 'NO.4 小蝶的 1/10 比例缩放公仔。小马镇动物的褓姆，大家都喜爱她。喜欢幼龙；讨厌能一口吞掉小马的大龙。 ',
        'A 1/10th scale figurine of Pinkie Pie, a celebrated connoisseur of cupcakes and confectioneries. She just wants to keep smiling forever.' : 'NO.5 萍琪的 1/10 比例缩放公仔。一位著名的杯子蛋糕与各式饼干糖果的行家。她只想让大家永远保持笑容。 ',
        'A 1/10th scale figurine of Rarity, the mistress of fashion and elegance. Even though she&amp;#039;s prim and proper, she could make it in a pillow fight.' : 'NO.6 瑞瑞的 1/10 比例缩放公仔。时尚与品味的的女主宰。她总是能在枕头大战中保持拘谨矜持。 ',
        'A 1/10th scale figurine of The Great and Powerful Trixie. After losing her wagon, she now secretly lives in the Ponyville library with her girlfriend, Twilight Sparkle.' : 'NO.7 崔克茜的 1/10 比例缩放公仔。伟大的、法力无边的崔克茜。失去她的篷车后，她现在偷偷的与她的女友暮光闪闪住在小马镇的图书馆中。 ',
        'A 1/10th scale figurine of Princess Celestia, co-supreme ruler of Equestria. Bored of the daily squabble of the Royal Court, she has recently taken up sock swapping.' : 'NO.8 塞拉斯提娅公主的 1/10 比例缩放公仔。阿奎斯陲亚大陆的最高统治者。对每日的皇家争吵感到无聊，她近日开始穿上不成对的袜子。 ',
        'A 1/10th scale figurine of Princess Luna, aka Nightmare Moon. After escaping her 1000 year banishment to the moon, she was grounded for stealing Celestia&amp;#039;s socks.' : 'NO.9 露娜公主的 1/10 比例缩放公仔。又名梦靥之月。在结束了一千年的放逐后，她从月球回到阿奎斯陲亚偷走了塞拉斯提娅的袜子。 ',
        'A 1/10th scale figurine of Apple Bloom, Applejack&amp;#039;s little sister. Comes complete with a &amp;quot;Draw Your Own Cutie Mark&amp;quot; colored pencil and permanent tattoo applicator set.' : 'NO.10 小萍花的 1/10 比例缩放公仔。苹果杰克的小妹。使用了“画出妳自己的可爱标志”彩色铅笔与永久纹身组后，生命更加的完整了。 ',
        'A 1/10th scale figurine of Scootaloo. Die-hard Dashie fanfilly, best pony of the Cutie Mark Crusaders, and inventor of the Wingboner Propulsion Drive. 1/64th chicken.' : 'NO.11 飞板露的 1/10 比例缩放公仔。云宝黛西的铁杆年轻迷妹，可爱标志十字军中最棒的小马，以及蠢翅动力推进系统的发明者。有 1/64 的组成成分是鲁莽。 ',
        'A 1/10th scale figurine of Sweetie Belle, Rarity&amp;#039;s little sister. Comes complete with evening gown and cocktail dress accessories made of 100% Dumb Fabric.' : 'NO.12 甜贝儿的 1/10 比例缩放公仔。瑞瑞的小妹。在穿上 100% 蠢布料制成的晚礼服与宴会短裙后更加完美了。 ',
        'A 1/10th scale figurine of Big Macintosh, Applejack&amp;#039;s older brother. Famed applebucker and draft pony, and an expert in applied mathematics.' : 'NO.13 大麦克的 1/10 比例缩放公仔。苹果杰克的大哥。有名的苹果采收员和大力马，同时也是实用数学的专家。 ',
        'A 1/10th scale figurine of Spitfire, team leader of the Wonderbolts. Dashie&amp;#039;s idol and occasional shipping partner. Doesn&amp;#039;t actually spit fire.' : 'NO.14 爆火的 1/10 比例缩放公仔。惊奇闪电的领导者。云宝黛西的偶像和临时飞行搭档。实际上不会吐火。 ',
        'A 1/10th scale figurine of Derpy Hooves, Ponyville&amp;#039;s leading mailmare. Outspoken proponent of economic stimulus through excessive muffin consumption.' : 'NO.15 小呆的 1/10 比例缩放公仔。小马镇上重要的邮差马。直言不讳的主张以大量食用马芬的方式来刺激经济。 ',
        'A 1/10th scale figurine of Lyra Heartstrings. Features twenty-six points of articulation, replaceable pegasus hoofs, and a detachable unicorn horn.' : 'NO.16 天琴心弦的 1/10 比例缩放公仔。拥有 26 个可动关节，可更换的飞马蹄与一个可拆卸的独角兽角是其特色。 ',
        'A 1/10th scale figurine of Octavia. Famous cello musician; believed to have created the Octatonic scale, the Octahedron, and the Octopus.' : 'NO.17 奥塔维亚的 1/10 比例缩放公仔。著名的大提琴家；据信创造了八度空间、八面体以及章鱼。 ',
        'A 1/10th scale figurine of Zecora, a mysterious zebra from a distant land. She&amp;#039;ll never hesitate to mix her brews or lend you a hand. Err, hoof.' : 'NO.18 泽科拉的 1/10 比例缩放公仔。一位来自远方的神秘斑马。她会毫不迟疑的搅拌她的魔药或助你一臂之力。呃，我是说一蹄之力… ',
        'A 1/10th scale figurine of Cheerilee, Ponyville&amp;#039;s most beloved educational institution. Your teachers will never be as cool as Cheerilee.' : 'NO.19 车厘子的 1/10 比例缩放公仔。小马镇最有爱心的教育家。你的老师绝对不会像车厘子这么酷的！ ',
        'A 1/10th scale bobblehead figurine of Vinyl Scratch, the original DJ P0n-3. Octavia&amp;#039;s musical rival and wub wub wub interest.' : 'NO.20 维尼尔的 1/10 比例缩放摇头公仔。是 DJ P0n-3 的本名。为奥塔维亚在音乐上的对手，喜欢重低音喇叭。 ',
        'A 1/10th scale figurine of Daring Do, the thrill-seeking, action-taking mare starring numerous best-selling books. Dashie&amp;#039;s recolor and favorite literary character.' : 'NO.21 天马无畏的 1/10 比例缩放公仔。追寻刺激，有如动作片主角一般的小马，为一系列畅销小说的主角。是云宝黛西最喜欢的角色，也是带领她进入阅读世界的原因。 ',
        'A 1/10th scale figurine of Doctor Whooves. Not a medical doctor. Once got into a hoof fight with Applejack over a derogatory remark about apples.' : 'NO.22 神秘博士的 1/10 比例缩放公仔。不是医生。曾经与苹果杰克陷入一场因贬低苹果的不当发言而产生的蹄斗。 ',
        'A 1/10th scale figurine of Berry Punch. Overly protective parent pony and Ponyville&amp;#039;s resident lush. It smells faintly of fruit wine.' : 'NO.23 酸梅酒的 1/10 比例缩放公仔。有过度保护倾向的小马，也是小马镇的万年酒鬼。闻起来有淡淡水果酒的气味。 ',
        'A 1/10th scale figurine of Bon-Bon. Usually seen in the company of Lyra. Suffers from various throat ailments that make her sound different every time you see her.' : 'NO.24 糖糖的 1/10 比例缩放公仔。常常被目击与天琴心弦在一起。患有许多呼吸道相关的疾病，使你每次遇到她的时候她的声音都不同。 ',
        'A 1/10th scale fluffy figurine of Fluffle Puff. Best Bed Forever.' : 'NO.25 毛毛小马 1/10 比例缩放的毛茸茸玩偶。让你想要永远躺在上面。 ',
        'A lifesize figurine of Angel Bunny, Fluttershy&amp;#039;s faithful yet easily vexed pet and life partner. All-purpose assistant, time keeper, and personal attack alarm.' : 'NO.26 天使兔的等身大玩偶。为小蝶忠实且易怒的宠物及伴侣。万能助理、报时器、受到人身攻击时的警报器。 ',
        'A lifesize figurine of Gummy, Pinkie Pie&amp;#039;s faithful pet. Usually found lurking in your bathtub. While technically an alligator, he is still arguably the best pony.' : 'NO.27 甘米的等身大玩偶。是萍琪的忠实宠物。经常被发现潜伏在你的浴缸里。虽然技术上是只短吻鳄，但它仍然可以称得上是最棒的小马。 ',
        'Some materials scavenged from fallen adventurers by a monster' : '从被击败的冒险者身上收集来的材料',
        'Required to reforge Phase Armor' : '用于强化相位甲',
        'Required to reforge Shade Armor' : '用于强化暗影甲',
        'Required to reforge Power Armor' : '用于强化动力甲',
        'Required to reforge Force Shields' : '用于强化力场盾',
        'Physical Base Damage' : '(物理伤害)',
        'Physical Hit Chance' : '(物理命中率)',
        'Magical Base Damage' : '(魔法伤害)',
        'Magical Hit Chance' : '(魔法命中率)',
        'Physical Defense' : '(物理减伤)',
        'Magical Defense' : '(魔法减伤)',
        'Evade Chance' : '(回避率)',
        'Block Chance' : '(格挡率)',
        'Parry Chance' : '(招架率)',
        'Elemental Magic Proficiency' : '(元素熟练)',
        'Divine Magic Proficiency' : '(圣熟练)',
        'Forbidden Magic Proficiency' : '(暗熟练)',
        'Deprecating Magic Proficiency' : '(减益熟练)',
        'Supportive Magic Proficiency' : '(增益熟练)',
        'Fire Spell Damage' : '(火焰法术伤害)',
        'Cold Spell Damage' : '(冰霜法术伤害)',
        'Elec Spell Damage' : '(闪电法术伤害)',
        'Wind Spell Damage' : '(狂风法术伤害)',
        'Holy Spell Damage' : '(神圣法术伤害)',
        'Dark Spell Damage' : '(黑暗法术伤害)',
        'Crushing Mitigation' : '(敲击减伤)',
        'Slashing Mitigation' : '(斩击减伤)',
        'Piercing Mitigation' : '(刺击减伤)',
        'Fire Mitigation' : '(火焰减伤)',
        'Cold Mitigation' : '(冰霜减伤)',
        'Elec Mitigation' : '(闪电减伤)',
        'Wind Mitigation' : '(狂风减伤)',
        'Holy Mitigation' : '(神圣减伤)',
        'Dark Mitigation' : '(黑暗减伤)',
        'Strength' : '(力量)',
        'Dexterity' : '(灵巧)',
        'Agility' : '(敏捷)',
        'Endurance' : '(体质)',
        'Intelligence' : '(智力)',
        'Wisdom' : '(智慧)',
        'Magical Mitigation' : '(魔法减伤)',
        'Resist Chance' : '(抵抗率)',
        'Physical Crit Chance' : '(物理暴击率)',
        'Magical Crit Chance' : '(魔法暴击率)',

        //物品类型，悬浮窗onmouseover参数自带一层单引号
        "'Consumable'" : "'消耗品'",
        "'Crystal'" : "'水晶'",
        "'Monster Food'" : "'怪物食品'",
        "'Token'" : "'令牌'",
        "'Trophy'" : "'奖杯'",
        "'Artifact'" : "'文物'",
        "'Material'" : "'材料'",
        "'Collectable'" : "'收藏品'",
    };

    dictItems = new Map();
    for(var i in items) {
        dictItems.set(new RegExp(i,'g'), items[i]);
    }
    return dictItems;
};

function loadEquipsInfo(){
    if (dictEquipsInfo) return dictEquipsInfo;
    //装备信息字典
    var equipsInfo = {
        /////////////////////////////////装备属性
        'One-handed Weapon':'单手武器',
        'Two-handed Weapon':'双手武器',
        '>Staff ':'>法杖 ',
        '>Shield ':'>盾牌 ',
        'Cloth Armor':'布甲',
        'Light Armor':'轻甲',
        'Heavy Armor':'重甲',

        'Condition:':'耐久:',
        'Untradeable':'不可交易',
        'Tradeable':'可交易',
        'Level ':'等级 ',
        'Soulbound':'灵魂绑定',
        'Unassigned':'未确定',
        'Potency Tier':'潜能等级',
        'MAX' : '已满',

        'Ether Tap':'魔力回流',
        'Bleeding Wound':'流血',
        'Penetrated Armor':'破甲',
        'Stunned':'眩晕',
        'Siphon Spirit':'灵力吸取',
        'Siphon Magic':'魔力吸取',
        'Siphon Health':'生命吸取',
        'Ether Theft':'魔力回流',
        'Lasts for':'持续',
        'chance - ':'几率 - ',
        ' turns':' 回合',
        ' turn<':' 回合<',
        ' turn /':' 回合 /',
        'points drained':'点吸取量',
        'base drain':'基础吸取量',
        'DOT':'持续伤害比例',

        'Elemental Strike':'属性攻击',
        'Fire Strike':'火焰冲击',
        'Cold Strike':'冰霜冲击',
        'Elec Strike':'闪电冲击',
        'Wind Strike':'狂风冲击',
        'Holy Strike':'神圣冲击',
        'Dark Strike':'黑暗冲击',
        'Void Strike':'虚空冲击',

        'Damage Mitigations':'伤害减免',
        'Spell Damage':'法术伤害加成',
        'Fire ':'火焰 ',
        'Cold ':'冰霜 ',
        'Elec ':'闪电 ',
        'Wind ':'狂风 ',
        'Holy ':'神圣 ',
        'Dark ':'黑暗 ',
        'Void ':'虚空 ',
        'Crushing':'敲击',
        'Piercing':'刺击',
        'Slashing':'斩击',

        'Magic Crit Chance':'魔法暴击率',
        'Attack Crit Chance':'物理暴击率',
        'Attack Accuracy':'物理命中',
        'Attack Critical':'物理暴击',
        'Attack Damage':'物理伤害',
        'Parry Chance':'招架率',
        'Magic Damage':'魔法伤害',
        'Magic Critical':'魔法暴击',
        'Mana Conservation':'魔力消耗减免',
        'Counter-Resist':'反抵抗',
        'Physical Mitigation':'物理减伤',
        'Magical Mitigation':'魔法减伤',
        'Block Chance':'格挡率',
        'Evade Chance':'回避率',
        'Casting Speed':'施法速度',
        'Resist Chance':'抵抗率',
        'Spell Crit':'法术暴击',
        'Attack Crit Damage':'物理爆击伤害',
        'Magic Accuracy':'魔法命中',
        'Counter-Parry':'反招架',
        'Attack Speed':'攻击速度',
        'MP Bonus':'魔力加成',
        'HP Bonus':'体力加成',
        'Burden':'负重',
        'Interference':'干涉',

        'Proficiency':'熟练度加成',
        '>Elemental ':'>元素 ',
        'Divine':'神圣',
        'Forbidden':'黑暗',
        'Deprecating':'减益',
        'Supportive':'增益',

        'Primary Attributes':'属性加成',
        'Strength':'力量',
        'Dexterity':'灵巧',
        'Agility':'敏捷',
        'Endurance':'体质',
        'Intelligence':'智力',
        'Wisdom':'智慧',

        'Upgrades and Enchantments':'强化与附魔',
        'None':'无',
        'Physical':'物理',
        'Magical':'魔法',
        'Damage':'伤害',
        'Defense':'防御',
        'Mitigation':'减伤',
        'Hit Chance':'命中率',
        'Crit Chance':'暴击率',
        'Bonus Lv':'加成 Lv',
        'Bonus<':'加成<',

        'Capacitor':'魔力加成',
        'Juggernaut':'生命加成',
        'Butcher':'武器伤害加成',
        'Fatality':'攻击暴击伤害',
        'Overpower':'反招架',
        'Swift Strike':'迅捷打击',
        'Annihilator':'魔法暴击伤害',
        'Archmage':'魔法伤害加成',
        'Economizer':'魔力消耗减免',
        'Penetrator':'反魔法抵抗',
        'Spellweaver':'高速咏唱',
        'Hollowforged':'虚空升华',

        'Coldproof':'抗寒',
        'Darkproof':'驱暗',
        'Elecproof':'绝缘',
        'Fireproof':'耐热',
        'Holyproof':'驱圣',
        'Windproof':'防风',

        'Suffused Aether' : '弥漫的以太',
        'Featherweight Charm' : '轻如鸿毛',
        'Voidseeker\'s Blessing':'虚空探索者的祝福',

        'Infused Flames':'火焰附魔',
        'Infused Frost':'冰霜附魔',
        'Infused Lightning':'雷电附魔',
        'Infused Storms?':'风暴附魔',
        'Infused Divinity':'神圣附魔',
        'Infused Darkness':'黑暗附魔',

    };

    dictEquipsInfo = new Map();
    for(var k in equipsInfo) {
        dictEquipsInfo.set(RegExp(k,'g'), equipsInfo[k]);
    }
    return dictEquipsInfo;
}

function loadEquips(){
    if (dictEquips) return dictEquips;
    //装备名
    var equips = {
        ///////////////////////////////////////////武器种类
        // 单手武器类
        'Dagger':'*匕首（单）',
        'Sword Chucks' : '*锁链双剑（单）',
        'Shortsword':'短剑（单）',
        'Wakizashi':'脇差（单）',
        'Axe':'斧（单）',
        'Club':'棍（单）',
        'Rapier':'<span style=\"background:#ffa500\" >西洋剑</span>（单）',
        //双手
        'Scythe':'*镰刀（双）',
        'Longsword':'长剑（双）',
        'Katana':'太刀（双）',
        'Mace':'重槌（双）',
        'Estoc':'刺剑（双）',
        //法杖
        'Staff':'法杖',
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
        'Armor':'盔甲',
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
        'Phase':'<span style=\"background:#ffa500\" >相位</span><span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        //轻甲
        'Leather':'皮革<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Kevlar':'*凯夫拉<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Dragon Hide' : '*龙皮<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Shade':'<span style=\"background:#ffa500\" >暗影</span><span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        //重甲
        'Chainmail' : '*锁子甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Plate':'板甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Power':'<span style=\"background:#ffa500\" >动力</span><span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        //法杖
        'Ebony':'*乌木',
        'Redwood':'红木',
        'Willow':'柳木',
        'Oak':'橡木',
        'Katalox':'铁木',

        ///////////////////////////////////////////防具后缀////////////////////////////////////////////
        'of Negation':'否定',
        'of the Shadowdancer':'影舞者',
        'of the Arcanist':'奥术师',
        'of the Fleet':'迅捷',
        'of the Fire-eater':'噬火者',
        'of the Thunder-child':'雷之子',
        'of the Wind-waker':'风之杖',
        'of the Frost-born':'冰人',
        'of the Spirit-ward':'灵魂护佑',
        'of the Thrice-blessed':'三重祝福',
        'of the Stone-skinned':'硬皮',
        'of Dampening':'抑制',
        'of Stoneskin':'石肤',
        'of Deflection':'偏转',
        'of the Nimble':'招架',
        'of the Barrier':'格挡',
        'of Protection':'物防',
        'of Warding':'魔防',

        'of the Ox' :  '牛（力量）',
        'of the Raccoon' :  '浣熊（灵巧）',
        'of the Cheetah' :  '猎豹（敏捷）',
        'of the Turtle' :  '乌龟（体质）',
        'of the Fox' :  '狐狸（智力）',
        'of the Owl' :  '猫头鹰（智慧）',
        'of the Hulk' :  '浩克',
        'of the Shielding Aura' :  '守护光环',

        ////////////////////////////////////////////////////武器后缀/////////////////////////////////
        'of Slaughter':'<span style=\"background:#FF0000;color:#FFFFFF\" >杀戮</span>',
        'of Swiftness':'加速',
        'of Balance':'平衡',
        'of the Battlecaster':'战法师',
        'of the Banshee':'报丧女妖',
        'of the Illithid':'灵吸怪',
        'of the Vampire':'吸血鬼',
        'of Destruction':'<span style=\"background:#9400d3;color:#FFFFFF\" >毁灭</span>',
        'of Surtr':'<span style=\"background:#f97c7c\" >苏尔特（火伤）</span>',
        'of Niflheim':'<span style=\"background:#94c2f5\" >尼芙菲姆（冰伤）</span>',
        'of Mjolnir':'<span style=\"background:#f4f375\" >姆乔尔尼尔（雷伤）</span>',
        'of Freyr':'<span style=\"background:#7ff97c\" >弗瑞尔（风伤）</span>',
        'of Heimdall':'<span style=\"background:#ffffff\;color:#000000\" >海姆达（圣伤）</span>',
        'of Fenrir':'<span style=\"background:#000000\;color:#ffffff" >芬里尔（暗伤）</span>',
        'of Focus':'专注',
        'of the Elementalist':'元素使',
        'of the Heaven-sent':'天堂',
        'of the Demon-fiend':'恶魔',
        'of the Earth-walker':'地行者',
        'of the Priestess':'牧师',
        'of the Curse-weaver':'咒术师',

        ///////////////武器或者防具属性/////////////////
        'Radiant':'<span style=\"background:#ffffff\;color:#000000" >✪魔光✪</span>',
        'Mystic':'神秘的',
        'Charged':'<span style=\"color:red\" >充能的</span>',
        'Amber':'<span style=\"background:#ffff00\;color:#9f9f16" >琥珀的（雷抗）</span>',
        'Mithril':'<span style=\"color:red\" >秘银的</span>',
        'Agile':'俊敏的',
        'Zircon':'<span style=\"background:#ffffff\;color:#5c5a5a" >锆石的（圣抗）</span>',
        'Frugal':'<span style=\"color:red\" >节能</span>',
        'Jade':'<span style=\"background:#b1f9b1\" >翡翠的（风抗）</span>',
        'Cobalt':'<span style=\"background:#a0f4f4\" >钴石的（冰抗）</span>',
        'Ruby':'<span style=\"background:#ffa6a6\" >红宝石（火抗）</span>',
        'Onyx':'<span style=\"background:#cccccc\" >缟玛瑙（暗抗）</span>',
        'Savage':'<span style=\"color:red\" >野蛮的</span>',
        'Reinforced':'加固的',
        'Shielding':'盾化的',
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
        'Flimsy ' : '薄弱 ',
        'Crude ':'<span style=\"background:#acacac\" >劣质</span> ',
        'Fair ':'<span style=\"background:#c1c1c1\" >一般</span> ',
        'Average ':'<span style=\"background:#dfdfdf\" >中等</span> ',
        'Superior ':'<span style=\"background:#fbf9f9\" >上等</span> ',
        'Fine ':'<span style=\"background:#b9ffb9\" >优质</span> ',
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