// ==UserScript==
// @name         HV 物品装备汉化
// @description  汉化物品、装备界面及论坛，带装备高亮/装备店隐藏锁定装备，无翻译原文切换功能，会直接替换网页源码所以可能导致其它脚本冲突
// @notice       必须在Hentaiverse主菜单 CHARACTER→SETTINGS 勾选 Use Custom Font 并在下一行 font-family 填上任意字体名称，拉到最下面Apply Changes才会生效
// @notice       如有同时使用其它汉化，需要先于其它汉化脚本运行才会生效
// @notice       如与HVtoolBox同时使用，将脚本运行顺序置于HVtoolBox之前，如与其它脚本同时使用冲突，也可尝试调整脚本运行顺序，但不保证兼容
// @notice       虽然脚本设计可以在各种HV装备和物品页面及论坛运行，但由于和其它脚本冲突概率大，仅在装备仓库和装备商店及论坛启用，其它页面如有需要自行添加@match
// @notice       如果你要在论坛买东西，挑好东西之后最好关掉脚本刷新再复制内容，因为别人并不一定看得懂经过翻译过后的东西
// @icon         http://e-hentai.org/favicon.ico
// @match        *://*hentaiverse.org/?s=Character&ss=in*
// @match        *://*hentaiverse.org/?s=Bazaar&ss=es*
// @match        *://forums.e-hentai.org/*
// @exclude      *://forums.e-hentai.org/index.php?act*
// @version      5.6.1
// ==/UserScript==

if (document.location.href.match(/ss=iw/)&&!document.getElementById('item_pane'))return
if (document.getElementById('riddlemaster')||document.getElementById('textlog')) return;
load();//加载翻译字典
build();//转换字典
main();//执行汉化
var items, equips, regItems, regEquips;
function main(){
    var location,i;
    var itemdiv,equipdiv;
    var lklist = [
        'Character&ss=in',  //装备仓库0
        'Bazaar&ss=is',     //道具店1
        'Character&ss=eq',  //装备2
        'Bazaar&ss=es',     //装备店3
        'Bazaar&ss=ss',     //祭坛4
        'Character&ss=it',  //道具仓库5
        'ss=iw',            //iw汉化6
        'forums',           //论坛汉化7
        'Bazaar&ss=lt',     //武器彩票8
        'Bazaar&ss=la',     //防具彩票9
        'Forge&ss=up&*',    //强化10
        'Forge&ss=en&*',    //附魔11
        'Forge',            //锻造12
        'equip',            //装备页 13
    ];
    for(i=0;i<lklist.length;i++){
        if(document.location.href.match(lklist[i])){
            location = i;
            break;
        }
    }
    switch (location){
        case 0: //装备仓库
            try{
                translateEquips(document.querySelector("#inv_equip.cspp"));
                translateEquips(document.querySelector("#inv_eqstor.cspp"));
            }
            catch(e){}
            break;

        case 1: //道具店1
            break;
            equipdiv = document.querySelectorAll(".itemlist");
            translateItems(equipdiv[0]);
            translateItems(equipdiv[1]);
            break;

        case 2: //装备2
            equipdiv = document.querySelector("#eqsb");
            if(equipdiv) {
                translateEquips(equipdiv);
            }
            equipdiv = document.querySelector("#equip_pane");
            if(equipdiv) {
                translateEquips(equipdiv);
            }
            break;

        case 3: //装备店3
            equipdiv = document.querySelectorAll(".equiplist");
            translateEquips(equipdiv[0]);
            translateEquips(equipdiv[1]);
            var equhide = document.createElement('button');
            equhide.style.cssText = "font-size:15px; position:absolute;top:82px; left:2px  ;text-align:left";
            equhide.title = '点击切换';
            try{
                if(!localStorage.hideflag) localStorage.hideflag = "隐藏锁定装备";
                if(localStorage.hideflag=="隐藏锁定装备"){
                    equipdiv = document.querySelectorAll(".il");
                    for(i = 0 ;i <equipdiv.length;i++) {
                        equipdiv[i].parentNode.style.display = "none";
                    }
                }
                equhide.innerHTML = "当前"+localStorage.hideflag;
            }
            catch(e){alert(e)}
            equhide.onclick = function(){
                equipdiv = document.querySelectorAll(".il");
                if(localStorage.hideflag=="隐藏锁定装备"){
                    localStorage.hideflag = "显示锁定装备";
                    for(i = 0 ;i <equipdiv.length;i++) {
                        equipdiv[i].parentNode.style.display = "";
                    }
                }
                else{
                    localStorage.hideflag = "隐藏锁定装备";
                    for(i = 0 ;i <equipdiv.length;i++) {
                        equipdiv[i].parentNode.style.display = "none";
                    }
                }
                this.innerHTML = "当前"+localStorage.hideflag;
            }
            document.body.appendChild(equhide);
            break;

        case 4: // 祭坛4
            translateItems(document.querySelector("#item_pane"));
            break;

        case 5: //道具仓库5
            translateItems(document.querySelector("#mainpane"));
            break;

        case 6: // iw
            translateEquips(document.querySelector("#item_pane"));
            break;

        case 7: //论坛
            equipdiv = document.getElementsByClassName('postcolor');
            for (var ii=0; ii<equipdiv.length ; ii++ ){
                var tempequipment = equipdiv[ii];
                //以下几行内容为去除论坛格式，如果想要开启的话在下一行/*前面加//
                /*
                tempequipment.innerHTML=tempequipment.innerHTML.replace(/<span [^>]+>[^>]+>/g,"")
                tempequipment.innerHTML=tempequipment.innerHTML.replace(/<!--[/]?color[^>]+>/g,"")
                tempequipment.innerHTML=tempequipment.innerHTML.replace(/<[/]*b>/g,"")
                //*/
                translateItems(tempequipment);
                translateEquips(tempequipment);
            }
            break;

        case 8: //武器彩卷
        case 9: //防具彩卷
        case 10: //强化
        case 11: //附魔
            translateEquips(document.querySelector("#leftpane"));
            break;

        case 12: //锻造
            if(equipdiv = document.getElementById("upgrade_button")) equipdiv.style.cssText = "position:relative; top:20px; ";
            translateEquips(document.querySelector("#item_pane"));
            break;

        case 13: //装备属性页面
            translateEquips(document.body);
            break;
        default:
    }
}

function translateEquips(div){
    if(!div) return;
    var repTo = div.innerHTML;
    for (var i in equips){
        repTo = repTo.replace(regEquips[i], equips[i]);
    }
    div.innerHTML = repTo;
}

function translateItems(div){
    if(!div) return;
    var repTo = div.innerHTML;
    for (var i in items){
        repTo = repTo.replace(regItems[i], items[i]);
    }
    div.innerHTML = repTo;
}

function build() {
    regItems = {};
    for(var i in items) {
        regItems[i] = new RegExp(i,'g');
    }
    regEquips = {};
    for(var j in equips) {
        regEquips[j] = new RegExp(j,'g');
    }
}

function load(){
    //道具字典
    items = {
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
        'Binding of Dampening':  '粘合剂 锤击减伤',
        'Binding of Stoneskin':  '粘合剂 砍击减伤',
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
        'Wispy' : '纤小',
        'Diluted' : '稀释',
        'Regular' : '平凡',
        'Robust' : '充沛',
        'Vibrant' : '活力',
        'Coruscating' : '闪耀',
        'Catalyst items' : '催化剂',
        'Catalyst' : '催化剂',
        'Scroll' : '卷轴',
        'Infusion' : '魔药',
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
        'Defense Matrix Modulator' : '立场碎片(盾)',
        'Repurposed Actuator' : '动力碎片(重)',
        'Shade Fragment' : '暗影碎片(轻)',
        'Crystallized Phazon' : '相位碎片(布)',
        'Voidseeker Shard' : '虚空碎片',
        'Featherweight Shard' : '羽毛碎片',
        'Aether Shard' : '以太碎片',
        'Amnesia Shard' : '重铸碎片',
        'Soul Fragment' : '灵魂碎片',
        'Blood Token' : '鲜血令牌',
        'Token of Blood' : '鲜血令牌',
        'Chaos Token' : '混沌令牌',
        'ManBearPig Tail' : '人熊猪的尾巴(等级2)',
        'Mithra\'s Flower' : '猫人族的花(等级2)',
        'Holy Hand Grenade of Antioch' : '安提阿的神圣手榴弹(等级2)',
        'Dalek Voicebox' : '戴立克音箱(等级2)',
        'Lock of Blue Hair' : '一绺蓝发(等级3)',
        'Bunny-Girl Costume' : '兔女郎装(等级3)',
        'Hinamatsuri Doll' : '雏人形(等级3)',
        'Broken Glasses' : '破碎的眼镜(等级3)',
        'Sapling' : '树苗(等级4)',
        'Black T-Shirt' : '黑色Ｔ恤(等级4)',
        'Unicorn Horn' : '独角兽的角(等级5)',
        'Noodly Appendage' : '面条般的附肢(等级6)',
        'Stocking Stuffers' : '圣诞袜小礼物(等级7)',
        'Dinosaur Egg' : '恐龙蛋(等级7)',
        'Precursor Smoothie Blender' : '远古冰沙机(等级8)',
        'Rainbow Smoothie' : '彩虹冰沙(等级7)',
        'Tenbora\'s Box' : '天菠拉的盒子(等级9)',
        'Mysterious Box' : '神秘宝盒(等级9)',
        'Solstice Gift' : '冬至赠礼(等级7)',
        'Shimmering Present' : '闪闪发光的礼品(等级7)',
        'Potato Battery' : '马铃薯电池',
        'RealPervert Badge' : '真-变态勋章',
        'Rainbow Egg' : '彩虹蛋',
        'Colored Egg' : '彩绘蛋',
        'Gift Pony' : '礼品小马',
        'Faux Rainbow Mane Cap' : '人造彩虹鬃毛帽',
        'Pegasopolis Emblem' : '天马族徽',
        'Fire Keeper Soul' : '防火女的灵魂',
        'Crystalline Galanthus' : '结晶雪花莲(等级8)',
        'Sense of Self-Satisfaction' : '自我满足感',
        'Six-Lock Box' : '六道锁盒子',
        'Golden One-Bit Coin' : '黄金比特币',
        'USB ASIC Miner' : '随身型特定应用积体电路挖矿机',
        'Reindeer Antlers' : '驯鹿鹿角',
        'Ancient Porn Stash' : '远古隐藏色情档案',
        'VPS Hosting Coupon' : 'VPS优惠券',
        'Heart Locket' : '心型盒坠',
        'Holographic Rainbow Projector' : '全像式彩虹投影机(等级8)',
        'Pot of Gold' : '黄金罐(等级7)',
        'Dinosaur Egg' : '恐龙蛋(等级7)',
        'Figurine' : '小马公仔',
        //药品解释
        'Provides a long-lasting health restoration effect.' : '持续回复2%的基础HP,持续50回合.',
        'Instantly restores a large amount of health.' : '立刻回复100%的基础HP.',
        'Fully restores health, and grants a long-lasting health restoration effect.' : 'HP全满,持续回复2%的基础HP,持续50回合.',
        'Provides a long-lasting mana restoration effect.' : '持续回复1%的基础MP,持续50回合.',
        'Instantly restores a moderate amount of mana.' : '立刻回复50%的基础MP.',
        'Fully restores mana, and grants a long-lasting mana restoration effect.' : 'MP全满,持续回复1%的基础MP,持续50回合.',
        'Provides a long-lasting spirit restoration effect.' : '持续回复1%的基础SP,持续50回合.',
        'Instantly restores a moderate amount of spirit.' : '立刻回复50%的基础SP.',
        'Fully restores spirit, and grants a long-lasting spirit restoration effect.' : 'SP全满,持续回复1%的基础SP,持续50回合.',
        'Fully restores all vitals, and grants long-lasting restoration effects.' : '状态全满,产生所有回复药水的效果.',
        'Restores 10 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for ten turns.' : '可在战斗中使用,请在战斗道具栏设置,恢复10点精力，但不超过99。战斗时使用时,每回合增加10%的灵力和Overcharge.',
        'Grants the Haste and Protection effects.with twice the normal duration.' : '产生加速和保护的效果。两倍持续时间',
        'Grants the Absorb effect.' : '使用后获得吸收效果。',
        'Restores' : '恢复',
        'of Base Mana per Turn for' : '的基础法力值并持续',
        'of Base Spirit per Turn for' : '的基础灵力值并持续',
        'of Base Health per Turn for' : '的基础体力，持续',
        'Base Health' : '的基础体力并每回合回复',
        'Turns' : '回合',
        //魔药解释
        'You gain' : '你得到',
        'resistance to ' : '的',
        'elemental attacks and do ' : '元素耐性并造成',
        'more damage with ' : '的额外',
        'spells.' : '魔法伤害。',
        'Melee attacks do additional ' : '近战攻击变为',
        'Grants the Haste effect.' : '使用产生加速效果。',
        'Grants the Protection effect.' : '使用产生保护效果。',
        'Grants the Shadow Veil effect.' : '使用产生闪避效果。',
        'Grants the Spark of Life effect.' : '使用产生复活效果。',
        'Grants the Absorb, Shadow Veil and Spark of Life effects with twice the normal duration.' : '同时产生吸收，加速，闪避，以及复活效果,两倍持续时间.',
        'Grants the Absorb Veil effect.' : '使用产生吸收效果。',

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
        'When used with a weapon, this shard will temporarily imbue it with the' : '当用在一件装备上时，会临时给予装备',
        'Suffused Aether enchantment' : '弥漫的以太的附魔效果',
        'Featherweight Charm enchantment' : '轻如鸿毛的附魔效果',
        'When used with a weapon, this shard will temporarily imbue it with the' : '当用在一件装备上时，会临时给予装备',
        'When used with a weapon, this shard will temporarily imbue it with the' : '当用在一件装备上时，会临时给予装备',
        'Voidseeker' : '虚空探索者',
        's Blessing enchantment' : '的祝福的附魔效果',
        'These fragments can be used in the forge to permanently soulfuse an equipment piece to you, which will make it level as you do.' : '这个碎片可以将一件装备与你灵魂绑定，灵魂绑定的装备会随着你的等级一同成长。',
        'You can fuse this crystal with a monster in the monster tab to increase its' : '你可以用这种水晶在怪物实验室里面为一个怪物提升它的',
        'Strength.' : '力量',
        'Dexterity.' : '灵巧',
        'Agility.' : '敏捷',
        'Endurance.' : '体质',
        'Intelligence.' : '智力',
        'Wisdom.' : '智慧',
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
        'Precursor Artifact' : '遗物',
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
        'Required to reforge Force Shields' : '用于强化立场盾',
        'Physical Base Damage' : '(物理伤害)',
        'Physical Hit Chance' : '(物理命中率)',
        'Magical Base Damage' : '(魔法伤害)',
        'Magical Hit Chance' : '(魔法命中率)',
        'Physical Defense' : '(物理减伤)',
        'Evade Chance' : '(回避率)',
        'Block Chance' : '(格挡率)',
        'Parry Chance' : '(招架率)',
        'Elemental Magic Proficiency' : '(元素熟练)',
        'Divine Magic Proficiency' : '(圣熟练)',
        'Forbidden Magic Proficiency' : '(暗熟练)',
        'Deprecating Magic Proficiency' : '(减益熟练)',
        'Supportive Magic Proficiency' : '(辅助熟练)',
        'Fire Spell Damage' : '(火焰法术伤害)',
        'Cold Spell Damage' : '(冰霜法术伤害)',
        'Elec Spell Damage' : '(闪电法术伤害)',
        'Wind Spell Damage' : '(狂风法术伤害)',
        'Holy Spell Damage' : '(神圣法术伤害)',
        'Dark Spell Damage' : '(黑暗法术伤害)',
        'Crushing Mitigation' : '(敲击减伤)',
        'Slashing Mitigation' : '(砍击减伤)',
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
        //物品类型

        'Token' : '令牌',
        'Consumable' : '消耗品',
        'Crystal' : '水晶',
        'Artifact' : '遗物',
        'Material' : '素材',
        'Trophy' : '奖杯',
        'Monster Food' : '怪物食品',
        'Collectable' : '收藏品',
        //材料
        'Low-Grade' : '低级',
        'Mid-Grade' : '中级',
        'High-Grade' : '高级',
        'Cloth' : '布料',

        'Leather' : '皮革',
        'Wood' : '木材',
        'Metals' : '金属',
        'Metal' : '金属',
        'Scrap' : '碎片',
        'Materials' : '材料s',
        'Crystals' : '水晶s',
    };

    //装备字典
    equips = {
        /////////////////////////////////装备属性
        //'Potency Tier':'潜力等级',
        //'One-handed Weapon':'单手武器',
        //'Two-handed Weapon':'双手武器',
        //'Heavy Armor':'重甲',
        //'Staff':'法杖',
        //'Cloth Armor':'布甲',
        'Level':'装备等级',
        'Magic Crit Chance':'魔法暴击率',
        'Attack Crit Chance':'攻击暴击率',
        'Attack Accuracy':'物理命中',
        'Attack Critical':'物理暴击',
        'Attack Damage':'攻击伤害',
        'Damage Mitigations':'伤害减免',
        'Parry Chance':'招架率',
        'Magic Damage':'魔法伤害',
        'Magic Critical':'魔法暴击',
        'Mana Conservation':'魔法消耗降低',
        'Counter-Resist':'反抵抗',
        'Physical Mitigation':'物理减伤',
        'Magical Mitigation':'魔法减伤',
        'Block Chance':'格挡率',
        'Upgrades and Enchantments':'升级与附魔',
        'Primary Attributes':'属性加成',
        'Evade Chance':'回避率',
        'Casting Speed':'施法速度',
        'Resist Chance':'抵抗率',
        'Spell Crit':'法术暴击',
        'Spell Damage':'法术伤害加成',
        'Siphon Spirit':'灵力吸取',
        'Siphon Magic':'偷取魔力',
        'Siphon Health':'生命吸取',
        'Ether Theft':'魔力回流',
        'Penetrated Armor':'破甲',
        'Attack Crit Damage':'攻击爆击伤害',
        'Magic Accuracy':'魔法命中',
        'Counter-Parry':'反招架',
        'Attack Speed':'攻击速度',
        'Current Owner':'持有者',
        'Ether Tap':'魔力回流',
        'Elemental Strike':'属性攻击',
        'Bleeding Wound':'流血',
        'Lasts for':'持续',
        'Coldproof':'抗寒',
        'Darkproof':'驱暗',
        'Elecproof':'绝缘',
        'Fireproof':'耐热',
        'Holyproof':'驱圣',
        'Windproof':'防风',
        'Condition':'耐久',
        'Tradeable':'可交易',
        'Untradeable':'不可交易',
        'Soulbound':'灵魂绑定',
        'Potency Tier':'潜能等级',
        'Level':'装备等级',
        'Mitigation':'减伤',
        'Defense':'防御',
        'Stunned':'眩晕',
        'turns':'回合',
        'Burden':'负重',
        'Interference':'干涉',
        'Burden':'负重',
        'Strength':'力量',
        'Dexterity':'灵巧',
        'Agility':'敏捷',
        'Endurance':'体质',
        'Intelligence':'智力',
        'Wisdom':'智慧',
        'chance':'几率',
        'Crushing':'敲击',
        'Piercing':'穿刺',
        'Slashing':'斩击',
        'Damage':'伤害',
        'Proficiency':'熟练度加成',
        '>Elemental':'>元素',
        'Divine':'神圣',
        'Forbidden':'黑暗',
        'Deprecating':'减益',
        'Supportive':'增益',
        'Fire ':'火焰',
        'Cold ':'冰霜',
        'Elec':'闪电',
        'Wind':'狂风',
        'Holy':'神圣',
        'Dark':'黑暗',
        'Void ':'虚空',
        'points':'点',
        'Void ':'虚空',
        'Strike':'冲击',
        'None':'无',
        'turns':'回合',
        'DOT':'持续伤害比例',
        'None':'无',

        //////////////////////////道具界属性
        'Unassigned':'未确定',
        'Physical':'物理',
        'Magical':'魔法',
        'Hit Chance':'命中率',
        'Crit Chance':'暴击率',
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

        ///////////////////////////////////////////武器种类
        'ddsezxcwer':'',
        //如果出现问号绝对有问题
        //盾
        'Buckler':'',
        'Kite Shield':'',
        'Tower Shield':'',
        // 单手武器类
        'Dagger':'匕首（单）',
        'Shortsword':'短剑（单）',
        'Wakizashi':'脇差（单）',
        'Axe':'斧（单）',
        'Club':'棍（单）',
        'Rapier':'<span style=\"background:#ffa500\" >西洋剑</span>（单）',
        //双手
        'Longsword':'长剑（双）',
        'Scythe':'镰刀（双）',
        'Katana':'太刀（双）',
        'Mace':'重槌（双）',
        'Estoc':'刺剑（双）',
        //法杖
        'Staff':'法杖',
        //布甲
        'Cap':'兜帽',
        'Robe':'长袍',
        'Gloves':'手套',
        'Pants':'短裤',
        'Shoes':'鞋',
        //轻甲
        'Helmet':'头盔',
        'Breastplate':'护胸',
        'Gauntlets':'手套',
        'Leggings':'绑腿',
        //重甲
        'Cuirass':'胸甲',
        'Armor':'盔甲',
        'Sabatons':'重靴',
        'Boots':'长靴',
        'Greaves':'护胫',

        /////////////////////////////盾或者材料,武器不会出现这个
        'ddsezxcwer':'',//防止空缺
        'Buckler':'圆盾',
        'Kite Shield':'鸢盾',
        'Tower Shield':'塔盾',
        'Force Shield':'<span style=\"background:#ffa500\" >力场盾</span>',

        ////////////////////////材质前缀////////////////////////
        //布甲
        'Cotton ':'棉质</span><span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        'Gossamer':'薄纱</span><span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        'Phase':'<span style=\"background:#ffa500\" >相位</span><span style=\"background:#FFFFFF;color:#000000\" >(布)</span>',
        //轻甲
        'Leather ':'皮革<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Kevlar':'凯夫拉<span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        'Shade':'<span style=\"background:#ffa500\" >暗影</span><span style=\"background:#666666;color:#FFFFFF\" >(轻)</span>',
        //重甲
        'Plate':'板甲<span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        'Power':'<span style=\"background:#ffa500\" >动力</span><span style=\"background:#000000;color:#FFFFFF\" >(重)</span>',
        //法杖
        'Ebony':'*乌木',
        'Redwood':'红木',
        'Willow':'柳木',
        'Oak':'橡木',
        'Katalox':'铁木',

        'adfouhasd':'',//防止空缺
        //大小写转换
        'Of ' : 'of ',
        'The ' : 'the ',
        ///////////////////////////////////////////防具后缀////////////////////////////////////////////
        'of the Cheetah':'猎豹之',
        'of Negation':'否定之',
        'of the Shadowdancer':'影武者',
        'of the <b>Shadowdancer</b>':'<b>影武者</b>',
        'of the Arcanist':'奥术师',
        'of the Fleet':'迅捷之',
        'Spirit-ward':'灵魂护佑',
        'of the Fire-eater':'噬火者',
        'Fire-eater':'噬火者',
        'of the Thunder-child':'雷之子',
        'of the Wind-waker':'风之杖',
        'of the Spirit-ward':'灵魂护佑',
        'of Dampening':'抑制',
        'of Stoneskin':'石肤',
        'of Deflection':'偏转',
        'of the Nimble':'灵敏',
        'of the Barrier':'招架',
        'of Protection':'物防',
        'of <b>the Barrier</b>':'<b>招架</b>',
        'of <b>Protection</b>':'<b>物防</b>',
        'of <!--coloro:red--><span style="color:red"><!--/coloro-->Protection<!--colorc--></span>':'<b style="color:red">物防</b>',
        'of Warding':'魔防',
        'of the Raccoon':'招架',
        'of the Frost-born':'寒冰',

        ////////////////////////////////////////////////////武器后缀/////////////////////////////////
        'of Slaughter':'<span style=\"background:#FF0000;color:#FFFFFF\" >杀戮</span>',
        'of <b>Slaughter</b>':'<span style=\"background:#FF0000;color:#FFFFFF\" >杀戮</span>',
        'of <!--coloro:#f00--><span style="color:#f00"><!--/coloro-->Slaughter<!--colorc--></span>':'<span style=\"background:#FF0000;color:#FFFFFF\" >杀戮</span>',
        'of Swiftness':'加速',
        'of Balance':'平衡',
        'of the Battlecaster':'战法师',
        'of the Banshee':'女妖',
        'of the Illithid':'汲灵',
        'of the Vampire':'吸血鬼',
        'of Destruction':'<span style=\"background:#9400d3;color:#FFFFFF\" >毁灭</span>',
        'of <b>Destruction</b>':'<span style=\"background:#9400d3;color:#FFFFFF\" >毁灭</span>',
        '<of> <b>Destruction</b>':'<span style=\"background:#9400d3;color:#FFFFFF\" >毁灭</span>',
        'of Surtr':'<span style=\"background:#f97c7c\" >苏尔特（火伤）</span>',
        'of Niflheim':'<span style=\"background:#94c2f5\" >尼芙菲姆（冰伤）</span>',
        'of Mjolnir':'<span style=\"background:#f4f375\" >姆乔尔尼尔（雷伤）</span>',
        'of Freyr':'<span style=\"background:#7ff97c\" >弗瑞尔（风伤）</span>',
        'of Heimdall':'<span style=\"background:#ffffff\;color:#000000\" >海姆达（圣伤）</span>',
        'of Fenrir':'<span style=\"background:#000000\;color:#ffffff" >芬里尔（暗伤）</span>',
        'of Focus':'专注',
        'of <b>Focus</b>':'<b>专注</b>',
        'of <b>the Elementalist</b>':'<b>元素使</b>',
        'of <b>the Heaven-sent</b>':'<b>天堂</b>',
        'of <b>the Demon-fiend</b>':'<b>恶魔</b>',
        'of the Elementalist':'元素使',
        'of the Heaven-sent':'天堂',
        'of the Demon-fiend':'恶魔',
        'of the Earth-walker':'地行者',
        'of the Priestess':'牧师',
        'of the Curse-weaver':'咒术师',
        'of the Thrice-blessed':'三重祝福',

        ///////////////武器或者防具属性/////////////////
        'dfgdsfgsdge':'',//防止空缺
        'Radiant':'<span style=\"background:#ffffff\;color:#000000" >✪魔光✪</span>',
        'Mystic':'神秘的',
        'Charged':'<span style=\"color:red\" >充能的</span>',
        'Amber':'<span style=\"background:#ffff00\;color:#9f9f16" >琥珀的（雷抗）</span>',
        'Mithril':'<span style=\"color:red\" >秘银的</span>',
        'Agile':'俊敏的',
        'Zircon':'<span style=\"background:#ffffff\;color:#5c5a5a" >锆石的（圣抗）</span>',
        'Frugal':'<span style=\"color:red\" >节能</span>',
        'Jade':'<span style=\"background:#b1f9b1\" >翡翠的（风抗）</span>',
        'Cobalt':'<span style=\"background:#a0f4f4\" >冰蓝的（冰抗）</span>',
        'Ruby':'<span style=\"background:#ffa6a6\" >红宝石（火抗）</span>',
        'Astral':'五芒星',
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

        /////////////////品质//////////
        'Crude':'<span style=\"background:#acacac\" >劣质</span>',
        'Fair':'<span style=\"background:#c1c1c1\" >一般</span>',
        'Average':'<span style=\"background:#dfdfdf\" >中等</span>',
        'Superior':'<span style=\"background:#fbf9f9\" >上等</span>',
        'Fine':'<span style=\"background:#b9ffb9\" >优质</span>',
        'Exquisite':'<span style=\"background:#d7e698\" >✧精良✧</span>',
        'Magnificent':'<span style=\"background:#a6daf6\" >☆史诗☆</span>',
        'Legendary':'<span style=\"background:#ffbbff\" >✪传奇✪</span>',
        'Peerless':'<span style=\"background:#ffd760\" >☯无双☯</span>',
    };
}