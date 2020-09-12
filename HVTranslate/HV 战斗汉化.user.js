// ==UserScript==
// @name           HV 战斗汉化
// @namespace      hentaiverse.org
// @author         indefined
// @icon           https://hentaiverse.org/y/favicon.png
// @description    仅对HV战斗说明框进行汉化
// @include        *://hentaiverse.org/*
// @include        *://alt.hentaiverse.org/*
// @exclude        *://*hentaiverse.org/equip/*
// @exclude        *://*hentaiverse.org/pages/showequip.php?*
// @core           http://userscripts-mirror.org/scripts/show/41369
// @version        2020.08.22
// @grant none
// ==/UserScript==
(function () {
    'use strict';
    if (!document.getElementById('pane_log')) return;

    /*
        NOTE:
            You can use \\* to match actual asterisks instead of using it as a wildcard!
            The examples below show a wildcard in use and a regular asterisk replacement.
                'your a' : 'you\'re a',
                'imo' : 'in my opinion',
                'im\\*o' : 'matching an asterisk, not a wildcard',
                '/\\bD\\b/g' : '[D]',
    */



    var words = {
    // Syntax: 'Search word' : 'Replace word',
    // 字典语法: '原文' : '翻译之后的句子',
        //原文部分带*号将被视为通配，匹配真正*号时使用\\*代替*
        //原文以/开头和结尾的为正则表达式，在这个脚本里多用来做全词匹配

    // 待验证语句：
        // 1. 恢复剂部分的提神、带劲效果（ED/咖啡因/泡泡糖/花瓶效果）
        // 2. 以太窃取、灵力窃取
        // 3. 焚烧的灵魂、鲜美的灵魂

    ///////////////////////////////////////////////////////战斗行动
        '/^Attack$/' : '攻击',
        '/^Defend$/' : '防御',
        '/^Focus$/' : '专注',
        '/^Items$/' : '道具',
        '/^Skillbook$/' : '技能书',
        '/^Spirit$/' : '灵动架式',
        '/^Battle Time$/' : '战斗时间',
        'Damages a single enemy. Depending on your equipped weapon, this can place certain status effects on the affected monster. To attack, click here, then click your target. Simply clicking an enemy will also perform a normal attack.' : '普通攻击，取决于你的武器能对怪物造成特定的伤害，单击此处并点击目标怪物进行攻击，没有选中技能法术时仅点击怪物也有相同效果。普通攻击命中怪物可以获得5%~10%斗气。',
        'Use special skills and magic. To use offensive spells and skills, first click it, then click your target. To use it on yourself, click it twice.' : '使用一个技能法术。对于攻击和乏抑技能法术，点击技能然后点击目标怪物，对于治疗和辅助自用法术，仅需点击技能法术名称。重复点击技能书按钮可以切换技能和法术列表。你可以在HV设置中将常用技能法术放在快捷栏上。',
        'Use various consumable items that can replenish your vitals or augment your power in various ways.' : '使用战斗补给品中的道具，它们能恢复你的状态或者给你带来各方面提升。',
        'Toggle Spirit Channeling.' : '切换灵动架式。当你有 50% 以上的斗气可以开启，开启后每次行动消耗 1 点灵力值和 10% 斗气，物理伤害增幅 +100%，魔力值消耗减少 25%。',
        'Increases your defensive capabilities for the next turn.' : '本回合和下一回合你的物理和魔法缓伤增幅 +25%。消耗 10% 斗气恢复 10% 基础生命值 (需要 10%+ 斗气)。',
        'Reduces the chance that your next spell will be resisted. Your defenses and evade chances are lowered for the next turn.' : '降低本回合自身回避、格挡、招架和抵抗率，增加下一回合魔法命中和反抵抗率。消耗 25% 斗气恢复 5% 基础魔力值 (需要 25%+ 斗气)。',
        'Choose from the Battle Actions highlighted above, and use them to defeat your enemies listed to the right. When all enemies are reduced to zero Health, you win. If your Health reaches zero, you are defeated.' : '选择上面的任意一个行动来打倒右侧的敌人。当所有敌人生命为0时，你获得胜利，当你的生命为0时，你被打败。',

    /////////////////////////////////////////////////////效果、需求说明
        'Expires if magic is depleted to below 10%' : '如果你的MP低于10%将会消散',
        'Permanent until triggered' : '直到触发前将会一直有效',
        '/Expires in (\\d+) turns?/' : '剩余持续时间 $1 回合',
        '/Requires (\\d+) Magic Points to use/' : '需要 $1 点 MP',
        '/Requires (\\d+) Charges? to use/' : '需要 $1 格斗气',
        '/Requires (\\d+) Magic Points and (\\d+) Charges? to use/' : '需要 $1 点 MP 和 $2 格斗气',
        '/Cooldown: (\\d+) turns?/' : '冷却时间: $1 回合',

    /////////////////////////////////////////////////////技能、技巧名称
        '/^Flee$/' : '逃跑',
        '/^Scan$/' : '扫描',

        '/^FUS RO DAH$/' : '龙吼',
        '/^Orbital Friendship Cannon$/' : '友谊小马炮',
        '/^Concussive Strike$/' : '震荡打击',
        '/^Skyward Sword$/' : '天空之剑',
        '/^Frenzied Blows$/' : '狂乱百裂斩',
        '/^Iris Strike$/' : '虹膜打击',
        '/^Backstab$/' : '背刺',
        '/^Shatter Strike$/' : '破碎打击',
        '/^Rending Blow$/' : '撕裂打击',
        '/^Great Cleave$/' : '大劈砍',
        '/^Merciful Blow$/' : '最后的慈悲',
        '/^Shield Bash$/' : '盾击',
        '/^Vital Strike$/' : '要害强击',

        '/^Fiery Blast$/' : '灼热冲击(Ⅰ)',
        '/^Inferno$/' : '地狱火(Ⅱ)',
        '/^Flames of Loki$/' : '邪神之火(Ⅲ)',
        '/^Freeze$/' : '冰冻(Ⅰ)',
        '/^Blizzard$/' : '暴风雪(Ⅱ)',
        '/^Fimbulvetr$/' : '芬布尔之冬(Ⅲ)',
        '/^Shockblast$/' : '电能爆破(Ⅰ)',
        '/^Chained Lightning$/' : '连锁闪电(Ⅱ)',
        '/^Wrath of Thor$/' : '雷神之怒(Ⅲ)',
        '/^Gale$/' : '烈风(Ⅰ)',
        '/^Downburst$/' : '下击暴流(Ⅱ)',
        '/^Storms of Njord$/' : '尼奥尔德风暴(Ⅲ)',
        '/^Smite$/' : '惩戒(Ⅰ)',
        '/^Banishment$/' : '放逐(Ⅱ)',
        '/^Paradise Lost$/' : '失乐园(Ⅲ)',
        '/^Corruption$/' : '腐化(Ⅰ)',
        '/^Disintegrate$/' : '瓦解(Ⅱ)',
        '/^Ragnarok$/' : '诸神黄昏(Ⅲ)',

        '/^Drain$/' : '枯竭',
        '/^Slow$/' : '缓慢',
        '/^Weaken$/' : '虚弱',
        '/^Silence$/' : '沉默',
        '/^Sleep$/' : '沉眠',
        '/^Confuse$/' : '混乱',
        '/^Imperil$/' : '陷危',
        '/^Blind$/' : '致盲',
        '/^MagNet$/' : '魔磁网',

        '/^Cure$/' : '治疗',
        '/^Regen$/' : '细胞活化',
        '/^Full-Cure$/' : '完全治愈',
        '/^Haste$/' : '急速',
        '/^Protection$/' : '守护',
        '/^Shadow Veil$/' : '影纱',
        '/^Absorb$/' : '吸收',
        '/^Spark of Life$/' : '生命火花',
        '/^Arcane Focus$/' : '奥术集成',
        '/^Heartseeker$/' : '穿心',
        '/^Spirit Shield$/' : '灵力盾',

    /////////////////////////////////////////////////////技能、技巧说明
        //先天技能
        'Run away from the current battle.' : '从战斗中逃跑，逃跑可能需要完整的一回合才会生效，在此期间怪物仍然可以攻击。',
        'Retrieve data on the target.' : '撷取目标的情报。',

        'Massive AoE damage to all enemies on the battlefield.' : '对战场上所有的敌人打出虚空高伤害。',
        'Damages and temporarily staggers all enemies on the battlefield.' : '击中战场上所有敌人。打出虚空伤害。导致晕眩 5 回合。',

        //武器技能
        'A precision strike towards the sensory organs of your enemy inflicts massive damage and temporarily blinds it.' : '使目标盲眼 100 回合。',
        'Does additional damage to blinded targets.' : '打击盲眼的目标有额外伤害。约 50% 机率会使盲眼的目标中毒 15 回合。',
        'Hits up to five targets multiple times.' : '给多达 5 个相邻目标造成 10~20 段攻击。',

        'Bash an enemy with your shield to stun it, which opens up for devastating strikes with your weapon.' : '使目标晕眩 5 回合。打出敲击伤害。',
        'Follow up with an attack that, if used on a stunned target, causes a large amount of damage and a chance of inflicting bleed.' : '在已晕眩的敌人上堆 5 道流血伤口 (流血百分比 = 50%) 持续 5 回合。打击晕眩的敌人有额外伤害。',
        'Finish off a mortally wounded enemy. Instantly kills a target with bleed and less than 25% health.' : '立即杀死生命值低于 25% 且正在流血的敌人。当目标的生命值在 25% 之上只会受到一般技巧伤害。',

        'Focus a powerful strike on a single enemy.' : '对单个敌人打出比正常值高的伤害。',
        'Tears through enemy defenses, leaving them vulnerable for followup attacks.' : '对多个目标给予 3 道破甲效果。',
        'A mighty swing with your weapon causes all enemies with penetrated armor to stagger.' : '打击破甲目标可给予晕眩效果。',

        'Channels the power of the heavens for a powerful strike that causes massive carnage.' : '给予多达5个目标 3 道破甲 (缓伤降至 25%) 和 5 道流血 (流血百分比 = 20%) 的效果。',

        'Focus your magical power into your staff for a precision strike towards the head of your enemy, causing major damage and stunning it.' : '使目标晕眩 5 回合，但不会使已晕眩的目标再晕眩。打出魔法性质伤害，而非物理性质。会触发魔力合流特效。',


        //辅助咒语（BUFF）
        'Restores a moderate amount of Health on the target.' : '使目标恢复中量生命值。',
        'Fully restores the Health of the target.' : '使目标恢复全部生命值。',
        'The next magical attack against the target has a chance to be absorbed and partially converted to MP.' : '当下一个魔法性质攻击打中目标时将有机率会被吸收并转换一部分为魔力值。',
        'Speeds up all actions of the target, allowing it to attack more frequently.' : '加速目标的所有行动，使他行动更频繁。',
        'Places a shield effect on the target, absorbing' : '对目标施加护盾效果，吸收所有攻击',
        'of the damage from all attacks.' : '的伤害值。',
        'Places a heal over time effect on the target.' : '在目标身上施加持续性治疗效果。',
        'Surrounds the target with a veil of shadows, making it harder to hit with attacks and spells.' : '一层幻影面纱包围目标，使他不容易被攻击和咒语击中。',
        'Any attack that would one-shot a target with more than 1 HP leaves it alive but on the brink of defeat. The buff is removed when triggered.' : '当目标受到任何致命攻击时会以1HP保住性命。辅助效果在触发之后就会消失 (并且消耗玩家的基础灵力值 50%)。',
        'Powerful attacks against you will be partially absorbed and damage your spirit gauge instead of health.' : '当你遭受到强力攻击时会吸收部分伤害转嫁到灵力值量表，而不是生命值量表。',
        'The target attains a higher level of attunement with the arcane forces, increasing magic power and crit chance.' : '使目标经由奥术的力量点化而到达更高的境界，强化魔法的威力与暴击率。',
        'The target attains intimate knowledge of the flow of life in all living beings, increasing attack power and crit chance.' : '使目标到达精通万物生命源流的境界，强化物理攻击威力与暴击率。',

        //乏抑咒语（DEBUFF）
        'A net of pure energy ensnares the target, slowing it by' : '使用一张能量网诱捕目标，降低它',
        'and making it unable to evade attacks or spells.' : '的回避和咒语抵抗',
        'Blinds the target, reducing the chance of it landing attacks and hitting with magic spells.' : '使目标盲眼，降低攻击与魔法咒语的命中率。',
        'Inflicts Drain on one target, causing damage over time.' : '对目标施加枯竭，给予持续伤害。',
        'Confuses the target, making it lunge out wildly and strike friends and foes alike.' : '使目标产生错乱，如同面对敌人似地疯狂扑向伙伴攻击。',
        'The target is imperiled, reducing physical and magical mitigation as well as elemental mitigations.' : '使目标劣化，削减它的物理和魔法缓伤，同样也削减四元素缓伤。',
        'The target is silenced, preventing it from using special attacks and magic.' : '使目标封口，防止它使用特殊攻击。',
        'The target is lulled to sleep, preventing it from taking any actions.' : '使目标进入沉睡，防止它采取任何行动。',
        'The target is slowed by' : '使目标延迟',
        'making it attack less frequently.': '它们攻击频率会降低',
        'The target is weakened, making it deal less damage, and preventing it from scoring critical hits.' : '使目标弱化，让它的攻击打出较低伤害且能防止它打出暴击。',

        //攻击咒语
        'A ball of fire is hurled at the target.' : '对着目标投掷一颗火球。',
        'A blast of wind hits the target, causing Wind damage.' : '刮起一阵风攻击目标，造成风属性伤害。',
        'A bolt of lightning strikes the target, causing Elec damage.' : '落下一道闪电击中目标，造成雷属性伤害。',
        'Unleashes an inferno of flames on all hostile targets, causing Fire damage.' : '释放一道地狱之火对付所有敌人，造成火属性伤害。',

        'Dark damage.' : '暗属性伤害',
        'Holy damage.' : '圣属性伤害',
        'Cold damage.' : '冰属性伤害',
        'Fire damage.' : '火属性伤害',
        'Wind damage.' : '风属性伤害',
        'Elec damage.' : '雷属性伤害',

    /////////////////////////////////////////////////////道具
        'This powerup will restore a large amount of health.' : '立刻回复100%的基础HP(战场免费掉落道具，无法带出战斗)',
        'This powerup will restore a moderate amount of mana.' : '立刻回复50%的基础MP(战场免费掉落道具，无法带出战斗)',
        'This powerup will restore a small amount of spirit.' : '立刻回复50%的基础SP(战场免费掉落道具，无法带出战斗)',
        'This powerup will grant you the Channeling effect.' : '给予 15 回合的引导效果，施放咒语会终止效果。(战场免费掉落道具，无法带出战斗。引导时施放的咒语效果增强 50% 且只会消耗 1 点魔力值。)',

        'Provides a long-lasting health restoration effect.' : '持续50回合回复2%的基础HP.',
        'Instantly restores a large amount of health.' : '立刻回复100%的基础HP.',
        'Fully restores health, and grants a long-lasting health restoration effect.' : 'HP全满,持续100回合回复2%的基础HP.',
        'Provides a long-lasting mana restoration effect.' : '持续50回合回复1%的基础MP.',
        'Instantly restores a moderate amount of mana.' : '立刻回复50%的基础MP.',
        'Fully restores mana, and grants a long-lasting mana restoration effect.' : 'MP全满,持续100回合回复1%的基础MP.',
        'Provides a long-lasting spirit restoration effect.' : '持续50回合回复1%的基础SP.',
        'Instantly restores a moderate amount of spirit.' : '立刻回复50%的基础SP.',
        'Fully restores spirit, and grants a long-lasting spirit restoration effect.' : 'SP全满,持续100回合回复1%的基础SP.',
        'Fully restores all vitals, and grants long-lasting restoration effects.' : '状态全满,产生所有回复药水的效果.',
        'Restores 10 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for ten turns.' : '恢复10点精力，但不超过99，每回合增加10%的灵力和斗气.',
        'Restores 5 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for five turns.' : '恢复5点精力，但不超过99，每回合增加10%的灵力和斗气.',
        'There are three flowers in a vase. The third flower is green.' : '你的物理/魔法 伤害、命中、暴击率、回避、抵抗率大幅提升+25%，持续50回合。',
        'It is time to kick ass and chew bubble-gum... and here is some gum.' : '你的攻击和咒语伤害大幅提升+100%。必定命中且必定暴击。同时每回合补充 20% 基础魔力与基础生命值，持续50回合。',
        'You gain +25% resistance to Fire elemental attacks and do 25% more damage with Fire magicks.' : '你获得 +25% 的火系魔法耐性且获得 25% 的额外火系魔法伤害。',
        'You gain +25% resistance to Cold elemental attacks and do 25% more damage with Cold magicks.' : '你获得 +25% 的冰冷魔法耐性且获得 25% 的额外冰系魔法伤害。',
        'You gain +25% resistance to Elec elemental attacks and do 25% more damage with Elec magicks.' : '你获得 +25% 的雷系魔法耐性且获得 25% 的额外雷系魔法伤害。',
        'You gain +25% resistance to Wind elemental attacks and do 25% more damage with Wind magicks.' : '你获得 +25% 的风系魔法耐性且获得 25% 的额外风系魔法伤害。',
        'You gain +25% resistance to Holy elemental attacks and do 25% more damage with Holy magicks.' : '你获得 +25% 的神圣魔法耐性且获得 25% 的额外神圣魔法伤害。',
        'You gain +25% resistance to Dark elemental attacks and do 25% more damage with Dark magicks.' : '你获得 +25% 的黑暗魔法耐性且获得 25% 的额外黑暗魔法伤害。',
        'Grants the Haste effect.' : '使用产生加速效果。',
        'Grants the Protection effect.' : '使用产生保护效果。',
        'Grants the Haste and Protection effects with twice the normal duration.' : '产生加速和保护的效果。两倍持续时间',
        'Grants the Absorb effect.' : '使用后获得吸收效果。',
        'Grants the Shadow Veil effect.' : '使用产生闪避效果。',
        'Grants the Spark of Life effect.' : '使用产生生命火花效果。',
        'Grants the Absorb, Shadow Veil and Spark of Life effects with twice the normal duration.' : '同时产生吸收，闪避，以及生命火花效果,两倍持续时间.',

        'Health Gem' : '生命宝石',
        'Mana Gem' : '魔力宝石',
        'Spirit Gem' : '灵力宝石',
        'Mystic Gem' : '神秘宝石',
        'Health Potion' : '体力药水',
        'Health Draught' : '体力长效药',
        'Health Elixir' : '终极体力药',
        'Mana Potion' : '法力药水',
        'Mana Draught' : '法力长效药',
        'Mana Elixir' : '终极法力药',
        'Spirit Potion' : '灵力药水',
        'Spirit Draught' : '灵力长效药',
        'Spirit Elixir' : '终极灵力药',
        'Last Elixir' : '终极秘药',
        'Energy Drink' : '能量饮料',
        'Caffeinated Candy' : '咖啡因糖果',
        'Soul Stone' : '灵魂石',
        'Flower Vase' : '花瓶',
        'Bubble-Gum' : '泡泡糖',
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

    /////////////////////////////////////////////////////状态
        //先天能力
        '/^Focusing$/' : '专注',
        '/^Defending$/' : '防御',
        '/^Fleeing$/' : '逃跑',
        'You are mentally prepared for casting a magical attack. The chance for your spell being evaded or resisted is reduced, but so are your avoidance stats.' : '你正集中精力准备释放法术，你的法术被闪避和被抵抗概率降低，但你自身的躲避能力同样下降。',
        'You are defending from enemy blows. The amount of damage you take is reduced by' : '你正在防御敌人的进攻，你遭受的攻击伤害将减少',
        'You are running away' : '你正尝试从战场中逃离',

        //战斗风格
        'Overwhelming Strikes' : '压倒性的攻击',
        '/^Coalesced Mana$/' : '魔力合流',
        'Ether Tap' : '以太水龙头',
        'Increases attack damage by 15% and attack accuracy by 50%. Also grants a 20% chance per stack to overwhelm enemy parry.' : '增加15%攻击伤害和50%攻击准确度。每一道特效有20%反制怪物招架几率，最多可堆叠5道特效 (完全无视怪物的招架)',
        'Mystical energies have converged on this target. Striking it with any magic spell will consume only half the normal mana.' : '神秘的能量汇集于这个目标，对它施放魔法咒语只需消耗一半的魔力值 (可以和灵动架式共同作用)。',
        'You are absorbing magicks from shattering the Coalesced Mana surrounding a target.' : '你打散了合流于目标周围的魔力然后吸取中。',

        //武器效果
        'Penetrated Armor' : '破甲',
        'Stunned' : '眩晕',
        'Bleeding Wound' : '流血',
        'A powerful blow has temporarily stunned this target.' : '巨大的冲击使目标陷入眩晕，它将无法继续行动。',
        'The armor of this target has been breached, reducing its physical defenses.' : '目标的护甲被击穿，它的物理防御力下降了',
        'A gashing wound is making this target take damage over time.' : '血流如注的伤口给予此目标持续伤害。',

        //特殊
        '/^Channeling$/' : '引导',
        'Blessing of the RiddleMaster' : '御谜士的祝福',
        'You are channeling the mystic forces of the ever-after. Your next spell is powered up by 50%, and costs no MP.' : '你正不断地引导出神祕的力量，你下一次施放的咒语效果会增强 50% 且只会消耗 1 点魔力值。',
        'You have been blessed by the RiddleMaster. Your attack and magic damage are temporarily increased by' : '你已被御谜士祝福，你的物理和魔法攻击会短暂提升',

        //恢复剂
        'Refreshment' : '提神',
        'Regeneration' : '再生',
        'Replenishment' : '补给',
        'Energized' : '带劲',
        'Kicking Ass': '海扁',
        'Sleeper Imprint' : '沉睡烙印',
        'You are generating additional Overcharge and Spirit.' : '你正在产生额外的斗气和灵力。',
        'The holy effects of the spell are restoring your body.' : '神奇的细胞再生效果正在恢复你的身体',
        'The Spirit Restorative is refreshing your spirit.' : '灵力恢复剂正在提升你的灵力',
        'The Health Restorative is regenerating your body.' : '体力恢复剂正在再生你的体力',
        'The Mana Restorative is replenishing your magic reserves.' : '魔力恢复剂正在补给你的魔力',
        'Your attacks and spells deal significantly more damage for a short time, will always hit, and will always land critical hits. Also replenishes 20% of base mana and health per turn.' : '你的攻击和咒语伤害短暂大幅提升。必定命中且必定暴击。同时每回合补充 20% 基础魔力与基础生命值。',
        'Your attack/magic damage, attack/magic hit/crit chance, and evade/resist chance increases significantly for a short time.' : '你的物理/魔法 伤害、命中、暴击率、回避、抵抗率短暂大幅提升。',

        //卷轴
        '(Scroll]' : '[卷轴]',
        'Increases Action Speed by' : '增加行动速度',
        'Absorbs all damage taken by' : '吸收所有伤害的',
        'Increases evasion by' : '增加闪避率',
        'Any attack that would normally kill the target leaves it alive with 50% HP. The buff is removed when triggered.' : '任何本该杀死玩家的攻击现在玩家可以保留50%的HP存活。辅助效果在触发之后就会消失 (并且消耗玩家25%基础灵力值)',
        'The next magical attack against the target will be absorbed and partially converted to MP.' : '命中此目标的下一次魔法伤害将100%被吸收并转为MP',

        //魔药
        'Infused Flames' : '火焰围绕',
        'Infused Frost' : '冰霜覆盖',
        'Infused Lightning' : '雷电围绕',
        'Infused Storm' : '暴风围绕',
        'Infused Divinity' : '神圣围绕',
        'Infused Darkness' : '黑暗围绕',
        'You are wreathed in the power of flames.' : '你被火焰的力量覆蓋著。',
        'You are suffused with the power of frost.' : '你充满著冰霜的力量。',
        'You are surrounded by the power of lightning.' : '你被雷电的力量围绕着。',
        'You are draped in the power of storms.' : '你乘着暴风的力量。',
        'You are veiled in the power of divinity.' : '你被蒙上神圣的力量。',
        'You are cloaked in the power of darkness.' : '你披上了黑暗的力量。',

        //BUFF的效果
        '/^Regen$/' : '细胞活化',
        '/^Protection$/' : '守护',
        '/^Spirit Shield$/' : '灵力盾',
        '/^Hastened$/' : '疾速',
        '/^Shadow Veil$/' : '影纱',
        '/^Absorbing Ward$/' : '吸收结界',
        '/^Spark of Life$/' : '生命火花',
        '/^Cloak of the Fallen$/' : '陨落的披风',
        '/^Heartseeker$/' : '穿心',
        '/^Arcane Focus$/' : '奥术集成',
        'The holy effects of the spell are restoring your body.' : '神奇的细胞再生效果正在恢复你的身体',
        'Places a shield effect on the target, absorbing' : '对目标施加护盾效果，吸收所有攻击',
        'of the damage from all attacks.' : '的伤害值。',
        'The target has been hastened, increasing its action speed by' : '目标已被加速，行动速度增加',
        'A veil of shadows surround the target, increasing its chance to evade attacks and spells by' : '目标被影纱包围，回避率增加',
        'This protective veil activates for powerful blows that damage more than' : '当你遭受到强力攻击时超出生命值',
        'of your max HP, absorbing the remainder as spirit damage.' : '的伤害会被吸收部分伤害转嫁到灵力值量表，而不是生命值量表。',
        'Any attack that would normally kill the target leaves it alive with a small amount of HP. The buff is removed when triggered.' : '受到任何致命攻击时会以1HP保住性命。辅助效果在触发之后就会消失 (并且消耗玩家50%基础灵力)。',
        'Being brought back by Spark of Life has draped you with this powerful protective shield, increasing your damage resistance for a brief time.' : '被“生命火花”带回战场的你披着此强力的防护盾，短暂地强化你的伤害抗性。',
        'You are able to see the flow of life in all living beings, increasing your attack damage by' : '你已到达精通万物生命源流的境界，强化物理攻击威力',
        'and crit chance by': '和暴击率',
        'You have reached a high level of attunement with the arcane forces, increasing your magic damage by' : '你经由奥术的力量点化而到达更高的境界，强化魔法的威力',


        //DEBUFF效果
        '/^Weakened$/' : '虚弱',
        '/^Slowed$/' : '缓慢',
        '/^Magically Snared$/' : '魔磁网',
        '/^Imperiled$/' : '陷危',
        '/^Silenced$/' : '沉默',
        '/^Asleep$/' : '沉眠',
        '/^Blinded$/' : '盲目',
        '/^Confused$/' : '混乱',
        'The target has been weakened, making it deal less damage, and preventing it from scoring critical hits.' : '目标已被弱化，使它的攻击打出较低伤害且能防止它打出暴击。',
        'The target has been slowed by' : '此目标已延迟',
        'The target has been hit with a magic net, eliminating its chance to evade or resist attacks.' : '目标已被能量网诱捕，削减它的回避和咒语抵抗。',
        'The target has been imperiled, reducing physical and magical mitigation as well as elemental mitigations.' : '目标已被劣化，削减它的物理和魔法缓伤，同样也削减四元素缓伤。',
        'The target has been silenced, preventing it from using special attacks and magic.' : '目标已被封口，防止它使用特殊攻击。',
        'The target has been lulled to sleep, preventing it from taking any actions.' : '目标已进入沉睡，防止它采取任何行动。',
        'The target has been blinded, reducing the chance of landing attacks and hitting with magic spells.' : '目标已盲眼，降低攻击与魔法咒语的命中率。',
        'The target has been confused, making it lunge out wildly and strike friends and foes alike.' : '目标产生错乱，如同面对敌人似地疯狂扑向伙伴攻击。',

        'Vital Theft' : '生命吸窃',
        'Ether Theft' : '以太吸窃',
        'Spirit Theft' : '灵力吸窃',
        'Siphons off the target\'s life essence over time. This causes a damage-over-time effect, and returns a small amount of health to the player.' : '持续抽取目标的生命精髓。造成持续伤害效果而且少量的生命值会回到玩家身上。',
        'Siphons off the target\'s mana over time. This returns a small amount of mana to the player.' : '持续抽取目标的魔力值。少量的魔力值会回到玩家身上。',
        'Siphons off the target\'s spirit over time. This returns a small amount of spirit to the player.' : '持续抽取目标的灵力值。少量的灵力值会回到玩家身上。',


        //攻击咒语效果
        'Searing Skin' : '烧灼的皮肤',
        'Freezing Limbs' : '冰封的肢体',
        'Turbulent Air' : '湍流的空气',
        'Deep Burns' : '深层的烧伤',
        'Breached Defense' : '崩溃的防御',
        'Blunted Attack' : '钝化的攻击',
        'The skin of the target has been scorched, inhibiting its attack damage. Cold resistance is lowered.' : '此目标的皮肤已烧焦，抑制它的攻击力，冰抗性降低。',
        'The limbs of the target have been frozen, causing slower movement. Wind resistance is lowered.' : '此目标的肢体已被冻结，使它行动迟缓，风抗性降低。',
        'The air around the target has been upset, blowing up dust and increasing its miss chance. Elec resistance is lowered.' : '此目标周围的气流已被扰乱，扬起的尘土增加它的错失率，雷抗性降低。',
        'Internal damage causes slower reactions and lowers evade and resist chance. Fire resistance is lowered.' : '体内的伤害导致反应迟钝，降低回避率与抵抗率，火抗性降低。',
        'The holy attack has penetrated the target defenses, making it take more damage. Dark resistance is lowered.' : '神圣的攻击穿透此目标的防御，它将会受到更多伤害，暗抗性降低。',
        'The decaying effects of the spell has blunted the target offenses, making it deal less damage. Holy resistance is lowered.' : '咒语的衰败效果磨钝目标的攻击性，使它打出较低伤害，圣抗性降低。',

        'Burning Soul' : '焚烧的灵魂',
        'Ripened Soul' : '鲜美的灵魂',
        'The life essence of the target has been set ablaze, damaging its physical form over time.' : '此目标的生命之核已被点燃，对它造成持续性物理伤害。',
        'The life essence of the target has been corrupted beyond repair, damaging its physical form over time.' : '此目标的生命之核持续著无法修补的腐败，对它造成持续性物理伤害。',


        //特殊怪物效果
        'Fury of the Sisters' : '姊妹们的盛怒',
        'Lamentations of the Future' : '未来的悲叹',
        'Screams of the Past' : '昔日的凄叫',
        'Wails of the Present' : '此刻的恸哭',
        'The destruction of the world tree has infuriated its defenders, increasing their hit and crit chances.' : '消灭世界树激怒了它，使它的命中率和暴击率增加。',
        'The destruction of the future has increased the attack power of her allies.' : '诗蔻蒂被击倒，消灭了“未来”，强化了它的攻击力。',
        'The destruction of the past has increased the defensive power of her allies.' : '兀儿德被击倒，消灭了“过去”，强化了它的防御力。',
        'The destruction the present has increased the attack speed of her allies.' : '蓓儿丹娣被击倒，消灭了“现在”，强化了它的攻击速度。',


        '' : '',
        '' : '',
    '':''};











    //////////////////////////////////////////////////////////////////////////////
    // This is where the real code is
    // Don't edit below this
    // 翻译字典到上面为止全部结束，以下部分为真正的翻译代码
    // 除非你知道自己在干什么否则不要动下面的代码部分
    //////////////////////////////////////////////////////////////////////////////

    var regexs = [], replacements = [],
        tagsWhitelist = ['PRE', 'BLOCKQUOTE', 'CODE', 'INPUT', 'BUTTON', 'TEXTAREA','SCRIPT','STYLE'],
        rIsRegexp = /^\/(.+)\/([gim]+)?$/,
        word, text, texts, i, userRegexp;

    // prepareRegex by JoeSimmons
    // used to take a string and ready it for use in new RegExp()
    function prepareRegex(string) {
        return string.replace(/([\[\]\^\&\$\.\(\)\?\/\\\+\{\}\|])/g, '\\$1');
    }

    // function to decide whether a parent tag will have its text replaced or not
    function isTagOk(tag) {
        return tagsWhitelist.indexOf(tag) === -1;
    }

    delete words['']; // so the user can add each entry ending with a comma,
                      // I put an extra empty key/value pair in the object.
                      // so we need to remove it before continuing

    // convert the 'words' JSON object to an Array
    for (word in words) {
        if ( typeof word === 'string' && words.hasOwnProperty(word) ) {
            userRegexp = word.match(rIsRegexp);

            // add the search/needle/query
            if (userRegexp) {
                regexs.push(
                    new RegExp(userRegexp[1], 'g')
                );
            } else {
                regexs.push(
                    new RegExp(prepareRegex(word).replace(/\\?\*/g, function (fullMatch) {
                        return fullMatch === '\\*' ? '*' : '[^ ]*';
                    }), 'g')
                );
            }

            // add the replacement
            replacements.push( words[word] );
        }
    }

    // function to do the replacement for battle info element
    function replace() {
        texts = document.evaluate(`//div[@id='infopane']//text()[ normalize-space(.) != "" ]`, document, null, 6, null);
        for (i = 0; text = texts.snapshotItem(i); i += 1) {
            //console.log(text.parentNode.tagName)
            var temp = text.data;
            for(var index in regexs){
                temp = temp.replace( regexs[index], replacements[index] );
            }
            if(temp!=text.data) text.data = temp;
        }
    }

    function init() {
        replace();
        new MutationObserver(replace).observe(document.getElementById('infopane'),{childList:true,subtree:true});
    }

    init();
    document.addEventListener('HVCounterReload', init);
    document.addEventListener('DOMContentLoaded', init);
}());
