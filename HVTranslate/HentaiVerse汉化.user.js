// ==UserScript==
// @name           HentaiVerse汉化
// @namespace      hentaiverse.org
// @author         ggxxsol & NeedXuyao & mbbdzz & indefined & etc.
// @icon           https://hentaiverse.org/y/favicon.png
// @updateURL      https://sleazyfork.org/scripts/404118/code/script.meta.js
// @downloadURL    https://sleazyfork.org/scripts/404118/code/script.user.js
// @description    基本完全汉化整个Hentaiverse文本，包括装备物品、界面说明和弹窗提示的汉化，带原文切换功能
// @notice         本脚本已完全整合HV战斗汉化功能，与独立的HV战斗汉化脚本互斥，默认不开启，如需开启战斗汉化在战斗界面中双击信息面板的提示
// @notice         完整功能需要在Hentaiverse主菜单 CHARACTER→SETTINGS 勾选自定义字体(Use Custom Font)并在下一行文本框中填上任意字体名称，拉到最下面点击Apply Changes
// @notice         和HVToolBox1.0.7以前版本在物品仓库中冲突，使用请更新到新版HVToolBox并将汉化运行顺序放在HVToolBox之后
// @notice         如与Live Percentile Ranges同时使用，需要将脚本运行顺序置于Live Percentile Ranges之后，查询不同品质范围需要切换到英文状态
// @notice         如有其它脚本共同运行冲突也可尝试调整脚本运行顺序，但无法保证完全兼容
// @include        *://hentaiverse.org/*
// @include        *://alt.hentaiverse.org/*
// @core           http://userscripts-mirror.org/scripts/show/41369
// @version        2025.04.22
// @grant none
// ==/UserScript==
(function () {
    'use strict';
    //if (document.getElementById('pane_log')) return;

    //字典分区，决定网页中的哪一部分使用哪部分翻译字典
    //格式： 'css选择器': ['使用到的字典名称',..]
    //注意使用到的字典顺序，互相包含的分区或者一个分区使用多个字典前面的翻译可能会影响后面的结果
    var dictsMap = {
        // 除了本字典分区里指定的部分之外，正文字典里另有alerts(浏览器弹窗)特殊部分使用独立方法翻译且所有页面生效
        '#messagebox' : ['messagebox', 'items', 'equipsName', 'equipsInfo'], //HV内的系统消息浮窗，所有页面的系统信息提示翻译均在这部分
        '#messagebox_outer' : ['messagebox', 'items', 'equipsName', 'equipsInfo'], //HV内的系统消息浮窗，所有页面的系统信息提示翻译均在这部分
        'body>script[src$="hvc.js"]+div[style]:not([id])' : ['login'], //登陆页面，因为没有ID特征比较难搞
        '#navbar' : ['menu', 'difficulty'], //主菜单导航栏，使用菜单字典和难度名字典
        '#eqch_left' : ['character', 'equipsName', 'equipsPart'], //主界面和切换装备页左侧栏，使用主界面字典和装备字典
        '#compare_pane' : ['equipsInfo'], //切换装备页面的装备对比悬浮窗，使用装备信息字典。
        '#eqch_stats' : ['characterStatus'], //主界面右侧状态栏
        '#ability_outer' : ['ability'], //技能页面，使用技能名称字典
        '#ability_info' : ['skills', 'abilityInfo', 'ability', 'items'], //技能悬浮窗，需监听动态翻译
        '#train_outer' : ['trains'], //训练
        '#popup_box' : ['itemInfos', 'items', 'artifact', 'equipsName', 'equipsInfo'], //物品和装备悬浮窗，需要监听动态翻译
        '#filterbar' : ['filters'], //装备、物品列表的类型筛选栏
        '#item_outer' : ['items', 'artifact'], //物品仓库
        '#eqinv_outer' : ['equipsName'], //装备仓库
        '#itshop_outer' : ['items', 'artifact'], //物品商店
        '#eqshop_outer' : ['equipsName'], //装备商店
        '#itembot_outer' : ['itemBot', 'items', 'artifact'], //采购机器人
        '#bocreate' : ['itemBot'], //采购机器人
        '#market_right' : ['items', 'artifact'], //市场列表
        '#market_outer' : ['market'], //交易市场其它内容
        '#settings_outer' : ['settings', 'skills', 'difficulty', 'equipsName'], //设置页面
        '#monstercreate_right' : ['monsterCreate'], //创建怪物信息，由于此面板被怪物实验室包含，实际也使用到了下一行的字典
        '#monster_outer' : ['monsterLabs'], //怪物实验室
        '#upgrade_text' : ['monsterLabs', 'items'], //怪物实验室的升级强化需求提示，需要监听动态翻译
        '#shrine_left' : ['artifact'], //祭坛左侧物品列表
        '#shrine_right' : ['shrine'], //祭坛右侧说明
        '#accept_equip' : ['equipsPart'], //装备献祭选项
        '#shrine_offertext' : ['artifact', 'shrine'], //祭坛献祭物品动态说明，需要动态监听
        '#mmail_outer' : ['mm'], //邮件
        '#mmail_attachlist' : ['items', 'artifact', 'equipsName'], //邮件附件列表
        '#mmail_attachitem' : ['items', 'artifact'], //写邮件附带物品列表
        '#mmail_attachequip' : ['equipsName'], //写邮件附带装备列表
        '#lottery_eqname' : ['equipsName'], //彩票装备名
        '#lottery_eqstat' : ['equipsInfo'], //彩票装备属性
        'div:not([id])>#leftpane' : ['prizes'], //很混乱的左侧栏，此处为彩票左侧栏
        'div:not([id])>#rightpane' : ['prizes'], //也很乱的右侧栏，此处为彩票右侧栏
        '#forge_outer>#leftpane' : ['equipsName','equipsSuffix'], //此处为强化左侧栏装备列表
        '#forge_outer>#rightpane' : ['upgrades', 'items', 'equipsInfo'], //装备强化的右侧栏，包含强化、物品、装备信息
        '#forge_cost_div' : ['upgrades', 'items'], //装备修复、拆解、魂绑、重铸右侧的动态提示文本，需要监听动态翻译
        '#equip_extended' : ['equipsInfo'], //强化、装备独立信息页的装备信息
        '#showequip' : ['equipsName', 'equipsSuffix'], //独立装备信息页，装备信息已经由上面翻译只需要翻译装备名和装备后缀补充
        '#arena_list' : ['battle', 'difficulty'], //AR/ROB战斗列表
        '#arena_tokens' : ['battle'], //ROB的底部令牌提示
        '#towerstart' : ['battle', 'difficulty'], //TW战斗模式入场提示
        '#grindfest' : ['battle'], //GF战斗提示
        '#itemworld_left' : ['equipsName'], //IW左侧装备列表
        '#itemworld_right' : ['battle'], //IW右侧战斗提示
        '#riddlemaster' : ['riddlemaster'], //小马引导图

        //战斗页面的翻译元素，即使已经写了字典脚本默认也不会翻译战斗页面，需要双击战斗下方经验条开启
        '#infopane' : ['battling', 'skills'], //战斗提示信息面板
        //以下几个面板翻译会和Monsterbation冲突，且切换翻译需要刷新页面才会生效
        //'#table_skills' : ['skills'], //战斗技能面板
        //'#table_magic' : ['skills'], //战斗法术面板
        //'#pane_item' : ['battling'], //战斗物品面板
    };

    //需要监听动态翻译的元素列表，除非有新的动态元素否则不需要更改
    //只要上面字典分区里没有的就算在下面动态元素列表里有的也不会被翻译
    var dynamicElem = [
        '#popup_box', //装备、物品信息悬浮窗
        '#bocreate', //物品机器人订单按钮
        '#ability_info', //技能说明悬浮窗
        '#upgrade_text', //怪物实验室强化动态文字
        '#forge_cost_div', //装备修复、拆解、魂绑、重铸右侧的动态提示文本
        '#shrine_offertext', //祭坛献祭动态说明文字

        '#infopane', //战斗提示信息面板
        '#table_skills', //战斗技能列表
        '#table_magic', //战斗法术列表
        '#pane_item', //战斗物品面板
    ];




//翻译字典，内部分割为多个部分，每部分名称对应上述所指字典名称，翻译内容必须写入正确的部分才会生效
//除非上面字典分区中被指派到同一个翻译部分，否则各个部分之间互相独立，必要时有些翻译词条也会重复出现在多个部分中（这样比同时使用多个部分字典更有效率）
var words = {
    /*
    NOTE:
        You can use \\* to match actual asterisks instead of using it as a wildcard!
        The examples below show a wildcard in use and a regular asterisk replacement.
            'your a' : 'you\'re a',
            'imo' : 'in my opinion',
            'im\\*o' : 'matching an asterisk, not a wildcard',
            '/\\bD\\b/g' : '[D]',

        每部分字典内部语法格式：
            '原文' : '翻译之后的句子',
        原文部分如果带有*将被视为任意通配符，如果需要匹配真正的*号使用\\*代替*
            '\\*#06#' : '这句话将匹配到*#06#这个词而不会匹配到其它06#',
        原文部分可以使用正则表达式字符串，但是\必须二次转义为\\，比如
            '/(\\d)/' : '可以匹配到任意数字'，
        可以使用 '/^原文$/' 正则表达式来限制匹配整个原文句子而不是句子的一部分，比如:
            '/^Hell$/': '地狱', //可以匹配将'Hell'翻译为'地狱'而不会将'What the Hell'翻译为'What the 地狱'，也不会将'Hello'翻译为'地狱o'
    */

    //已知现缺：
        // trains：缺：新陈代谢、激励、解离症

    ////////////////////////////////////////////////////////////////////////////////
    // 浏览器弹窗，此部分使用独立翻译方法不受上面dictsMap影响
    // 此部分仅包含带有确认（取消）按钮的浏览器弹窗，所有页面的浏览器弹窗均使用此字典
    ////////////////////////////////////////////////////////////////////////////////
    alerts: {
        // 此部分内原文基本都是使用符合正则格式写的（正则元字符添加\\转义，去除前后的/之后可以直接用于创建RegExp）
        //hvc.js里的
        'Server communication failed: ' : '服务器通讯错误：',
        '/Are you sure you wish to purchase ([\\d,]+) equipment pieces? for ([\\d,]+) credits\\?/' : '是否确认以 $2 Credits的价格购买 $1 件装备',
        '/Are you sure you wish to sell ([\\d,]+) equipment pieces? for ([\\d,]+) credits\\?/' : '是否确认以 $2 Credits的价格出售 $1 件装备',
        '/Are you sure you wish to purchase ([\\d,]+) (.+) for ([\\d,]+) credits \\?/' : '是否确认以 $3 Credits的价格购买 $1 件 $2',
        '/Are you sure you wish to sell ([\\d,]+) (.+) for ([\\d,]+) credits \\?/' : '是否确认以 $3 Credits的价格出售 $1 件 $2',
        'No item selected' : '没有选中物品',
        '/Are you sure you wish to offer Snowflake a?/' : '是否确认向雪花女神献祭 ',
        '/You have attached ([\\d,]+) items?, and the CoD is set to ([\\d,]+) credits, kupo!/' : '你在邮件中附加了 $1 个附件，并且设置了 $2 Credits的货到付款(CoD)，注意！',
        '/You have attached ([\\d,]+) items?, but you have not set a CoD, kupo! The attachments will be a gift, kupo!/' : '你在邮件中附加了 $1 个附件，但是没有设置货到付款(CoD)，注意！你的附件将会被认为是礼物免费送出！',
        '/Sending it will cost you ([\\d,]+) credits, kupo!/' : '发送本邮件将会收取你 $1 Credits 的费用！注意！',
        '/Are you sure you wish to send this message, kupo\\?/' : '是否确认发送本邮件？',
        '/Are you sure you wish to discard this message, kupo\\?/' : '是否确认丢弃本邮件信息？注意！',
        '/Removing the attachments will deduct ([\\d,]+) Credits from your account, kupo! Are you sure\\?/' : '领取本邮件附件将会收取你 $1 Credits 货到付款(CoD)费用，是否确认？注意！',
        '/This will return the message to the sender, kupo! Are you sure\\?/' : '此操作将会把邮件退还给发件人，是否确认？注意！',

        'Tired already? I guess we can play forever some other time...' : '累了？或许我们下次还可以一起愉快地玩耍',

        //网页内嵌script里的
        '/Enter a new name for this persona\\./' : '请输入一个新的用户名（1~20字符，仅支持英文和数字）',
        '/Are you sure you wish to create a new persona with the same attribute, slot, equipment and ability assignments as "(.+)"\\? This action is irreversible, and created personas cannot be deleted\\./' : '是否确认创建一个和 $1 相同属性、套装、技能分配的人格角色？注意此操作不可撤销且创建的角色无法删除！',
        '/Are you sure you wish to create a blank persona\\? This action is irreversible, and created personas cannot be deleted\\./' : '是否确认创建一个未设置的全新人格角色？（你的等级经验和基础熟练、装备物品仓库等仍然和当前人格角色共享）请注意此操作无法撤销且创建的角色无法删除！',
        '/Reseting this ability will cost ([\\d,]+) soul fragments?\\. Proceed\\?/' : '重置该技能将消耗 $1 个灵魂碎片，是否执行？',
        '/Reseting this ability is free this time\\. Proceed\\?/' : '本次重置技能免费(总计达到10次之后将消耗灵魂碎片)，是否执行？',
        '/This will reset ALL mastery and ability point assignments at a cost of ([\\d,]+) soul fragments?\\. Proceed\\?/' : '此操作将重置所有技能点和已投放的支配点，本次重置将消耗 $1 个灵魂碎片。是否执行？',
        '/This will reset ALL mastery and ability point assignments\\. This time it is free\\. Proceed\\?/' : '此操作将重置所有技能点和已投放的支配点，本次重置免费(下一次全部重置将消耗灵魂碎片)。是否执行？',
        '/Enter a new name for this monster\\./' : '请输入怪物的新名称（3~30字符，仅支持英文和数字）',
        '/Are you sure you wish to delete the monster (.+)?\\? This action cannot be reversed\\./' : '是否确认删除怪物 $1 ？ 此操作无法撤销！',
        '/Are you sure you wish to opt out of the grand prize drawing on this lottery\\? This is not reversible\\./' : '是否确认放弃本次彩票的头奖？此操作无法撤销',
        '/Are you sure you wish to start this Arena Challenge\\?/' : '是否确认进入竞技场挑战？',
        '/Are you sure you wish to spend ([\\d,]+) tokens? to start this Arena Challenge\\?/' : '是否确认消耗 $1 个令牌进入战场？',
        '/Are you sure you wish to enter the Ring of Blood\\?/' : '是否确认进入浴血擂台挑战？',
        '/Are you sure you wish to spend ([\\d,]+) tokens? to enter the Ring of Blood\\?/' : '是否确认消耗 $1 个鲜血令牌进入浴血擂台挑战？',
        '/Enter a name for this equipment\\./' : '请输入装备名称（最大50个字符，仅支持字母和数字和非特殊字符)',

        //直接写在onclick里的
        '/Are you sure you want to reforge this item\\? This will remove all potencies and reset its level to zero\\./' : '是否确认重铸所选装备？此操作将会移除该装备所有的已解锁潜能并将潜能等级重置为0。',
        '/Are you sure you want to soulfuse this item\\? This will bind it to your level, but makes it untradeable\\./' : '是否确认灵魂绑定所选装备？该装备将会跟随你的等级成长并且变成不可交易。',
    },

    ///////////////////////////////////////////////////////
    // System Message弹窗, 所有页面的系统信息弹窗提示提示信息均需要放置在这一部分
    ///////////////////////////////////////////////////////
    messagebox: {
        'System Message' : '系统讯息',

        'No energy items available.' : '你没有可用的精神恢复剂',
        'Name contains invalid characters.' : '名字包含不支持字符(仅支持英文和数字)',
        '/Name must be between (\\d+) and (\\d+) characters\./' : '名字长度需要在$1至$2个字符之间',
        'Requested persona does not exist' : '所选人格角色不存在',
        'You cannot currently create more personas' : '你当前已经没有空余的角色槽可以创建新人格。',
        'Insufficient do-overs.' : '下调数值超过每日限制',
        'Insufficient EXP.' : '可分配属性点不足',

        'No such equipment' : '装备不存在',
        'Equipment is too high level to equip.' : '你无法穿戴比自己等级高的装备',
        'That item cannot be used as an offhand with that main weapon.' : '除非是太刀+脇差，否则不能在装备非单手武器的情况下在副手装备其他武器',
        'Cannot equip the same item in two slots.' : '不能把相同的装备同时穿戴在两个部位上',
        '/Equipment (\\d+) is currently equipped/' : '装备 $1 当前正在穿戴',
        'Cannot slot item - no free spaces.' : '无法携带物品 - 没有空余的物品槽。',
        'Can only slot consumables' : '你只能携带战斗消耗品',
        'Item is already slotted.' : '只能携带一种同名物品',
        'Slot only takes infusions.' : '所选物品槽只能装配魔药',
        'Slot only takes scrolls.' : '所选物品槽只能装配卷轴',
        'Insufficient items.' : '道具不足',

        'You cannot afford to train that.' : '你没有足够 Credits 训练指定项目',
        'You cannot start a new training at this time' : '你现在无法开始训练新项目',
        'You have already maxed that training.' : '该训练已经满级',
        'There is no such skill' : '所指定技能不存在',

        'Ability is already slotted' : '技能已装备',
        'No slot available that fits the given ability' : '没有合适的空槽位适合该技能',
        'The slot does not fit the given ability' : '所选技能不能装备在该槽位上',
        'That slot is already unlocked' : '所指定槽位已解锁',
        'No such slot' : '所指定槽位不存在',
        'Insufficient ability points' : '技能点不足',
        'Insufficient mastery points' : '支配点不足',
        'Ability cannot be increased further' : '你已经将该技能升级满了！',
        'No such ability' : '你没有获得该技能',
        'Level requirements not met' : '你还没有到达解锁该技能要求的等级',

        'There are no items of that type available.' : '购买的物品库存不足',
        'Item has already been sold.' : '所选物品已售出',
        'Invalid item, or item cannot be auto-bought' : '所指定物品无效在或者不能自动购买',
        'Bid price must be at least' : '最低出价为',
        'Insufficient credits.' : 'Credits 不足',
        'No longer available' : '已不存在',
        'Items cannot be sold while locked.' : '无法出售已锁定装备',
        'Items cannot be sold while in use.' : '无法出售正在穿戴装备',
        'Your equipment inventory is full' : '你的装备库存已经满了！',
        'You do not have enough credits for that.' : '你没有足够的 Credits 来执行操作！',

        'Item does not exist or cannot be traded' : '物品不存在或者不可交易',
        'Insufficent credits in market account' : '市场账户余额不足',
        'Insufficent credits in credit balance' : '个人账户余额不足',
        'Insufficient items available' : '你没有足够数量该物品可供出售',
        'You do not have a sufficient market balance to place that order' : '你没有足够的市场余额可供投放当前买单',
        'Bidding price must be at least' : '当前物品最低出价为',
        'Asking price must be at least' : '当前物品最低要价为',
        'The provided price point is not valid' : '价格无效',
        '/Your bid price must be at least (.+?) to overbid the current buy orders/' : '如果要加价超出目前最高买价你必须最少出价 $1',
        '/Your ask price must be at most (.+?) to undercut the current sell orders/' : '如果要减价低于目前最低卖价你必须开价不超过 $1',
        'You have to wait a short while between placing each order' : '你创建订单过于频繁，稍后再试',
        'Placing buy orders for this item has been temporarily disabled' : '此物品买单已暂时被禁用',
        'You cannot currently place buy orders' : '你现在无法创建买单',
        'You cannot currently place sell orders' : '你现在无法创建卖单',
        'Please wait a bit longer before making another account transfer' : '再等一会，你转账太快了',

        'There are no free slots left.' : '没有空余的怪物槽可以创建怪物。',
        'Slot unlock limit reached' : '怪物槽已达到上限',
        'Name is too long (max 50 chars)' : '名字太长（最大50个字符，仅支持字母和数字和非特殊字符)',
        'Too many spaces' : '名字包含太多空格(包含下划线最多5个，不能连用)',
        'A monster with that name already exists.' : '已存在此名字怪物',
        'The name is bad and you should feel bad' : '这个名字不太好，你应该也是这么觉得的',
        'Monster cannot yet be named.' : '你现在无法为怪物取名',
        'Monster is not sufficiency high powerlevel' : '此怪物还没有达到能强化此能力的等级',
        'Monster can no longer be deleted.' : '此怪物已经无法删除',
        'Insufficient happy pills' : '快乐药丸不足',
        'Insufficient Happy Pills' : '快乐药丸不足',
        'Insufficient food' : '食物不足',
        'Insufficient Monster Chow' : '怪物饲料不足',
        'Insufficient Monster Edibles' : '怪物食品不足',
        'Insufficient Monster Cuisine' : '怪物料理不足',
        'Insufficient tokens' : '令牌不足',
        'Insufficient crystals' : '水晶不足',
        'At full morale' : '情绪已满',
        'At full hunger' : '饥饿度已满',
        'brought you a gift' : '送来了礼物',
        'brought you some gifts' : '送来了一些礼物',
        'Received some' : '获得了一些',
        'Received a' : '获得了',
        //收到的怪物礼物使用items字典

        'Insufficient items, kupo!' : '物品不足，咕波！',
        'Equipment not found, kupo!' : '装备不存在，咕波！',
        'Equipment cannot be attached, kupo!' : '无法附带该装备，咕波！',
        'Insufficient credits, kupo!' : 'Credits 不足，咕波！',
        'The mail moogle cannot carry more than 10 items at a time, kupo!' : '每封邮件最多只能添加10个附件，咕波！',
        'CoD must be at least 10 credits, kupo!' : '货到付款(CoD)至少需要设置 10 Credits，咕波！',
        'Insufficient hath, kupo!' : 'Hath 不足，咕波！',
        'No amount specified, kupo!' : '没有指定数量，咕波！',
        'That item cannot be attached, kupo!' : '所选物品无法邮寄，咕波！',
        'Mail does not exist, kupo!' : '邮件不存在，咕波！',
        'You need to be a donator to attach items, kupo!' : '你需要捐助e绅士才可以在异世界邮局添加附件，咕波！',
        'Cannot set CoD without attachments, kupo!' : '你必须至少附带一件附件才能设置货到付款(CoD)，咕波！',
        'You cannot afford the postage, kupo!' : '你负担不起邮资，咕波！(没有购买hath能力“邮资已付”时每发一封邮件10C手续费，且设置CoD时会有额外的费用)',
        'You must at minimum specify a recipient and subject, kupo!' : '你必须至少设定一个收件人和主题，咕波！',
        'You must at minimum specify a subject, kupo!' : '你必须至少填写主题，咕波！',
        'Invalid or missing recipient, kupo!' : '收件人不存在，咕波！',
        'You cannot read that, kupo!' : '你无法阅读该邮件，咕波！',
        'Messaging yourself must be the ultimate form of social withdrawal, kupo! Seek help, kupo!' : '给自己发邮件是社交退缩的终极形式，咕波！去找些别的乐子吧，咕波！',
        'Mail cannot be returned, kupo!' : '此邮件已无法退回，咕波！',
        'Message has no attachment, kupo!' : '此邮件没有附件，咕波！',
        'Received Paid CoD' : '收到CoD收货支付款',
        'was added to your balance.' : '已添加到你的余额。',

        'Invalid reward class' : '所选奖励类型不可用',
        'Invalid reward type' : '所选奖励类型不可用',
        'No such item' : '物品不存在',
        'You do not have enough of that trophy' : '你没有足够的奖杯执行此次献祭',
        'Snowflake has blessed you with some of her power!' : '雪花女神用她的力量祝福了你！',
        'Your strength' : '你的力量',
        'Your dexterity' : '你的灵巧',
        'Your agility' : '你的敏捷',
        'Your endurance' : '你的体质',
        'Your intelligence' : '你的智力',
        'Your wisdom' : '你的智慧',
        'has increased by one' : '提升了1点',
        'Follower peerless granted!' : '获得雪花信徒的无双奖励！',
        'Snowflake has blessed you with an item!' : '雪花女神祝福了你！',
        'Received' : '获得了',
        'Sold it for' : '已自动出售获得',
        'Salvaged it for' : '已自动拆解获得',
        'Hit Space Bar to offer another item like this.' : '按空格键可以重复执行上一个相同的献祭',
        //献祭收到的装备使用equipsName字典

        'Cannot opt out without buying a ticket first' : '你必须至少购买一张彩票才能决定是否参与头奖争夺',
        'Too many tickets - may not have more than 20,000 tickets per drawing' : '购买数量超过上限 - 每期彩票你最多只能拥有2万张',
        'Must buy at least one ticket' : '最低起购数量1张',
        'No golden tickets to spend' : '你没有黄金彩票券可以使用',
        'Already spent a golden lottery ticket' : '你已经使用了一张黄金彩票券',
        'Already opted out' : '已经决定过放弃头奖',
        'This lottery is closed' : '本期彩票售卖已结束',
        'Insufficient GP' : 'GP不足',

        'Invalid or expired token' : '令牌无效或者已过期',
        'You cannot enter the same arena twice in one day.' : '同一竞技场一天只能进入一次',
        'You cannot enter the Item World while exhausted.' : '你无法在精力耗竭时进入道具界',
        'You cannot start a Grindfest while exhausted.' : '你无法在精力耗竭时进入压榨界',
        'You cannot attempt The Tower again until tomorrow.' : '你今天的塔楼挑战/清通次数已达上限，明天再来吧。',
        'You do not have enough stamina to start a new Arena.' : '你没有足够的精力开始竞技场挑战',
        'You do not have enough stamina to enter this Item World.' : '你没有足够的精力进入道具界挑战',
        'You do not have enough stamina to start a new Grindfest.' : '你没有足够的精力开始压榨界挑战',
        'You do not have enough stamina to enter The Tower.' : '你没有足够的精力进入塔楼挑战',
        'Item is already max level' : '装备等级已满',
        'Cannot fight in equipped items' : '正在佩戴的装备无法进入道具界中',

        'Cannot rename equipment until level 10' : '你必须先将装备升级到潜能等级10才能对其重命名',
        'Cannot reforge level zero items' : '不能重铸潜能等级为0的装备',
        'Cannot reforge locked or equipped items' : '不能重铸上锁或者正在穿戴的装备',
        'Cannot salvage locked or equipped items' : '不能分解上锁或者正在穿戴的装备',
        'No base salvage could be extracted.' : '重复拆解已经拆解过的装备不再获得基础材料',
        'Insufficient materials.' : '材料不足',
        'Insufficient soul fragments.' : '灵魂碎片不足',
        'Insufficient amnesia shards.' : '重铸碎片不足',
        'Equipment Potency Unlocked!' : '解锁了装备潜能！',
        //强化装备解锁的潜能使用equipsInfo字典
        'Cannot upgrade item' : '无法升级',
        'Cannot enchant item' : '无法附魔',
        'Salvaged' : '分解获得',
        'Returned' : '返还强化材料',
        'Item not found' : '物品不存在',

    },

    ///////////////////////////////////////////////////////
    // 出于效率考虑，当前脚本未使用全局翻译，此字典目前未使用
    // 包括此字典在内的维护提示和无框架报错内容目前不会被翻译
    ///////////////////////////////////////////////////////
    body: {
        'Account Suspended' : '你登月了~',
        /* // 历史维护提示，应该不会重复使用
        'Snowflake and the moogles are relaxing on the beach. Check back later.' : '雪花女神和莫古利正在海滩休息，请稍后再来',
        'Snowflake and the moogles are rebooting the universe. Check back later.' : '雪花女神和莫古利正在重启宇宙，请稍后再来',
        'Snowflake and the moogles are playing in the snow. Check back later.' : '雪花女神和莫古利正在玩雪，请稍后再来',
        'Snowflake and the moogles are pining for spring. Check back later.' : '雪花女神和莫古利渴望春天，请稍后再来',
        'Snowflake and the moogles are remaking the world. Check back later.' : '雪花女神和莫古利正在重做世界，请稍后再来',
        'Snowflake and the moogles are fixing shit. Check back later.' : '雪花女神和莫古利正在修复东西，请稍后再来',
        'Snowflake and the moogles are remaking the world. Check back later.' : '雪花女神和莫古利正在重造世界，请稍后再来',
        */
        '/Snowflake and the moogles are .+? Check back later./' : '版本维护中，请稍后再来。',
        'Page load has been aborted due to a fatal error. A report has been dispatched to site staff. Please try again later.' : '发生致命错误，页面加载已取消。报告已发送给网站管理员，请稍后再试。',

        'Item not found' : '物品不存在',
        'Nope' : '不行！',
    },

    ///////////////////////////////////////////////////////登陆界面
    login: {
        'You have to log on to access this game.' : '你必须登陆之后才能访问游戏功能',
        'You have to log on with an EH account to access the game.' : '你必须使用EH账号登陆之后才能访问游戏功能',
        'No account? ' : '还没有帐号？',
        'No account yet?' : '还没有账号？',
        'Click here to create one' : '点击此处创建一个',
        '. (It\'s free!)' : ' (不要钱的)',
        'It\'s free, obviously.' : '很显然，不要钱的',
        'User:' : '用户:',
        'Pass:' : '密码:',
        'Login!' : '登陆!',
        '/^ or $/' : ' 或者 ',
        'Register' : '注册',
        'The HentaiVerse a free online game hosted by' : 'HentaiVerse是由E绅士呈现的一个免费在线游戏 ',
        'The HentaiVerse a free online game presented by ' : 'HentaiVerse是由E绅士呈现的一个免费在线游戏 ',
        'E-Hentai.org - The Free Hentai Gallery System' : 'E-Hentai.org - 免费的绅士画廊',
        'You must be logged on to visit the HentaiVerse.' : '你必须登陆之后才能访问HentaiVerse',
    },

    ///////////////////////////////////////////////////////主菜单导航栏
    //除了菜单项还包括难度等级和精力下方的一些红字提示。
    menu: {
        'Character' : '角色',
        '/^Equipment$/' : '装备',
        'Abilities' : '技能',
        'Training' : '训练',
        'Item Inventory' : '物品仓库',
        'Equip Inventory' : '装备仓库',
        'Settings' : '设置',
        'Equipment Shop' : '武器店',
        '/^Item Shop$/' : '道具店',
        'Item Shop Bot' : '采购机器人',
        'Item Backorder' : '采购机器人',
        'The Market' : '交易市场',
        'Monster Lab' : '怪物实验室',
        'The Shrine' : '雪花祭坛',
        'MoogleMail' : '莫古利邮局',
        'Weapon Lottery' : '武器彩票',
        'Armor Lottery' : '防具彩票',
        'The Arena' : '竞技场(The Arena)',
        'The Tower' : '塔楼(The Tower)',
        'Ring of Blood' : '浴血擂台(Ring of Blood)',
        'GrindFest' : '压榨界(GrindFest)',
        'Item World' : '道具界(Item World)',
        '/^Repair$/' : '装备修理',
        '/^Salvage$/' : '装备分解',
        '/^Reforge$/' : '装备重铸',
        '/^Soulfuse$/' : '装备魂绑',
        '/^Upgrade$/' : '装备强化',
        '/^Enchant$/' : '装备附魔',
        'Stamina:' : '精力:',
        'Check Attributes' : '检查属性点分配！',
        'Check Abilities' : '检查技能！',
        'Check attributes' : '检查属性点分配！',
        'Check abilities' : '检查技能！',
        'Check equipment' : '检查装备！',
        'Repair armor' : '护甲需要修理！',
        'Repair weapon' : '武器需要修理！',
        'Armor Damage' : '护甲损坏！',
        'Weapon Damage' : '武器损坏！',
        //'Next:' : '距离升级还差', //与HVUtils获取等级经验冲突

        '/^Isekai$/' : '异世界',
        'Currently playing on Isekai' : '你当前在异世界模式下',
        'Season' : '赛季',
        'Click to switch to Persistent' : '点击切换到传统恒定世界模式',
        '/^Persistent$/' : '恒定世界',
        'Currently playing on Persistent' : '你当前在传统恒定世界模式下',
        'Click to switch to Isekai' : '点击切换到异世界模式',

        'You have increased stamina drain due to low riddle accuracy' : '因为你的小马图回答正确率太低，你的精力消耗速率被提高了',
        'Great. You receive a 100% EXP Bonus but stamina drains 50% faster.' : '充沛，你将获得+100%经验奖励，但精力消耗速度增加50%。',
        'Normal. You are not receiving any bonuses or penalties.' : '正常，你既不会收到额外的奖励也不会受到惩罚',
        'Exhausted. You do not receive EXP or drops from monsters, and you cannot gain proficiencies.' : '耗竭，你将无法从怪物收到任何经验或者掉落，也无法获得熟练度奖励',
        'You Got Mail' : '你有新邮件',
    },

    ///////////////////////////////////////////////////////难度名
    // 包括上方主菜单导航栏等多个地方用到，姑且独立出来做一块方便统一管理……吧
    difficulty: {
        'Normal' : '普通 X1',
        'Hard' : '困难 X2',
        'Nightmare' : '噩梦 X4',
        'Hell' : '地狱 X7',
        'Nintendo' : '任天堂 X10',
        'IWBTH' : 'I Wanna X15',
        'PFUDOR' : '彩虹小马 X20',
    },

    ///////////////////////////////////////////////////////主界面和切换装备左侧栏
    character: {
        'Active persona' : '当前角色',
        'Used persona slots' : '已使用的角色槽',
        'Primary attributes' : '主属性',
        'Strength' : '力量',
        'Dexterity' : '灵巧',
        'Agility' : '敏捷',
        'Endurance' : '体质',
        'Intelligence' : '智力',
        'Wisdom' : '智慧',
        'Isekai bonus' : '异世界奖励',
        'Equipment proficiency' : '武器/装备熟练度',
        '/^One-handed$/' : '单手',
        '/^Two-handed$/' : '双手',
        'Dual wielding' : '双持',
        'Light armor' : '轻甲',
        'Cloth armor' : '布甲',
        'Heavy armor' : '重甲',
        'Magic proficiency' : '法杖/魔法熟练度',
        '/^Staff$/' : '法杖',
        '/^Elemental$/' : '元素魔法',
        '/^Divine$/' : '神圣魔法',
        '/^Forbidden$/' : '黑暗魔法',
        '/^Supportive$/' : '增益魔法',
        '/^Deprecating$/' : '减益魔法',
    ///////////////////////////////////////////////////////切换装备页面
        'Equipment Slots' : '套装切换',
        'Main Hand' : '主手',
        'Off Hand' : '副手',
        'Empty Slot' : '空槽位',
        'Empty' : '空',
        'Soulbound' : '灵魂绑定',
    },

    ///////////////////////////////////////////////////////主界面右侧的状态栏
    characterStatus: {
        'Statistics' : '状态栏',

        'Fighting Style' : '战斗风格',
        'Unarmed' : '徒手',
        'crushing' : '敲击',
        'piercing' : '刺击',
        'slashing' : '斩击',
        'void' : '虚空',

        'One-Handed' : '单手',
        'Counter-Attack' : '反击',
        'Overwhelming Strikes' : '压制打击',
        'on block/parry' : '格挡/招架时触发',
        'Two-Handed' : '双手',
        'Domino Strike' : '多米诺骨牌',
        'on mainhand hit' : '主手击中时触发',
        'Dualwield' : '双持',
        'Offhand Strike' : '副手攻击',
        'on offhand hit' : '副手击中时触发',
        'Staff' : '法杖',
        'Coalesced Mana' : '魔力合流',
        'on spell hit' : '法术击中时触发',
        'Niten Ichiryu' : '二天一流',
        'on hit' : '击中时触发',

        'Physical Attack' : '物理攻击相关',
        'attack base damage' : '基础攻击力',
        'hit chance' : '命中率',
        'crit chance' : '暴击率',
        '% damage' : '% 暴击伤害量',
        'attack speed bonus' : '攻击速度加成',

        'Magical Attack' : '魔法攻击相关',
        'magic base damage' : '魔法基础攻击力',
        'mana cost modifier' : '魔力消耗修正',
        'cast speed bonus' : '施法速度加成',

        'Vitals' : '状态值相关',
        'health points' : '体力值',
        'magic points' : '魔力值',
        'magic regen per tick' : '魔力恢复率/分',
        'spirit points' : '灵力值',
        'spirit regen per tick' : '灵力恢复率/分',

        'Defense' : '防御值相关',
        'physical mitigation' : '物理减伤',
        'magical mitigation' : '魔法减伤',
        'evade chance' : '回避率',
        'block chance' : '格挡率',
        'parry chance' : '招架率',
        'resist chance' : '抵抗率',

        'Compromise' : '装备影响',
        'interference' : '干涉',
        'burden' : '负重',

        'Specific Mitigation' : '属性减伤',
        'Spell Damage Bonus' : '法术伤害加成',
        '% fire' : '% 火焰',
        '% cold' : '% 冰冷',
        '% wind' : '% 疾风',
        '% elec' : '% 闪电',
        '% holy' : '% 神圣',
        '% dark' : '% 黑暗',
        '% void' : '% 虚空',

        'Effective Primary Stats' : '人物最终属性',
        'strength' : '力量',
        'dexterity' : '灵巧',
        'agility' : '敏捷',
        'endurance' : '体质',
        'intelligence' : '智力',
        'wisdom' : '智慧',

        'Effective Proficiency' : '有效熟练度',
        'one-handed' : '单手',
        'two-handed' : '双手',
        'dual wielding' : '双持',
        'staff' : '法杖',
        'cloth armor' : '布甲',
        'light armor' : '轻甲',
        'heavy armor' : '重甲',
        'elemental' : '元素魔法',
        'divine' : '神圣魔法',
        'forbidden' : '黑暗魔法',
        'deprecating' : '减益魔法',
        'supportive' : '增益魔法',
    },


    ///////////////////////////////////////////////////////训练
    trains: {
        'Training' : '训练',
        'Effect' : '效果',
        'Credit Cost' : '训练花费',
        'Time' : '耗时',
        'Level' : '等级',

        'Adept Learner' : '善学者',
        'Assimilator' : '同化者',
        'Ability Boost' : '能力升级',
        'Manifest Destiny' : '天命昭显',
        'Scavenger' : '拾荒者',
        'Luck of the Draw' : '抽签运',
        'Quartermaster' : '军需官',
        'Archaeologist' : '考古学家',
        'Metabolism' : '新陈代谢',
        'Inspiration' : '激励',
        'Scholar of War' : '战斗学者',
        'Tincture' : '酩酊',
        'Pack Rat' : '林鼠',
        'Dissociation' : '解离症',
        'Set Collector' : '套装收藏家',

        'EXP Bonus' : '经验值获取量',
        'Proficiency Experience' : '熟练度获取量',
        'Ability Point' : '技能点',
        'Mastery Point' : '支配点',
        'Improved Monster Hunger Drain' : '降低怪物饥饿速度（每一级推测为5%的效果，满级降低50%下降速度）',
        'Improved Monster Morale Drain' : '怪物士气不易降低（每一级推测为5%的效果，满级降低50%下降速度）',
        'Base Loot Drop Chance' : '基础掉落几率（发生掉落的基础概率为10%，一级提升0.05%基础掉落率，满级提升2.5%基础掉落率）',
        'Base Rare Drop Chance' : '基础物品掉落稀有度（提升稀有物品装备的掉落率）',
        'Base Rare Equipment Chance' : '基础稀有装备率（提升稀有装备的掉落率）',
        'Base Equipment Drop Chance' : '基础装备掉落率（装备基础掉落率2.5%，一级提升0.05%基础掉落率，满级提升2.5%基础掉落率）',
        'Base Artifact Drop Chance' : '基础文物掉落率（古董基础掉落率0.2%，一级提升0.02%基础掉落率，满级提升0.2%基础掉落率）',
        'Battle Scroll Slots' : '卷轴携带数',
        'Battle Infusion Slots' : '魔药携带数',
        'Battle Inventory Slots' : '战斗携带品携带数',
        'Persona Slot' : '人物角色槽',
        'Equipment Set' : '装备套装槽',

        'Here you can exchange your credits for Henjutsu 训练 in various subjects.' : '在这里你可以消耗credit提升你的各项能力',
        '训练 happens in realtime, and you can only train one skill at a time.' : '训练耗时是现实时间（小时），一次只能训练一个项目',

        'Progress:' : '进度:',
        'You have gained another level in' : '你训练提升了一级',
        'You have increased your EXP bonus by 1%!' : '你获得的经验加成增加了1%！',
        'You now get proficiency gains 10% more often!' : '你的熟练度获取量现在有10%的基础提升！',
        'You have received an additional' : '你获得了一点额外',
        'You now have a higher chance of finding items!' : '你现在有更高的几率拾获物品掉落！',
        'You feel a little luckier!' : '你感觉更加幸运了一点！',
        'Equipment will now drop a little more often!' : '你的装备掉落率现在小幅提升！',
        'You now have a slightly larger chance of uncovering lost artifacts!' : '你发现丢失文物的几率现在有轻微的提升！',
        //缺：新陈代谢、激励
        'Your battle scroll slots have been increased!' : '你的战斗卷轴携带槽现在增加了一格！',
        'Your battle infusion slots have been increased!' : '你的战斗魔药携带槽现在增加了一格！',
        'Your battle inventory space has been increased!' : '你的战斗携带品槽现在增加了一格！',
        //缺：解离症
        'You can now use an additional equipment set!' : '你现在可以多使用一套额外的装备套装！',
    },

    ///////////////////////////////////////////////////////技能
    ability: {
        'Major Ability Slot' : '主要技能槽',
        'Supportive Ability Slot' : '辅助技能槽',
        'Protection Augment Ability Slot' : '“守护”扩充技能槽',
        'Drain Augment Ability Slot' : '“枯竭”扩充技能槽',
        'Click or drag an unlocked ability to fill slot.' : '点击或者拖曳一个已解锁技能到此处安装',
        'Unlock Cost:' : '解锁消耗',

        'Maxed' : '已满级',
        'Ability Points' : '技能点',
        'Mastery Points' : '支配点',
        'Mastery Point' : '支配点',
        'AP' : '技能点',
        'Cost:' : '消耗:',
        'HP Tank' : '体力值增幅',
        'MP Tank' : '魔力值增幅',
        'SP Tank' : '灵力值增幅',
        'Better Health Pots' : '体力药水效果加成',
        'Better Mana Pots' : '魔力药水效果加成',
        'Better Spirit Pots' : '灵力药水效果加成',
        '2H Damage' : '双手流伤害加成',
        '1H Damage' : '单手流伤害加成',
        'DW Damage' : '双持流伤害加成',
        'Light Acc' : '轻甲套命中率加成',
        'Light Crit' : '轻甲套暴击率加成',
        'Light Speed' : '轻甲套攻速加成',
        'Light HP/MP' : '轻甲套生命/魔力值加成',
        '1H Accuracy' : '单手流命中率加成',
        '1H Block' : '单手流格挡率加成',
        '2H Accuracy' : '双手流命中率加成',
        '2H Parry' : '双手流招架率加成',
        'DW Accuracy' : '双持流命中率加成',
        'DW Crit' : '双持流暴击率加成',
        'Staff Spell Damage' : '法杖流法术伤害加成',
        'Staff Accuracy' : '法杖流全域命中率加成',
        'Staff Damage' : '法杖流法杖攻击伤害加成',
        'Cloth Spellacc' : '布甲套法术命中率加成',
        'Cloth Spellcrit' : '布甲套法术暴击加成',
        'Cloth Castspeed' : '布甲套咏唱速度加成',
        'Cloth MP' : '布甲套魔力值加成',
        'Heavy Crush' : '重甲套敲击减伤加成',
        'Heavy Prcg' : '重甲套刺击减伤加成',
        'Heavy Slsh' : '重甲套斩击减伤加成',
        'Heavy HP' : '重甲套体力值加成',
        'Better Weaken' : '强力虚弱',
        'Faster Weaken' : '快速虚弱',
        'Better Imperil' : '强力陷危',
        'Faster Imperil' : '快速陷危',
        'Better Blind' : '强力致盲',
        'Faster Blind' : '快速致盲',
        'Mind Control' : '精神控制',
        'Better Silence' : '强力沉默',
        'Better MagNet' : '强力魔磁网',
        'Better Slow' : '强力缓慢',
        'Better Drain' : '强力枯竭',
        'Faster Drain' : '快速枯竭',
        '/^Ether Theft$/' : '以太窃取',
        '/^Spirit Theft$/' : '灵力窃取',
        'Better Haste' : '强力急速',
        'Better Shadow Veil' : '强力影纱',
        'Better Absorb' : '强力吸收',
        'Stronger Spirit' : '强力灵能力',
        'Better Heartseeker' : '强力穿心',
        'Better Arcane Focus' : '强力奥数集成',
        'Better Regen' : '强力细胞活化',
        'Better Cure' : '强力治疗',
        'Better Spark' : '强力生命火花',
        'Better Protection' : '强力守护',
        'Flame Spike Shield' : '火焰刺盾',
        'Frost Spike Shield' : '冰霜刺盾',
        'Shock Spike Shield' : '闪电刺盾',
        'Storm Spike Shield' : '风暴刺盾',
        'Conflagration' : '火灾',
        'Cryomancy' : '寒灾',
        'Havoc' : '雷暴',
        '/^Tempest$/' : '风灾',
        'Sorcery' : '巫术',
        'Elementalism' : '自然崇拜者',
        'Archmage' : '大法师',
        'Better Corruption' : '强力腐败',
        'Better Disintegrate' : '强力瓦解',
        'Better Ragnarok' : '强力诸神黄昏',
        '/^Ripened Soul$/' : '成熟的灵魂',
        'Dark Imperil' : '暗陷危',
        'Better Smite' : '强力惩戒',
        'Better Banish' : '强力放逐',
        'Better Paradise' : '强力失乐园',
        '/^Soul Fire$/' : '焚烧的灵魂',
        'Holy Imperil' : '圣陷危',
    },

    ///////////////////////////////////////////////////////技能说明
    abilityInfo: {
        'Current Tier' : '当前等级',
        'Next Tier' : '下一等级',
        'Not Acquired' : '未获得',
        'At Maximum' : '已满',

        //基础技能
        'Increases your maximum ' : '增加你的最大',
        'This adds' : '每一级增加',
        'to your total' : '你的总',
        ' per tier' : '',
        '/^Requires /' : '需要 ',
        'Level' : '等级',
        'Direct Player Stat Modification' : '直接改变玩家状态',
        'Items Modified' : '道具变化',
        //影响的恢复剂使用items字典
        'Effect Over Time' : '持续性效果',
        'Restores ' : '每一滴答声恢复',
        ' per tick' : '',
        'Maximum Health' : '最大体力',
        'Maximum Magic' : '最大魔力',
        'Maximum Spirit' : '最大灵力',
        '/Base Health$/' : '基础体力',
        'Base Magic' : '基础魔力',
        'Base Spirit' : '基础灵力',
        'Improves the overall potency of common' : '增加常见',
        'health restoratives.' : '体力恢复剂药效',
        'mana restoratives.' : '魔法恢复剂药效',
        'spirit restoratives.' : '灵力恢复剂药效',
        'When Used' : '使用时',
        'Instantly restores ' : '立即恢复',

        //武器和装备技能
        'Increases your damage' : '增加你的物理伤害，',
        'Increases your spell damage' : '增加你的魔法伤害，',
        'Increases your critical chance' : '增加你的物理暴击几率，',
        'Increases your accuracy' : '增加你的物理命中率，',
        'Increases your spell accuracy' : '增加你的魔法命中率，',
        'Increases your attack and magic accuracy' : '增加你的物理和魔法命中，',
        'Increases your block' : '增加你的物理命中率，',
        'Increases your attack accuracy' : '增加你的物理命中率，',
        'Increases your spell critical chance' : '增加你的魔法暴击几率，',
        'Increases your attack speed' : '增加你的物理攻击速度，',
        'Increases your attack crit chance' : '增加你的物理暴击几率，',
        'Increases your spell casting speed' : '增加你的物理攻击速度，',
        'Increases your crushing mitigation' : '增加你的敲击减伤，',
        'Increases your piercing mitigation' : '增加你的刺击减伤，',
        'Increases your slashing mitigation' : '增加你的斩击减伤，',
        ' when using only ' : '当你使用全套 ',
        ' when using the ' : '当你使用 ',
        'cloth armor, ':'布甲 时，',
        'light armor, ':'轻甲 时，',
        'heavy armor, ':'重甲 时，',
        'fighting style' : '战斗风格时',
        'scaling with your proficiency.' : '与你的熟练度成比例增加。',
        'Proficiency-based Stat Modification' : '依照熟练度改变能力值',
        'For every ten points of' : '每10点',
        'One-Handed' : '单手',
        'Two-Handed' : '双手',
        'Niten' : '二天',
        'Dual-Wielding' : '双持',
        ' Staff ' : ' 法杖 ',
        ' Weapon' : '',
        'Cloth Armor':'布甲',
        'Light Armor':'轻甲',
        'Heavy Armor':'重甲',

        'Proficiency, adds' : '熟练度 获得',
        'Attack Base Damage' : '基础物理伤害',
        'Magic Base Damage' : '基础魔法伤害',
        'Attack Crit Chance' : '物理暴击几率',
        'Attack Accuracy' : '物理命中率',
        'Attack Speed' : '行动速度',
        'Magic Cast Speed' : '法术咏唱速度',
        'Magic Accuracy' : '魔法命中率',
        'Magic Crit Chance' : '魔法暴击率',
        'Block Chance' : '格挡率',
        'Parry Chance' : '招架率',

        'Crushing Damage Mitigation':'敲击减伤',
        'Piercing Damage Mitigation':'刺击减伤',
        'Slashing Damage Mitigation':'斩击减伤',
        'Physical Mitigation' : '物理减伤',
        'Magical Mitigation' : '魔法减伤',

        'Spells Modified' : '咒语变化',
        'Effects Modified' : '效果变化',

        //技能影响的咒语名称使用skills字典内容，但是因为技能名做了全词匹配，同时影响多个技能名的在这里单独写字典
        'Sleep, Confuse' : '沉睡,混乱',
        'Fiery Blast, Freeze, Shockblast, Gale' : '灼热冲击(Ⅰ),冰冻(Ⅰ),烈风(Ⅰ),惩戒(Ⅰ)',
        'Inferno, Blizzard, Chained Lightning, Downburst' : '地狱火(Ⅱ),暴风雪(Ⅱ),连锁闪电(Ⅱ),下击暴流(Ⅱ)',
        'Flames of Loki, Fimbulvetr, Wrath of Thor, Storms of Njord' : '邪神之火(Ⅲ),芬布尔之冬(Ⅲ),雷神之怒(Ⅲ),尼奥尔德风暴(Ⅲ)',

        //影响的技能效果，大部分和skills名称相同，部分有差异在这里单独写
        '/^Hastened$/' : '疾速',
        '/^Absorbing Ward$/' : '吸收结界',
        '/^Slowed$/' : '缓慢',
        '/^Weakened$/' : '虚弱',
        '/^Imperiled$/' : '陷危',
        '/^Blinded$/' : '盲目',
        '/^Asleep$/' : '沉眠',
        '/^Confused$/' : '混乱',
        '/^Silenced$/' : '沉默',
        '/^Magically Snared$/' : '魔磁网',
        '/^Vital Theft$/' : '生命窃取',

        //DEBUFF技能
        'Increases the duration and damage decrease granted by Weaken' : '增加 虚弱 法术的持续时间和伤害弱化.',
        'Increases Damage Decrease to ' : '伤害弱化提高到 ',
        'Decreases the casttime and cooldown of weaken. Higher levels also increase the number of targets affected per cast' : '缩短“虚弱”的施放时间和冷却时间。高等级也增加每次施放影响的目标数。',
        'Changes cooldown to' : '改变冷却时间至',
        ' turns' : ' 回合',
        'Changes max affected targets to' : '改变受影响的最大目标数至',
        'Changes cast time to' : '改变施法时间至',
        'Changes base mana cost to' : '改变基础魔力消耗至',
        'Changes effect duration to' : '改变效果持续时间至',
        'Increases the duration and defensive penalties caused by Imperil.' : '增加“陷危”给予的持续回合数和防御损失。',
        'Decreases the casttime and cooldown of Imperil. Higher levels also increase the number of targets affected per cast.' : '缩短“陷危”的施放时间和冷却时间。高等级也增加每次施放影响的目标数。',
        'Increase the duration and hit penalty caused by the Blind spell.' : '增加“致盲”咒语给予的持续回合数和命中损失。',
        'Decreases the cooldown and casttime on the Blind spell. Higher levels also increase the number of targets affected per cast.' : '缩短“致盲”咒语的冷却时间和施放时间。高等级也增加每次施放影响的目标数。',
        'Increase the duration and decrease the chance that Sleep and Confuse will break upon taking damage. Higher levels also increase the number of targets affected per cast.' : '增加“沉眠”和“混乱”的持续回合数并且降低受到伤害后立即脱离状态的机率。高等级也增加每次施放影响的目标数。',
        'Increase the duration and decrease the cooldown of the Silence spell. Higher levels also increase the number of targets affected per cast.' : '增加“沉默”咒语的持续回合数和缩短冷却时间。高等级也增加每次施放影响的目标数。	',
        'Increase the duration of the MagNet spell, and add a slowing effect. Higher levels increase the number of targets affected per cast, and reduces the cooldown of the spell.' : '增加“魔磁网”咒语的持续回合数并且附加缓慢效果。高等级增加每次施放影响的目标数，也缩短咒语的冷却时间。',
        'Increase the duration and power of the Slow spell. Higher levels also increase the number of targets affected per cast.' : '增加“缓慢”咒语的持续回合数与效果。高等级也增加每次施放影响的目标数。	',
        'Increases the amount of health drained by the Drain spell.' : '增加“枯竭”咒语的生命枯竭速率。	',
        'Decreases the cooldown and cast time on the Drain spell.' : '缩短“枯竭”咒语的冷却时间和施放时间。	',
        'Augment the Drain spell with the ability to inflict Ether Theft on any target afflicted with Soul Fire.' : '此技能扩充“枯竭”咒语的能力，可对任何受焚烧的灵魂(圣特殊效果)折磨的目标强加以太吸窃效果。',
        'Augment the Drain spell with the ability to inflict Spirit Theft on any target afflicted with Ripened Soul.' : '此技能扩充“枯竭”咒语的能力，可对任何受鲜美的灵魂(暗特殊效果)折磨的目标强加灵力吸窃效果。',
        'Action Speed Modification' : '行动速度变化',
        'Added special effect: Ether Theft' : '附加特殊效果：以太窃取',
        'Added special effect: Spirit Theft' : '附加特殊效果：灵力窃取',
        'Followup' : '追加',
        'Multiplies HP Drain by ' : '生命枯竭倍率',
        'Increases Confuse Break Resistance to' : '增加混乱脱离抗性至',
        'Increases Sleep Break Resistance to' : '增加沉眠脱离抗性至',

        //BUFF技能
        'Increases the action speed-up granted by the Haste spell.' : '增加“急速”咒语给予的行动加速。',
        'Increases the evade bonus granted by the Shadow Veil spell.' : '增加“影纱”咒语给予的回避率奖励。',
        'Increases the chance that Absorb will successfully nullify a hostile spell.' : '增加“吸收”成功使敌方咒语无效的机率。',
        'Decreases the amount of damage required to make Spirit Shield kick in, as well as how much spirit is consumed when it does.' : '降低触动“灵力盾”所需的伤害值，同时也减少灵力值的损失。	',
        'Heartseeker will additionally increase the damage of any critical melee hits.' : '“穿心”会额外增加任何近战暴击的伤害。',
        'Arcane Focus will additionally increase the damage of any critical spell hits.' : '“奥术集成”会额外增加任何咒语暴击的伤害。	',
        'Increase the power and duration of the Regen spell.' : '增加“细胞活化”咒语的效果和持续回合数。	',
        'Increase the healing power and decrease the cooldown of the Cure spell.' : '增加“疗伤”咒语的治疗效果和缩短冷却时间。	',
        'Increase the duration and decrease the mana cost of the Spark of Life spell.' : '增加“生命火花”咒语的持续回合数并且减少施放所需魔力值。	',
        'Increases the mitigation bonuses granted by the Protect spell.' : '增加“守护”咒语给予的缓伤奖励。	',
        'Augments your Protection spell by adding fire elemental spikes. Additional levels increase your fire elemental resistance while the spell is active.' : '扩充你的“守护”咒语能力，使它附加火元素刺盾。后续等级会在此咒语作用时增加你的火元素抗性。',
        'Augments your Protection spell by adding cold elemental spikes. Additional levels increase your cold elemental resistance while the spell is active.' : '扩充你的“守护”咒语能力，使它附加冰元素刺盾。后续等级会在此咒语作用时增加你的冰元素抗性。',
        'Augments your Protection spell by adding elec elemental spikes. Additional levels increase your elec elemental resistance while the spell is active.' : '扩充你的“守护”咒语能力，使它附加雷元素刺盾。后续等级会在此咒语作用时增加你的雷元素抗性。',
        'Augments your Protection spell by adding wind elemental spikes. Additional levels increase your wind elemental resistance while the spell is active.' : '扩充你的“守护”咒语能力，使它附加风元素刺盾。后续等级会在此咒语作用时增加你的风元素抗性。',

        'Additional Effect' : '额外效果',
        'Increases Absorption Chance to' : '增加吸收率至 ',
        'Reduces Damage Threshold to ' : '降低伤害门槛至 ',
        'Spell Critical Damage' : '魔法暴击伤害',
        'Attack Critical Damage' : '物理暴击伤害',
        'Changes base damage to' : '改变基础伤害至 ',
        'Base Health Regen' : '基础体力/回合',
        'Evade' : '闪避率',

        'Flame Spikes' : '火焰刺盾(火状态使怪物-10%伤害/-25%冰抗性)',
        'Frost Spikes' : '寒冰刺盾(冰状态使怪物-10%速度/-25%风抗性)',
        'Shock Spikes' : '闪电刺盾(雷状态使怪物-10%回避/抵抗/-25%火抗性)',
        'Storm Spikes' : '风暴刺盾(风状态使怪物-10%命中/-25%雷抗性)',
        'Fire Mitigation' : '火焰减伤',
        'Cold Mitigation' : '冰霜减伤',
        'Elec Mitigation' : '闪电减伤',
        'Wind Mitigation' : '狂风减伤',
        'Fire/Cold/Elec' : '火焰/冰霜/闪电',

        //攻击技能
        'Increases the maximum number of targets hit by' : '增加',
        'fire elemental spells.' : '火系元素咒语的最大目标数',
        'cold elemental spells.' : '冰系元素咒语的最大目标数',
        'lightning elemental spells.' : '雷系元素咒语的最大目标数',
        'wind elemental spells.' : '风系元素咒语的最大目标数',
        'Increases damage and decreases cast time of all first-tier elemental spells.' : '对所有第一级元素咒语增加伤害、缩短施放时间。',
        'Increases damage, and decreases cast time and cooldown of all second-tier elemental spells.' : '对所有第二级元素咒语增加伤害、缩短施放时间和冷却时间。	',
        'Increases damage, and decreases cast time and cooldown of all third-tier elemental spells.' : '对所有第三级元素咒语增加伤害、缩短施放时间和冷却时间。	',

        'Decreases cooldown and increases the maximum number of targets hit by the Corruption spell.' : '缩短冷却时间并且增加“腐败”咒语的最大目标命中数。	',
        'Decreases cooldown and increases the maximum number of targets hit by the Disintegrate spell.' : '缩短冷却时间并且增加“瓦解”咒语的最大目标命中数。	',
        'Decreases cooldown and increases the maximum number of targets hit by the Ragnarok spell.' : '缩短冷却时间并且增加“诸神黄昏”咒语的最大目标命中数。	',
        'Augments your forbidden spells with the Ripened Soul proc, which damages the target over time and enables certain follow-up attacks. Higher levels increase the chance of the proc occurring.' : '扩充你的黑暗咒语能力，附加鲜美的灵魂状态，给予持续伤害且能对目标使用某些后续攻击。高等级增加状态触发率。',
        'Added effect: Ripened Soul' : '附加效果：鲜美的灵魂',
        'Chance)' : '几率)',
        'Imperil additionally reduces specific mitigation against Dark.' : '让“陷危”咒语附加降低暗属性缓伤的能力。	',
        'Dark Mitigation':'黑暗减伤',

        'Decreases cooldown and increases the maximum number of targets hit by the Smite holy spell.' : '缩短冷却时间并且增加“惩戒”神圣咒语的最大目标命中数。	',
        'Decreases cooldown and increases the maximum number of targets hit by the Banishment holy spell.' : '缩短冷却时间并且增加“放逐”神圣咒语的最大目标命中数。	',
        'Decreases cooldown and increases the maximum number of targets hit by the Paradise Lost holy spell.' : '缩短冷却时间并且增加“失乐园”神圣咒语的最大目标命中数。	',
        'Augments your divine spells with the Soul Fire proc, which damages the target over time and enables certain follow-up attacks. Higher levels increase the chance of the proc occurring.' : '扩充你的神圣咒语能力，附加焚烧的灵魂状态，给予持续伤害且能对目标使用某些后续攻击。高等级增加状态触发率。',
        'Added effect: Soul Fire' : '附加效果：焚烧的灵魂',
        'Imperil additionally reduces specific mitigation against Holy.' : '让“陷危”咒语附加降低圣属性缓伤的能力。	',
        'Holy Mitigation':'神圣减伤',

        //词缀处理
        ' and ' : ' 和 ',
        ' or ' : ' 或者 ',
        ' of ' : ' ',

    },

    ///////////////////////////////////////////////////////技能技巧
    //为防止错误匹配全部使用正则全词匹配
    skills: {
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

        '/^Drain$/' : '枯竭[D]',
        '/^Slow$/' : '缓慢[D]',
        '/^Weaken$/' : '虚弱[D]',
        '/^Silence$/' : '沉默[D]',
        '/^Sleep$/' : '沉眠[D]',
        '/^Confuse$/' : '混乱[D]',
        '/^Imperil$/' : '陷危[D]',
        '/^Blind$/' : '致盲[D]',
        '/^MagNet$/' : '魔磁网[D]',

        '/^Cure$/' : '治疗[S]',
        '/^Regen$/' : '细胞活化[S]',
        '/^Full-Cure$/' : '完全治愈[S]',
        '/^Haste$/' : '急速[S]',
        '/^Protection$/' : '守护[S]',
        '/^Shadow Veil$/' : '影纱[S]',
        '/^Absorb$/' : '吸收[S]',
        '/^Spark of Life$/' : '生命火花[S]',
        '/^Arcane Focus$/' : '奥术集成[S]',
        '/^Heartseeker$/' : '穿心[S]',
        '/^Spirit Shield$/' : '灵力盾[S]',
    },


    ///////////////////////////////////////////////////////物品筛选栏/装备筛选栏
    filters: {
        //物品类型
        '/^All$/' : '全部',
        '/^Restoratives$/' : '回复品',
        '/^Infusions$/' : '魔药',
        '/^Scrolls$/' : '卷轴',
        '/^Crystals$/' : '水晶',
        '/^Materials$/' : '材料',
        '/^Special$/' : '特殊',

        //装备类型
        '/^Equipped$/' : '装备中',
        '/^One-Handed$/' : '单手武器',
        '/^Two-Handed$/' : '双手武器',
        '/^Staffs$/' : '法杖',
        '/^Shield$/' : '盾牌',
        '/^Cloth$/' : '布甲',
        '/^Light$/' : '轻甲',
        '/^Heavy$/' : '重甲',
    },


    ///////////////////////////////////////////////////////物品
    //出于整洁和效率考虑，普通物品列表不包含文物奖杯
    items: {
        'Item Inventory' : '物品仓库',
        'Battle Slots' : '战斗携带品',
        'Your Inventory' : '你的物品',
        'Store Inventory' : '商店物品',

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

        'Monster Chow' : '怪物饲料',
        'Monster Edibles' : '怪物食品',
        'Monster Cuisine' : '怪物料理',
        'Happy Pills' : '快乐药丸',

        'Golden Lottery Ticket' : '黄金彩票券',
        'Token of Blood' : '鲜血令牌',
        'Chaos Token' : '混沌令牌',
        'Soul Fragment' : '灵魂碎片',

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

    },

    ///////////////////////////////////////////////////////文物与奖杯
    //出于整洁和效率考虑，文物奖杯单独写一个字典
    artifact: {
        'Artifacts and Trophies' : '文物和奖杯',

        //当前可以获取的文物和奖杯
        'Precursor Artifact' : '古遗物',
        'ManBearPig Tail' : '人熊猪的尾巴(等级2)',
        'Holy Hand Grenade of Antioch' : '安提阿的神圣手榴弹(等级2)',
        'Mithra\'s Flower' : '猫人族的花(等级2)',
        'Dalek Voicebox' : '戴立克音箱(等级2)',
        'Lock of Blue Hair' : '一绺蓝发(等级2)',
        'Bunny-Girl Costume' : '兔女郎装(等级3)',
        'Hinamatsuri Doll' : '雏人形(等级3)',
        'Broken Glasses' : '破碎的眼镜(等级3)',
        'Sapling' : '树苗(等级4)',
        'Black T-Shirt' : '黑色Ｔ恤(等级4)',
        'Unicorn Horn' : '独角兽的角(等级5)',
        'Noodly Appendage' : '面条般的附肢(等级6)',

        //礼券
        'Bronze Coupon' : '铜礼券(等级3)',
        'Silver Coupon' : '银礼券(等级5)',
        'Gold Coupon' : '黄金礼券(等级7)',
        'Platinum Coupon' : '白金礼券(等级8)',
        'Peerless Voucher' : '无双凭证',

        //旧旧古董
        'Priceless Ming Vase' : '无价的明朝瓷器',
        'Grue' : '格鲁',
        'Seven-Leafed Clover' : '七叶幸运草',
        'Rabbit\'s Foot' : '幸运兔脚',
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
        'Festival Coupon' : '节日礼券(等级7)', //2020起收获节（中秋）
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


    },

    ///////////////////////////////////////////////////////物品说明
    itemInfos: {
        //物品类型
        '/^Trophy$/': '奖杯',
        '/^Consumable$/': '消耗品',
        '/^Artifact$/': '文物',
        '/^Token$/': '令牌',
        '/^Crystal$/': '水晶',
        '/^Material$/': '材料',
        '/^Collectable$/': '收藏品',
        '/^Monster Food$/': '怪物食物',

        ///////////////////////////////////////////////////////物品说明
        //消耗品说明
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
        'Restores 10 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for ten turns.' : '恢复10点精力，但不超过99。如果在战斗中使用，除恢复精力外附带持续10回合增加10%灵力和斗气.',
        'Restores 5 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for five turns.' : '恢复5点精力，但不超过99。如果在战斗中使用，除恢复精力外附带持续5回合增加10%灵力和斗气.',
        'There are three flowers in a vase. The third flower is green.' : '花瓶中有三朵花，第三朵是绿色的(玩偶特工)。战斗中使用时持续50回合物理/魔法 伤害、命中、暴击率、回避、抵抗率大幅提升+25%。',
        'It is time to kick ass and chew bubble-gum... and here is some gum.' : '该是嚼著泡泡糖收拾他们的时候了…这里有一些泡泡糖(极度空间)。战斗中使用时持续50回合攻击和咒语伤害大幅提升+100%，必定命中且必定暴击',
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

        //强化材料
        'A cylindrical object filled to the brim with arcano-technological energy. Required to restore advanced armor and shields to full condition.' : '一个边缘充斥着神秘科技能量的圆柱形物体，用于修复高级护甲和盾牌',
        'A small vial filled with a catalytic substance necessary for upgrading and repairing equipment in the forge. This is permanently consumed on use.' : '一个装着升级与修复装备必须的催化剂的小瓶子，每使用一次就会消耗一个',
        'Various bits and pieces of scrap cloth. These can be used to mend the condition of an equipment piece.' : '各种零碎的布料，用于修复装备',
        'Various bits and pieces of scrap leather. These can be used to mend the condition of an equipment piece.' : '各种零碎的皮革，用于修复装备',
        'Various bits and pieces of scrap metal. These can be used to mend the condition of an equipment piece.' : '各种零碎的金属，用于修复装备',
        'Various bits and pieces of scrap wood. These can be used to mend the condition of an equipment piece.' : '各种零碎的木材，用于修复装备',
        'Some materials scavenged from fallen adventurers by a monster. Required to ' : '一些从怪物身上收集到的材料，用于',
        'reforge and upgrade cloth armor.' : '升级布甲',
        'reforge and upgrade staffs and shields.' : '升级法杖和盾牌',
        'reforge and upgrade heavy armor and weapons' : '升级重甲和武器',
        'reforge and upgrade light armor' : '升级轻甲',
        'reforge Phase Armor' : '强化相位甲',
        'reforge Shade Armor' : '强化暗影甲',
        'reforge Power Armor' : '强化动力甲',
        'reforge Force Shields' : '强化力场盾',
        'upgrade equipment bonuses to ' : '升级装备的 ',
        'Elemental Magic Proficiency': '元素魔法熟练度',
        'Divine Magic Proficiency': '神圣魔法熟练度',
        'Forbidden Magic Proficiency': '黑暗魔法熟练度',
        'Deprecating Magic Proficiency': '减益魔法熟练度',
        'Supportive Magic Proficiency': '增益魔法熟练度',
        'Magical Base Damage': '基础魔法伤害',
        'Physical Base Damage': '基础物理伤害',
        'The core of a legendary weapon. Contains the power to improve a weapon beyond its original potential.' : '一件传奇武器的核心。含有提升一件武器原始潜能的力量。',
        'The core of a peerless weapon. Contains the power to improve a weapon beyond its original potential.' : '一件无双武器的核心。含有提升一件武器原始潜能的力量。',
        'The core of a legendary staff. Contains the power to improve a staff beyond its original potential.' : '一件传奇法杖的核心。含有提升一件法杖原始潜能的力量。',
        'The core of a peerless staff. Contains the power to improve a staff beyond its original potential.' : '一件无双法杖的核心。含有提升一件法杖原始潜能的力量。',
        'The core of a legendary armor. Contains the power to improve an armor piece or shield beyond its original potential.' : '一件传奇护甲的核心。含有提升一件护甲或者盾牌原始潜能的力量。',
        'The core of a peerless armor. Contains the power to improve an armor piece or shield beyond its original potential.' : '一件无双护甲的核心。含有提升一件护甲或者盾牌原始潜能的力量。',
        //其它可强化属性与equipsInfo装备属性字典共用

        //碎片
        'When used with an equipment piece, this shard will temporarily imbue it with the' : '当用在一件装备上时，会临时给予装备',
        'When used with a weapon, this shard will temporarily imbue it with the' : '当用在一件武器上时，会临时给予装备',
        'Suffused Aether enchantment' : '弥漫的以太 的附魔效果',
        'Featherweight Charm enchantment' : '轻如鸿毛 的附魔效果',
        'Voidseeker\'s Blessing enchantment' : '虚空探索者的祝福 的附魔效果',
        'Can be used to reset the unlocked potencies and experience of an equipment piece.' : '可以用于重置装备的潜能等级',

        'These fragments can be used in the forge to permanently soulfuse an equipment piece to you, which will make it level as you do.' : '这个碎片可以将一件装备与你灵魂绑定，灵魂绑定的装备会随着你的等级一同成长。',
        'You can exchange this token for the chance to face a legendary monster by itself in the Ring of Blood.' : '你可以用这些令牌在浴血擂台里面换取与传奇怪物对阵的机会',
        'You can use this token to unlock monster slots in the Monster Lab, as well as to upgrade your monsters.' : '你可以用这些令牌开启额外的怪物实验室槽位，也可以升级你的怪物',
        'Use this ticket on a lottery to add 100 tickets and double your effective ticket count. Will not increase effective count past 10% of the total tickets sold.' : '你可以使用这张彩券兑换100张当期彩票，并且让自己持有的彩票数量翻倍（效果在开奖时计算，最多不超过总奖池10%）',

        //怪物相关
        'You can fuse this crystal with a monster in the monster tab to increase its' : '你可以用这种水晶在怪物实验室里面为一个怪物提升它的',
        'Strength.' : '力量',
        'Dexterity.' : '灵巧',
        'Agility.' : '敏捷',
        'Endurance.' : '体质',
        'Intelligence.' : '智力',
        'Wisdom.' : '智慧',
        'Fire Resistance' : '火属性抗性',
        'Cold Resistance' : '冰属性抗性',
        'Electrical Resistance' : '雷属性抗性',
        'Wind Resistance' : '风属性抗性',
        'Holy Resistance' : '圣属性抗性',
        'Dark Resistance' : '暗属性抗性',
        'Non-discerning monsters like to munch on this chow.' : '不挑食的初级怪物喜欢吃这种食物',
        'Mid-level monsters like to feed on something slightly more palatable, like these scrumptious edibles.' : '中级怪物喜欢吃更好吃的食物，比如这种',
        'High-level monsters would very much prefer this highly refined level of dining if you wish to parlay their favor.' : '如果你想受高等级怪物的青睐的话，请喂它们吃这种精致的食物吧',
        'Tiny pills filled with delicious artificial happiness. Use on monsters to restore morale if you cannot keep them happy. It beats leaving them sad and miserable.' : '美味的人造药丸，满溢着的幸福，没法让怪物开心的话，就用它来恢复怪物的士气，赶走怪物的悲伤和沮丧吧',

        //现有文物和奖杯
        'An advanced technological artifact from an ancient and long-lost civilization. Handing these in at the Shrine of Snowflake will grant you a reward.' : '一个发达古文明的技术结晶，把它交给雪花神殿的雪花女神来获得你的奖励',
        'Retrieved as a Toplist Reward for active participation in the E-Hentai Galleries system.' : '作为在E-Hentai画廊系统的活跃排行榜奖励派发，献祭作用与奖杯相同。',
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
        'An Invisible Pink Unicorn Horn taken from the Invisible Pink Unicorn. It doesn\'t weigh anything and has the consistency of air, but you\'re quite sure it\'s real.' : '从隐形粉红独角兽头上取下来的隐形粉红色的角，它很像空气一样轻，几乎没有重量，但是你很确定它是真实存在的',
        'A nutritious pasta-based appendage from the Flying Spaghetti Monster.' : '一条用飞行意大利面怪物身上的面团做成的营养附肢。',
        'A voucher for a free soulbound Peerless equipment piece of your choice. Given to you personally by Snowflake for your devout worship and continued offerings.' : '一张可以根据你的选择兑换一件免费灵魂绑定无双装备的凭证。由雪花女神亲自交给你的虔诚崇拜和持续献祭奖励。',

        //小马
        'A 1/10th scale figurine of Twilight Sparkle, the cutest, smartest, all-around best pony. According to Pinkie Pie, anyway.' : 'NO.1 暮光闪闪的 1/10 比例缩放公仔。最可爱、最聪明，最全能的小马。(根据萍琪的说法，嗯…) ',
        'A 1/10th scale figurine of Rainbow Dash, flier extraordinaire. Owning this will make you about 20% cooler, but it probably took more than 10 seconds to get one.' : 'NO.2 云宝黛西的 1/10 比例缩放公仔。杰出的飞行员。拥有这个公仔可以让你多酷大约 20%，但为了得到她你得多花 10 秒！ ',
        'A 1/10th scale figurine of Applejack, the loyalest of friends and most dependable of ponies. Equestria\'s best applebucker, and founder of Appleholics Anonymous.' : 'NO.3 苹果杰克的 1/10 比例缩放公仔。最忠诚的朋友，最可靠的小马。阿奎斯陲亚最好的苹果采收员，同时也是苹果农庄的创始马。 ',
        'A 1/10th scale figurine of Fluttershy, resident animal caretaker. You\'re going to love her. Likes baby dragons; Hates grown up could-eat-a-pony-in-one-bite dragons.' : 'NO.4 小蝶的 1/10 比例缩放公仔。小马镇动物的褓姆，大家都喜爱她。喜欢幼龙；讨厌能一口吞掉小马的大龙。 ',
        'A 1/10th scale figurine of Pinkie Pie, a celebrated connoisseur of cupcakes and confectioneries. She just wants to keep smiling forever.' : 'NO.5 萍琪的 1/10 比例缩放公仔。一位著名的杯子蛋糕与各式饼干糖果的行家。她只想让大家永远保持笑容。 ',
        'A 1/10th scale figurine of Rarity, the mistress of fashion and elegance. Even though she\'s prim and proper, she could make it in a pillow fight.' : 'NO.6 瑞瑞的 1/10 比例缩放公仔。时尚与品味的的女主宰。她总是能在枕头大战中保持拘谨矜持。 ',
        'A 1/10th scale figurine of The Great and Powerful Trixie. After losing her wagon, she now secretly lives in the Ponyville library with her girlfriend, Twilight Sparkle.' : 'NO.7 崔克茜的 1/10 比例缩放公仔。伟大的、法力无边的崔克茜。失去她的篷车后，她现在偷偷的与她的女友暮光闪闪住在小马镇的图书馆中。 ',
        'A 1/10th scale figurine of Princess Celestia, co-supreme ruler of Equestria. Bored of the daily squabble of the Royal Court, she has recently taken up sock swapping.' : 'NO.8 塞拉斯提娅公主的 1/10 比例缩放公仔。阿奎斯陲亚大陆的最高统治者。对每日的皇家争吵感到无聊，她近日开始穿上不成对的袜子。 ',
        'A 1/10th scale figurine of Princess Luna, aka Nightmare Moon. After escaping her 1000 year banishment to the moon, she was grounded for stealing Celestia\'s socks.' : 'NO.9 露娜公主的 1/10 比例缩放公仔。又名梦靥之月。在结束了一千年的放逐后，她从月球回到阿奎斯陲亚偷走了塞拉斯提娅的袜子。 ',
        'A 1/10th scale figurine of Apple Bloom, Applejack\'s little sister. Comes complete with a \"Draw Your Own Cutie Mark\" colored pencil and permanent tattoo applicator set.' : 'NO.10 小萍花的 1/10 比例缩放公仔。苹果杰克的小妹。使用了“画出妳自己的可爱标志”彩色铅笔与永久纹身组后，生命更加的完整了。 ',
        'A 1/10th scale figurine of Scootaloo. Die-hard Dashie fanfilly, best pony of the Cutie Mark Crusaders, and inventor of the Wingboner Propulsion Drive. 1/64th chicken.' : 'NO.11 飞板露的 1/10 比例缩放公仔。云宝黛西的铁杆年轻迷妹，可爱标志十字军中最棒的小马，以及蠢翅动力推进系统的发明者。有 1/64 的组成成分是鲁莽。 ',
        'A 1/10th scale figurine of Sweetie Belle, Rarity\'s little sister. Comes complete with evening gown and cocktail dress accessories made of 100% Dumb Fabric.' : 'NO.12 甜贝儿的 1/10 比例缩放公仔。瑞瑞的小妹。在穿上 100% 蠢布料制成的晚礼服与宴会短裙后更加完美了。 ',
        'A 1/10th scale figurine of Big Macintosh, Applejack\'s older brother. Famed applebucker and draft pony, and an expert in applied mathematics.' : 'NO.13 大麦克的 1/10 比例缩放公仔。苹果杰克的大哥。有名的苹果采收员和大力马，同时也是实用数学的专家。 ',
        'A 1/10th scale figurine of Spitfire, team leader of the Wonderbolts. Dashie\'s idol and occasional shipping partner. Doesn\'t actually spit fire.' : 'NO.14 爆火的 1/10 比例缩放公仔。惊奇闪电的领导者。云宝黛西的偶像和临时飞行搭档。实际上不会吐火。 ',
        'A 1/10th scale figurine of Derpy Hooves, Ponyville\'s leading mailmare. Outspoken proponent of economic stimulus through excessive muffin consumption.' : 'NO.15 小呆的 1/10 比例缩放公仔。小马镇上重要的邮差马。直言不讳的主张以大量食用马芬的方式来刺激经济。 ',
        'A 1/10th scale figurine of Lyra Heartstrings. Features twenty-six points of articulation, replaceable pegasus hoofs, and a detachable unicorn horn.' : 'NO.16 天琴心弦的 1/10 比例缩放公仔。拥有 26 个可动关节，可更换的飞马蹄与一个可拆卸的独角兽角是其特色。 ',
        'A 1/10th scale figurine of Octavia. Famous cello musician; believed to have created the Octatonic scale, the Octahedron, and the Octopus.' : 'NO.17 奥塔维亚的 1/10 比例缩放公仔。著名的大提琴家；据信创造了八度空间、八面体以及章鱼。 ',
        'A 1/10th scale figurine of Zecora, a mysterious zebra from a distant land. She\'ll never hesitate to mix her brews or lend you a hand. Err, hoof.' : 'NO.18 泽科拉的 1/10 比例缩放公仔。一位来自远方的神秘斑马。她会毫不迟疑的搅拌她的魔药或助你一臂之力。呃，我是说一蹄之力… ',
        'A 1/10th scale figurine of Cheerilee, Ponyville\'s most beloved educational institution. Your teachers will never be as cool as Cheerilee.' : 'NO.19 车厘子的 1/10 比例缩放公仔。小马镇最有爱心的教育家。你的老师绝对不会像车厘子这么酷的！ ',
        'A 1/10th scale bobblehead figurine of Vinyl Scratch, the original DJ P0n-3. Octavia\'s musical rival and wub wub wub interest.' : 'NO.20 维尼尔的 1/10 比例缩放摇头公仔。是 DJ P0n-3 的本名。为奥塔维亚在音乐上的对手，喜欢重低音喇叭。 ',
        'A 1/10th scale figurine of Daring Do, the thrill-seeking, action-taking mare starring numerous best-selling books. Dashie\'s recolor and favorite literary character.' : 'NO.21 天马无畏的 1/10 比例缩放公仔。追寻刺激，有如动作片主角一般的小马，为一系列畅销小说的主角。是云宝黛西最喜欢的角色，也是带领她进入阅读世界的原因。 ',
        'A 1/10th scale figurine of Doctor Whooves. Not a medical doctor. Once got into a hoof fight with Applejack over a derogatory remark about apples.' : 'NO.22 神秘博士的 1/10 比例缩放公仔。不是医生。曾经与苹果杰克陷入一场因贬低苹果的不当发言而产生的蹄斗。 ',
        'A 1/10th scale figurine of Berry Punch. Overly protective parent pony and Ponyville\'s resident lush. It smells faintly of fruit wine.' : 'NO.23 酸梅酒的 1/10 比例缩放公仔。有过度保护倾向的小马，也是小马镇的万年酒鬼。闻起来有淡淡水果酒的气味。 ',
        'A 1/10th scale figurine of Bon-Bon. Usually seen in the company of Lyra. Suffers from various throat ailments that make her sound different every time you see her.' : 'NO.24 糖糖的 1/10 比例缩放公仔。常常被目击与天琴心弦在一起。患有许多呼吸道相关的疾病，使你每次遇到她的时候她的声音都不同。 ',
        'A 1/10th scale fluffy figurine of Fluffle Puff. Best Bed Forever.' : 'NO.25 毛毛小马 1/10 比例缩放的毛茸茸玩偶。让你想要永远躺在上面。 ',
        'A lifesize figurine of Angel Bunny, Fluttershy\'s faithful yet easily vexed pet and life partner. All-purpose assistant, time keeper, and personal attack alarm.' : 'NO.26 天使兔的等身大玩偶。为小蝶忠实且易怒的宠物及伴侣。万能助理、报时器、受到人身攻击时的警报器。 ',
        'A lifesize figurine of Gummy, Pinkie Pie\'s faithful pet. Usually found lurking in your bathtub. While technically an alligator, he is still arguably the best pony.' : 'NO.27 甘米的等身大玩偶。是萍琪的忠实宠物。经常被发现潜伏在你的浴缸里。虽然技术上是只短吻鳄，但它仍然可以称得上是最棒的小马。 ',

        //旧古董
        'It is dead, and smaller than you expected.' : '它已经死了，而且体型比你想像中还要小。',
        'So that is where that thing ended up.' : '所以这就是事件的最终下场。',
        'It would be totally awesome, but you do not have any sharks.' : '这肯定棒呆了！但你没有养鲨鱼。',
        'The energy cells are completely drained.' : '能量电池已完全用尽。 (BFG=Big Fucking Gun)',
        'The electromagnetic acceleration rails are bent and twisted. Using it would be bad.' : '电磁加速轨道已折弯和扭曲，使用它会很糟糕。',
        'Now all you need is some fuel.' : '现在你所需要的是一些燃料。',
        'Great for blowing up small kingdoms, but you do not know the code to activate it.' : '很适合用来摧毁小王国，但你不知道发射密码。',
        'Oil for chainsaws.' : '电锯的链条油。',
        'Fuel for chainsaws. Will not work in flame throwers.' : '电锯专用燃料，不能用在火焰喷射器。',
        'Spare cutting chain for a chainsaw.' : '电锯的切割链零件。',
        'Spare guide bar for a chainsaw.' : '电锯的导板零件。',
        'A booklet with safety information for proper use of a chainsaw.' : '写着正确使用电锯的安全须知的小册子。',
        'Contains information on the proper care and maintenance of a chainsaw.' : '包含适当的照料与维修方法。',
        'Unfortunately it is incomplete, and there are no orange portals around.' : '很可惜它是未完成品，周围没有橘色的传送门。',
        'Being aware that fulfilling its function will also end its existance, this bomb refuses to go off.' : '意识到履行自身的功能也将消灭自己的存在，这个炸弹拒绝爆炸。',
        'Must be hooked up to an Advanced Power Plant to fire.' : '必须连接大型发电厂才能发射。',
        'The blade that should be attached to this hilt is gone.' : '本该连接这个剑柄的剑刃不见了。',
        'A piece to the puzzle.' : '一块拼图。',

        'A rare winter decoration from an ancient civilization, serving as a perfect example of its gaudiness and bad taste.' : '一种来自古代文明的罕见冬季装饰品，它的俗丽的美和低劣品味可谓经典范例。(2010 年圣诞节发放)',
        'A rare 1/10th scale Santa sled featuring ponies instead of reindeer. It\'s decked out in gaudy flashing lights that fortunately ran out of power centuries ago.' : '罕见的圣诞雪橇 1/10 比例缩放模型，是由小马拉着雪橇而不是驯鹿。上面装了一堆超俗的闪光灯，幸好几百年前就没电了。(2011 年圣诞节发放)',
        'An eternally burning purple heart, fueled by magic and friendship, suspended inside a glass vessel. Saves on lantern oil.' : '一颗永久燃烧的紫色之心，以魔法和友谊为燃料，悬挂在玻璃容器里。省下了灯油。(2012 年圣诞节发放)',
        'Covers the entire 12th b\'ak\'tun of the Mayan Long Count Calendar, equivalent to 144000 days. Now only good as a very heavy ornate paperweight.' : '完整涵盖长纪历的第 12 个伯克盾，相当于 144000 天。现在只能当作装饰华丽的重型纸镇。(2012 年圣诞节发放)',
        'An intricately carved sculpture of the Tree of Harmony. The adorning multi-colored elements are slowly pulsating with a gentle glow.' : '一件精雕细琢的谐律之树雕塑品。树上装饰的彩色元素缓缓脉动着温和的光辉。(2013 年圣诞节发放)',
        'A snowman made of a deep blue and faintly glowing crystal, adorned with round onyx eyes and a carrot-shaped garnet nose. Does not melt during summer.' : '用闪著淡淡光辉的深蓝水晶制作的雪人，镶嵌著圆形缟玛瑙做的眼睛和胡萝卜形状的石榴石鼻子。夏天也不会融化。(2014 年圣诞节发放)',
        'A little white dog. It\'s fast asleep...' : '一只小白狗。它正熟睡着...(2015 年圣诞节发放)',
        'A precursor irrigation device, capable of providing sufficient water to around two dozen farm plots. The internal power source was depleted centuries ago.' : '一个旧世界的灌溉设备，能够为周围二十四块耕地喷洒充足的水。内置的电池在几个世纪前就没电了。(2016 年圣诞节发放)',
        'The giant head of an animatronic mecha-bunn. Rather cute, and rather horrifying.' : '一个巨大的动力机甲头部，相当可爱，也相当恐怖。(2017 年圣诞节发放)',

        'A colored easter egg, inscribed with the ' : '一个彩色的复活节彩蛋，上面刻着',
        'letter W.' : '字母S.',
        'letter N.' : '字母N.',
        'letter O.' : '字母O.',
        'letter W.' : '字母W.',
        'letter F.' : '字母F.',
        'letter L.' : '字母L.',
        'letter A.' : '字母A.',
        'letter K.' : '字母K.',
        'letter E.' : '字母E.',
        'If you collect and hand in the entire set, something good might happen.' : '如果你收集并献祭一整套，或许会有什么好事情发生。(2011 复活节)',
        'The pegasus ponies have lost their feathers! Better give them to Snowflake so she can help them get back on their wings.' : '天马们失去了她们的羽毛！最好交给雪花女神帮她们取回翅膀。(2012 复活节)',
        'A beautifully crafted, limited edition snowflake.' : '精美的限量版雪花。(2013 复活节)',
        'The altcoins are running wild! Better give them to Snowflake so she can get rid of them safely.' : '山寨币非常猖獗！最好把它们交给雪花让她安全地销毁。(2014 复活节)',
        'such altcoin so scare plz give snowflake for much wow' : '这种山寨币特别骇人，请给雪花多一点。汪 (2014 复活节活动)',
        'An ancient server-grade motherboard. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的服务器级主板。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'An ancient server-grade processor module. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的服务器级处理器模组。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'An ancient set of server-grade ECC RAM. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的服务器级错误修正码内存。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'An ancient 1U rack-mounted server chassis. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的 1U 机架式服务器机壳。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'An ancient gigabit ethernet network card. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的超高速以太网路卡。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'An ancient server-grade storage device. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的服务器级储存装置。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'An ancient dual redundant power supply unit. Give to Snowflake to help reassemble the Legendary Precursor Servers.' : '古老的双冗馀电源供应单元。交给雪花帮忙重组出传说中的旧世代服务器。(2015 复活节活动)',
        'Someone stole these commemorative easter chickens from the Rainbow Factory. Return a full set to Snowflake to earn their gratitude.' : '有人偷走了彩虹工厂的复活节纪念小鸡。找回整套归还给雪花以赢得她们的感激之情。(2016 复活节)',
        'A cryogenically preserved ancient lemon.' : '一颗低温保存的古代柠檬。(2017 复活节活动)',
        'A cryogenically preserved ancient kiwi. The fruit. Not the bird' : '一颗低温保存的古代奇异果。是水果，不是鸟。(2017 复活节活动)',
        'A cryogenically preserved ancient blueberry.' : '一颗低温保存的古代蓝莓。(2017 复活节活动)',
        'A cryogenically preserved ancient plum.' : '一颗低温保存的古代李子。(2017 复活节活动)',
        'A cryogenically preserved ancient mulberry.' : '一颗低温保存的古代桑椹。(2017 复活节活动)',
        'A cryogenically preserved ancient strawberry.' : '一颗低温保存的古代草莓。(2017 复活节活动)',
        'A cryogenically preserved ancient orange.' : '一颗低温保存的古代柳橙。(2017 复活节活动)',
        'A truely aggravating spelling error. Give it to Snowflake.' : '一个确实很严重的拼写错误。把它交给雪花。(2018 复活节活动)',
        'Alot of people make this mistake. Give it to Snowflake.' : '很多人都会犯这个错误。把它交给雪花。(2018 复活节活动)',
        'A rather embarassing mistake. Give it to Snowflake.' : '一个相当尴尬的错误。把它交给雪花。(2018 复活节活动)',
        'Definately one of the more common mistakes you can find. Give it to Snowflake.' : '绝对是你可以找到的最常见的错误之一。把它交给雪花。(2018 复活节活动)',
        'Mispelling this word is just extra dumb. Give it to Snowflake.' : '拼错这个词实在是相当愚蠢。把它交给雪花。(2018 复活节活动)',
        'Apparantly a very common error to make. Give it to Snowflake.' : '显然是一个非常常见的错误。把它交给雪花。(2018 复活节活动)',
        'A suprisingly common mistake. Give it to Snowflake.' : '一个令人惊讶的普遍错误。把它交给雪花。(2018 复活节活动)',
        'A deprecated category button scattered by the 2019 Easter Event. Give it to Snowflake.' : '2019复活节活动时散落的已被弃用类别按钮。把它交给雪花。',
        'Some hoarded supplies from the 2020 Easter Event. Give it to Snowflake for redistribution.' : '2020复活节活动时囤积的一些物资。把它交给雪花重新分配。',
        'The label is faded, but you can barely make out the letters' : '标签已经褪色了，但是你勉强认出了一些字母', //-s-ra--eca、-f-zer、-ode--a、J--s-n、-ov-vax、-put--V、Co--de--a
        'Give it to Snowflake for analysis.' : '把它交给雪花分析。(2021 复活节活动)',
        'Lost goods from the new CoreCare™ series of Snowflake-approved products. Give it back to Snowflake.' : '雪花核准的新[核心服务]™系列丢失的产品，把它交换给雪花。(2022 复活节活动)',

        //旧奖杯
        'One of only 57 limited edition boxes filled with spent ability points. You\'re not quite sure when you picked this up, but something tells you to hang on to it.' : '57 个限量版盒子的其中一个，里面放满了用过的技能点。你很犹豫是否要捡起它，但有个声音告诉你要紧抓住它不放。',
        'These gifts were handed out for the 2009 Winter Solstice. It appears to be sealed shut, so you will need to make Snowflake open it.' : '这些礼物在 2009 年冬至发放。看来这似乎是密封包装，所以你需要请雪花来打开它。',
        'You found these in your Xmas stocking when you woke up. Maybe Snowflake will give you something for them.' : '你醒来时在你的圣诞袜里发现这些东西。说不定雪花会跟你交换礼物。(2009年以来每年圣诞节礼物)',
        'You found this junk in your Xmas stocking when you woke up. Maybe Snowflake will give you something useful in exchange.' : '你醒来时在你的圣诞袜里发现这个垃圾。把它交给雪花或许她会给你一些好东西作为交换。(2009年以来每年圣诞节礼物)', //0.87更新
        'This box is said to contain an item of immense power. You should get Snowflake to open it.' : '传说此盒子封印了一件拥有巨大力量的装备。你应该找雪花来打开它。(年度榜单或者年度活动奖品)',
        'You happened upon this item when you somehow found time to play HV on the gamiest day of the year. It is attached to some strange mechanism.' : '在今年鸟最多的日子，当你不知怎的抓到时间刷 HV 时意外发现这个东西。它和一些奇怪的机械装置接在一起。(《传送门 2》发售纪念)',
        'A coupon which was handled to you by a festival moogle during the Loot and Harvest Festival. Offer it to Snowflake for some bonus loot.' : '一个在战利与丰收节日期间由节日莫古利送给你的礼券。把它交给雪花可以交换额外的战利品。[2020起中秋节活动]',

        'A gift for the 2010 Winter Celebrations. Its surface has a mysterious sheen which seems to bend light in strange ways. You will need to make Snowflake open it.' : '2010 年冬天的庆祝活动的礼物。它的表面呈现不可思议的光泽，看样子是用奇妙的方式反射光线。你需要请雪花来打开它。',
        'If you look it in the mouth, some evil fate may befall you. Hand it to Snowflake instead, and she might give you a little something.' : '如果你检查马嘴，某些恶运可能会降临到你身上。相反地，把它牵给雪花，她会给你一些别的。(2011 圣诞节)',
        'Whoever got you this apparently doesn\'t know you very well. You have no need for souls. Try giving it to Snowflake, she may reward you with something else.' : '无论是谁给你这个，很显然地他对你不甚了解。你根本不需要灵魂。试着把它交给雪花，也许她会给你一些别的报酬。(2012 圣诞节)',
        'A mysterious box with six distinct locks. If you ask Snowflake, chances are she happens to have all six keys required to open it.' : '一个有六种钥匙孔的神秘盒子。如果你请教雪花的话，可能她碰巧持有开盒所需的全部六种钥匙。(2013 圣诞节)',
        'Some geniune and highly decorative reindeer antlers to hang on your wall. Or, you know, trade to Snowflake for something you likely neither want nor need.' : '一些货真价实且极具装饰性的驯鹿鹿角挂在你的墙上。要不，你知道的，和雪花交易把你可能不想要也不需要的东西处理掉。(2014 圣诞节)',
        'It says "Best Friends Forever." Looking at it fills you with determination.' : '它写着“永远的好朋友。”看着它让你充满决心。(2015 圣诞节)',
        'A giant dino egg. The entire shell is still intact. The contents seem to have fossilized, and it seems unlikely that it will ever hatch.' : '一个巨大的恐龙蛋。它的壳还保存得很完整呢。内部看起来好像成为化石了，似乎不太可能会孵化。(2016 圣诞节)',
        'This tooth is very mysterious.' : '这个牙齿非常的神秘(2017 圣诞节)',
        'A very fragile flower. While you would leave it at home rather than take it into battle, handing it to Snowflake for safekeeping seems like the better choice.' : '一朵非常脆弱的花。虽然你宁愿把它留在家里也不愿带入战斗，但把它交给雪花保管似乎是更好的选择。(2018 圣诞节)',
        'A heart, made of iron. While it was capable of protecting you from damage once, it seems to have been spent already. You should give it to Snowflake.' : '一颗钢铁制作的心。在它曾经可用时它可以保护你免受一次伤害，但它现在似乎已经被用过了。你应该把它给雪花。(2019 圣诞节)',
        'A precursor smartgun with autonomous aiming and talking functionality. The name "Skippy" is crudely painted on its side. It seems broken in more ways than one.' : '一把拥有自动瞄准和说话功能的旧世界智能枪。其名称"Skippy"粗犷地喷涂在侧面。它似乎不止一个地方坏了(2020 圣诞节)',
        'Taru da! It\'s a barrel, which may or may not be filled with yummy nomnoms, but you will never know unless you ask Snowflake to open it.' : '塔鲁达！ 这是一个桶，里面可能装满了美味的nomnoms，也可能没有，但除非你让雪花打开它，否则你永远不会知道。(2021 圣诞节)',
        'A blueish transparent orb of unknown origin with a curiously shaped needle floating inside it. It seems to be pointing towards Snowflake\'s Shrine.' : '一个来源不明的蓝色透明球体，里面漂浮着一根形状奇特的针。 似乎是指向雪花神殿的方向。(2022 圣诞节)',
        'Contains the debut single and a variety of t-shirts and folding fans for some long-lost idol group, and a battery-powered RGB glowstick for indecisive types.' : '包含一些已经引退的偶像团体的出道单曲和各种 T 恤和折扇，以及适合各种类型场景的电池供电 RGB 荧光棒。(2023 圣诞节)',
        'An exquisite and particularly fragrant marten pelt that mysteriously smells of apples. Something this fine would make a good offering to Snowflake.' : '精致而特别芳香的貂皮，神秘地散发着苹果味。如此精美的东西可以作为雪花的上好礼物。(2024 圣诞节)',

        'A badge inscribed with your RealPervert identity. Regardless of whether you fell for it or not, you got this for participating in the 2011 April Fools thread.' : '一个刻着你的实名变态身份的胸章。无论你是否信以为真，你参与了 2011 年愚人节主题就会得到这个。',
        'A 1/10th scale collectible figure of Raptor Jesus. Consolitory prize for those who did not ascend during the May 2011 Rapture.' : '猛禽耶稣的 1/10 比例缩放公仔。给 2011 年 5 月被提发生期间没被送到天上的人开个安慰价格。',
        'Granted to you by Snowflake for finding and handing in all the eggs during the 2011 Easter Event.' : '由雪花授予你，在 2011 年复活节活动寻得并且献上所有彩蛋的证明。',
        'Granted to you by Snowflake for finding and handing in some of the eggs during the 2011 Easter Event. Better luck finding all of them next year.' : '由雪花授予你，在 2011 年复活节活动寻得并且献上部分彩蛋的证明。明年一定会幸运找齐全部的。',
        'Granted to you by Snowflake for finding and handing in all the ponyfeathers during the 2012 Easter Event. Now you, too, can be like Rainbow Dash.' : '由雪花授予你，在 2012 年复活节活动寻得并且献上所有天马的羽毛的证明。现在，你也可以像云宝黛西一样。',
        'Granted to you by Snowflake for finding and handing in some of the ponyfeathers during the 2012 Easter Event.' : '由雪花授予你，在 2012 年复活节活动寻得并且献上部分天马的羽毛的证明。',
        'A crystallized Galanthus flower. Granted to you by Snowflake for finding and handing in all the snowflakes during the 2013 Easter Event.' : '结晶化的雪花莲花朵。由雪花授予你，在 2013 年复活节活动寻得并且献上所有雪花的证明。',
        'A bottle of distilled, 100% pure self-satisfaction. Granted to you by Snowflake for finding and handing in some of the snowflakes during the 2013 Easter Event.' : '一瓶蒸馏过的，100% 纯正的自我满足。由雪花授予你，在 2013 年复活节活动寻得并且献上部分雪花的证明。',
        'A highly polished and shiny commemorative gold coin. This was created especially by the Royal Equestrian Mint for the 2014 Easter Event.' : '高度抛光且闪亮亮的纪念金币。这是皇家阿奎斯陲亚铸币局专为 2014 复活节活动铸造的。',
        'An ancient precursor device, once used to inefficiently mine for magic internet money. Awarded for participating in the 2014 Easter Event.' : '古老的旧世代装置，以前被用来为神奇的网络货币执行毫无效率的挖矿。参与 2014 复活节活动的奖赏。',
        'A USB storage device filled with precursor tentacle porn, extracted from the ancient servers that were recovered during the 2015 Easter Event.' : '塞满了旧世代触手色情档案的随身碟，提取自 2015 复活节活动中复原的古老服务器。',
        'A coupon for a lifetime 10% discount on a VPS plan. Expired many lifetimes ago. A moogle gave you this for participating in the 2015 Easter Event.' : '一次有效期限内享 10% 折扣的虚拟主机方案优惠券。已逾期多次有效期限之久。这是莫古利送给你当作参与 2015 复活节活动的奖赏。',
        'An advanced precursor device capable of projecting a miniature rainbow into the sky. Awarded for participating in the 2016 Easter Event.' : '一部旧世界的先进设备，能在天空投射出一道微型彩虹。参与 2016 复活节活动的奖赏。',
        'An ordinary pot of leprechaun gold designed for use with holographic rainbow projectors. Awarded for participating in the 2016 Easter Event.' : '为搭配全像式彩虹投影机而设计，常见的拉布列康收集的一罐黄金。参与 2016 复活节活动的奖赏。',
        'A technological curiosity of the past, capable of turning perfectly good fruit into an unpalatable blend of mush. [2017 Easter Event]' : '过去的科技珍品，能够完全的将美味的水果做成难吃的糊状混合物。[2017 复活节活动]',
        'That was the theory anyway. It is a sickly brown, and does not look particularly appetizing, but Snowflake seems to love them. [2017 Easter Event]' : '这只是理论上。实际它呈现黯淡的褐色，尤其看起来不能引起食欲，但是雪花女神好像很喜欢。[2017 复活节活动]',
        'A remnant from the last great invasion of undead grammar nazis. It predominately features a swastika stylized with red squiggly lines. [2018 Easter Event]' : '上一次不死人语法纳粹入侵的残余物。它的主要特征是一个带有红色波浪线的纳粹标志。[2018 复活节活动]',
        'An abstract rendition of "Clippy", believed to be the precursor patron saint of spelling errors. [2018 Easter Event]' : '一个“Office助手”表达，被认为是拼写错误的先驱守护神。[2018 复活节活动]',
        'A small selection of assorted collectable precursor coins. [2019 Easter Event]' : '一小部分精选的各种收藏品旧币。[2019 复活节活动]',
        'A first-edition signed copy of "Coping With Change", considered by most numismatists to be *the* authoritative guide to collecting coins. [2019 Easter Event]' : '《应对变化》的初版签名版，被大多数钱币学家视为收集硬币的权威指南。[2019 复活节活动]',
        'A special kind of omikuji that does not actually tell your fortune, but will instead directly grant you some if you offer it to Snowflake.' : '一种特殊的神签，它并不会实际告诉你命运，但是如果你把它献祭给雪花可以直接交换一些东西。[2020起复活节活动]',
        'A precursor beak-shaped mask filled with fragrant herbs, said to protect the wearer from disease and miasma but probably doesn\'t. [2020 Easter Event]' : '一种充满香草药的喙状前体面具，据说可以保护佩戴者免受疾病和瘴气的侵害，但实际可能并不能。[2020 复活节活动]',
        'A paper certifying that the holder was recently vaccinated from some ancient disease. It expired centuries ago and only has historic value. [2021 Easter Event]' : '一张证明持有者最近接种过某种远古疾病疫苗的文件。它已经在好几个世纪前过期，仅具有历史价值。[2021 复活节活动]',
        'A polishing cloth, pine-scented spray bottle and various other maintenance tools to give your Equipment Cores the love they deserve. [2022 Easter Event]' : '抛光布、松香喷雾瓶和其他各种维护工具，为您的设备核心提供应有的爱。[2022 复活节活动]',
        'Replacement parts for a precursor search engine. Snowflake has been looking for this for a restoration project.' : '远古搜索引擎的替换部件，雪花正在寻找这些东西以进行一个修复项目。[2023 复活节活动]',
        'A ticket to Snowflake\'s Search Engines Through The Ages Exhibition. A complimentary equipment piece will be handed out after the tour. [Easter 2023]' : '通往雪花历代搜索引擎展览的门票，参观结束后将获赠一件免费装备。[2023复活节]',
        'A curious piece of abstract precursor art, featuring a number of square low-resolution images in a grid pattern. Who would want this? Possibly Snowflake.' : '一块奇特的远古抽象艺术品，以一组低分辨率的方形图案展示在网格中。谁会想要这个呢？大概是雪花。[2024 复活节活动]',
        'A replica of a device historians believe to have caused the Great Flood, arguably triggering the demise of the precursor global information network. [Easter 2024]' : '历史学家认为造成大洪水的设备复制品，可以说造成了前全球信息网络的灭亡。 [2024 年复活节]',
        "A part of Snowflake's missing ritual bunny girl costume. You could return it to her at the shrine. Or keep it, and wear it when no one is watching.": "这是雪花女神丢失的仪式兔女郎服装的一部分。你可以去神社归还给她，或者自己留着在无人时穿戴。[2025 复活节活动]",
        "A part of Snowflake's missing bunny girl costume. You could return it to her at the shrine. Or keep it, and wear it when no one is watching.": "这是雪花女神丢失的兔女郎服装的一部分。你可以去神社归还给她，或者自己留着在无人时穿戴。[2025 复活节活动]",
        "A large 1/4th scale detailed collectible figure featuring Snowflake, the Goddess of Loot and Harvest, wearing her signature ritual bunny girl outfit. [Easter 2025]" : "一款大型的1/4比例精细收藏人偶，以战利品与丰收女神‘雪花’为特色，身着标志性的仪式兔女郎装扮。[2025复活节活动]",


    },

    ///////////////////////////////////////////////////////装备
    equipsName: {
        'Your Inventory' : '你的物品',
        'Store Inventory' : '商店物品',
        'Equipment Inventory' : '装备列表',
        'Equipment Storage' : '装备仓库',
        'Available Equipment' : '可选装备',
        'Equip Slots' : '装备库存',
        'Storage Slots' : '仓库库存',
        'Current Owner' : '持有者',

        //装备品质
        'Flimsy' : '薄弱',
        'Crude' : '劣等',
        'Fair' : '一般',
        'Average ' : '中等 ',
        'Superior' : '上等',
        '/^Fine /' : '优秀 ',
        'Exquisite' : '✧精良✧',
        'Magnificent' : '☆史诗☆',
        'Legendary' : '✪传奇✪',
        'Peerless' : '☯无双☯',

        //法杖类型
        ' Staff' : ' 法杖',
        'Oak' : '橡木',
        'Redwood' : '红杉木',
        'Willow' : '柳木',
        'Katalox' : '铁木',
        'Ebony':'*乌木',
        //单手武器
        'Axe' : '斧',
        'Club' : '棍',
        'Rapier' : '西洋剑',
        'Shortsword' : '短剑',
        'Wakizashi' : '脇差',
        'Sword Chucks' : '*锁链双剑',
        'Dagger' : '*匕首',
        //双手武器
        'Mace' : '重锤',
        'Estoc' : '刺剑',
        'Longsword' : '长剑',
        'Katana' : '日本刀',
        'Scythe' : '*镰刀',
        //盾类型
        'Buckler' : '小圆盾',
        'Kite Shield' : '鸢盾',
        'Force Shield' : '力场盾',
        'Tower Shield' : '*塔盾',
        //护甲类型
        'Cotton' : '棉制',
        'Phase' : '相位',
        'Shade' : '暗影',
        'Leather' : '皮革',
        'Plate' : '板甲',
        'Power ': '动力 ',
        //旧版护甲类型
        'Silk' : '*丝绸',
        'Gossamer' : '*薄纱',
        'Dragon Hide' : '*龙皮',
        'Kevlar' : '*凯夫拉',
        'Chainmail' : '*锁子甲',
        //锁子甲特有部位
        'Coif' : '头巾',
        'Mitons' : '护手',
        'Hauberk' : '装甲',
        'Chausses' : '裤',
        //护甲部位
        'Cap ' : '帽 ',
        '/Cap$/' : '帽 ',
        'Robe' : '长袍',
        'Breastplate' : '护胸',
        'Cuirass' : '胸甲',
        'Gloves' : '手套',
        'Gauntlets' : '手甲',
        'Pants' : '裤',
        'Leggings' : '护腿',
        'Greaves' : '护胫',
        'Shoes' : '鞋',
        'Boots' : '靴子',
        'Sabatons' : '铁靴',
        'Helmet' : '头盔',
        '动力 Armor' : '动力 盔甲',

        //前缀
        'Ethereal' : '虚空',
        'Fiery' : '红莲(火)',
        'Arctic' : '北极(冰)',
        'Shocking' : '雷鸣(雷)',
        'Tempestuous' : '风暴(风)',
        'Hallowed' : '圣光(圣)',
        'Demonic' : '魔性(暗)',
        'Reinforced' : '坚固的（减伤）',
        'Radiant' : '魔光的（魔伤）',
        'Mystic' : '神秘的（暴击）',
        'Charged' : '充能的（加速）',
        'Amber' : '琥珀的（雷抗）',
        'Mithril' : '秘银的（低重）',
        'Agile' : '俊敏的（加速）',
        'Zircon' : '锆石的（圣抗）',
        'Frugal' : '节约的（省魔）',
        'Jade' : '翡翠的（风抗）',
        'Cobalt' : '钴石的（冰抗）',
        'Ruby' : '红宝石（火抗）',
        'Onyx' : '缟玛瑙（暗抗）',
        'Savage' : '残暴的（暴伤）',
        'Shielding' : '盾化的（格挡）',
        //旧版前缀
        ' Shield ' : ' 盾化的（格挡） ', //旧版的盾化前缀和盾一模一样……前面已经充分排除其它带盾的应该没问题吧……
        'Bronze' : '铜',
        'Iron' : '铁',
        'Silver' : '银',
        'Steel' : '钢',
        'Gold' : '金',
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

        //后缀
        'of Slaughter' : '杀戮',
        'of Balance' : '平衡',
        'of Swiftness' : '迅捷',
        'of the Vampire' : '吸血鬼',
        'of the Illithid' : '灵吸怪',
        'of the Banshee' : '报丧女妖',
        'of the Nimble' : '招架',
        'of the Battlecaster' : '战法师',
        'of Destruction' : '毁灭',
        'of Focus' : '专注',
        'of Surtr' : '苏尔特（火伤）',
        'of Niflheim' : '尼芙菲姆（冰伤）',
        'of Mjolnir' : '姆乔尔尼尔（雷伤）',
        'of Freyr' : '弗瑞尔（风伤）',
        'of Heimdall' : '海姆达（圣伤）',
        'of Fenrir' : '芬里尔（暗伤）',
        'of the Elementalist' : '元素使',
        'of the Heaven-sent' : '天堂',
        'of the Demon-fiend' : '恶魔',
        'of the Earth-walker' : '地行者',
        'of the Curse-weaver' : '咒术师',
        'of the Barrier' : '格挡',
        'of Warding' : '魔防',
        'of Protection' : '物防',
        'of Dampening' : '抑制',
        'of Stoneskin' : '石肤',
        'of Deflection' : '偏转',
        'of the Shadowdancer' : '影舞者',
        'of the Arcanist' : '奥术师',
        'of the Fleet' : '迅捷',
        'of Negation' : '否定',
        //旧装备后缀
        'of the Priestess' : '牧师',
        'of the Hulk' : '浩克',
        'of the 盾化的（格挡） Aura' : '守护光环', //Shielding Aura
        'of the Ox' : '牛（力量）',
        'of the Raccoon' : '浣熊（灵巧）',
        'of the Cheetah' : '猎豹（敏捷）',
        'of the Turtle' : '乌龟（体质）',
        'of the Fox' : '狐狸（智力）',
        'of the Owl' : '猫头鹰（智慧）',
        'of the Stone-skinned' : '硬皮（减伤）',
        'of the Fire-eater' : '吞火者（火抗）',
        'of the Frost-born' : '冰人（冰抗）',
        'of the Thunder-child' : '雷之子（雷抗）',
        'of the Wind-waker' : '驭风者（风抗）',
        'of the Thrice-blessed' : '三重祝福（圣抗）',
        'of the Spirit-ward' : '幽冥结界（暗抗）',

    },

    ///////////////////////////////////////////////////////装备后缀
    ////此字典目前仅用于独立装备信息页
    ///////////////////////////////////////////////////////
    equipsSuffix: {
        //独立装备信息页面中装备名可能会分行导致无法匹配完整后缀，此处做特殊处理补充
        //为防止错误匹配其它单词，使用结尾正则表达式仅匹配后缀
        '/Slaughter$/' : '杀戮',
        '/Balance$/' : '平衡',
        '/Swiftness$/' : '迅捷',
        '/Vampire$/' : '吸血鬼',
        '/Illithid$/' : '灵吸怪',
        '/Banshee$/' : '报丧女妖',
        '/Nimble$/' : '招架',
        '/Battlecaster$/' : '战法师',
        '/Destruction$/' : '毁灭',
        '/Focus$/' : '专注',
        '/Surtr$/' : '苏尔特（火伤）',
        '/Niflheim$/' : '尼芙菲姆（冰伤）',
        '/Mjolnir$/' : '姆乔尔尼尔（雷伤）',
        '/Freyr$/' : '弗瑞尔（风伤）',
        '/Heimdall$/' : '海姆达（圣伤）',
        '/Fenrir$/' : '芬里尔（暗伤）',
        '/Elementalist$/' : '元素使',
        '/Heaven-sent$/' : '天堂',
        '/Demon-fiend$/' : '恶魔',
        '/Earth-walker$/' : '地行者',
        '/Curse-weaver$/' : '咒术师',
        '/Barrier$/' : '格挡',
        '/Warding$/' : '魔防',
        '/Protection$/' : '物防',
        '/Dampening$/' : '抑制',
        '/Stoneskin$/' : '石肤',
        '/Deflection$/' : '偏转',
        '/Shadowdancer$/' : '影舞者',
        '/Arcanist$/' : '奥术师',
        '/Fleet$/' : '迅捷',
        '/Negation$/' : '否定',
        //部分旧装备后缀
        '/Priestess$/' : '牧师',
        '/Hulk$/' : '浩克',
        '/盾化的（格挡） Aura$/' : '守护光环', //Shielding Aura
        '/Ox$/' : '牛（力量）',
        '/Raccoon$/' : '浣熊（灵巧）',
        '/Cheetah$/' : '猎豹（敏捷）',
        '/Turtle$/' : '乌龟（体质）',
        '/Fox$/' : '狐狸（智力）',
        '/Owl$/' : '猫头鹰（智慧）',
        '/Stone-skinned$/' : '硬皮（减伤）',
        '/Fire-eater$/' : '吞火者（火抗）',
        '/Frost-born$/' : '冰人（冰抗）',
        '/Thunder-child$/' : '雷之子（雷抗）',
        '/Wind-waker$/' : '驭风者（风抗）',
        '/Thrice-blessed$/' : '三重祝福（圣抗）',
        '/Spirit-ward$/' : '幽冥结界（暗抗）',

        //处理词缀。应该避免在没有必要的地方使用此字典，以免处理掉其它正常句子的词缀
        ' of ' : ' ',
        '/ of$/' : '',
        '/^[oO]f /' : '',
        ' the ' : ' ',
        '/^[tT]he /' : '',
        '/ the$/i' : '',
    },

    ///////////////////////////////////////////////////////装备部件
    ////……由于拆分起来比较麻烦装备部件字典和其它部分有内容重叠
    ///////////////////////////////////////////////////////
    equipsPart: {
        'One-Handed Weapon':'单手武器',
        'Two-Handed Weapon':'双手武器',
        'Staff':'法杖',
        'Shield':'盾牌',
        'Cloth Armor':'布甲',
        'Light Armor':'轻甲',
        'Heavy Armor':'重甲',

        'Helmet' : '头部',
        'Body' : '身体',
        'Hands' : '手部',
        'Legs' : '腿部',
        'Feet' : '足部',
    },

    ///////////////////////////////////////////////////////装备说明
    equipsInfo: {
        //装备属性
        'One-handed Weapon':'单手武器',
        'Two-handed Weapon':'双手武器',
        '/^Staff /':'法杖',
        '/^Shield /':'盾牌',
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
        ' turn':' 回合',
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
        'Elemental ':'元素 ',
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
        'Bonus':'加成',

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
        '/Infused Storms?/':'风暴附魔',
        'Infused Divinity':'神圣附魔',
        'Infused Darkness':'黑暗附魔',
    },

    ///////////////////////////////////////////////////////装备强化
    upgrades: {
        'Forge Upgrade Level' : '锻造等级',
        'Rank' : '水准',
        'Beginner' : '入门',
        'Novice' : '初心者',
        'Apprentice' : '学徒',
        'Journeyman' : '熟练工',
        'Artisan' : '工匠',
        'Expert' : '专家',
        'Master' : '大师',

        'Select an equipment piece from the list to the left\nthen hit Repair Item below to repair it.' : '从左侧列表选择一件装备，然后点击下方 Repair Item 按钮修复它，或者点击下方 Repair All 修理左侧所有装备。',
        'All equipment have a condition and a durability.\nCondition degrades with use. Durability dictates\nwhat the "maximum" condition of an item is and \ntherefore how often it needs to be repaired. When\nan equipment piece degrades below 50% condition\nit will temporarily make the equipment worse by\nreducing its effective stats.' : '所有装备都有耐久度，随时用而逐渐损耗，在战斗中被怪物击败会对装备造成较大的固定比值损耗。装备最高耐久度决定了你需要多久修理一次它，当一件装备耐久低于50% 时，它提供的属性加成会降低，当耐久为0%时，将不提供任何属性加成，直到你修复它。',
        'Here you can spend scrap materials to fully\nrestore an equipment piece to its maximum\ncondition. Scrap can be salvaged from unwanted\nequipment or bought from the Item Store.' : '在这里你可以使用素材修复一件装备的耐久度。素材可以通过分解不需要的装备或者在商店购买获得。',
        'The amount of scrap required to repair an item\ndepends on its percentage-wise degradation.\nEquipment with a high durability will therefore\nneed comparatively less materials over time to\nmaintain.' : '修复装备所需的素材数取决于装备的品质和耐久度损耗百分比，高耐久上限的装备更加耐用，同时维修起来更加划算。',
        'Select an item to see required repair materials.' : '选择一件装备以查看这件装备修复所需材料',
        'Requires:' : '需求:',
        'Everything is fully repaired.' : '该标签页下的所有装备已全部修复',

        'Select an equipment piece from the list to the left\nthen hit Show Upgrades below to show a list over\nstats that can be upgraded.' : '从左侧列表选择一件装备，然后点击下方 Show Upgrades 查看可用强化。',
        'Upgrades allow you to spend materials to boost\nthe stats of your equipment. Upgrades require\na binding that correspond to the stats you\nwish to upgrade and some materials that\ncorrespond to the gear you are upgrading.\nA catalyst item of a tier corresponding to\nthe equipment quality and upgrade level will\nalso be needed.' : '装备强化允许你使用各种素材来加强你的装备属性。每一级强化都需要根据装备品质、材质和强化等级消耗对应级别的材料和催化剂，当你强化一个属性超过5级之后每一级强化还需要消耗一个对应属性的粘合剂(异世界模式不需要粘合剂)',
        'Rare equipment types will also require a special\ncomponent to upgrade. This component is only\nneeded to increase the highest stat - if you\npreviously spent five of them to increase a stat\nto Level 5 then every other stat can be increased\nto Level 5 without spending any additional rare\ncomponents.' : '强化稀有装备还需要额外花费特殊素材，特殊素材只需要在一项上花费即可。打个比方 - 如果你已经将一项强化升级到5级并使用了5个特殊素材，那么将其他项目强化提升到5级就不需要花费额外的特殊素材了，只有继续将一项强化升级为6级时才需要再消耗1个特殊素材。',
        'Leveling equipment to its highest potential by \nupgrading it or leveling it in the Item World\nwill also unlock the ability to give it a custom\nname from this screen.' : '强化也将使装备获得一定的潜经验值用于升级该装备潜能等级，当你通过道具界或者强化使一件装备达到它的最高潜能等级后，你可以随意在强化界面修改装备的显示名称。',

        'Select an equipment piece from the list to the left\nthen hit Show Enchantments below to show a list\nof upgrades that can be applied.' : '从左侧列表选择一件装备，然后点击下方 Show Enchantments 按钮查看可用附魔。',
        'Every enchantment requires a consumable item\nto activate. The effect wears off after a\ncertain number of minutes real-time but can\nbe extended indefinitely by applying the same\nenchantment multiple times.' : '每种附魔都需要消耗附魔道具。附魔存在有效时间，以现实时间精确到分种计算，超过有效时间之后附魔就会失效。你可以通过多次重复同一个附魔来延长附魔有效时间。',
        'Enchantments will also wear off immediately\nif the item is sold or sent through MoogleMail.' : '附魔效果在装备售出或寄出后会立即失效。',

        'Select an equipment piece from the list to the left\nthen hit Salvage Item below to salvage it. This will\npermanently destroy the item in question.' : '从左侧列表选择一件装备，然后点击下方 Salvage Item 分解装备。此操作将会永久摧毁装备（其实分解24小时内可以在商店里买回，但是价格是5倍正常价或者至少10K，且装备潜能等级会被重置并会变成不可交易）',
        'You have a chance to get some forge upgrading\nmaterials when you salvage an item. The type\ndepends on the kind of item salvaged while the\ntier depends on the quality of the item as well\nas a random chance. At the very least you will\nreceive some scrap that can be used to repair\nother items.' : '你有机会通过分解装备获得一些用于装备升级的材料。分解出的素材种类取决于被分解装备的类型与品质，分解获得的材料数量也有一定的随机波动。但至少，你可以获得用各种废料素材来修理其他装备。',
        'You have a chance to get some forge upgrading\nmaterials when you salvage an item. The type\ndepends on the kind of item salvaged while the\ntier depends on the quality of the item as well\nas a random chance. At the very least you will\nreceive some scrap that can be used to repair\nother items.' : '分解装备可以获得一些素材用于强化或者修复装备。分解出的素材种类取决于被分解装备的类型与品质，现在上等及以上装备分解你会获得对应品质的强化素材，中等或更差的装备分解可以获得一些对应的废料用来修理其他装备，稀有装备类型分解还可以获得一些能量元。每件装备现在只能获得一次基础分解素材，也就是说如果你分解一件装备之后再次从商店购买回来分解将无法再次得到上述素材。', //0.87变更，作为对照上原文保留
        'If an equipment piece has been upgraded in the\nforge then salvaging it will return 90% of the\nmaterials spent upgrading it. Catalyst items\ncannot be recovered this way.' : '分解一件被强化过的装备会返还 90% 使用的强化材料。催化剂无法通过分解装备回收。',

        'Select an equipment piece from the list to the left\nthen hit Reforge Item below to reforge it.' : '从左侧列表选择一件装备，然后点击下方 Reforge Item 按钮重铸它。',
        'Reforging an item will reset its potential to zero\nwhich removes all of its unlocked potencies. This\nallows you to start over and take another shot\nat getting your desired potencies from upgrading\nor leveling the item in the Item World.' : '重铸一件装备会将该装备的潜能等级重置为0，同时清空该装备所有已解锁的潜能，这使你可以去道具界重新尝试解锁你想要的潜能。',
        'This costs one Amnesia Shard for every level of\nunlocked potential.' : '重铸一件装备将消耗等同于该装备已解锁潜能等级的重铸碎片。',

        'Select an equipment piece from the list to the left then hit Soulfuse Item below to permanently bind it to you. This will make it level as you do. There is no way to break this bond outside of salvaging the item.' : '从左侧列表选择一件装备，然后点击下方 Soulfuse Item 将该装备与你进行永久绑定。灵魂绑定之后该装备会跟随你的等级一起成长。除非你将装备分解否则没有其它办法可以解除绑定状态。',
        'Select an equipment piece from the list to the left then hit Soulfuse Item below to permanently bind it to you. This will make it level as you do. There is no way to break this bond, but the item can still be salvaged or sold.' : '从左侧列表选择一件装备，然后点击下方 Soulfuse Item 将该装备与你进行永久绑定。灵魂绑定之后该装备会跟随你的等级一起成长。此绑定无法解除，但是装备仍然可以被拆解或者出售给系统店。',
        'The cost for soulfusing with an item depends both on your level and how many levels below you the item is.' : '灵魂绑定消耗的碎片数量取决于装备的品质以及该装备比你高出的等级数。',
        'You cannot soulfuse items that have a gear level higher than 100 above your current level. Right now, you can soulfuse equipment up to level' : '你不能灵魂绑定高于自己超过100级的装备，也就是说, 你目前可以灵魂绑定的最高装备等级是',

        'You currently have ' : '你当前拥有 ',
        'Amnesia Shards' : '重铸碎片',
        'Soul Fragments' : '灵魂碎片',
        '/Fusing with the selected item will cost (\\d+) fragments\./' : '灵魂绑定所选装备需要 $1 个灵魂碎片',
        '/Reforging the selected item will cost (\\d+) shards?./' : '重铸所选装备需要消耗 $1 个重铸碎片。',
        'The selected item does not have any potencies' : '选中的装备没有潜能等级',
        'This will permanently destroy the item': '此操作将会永久摧毁装备',

        'Available Upgrades' : '可用强化',
        //可强化和附魔项目使用equipsInfo字典
        'At max upgrade level' : '已到达锻造等级上限',
        'Hover over an upgrade to get a list of necessary' : '鼠标停留在升级项目上以查看升级需要的材料',
        'Required items for next upgrade tier' : '提升到下级所需材料',
        //强化和附魔所需材料使用items字典
        'Materials to perform it.' : ' ',
        'Effect:' : '效果:',
        'Base' : '基础',
        'Grants' : '获得',
        'Forge EXP and' : '冶炼经验以及',
        'Gear Potency' : '装备潜经验值',
        'None' : '无',

        'Available Enchantments' : '可用附魔',
        'Hover an enchantment to get a description' : '鼠标停留在附魔项目上',
        'And list of required items.' : '以查看附魔介绍和所需材料',
        'Required items to apply enchantment' : '所需附魔材料',

        'This enchantment temporarily changes the weapon' : '将武器的伤害类型转换为虚空',
        'Damage type to Void. This makes it effectively' : '虚空伤害无视',
        'Ignore the physical defenses of most monsters' : '大部分怪物的物理防御力',
        'It also greatly increases your chance to hit.' : '且增加你 50% 物理命中（双持效果不可叠加）',

        'This enchantment will temporarily suffuse your' : '将武器用以太附魔',
        'Weapon with a powerful aether flux. This reduces' : '这将降低你10%魔力消耗',
        'The drain on your magic reserves when casting' : '以及增加50%的魔法命中',
        'Spells. It will also let you land spells on your' : '双持效果不可叠加',
        'Opponents with a higher rate of success.' : '',

        'This enchantment will temporarily reduce all' : '这个附魔将暂时降低',
        'Movement and spell casting penalties from a' : '装备上的负重与干扰',
        'Piece of equipment. This lets you use heavier' : '7点或50%',
        'Weapons, shields and armor pieces with a lower' : '以较高值为准',
        'Impact to mobility and spell power.' : '',

        'This enchantment will temporarily' : '这个附魔会暂时',
        'Imbue your armor with additional' : '给护甲附加上5%的',
        'Imbue your weapon with the elemental' : '给你的武器附加',
        //冲击效果使用equipsInfo字典
        'effect. (max 2 strikes)' : '效果（最多可有2个冲击效果）',

        'Resistance to Fire' : '对火属性减伤',
        'Resistance to Cold' : '对冰属性减伤',
        'Resistance to Elec' : '对电属性减伤',
        'Resistance to Wind' : '对风属性减伤',
        'Resistance to Holy' : '对圣属性减伤',
        'Resistance to Dark' : '对暗属性减伤',

        'Duration:' : '持续时间:',
        'minutes' : '分钟',

    },

    ///////////////////////////////////////////////////////设置
    settings: {
        'When you get too powerful to be challenged by the mobs on the normal difficulty, you can increase the Challenge Level here.' : '当你变的足够强大，感到对付当前难度的怪物已经没有挑战性的时候，你可以在这里增加难度等级。',
        'Playing on a higher Challenge Level will increase the EXP you get from each mob, but the mobs have increased HP and hit harder' : '在更高的难度等级下，你会获得更好的掉落，更多的经验与Credit，怪物也将变的更强',
        'Challenge Level' : '难度等级',
        'Challenge' : '名称',
        //难度名称使用独立的difficulty字典
        'EXP Mod' : '经验倍率',
        'Balanced Fun' : '平衡而有趣',
        'Somewhat Tricky' : '有些棘手(1.25倍Credits掉落)',
        'Pretty Tough' : '确实挺难的(1.5倍Credits掉落)',
        'Even Tougher' : '还能更难(1.75倍Credits掉落，开始有概率掉落"传奇"/"无双"装备)',
        'Old School' : '像老红白机游戏一样无情(2.2倍Credits掉落，装备掉落最低品质为"中等")',
        'I Wanna Be The Hentai' : '我要成为大Hentai(3倍Credits掉落)',
        'Smiles' : '微笑 :-)(3倍Credits掉落，掉落装备最低品质为"上等")',

        'Display Title' : '称号选择',
        'Here you can choose which of your available titles that will be displayed below your level and on the forums.' : '在这里可以选择你的称号，称号会在你的等级下方以及游戏论坛中显示',
        'Effect' : '效果',
        'Title' : '称号',
        'Newbie' : '新人',
        'Novice' : '入门者',
        'Beginner' : '初学者',
        'Apprentice' : '学徒',
        'Journeyman' : '熟练工',
        'Artisan' : '工匠',
        'Expert' : '专家',
        'Master' : '大师',
        'Champion' : '冠军',
        'Hero' : '英雄',
        'Lord' : '领主',
        'Ascended' : '崛起者',
        'Destined' : '天选者',
        'Godslayer' : '弑神者',
        'Dovahkiin' : '龙裔',
        'Ponyslayer' : '小马杀手',
        '% Damage' : '% 伤害',
        '% Evade' : '% 闪避率',
        'The power of the Dragonborn.' : '龙裔之力（可使用龙吼）',
        'Level Default' : '自动选择（根据当前等级）',
        'See Below' : '见下表（到“领主”为止）',
        'No Bonus' : '无加成',

        'Font Engine' : '文字引擎',
        'Here you can choose a custom font instead of the standard HentaiVerse font engine.' : '在这里你可以选择使用自定义字体代替HV的默认的字体引擎，',
        'This mostly affects how fast pages will render and how pretty they will look.' : '这将大幅改善页面的加载速度以及页面显示的字体效果。为了完全汉化其它内容及更好的使用其它脚本，你必须设置自定义字体',
        'Use Custom Font (specify below - this font MUST be installed on your local system to work)' : '使用自定义字体（下方字体名称必填，所指定的字体如果本地系统内没有安装会自动使用其它字体替代）',
        'font-family' : '字体名称',
        'font-size' : '字体大小',
        'font-weight' : '字体深浅',
        'font-style' : '字体版式',
        'vertical adjust' : '垂直调整',
        'Allowed' : '可选',
        '5 to 20 (points)' : '5 ~ 20 号（请输入数字）',
        'normal, bold, bolder, lighter' : '普通(normal),粗体(bold),粗体+(bolder),细(lighter)（请输入对应英文）',
        'normal, italic, oblique' : '普通(normal),斜体(italic),斜体+(oblique)（请输入对应英文）',
        '-8 to 8 pixels (tweak until text appears centered)' : '-8 ~ 8 像素（请输入数字，可适当调整使文字垂直居中）',

        'Equipment Sets' : '套装设定',
        'If you want to have separate slotted abilities, battle items and skillbars/autocast assignments per equipment set for your current persona, you can toggle the options below. ' : '默认情况下，同一个人格角色下的所有装备套装共享一样的技能、战斗物品、快捷栏、自动施法配置。如果你想让不同的装备套装使用不同的各项配置，你可以在这里更改选项。',
        'If this is changed, the current persona\'s shared set will be assigned to Set 1 and vice versa. This can be set differently for each persona.' : ' 如果以下选项被勾选，则当前人物角色该项的原有设置将仅应用于套装1，其它套装可以重新设置，当取消勾选时则当前人格角色下所有套装的该项配置将重新使用原有套装1的设置。',
        'Use Separate Ability Set Assigments' : '使用不同的技能配置',
        'Use Separate Battle Item Assigments' : '使用不同的战斗物品配置',
        'Use Separate Skillbar/Autocast Assignments' : '使用不同的快捷栏及自动施法配置',

        'Vital Bar Style' : '状态值显示设置',
        'You can either use the standard bar which uses pips for charges, or a more utilitarian (and skinnable) bar that has numerical bars for everything.' : '你可以使用预设的两端缩进（类似上古卷轴式）血条来表示体力值，圆点来表示Overcharge槽，也可以使用更直观的通常血条来表示体力值和Overcharge槽。',
        'Standard' : '预设',
        'Utilitarian' : '通常',

        'Shrine Trophy Upgrades' : '献祭奖杯升级',
        'By default, as you gain levels, Snowflake will start accepting more lower-tier trophies for a higher-trophy roll in the Shrine. You can override this behavior here.' : '默认情况下，雪花女神将随着你等级的提升自动接受你将多个低等级奖杯升级成高等级奖杯进行献祭，你可以在下面更改覆盖默认设置。（奖杯升级是叠加的，意味着32个等级2奖杯可以升级成1个等级5奖杯）',
        'Use Default' : '使用默认（跟随等级自动提升，200级时升级到等级3，300级时升级到等级4，400级时升级到等级5）',
        'Upgrade to Tier 3' : '升级到等级3（献祭时4个等级2奖杯升级为一个等级3奖杯，同时献祭价值提升为1.1倍）',
        'Upgrade to Tier 4' : '升级到等级4（献祭时2个等级3奖杯升级为一个等级4奖杯，同时献祭价值提升为1.2倍）',
        'Upgrade to Tier 5' : '升级到等级5（献祭时4个等级4奖杯升级为一个等级5奖杯，同时献祭价值提升为1.3倍）',
        'Do Not Upgrade' : '不升级',

        'Quickbar Slots' : '快捷栏',
        'Here you can set up which spells will appear on the battle screen quickbar.' : '这里你可以设定战斗中的技能法术快捷栏',
        '/Set (\\d+) is selected/' : '当前为套装$1设置',
        //技能法术名称使用独立的skills字典
        'Not Assigned' : '未设置',

        'Auto-Cast Slots' : '自动施法',
        'Here you can set which spells will be automatically cast at the start of each battle' : '这里你可以选择在战斗中自动释放的法术',
        'Note that you have to unlock one or more of the Innate Arcana ' : '你必须在',
        'to use these.' : '中购买了Innate Arcana才可以使用这个功能（异世界模式下自动解锁所有自动施法槽）',
        'You do not have any autocast slots.' : '你现在还没有开放自动施法槽。（购买Innate Arcana之后可能会有一段时间延迟）',
        'If your MP decreases below 10%, the innate spells will dissipate. They will be recast when it goes back above 25%.' : '如果你的MP低于10%，你将无法维持自动施法，直到你的MP回复到25%以上',
        'Upkeep' : '维持法术需消耗',
        'MP/round' : '魔力/回合',
        'Autocast' : '自动施法槽',

        'Auto-Sell / Auto-Salvage' : '自动出售/自动拆解',
        'If you want to automatically dump junk equipment on the closest travelling salesmoogle or break it down into parts, you can do so here. ' : '如果你打算自动把垃圾装备就近出售给路过的商人或者将其拆解成零件，你可以这这里设置。',
        'All equipment of the specified qualify and below will be automatically sold or turned in to salvage. ' : '所有你所指定品质及以下的装备将会在获得时被自动出售或者分解。',
        'If a dropped equipment qualifies for both sell and salvage, the action with the lowest required quality will be taken.' : '如果某类装备同时设置了自动出售和自动拆解品质，那么其中设置较低一个将优先执行（比如：你设置了棉质护甲自动出售精良品质和自动拆解史诗品质时，精良以下将被出售，史诗品质将被拆解）',
        'No Auto-Sell' : '不自动出售',
        '/^Sell (\\w+)$/' : '自动出售 $1 或更低品质',
        'No Auto-Salvage' : '不自动拆解',
        '/^Salvage (\\w+)$/' : '自动拆解 $1 或更低品质',
        '/ Armor$/' : ' 护甲',

        'Apply Changes' : '确认更改',
    },


    ///////////////////////////////////////////////////////采购机器人
    itemBot: {
        'New/Edit Bot Task' : '编辑/创建一个新的采购任务',
        'Select Item' : '选择一项道具',
        'Select an item' : '选择一件道具',
        'Max Item Count' : '采购数量',
        'Max Bid Per Item' : '你的出价',
        'Minimum Price' : '最低允许出价',
        'Current High Bid' : '目前最高出价',
        'Active Bot Tasks' : '已激活的采购任务',
        'Create Backorder' : '创建订单',
        'Update Backorder' : '更新订单',
        'Delete Backorder' : '删除订单',
        'Placing a backorder will allow you to automatically buy items that are sold to the item shop. The max bid should be set to the maximum value you are willing to pay for an item. If you are the highest bidder for a sold item, you will pay whatever the second highest bidder offered, or the minimum price (normal buying price) if there are no other backorders.' : '创建一个采购订单将允许你自动购买别人出售在商店的物品。最高出价应当永远设置为你愿意支付的最高价格。如果你是最高出价者，你将支付第二出价者的出价获得商品，如果你是唯一的出价者，那你将以最低价获得该订单。',
        'You only pay for items if and when the backorder is filled. If your account does not have sufficient credits whenever an item is sold, your backorder will be deleted.' : '你仅在该订单成立时支付货款。如果订单成立时你的账户余额不足以支付该订单，你的订单将会被删除。',
    },

    ///////////////////////////////////////////////////////交易市场
    market: {
        '/Consumables?/' : '消耗品',
        '/Materials?/' : '材料',
        '/Trophies|Trophy/' : '奖杯',
        '/Artifacts?/' : '文物',
        '/Figures?/' : '小马雕像',
        '/Monster Items?/' : '怪物物品',

        'Account Balance' : '账户余额',
        ' Withdraw ' : ' 提款 ',
        ' Deposit ' : ' 存款 ',
        'Market Balance' : '市场余额',
        'Browse Items' : '查看市场',
        'My Buy Orders' : '我的买单',
        'My Sell Orders' : '我的卖单',
        'Market Log' : '市场记录',
        'Account Log' : '帐号记录',
        '/^Trade Log$/' : '交易记录',

        'There are no items matching this filter' : '当前没有符合筛选条件的物品',
        'There are no orders for this type of item' : '当前类别没有订单',
        'There are no recent market events.' : '最近没有市场活动',
        'Only With Sellable Stock' : '只看可出售库存',
        'Only With Buyable Stock' : '只看可购买库存',
        'Show Obsolete Items' : '显示过时物品',
        'Your Stock' : '你的库存',
        'Market Bid' : '市场出价',
        'Market Ask' : '市场要价',
        'Market Stock' : '市场库存',
        'Placing sell orders is locked for the first' : '在异世界每季度最开始前24小时',
        '24 hours of each Isekai season.' : '投放卖单将被临时禁用',
        'Placing sell orders is locked until tomorrow.' : '明天开始才能投放卖单',

        'You have ': '你有 ',
        ' available to sell. This item is traded in batches of ' : ' 件库存可供出售。本物品出售单位为每包 ',
        '; all prices are per batch. Min price is ' : ' 件, 以下价格都是以包为单位。市场最低出价为 ',
        ' available to sell. This item is traded in single units. Min price is ' : ' 件库存可出售。本物品出售单位为一件，市场最低出价为',
        ' for market orders.' : '.',
        ' for market orders and ' : ', 最低系统店进价为 ',
        ' for backorders.' : '.',
        'Can always be bought for ' : '系统店直接供货价为 ',
        'Item cannot be backordered.' : '本物品不支持系统店进货',

        'Your Sell Order' : '你的卖单',
        'Sell Count:' : '出售数量',
        'Min Ask Price:' : '最低卖价',
        'Ask Price:' : '卖价',
        'Stock:' : '库存',
        'Place Sell Order' : '投放卖单',
        'Min Undercut' : '最低减价',
        'Available Sell Orders' : '当前卖单',
        'No sell orders found' : '当前没有卖单',
        'Your Buy Order' : '你的买单',
        'Buy Count:' : '购买数量',
        'Min Bid Price:' : '最低买价',
        'Bid Price:' : '买价',
        'Order Total:' : '总价',
        'Min Overbid' : '最低加价',
        'Place Buy Order' : '投放买单',
        'Update' : '更新',
        'Delete' : '删除',
        'Available Buy Orders' : '当前买单',
        'No buy orders found' : '当前没有买单',

        'Price History' : '历史价格',
        'Count' : '数量',
        'Price' : '单价',
        'Total' : '总计',
        'Sold' : '售出',
        'Low' : '最低',
        'Avg' : '平均',
        'High' : '最高',
        'Vol' : '总计',
        'Day' : '日',
        'Week' : '周',
        'Month' : '月',
        'Year' : '年',
        'Recent Trades' : '最近交易',
        'Seller' : '卖家',
        'Buyer' : '买家',
        '/^Item$/' : '物品',
        'No recent trades found' : '无最近交易记录',
        'No trades found' : '无交易记录',
        'Show Full Trade Log' : '查看全部交易记录',
        'Item Trade Log' : '物品交易记录',
        'Player Trade Log' : '用户交易记录',
        'Previous' : '上一个',
        'Back to' : '返回',
        'Go to' : '查看',
        'Next' : '下一个',

        'Order ' : '订单',
        'Amount' : '数额',
        'Balance' : '余额',
        'Info' : '详情',
        'Deposit from credit balance' : '从个人账户中存款至市场账户',
        'Withdrawal to credit balance' : '提款至个人账户',
        'Purchased' : '购买',
        'Sold' : '售出',
        '/per (\\d+)/' : '(每 $1 件)',
        'There are no recent trades.' : '最近无交易记录',
    },

    ///////////////////////////////////////////////////////雪花神殿
    shrine: {
        'Welcome to Snowflake\'s Shrine' : '欢迎来到雪花神殿',
        'Here you can make an offering to Snowflake, the Goddess of Loot and Harvest.' : '在这里你可以向雪花女神，司掌战利品与收获的女神献上祭品。',
        'Snowflake will grant you various boons depending on your offering.' : '雪花女神会根据你献上的祭品给予相应的馈赠。',
        'Select a trophy, artifact or collectible to continue.' : '从左侧列表中选择一件文物、奖杯或者收藏品查看具体献祭说明',
        'Artifacts can be exchanged for a random reward.' : '文物可以兑换随机奖励',
        'Depending on your luck and earlier rewards, you can get one of the following:' : '基于你的人品 你可以获得以下随机一项奖励',
        'Some Hath' : '一些Hath',
        'A bunch of crystals' : '一些水晶',
        'Some rare consumables' : '一些稀有消耗品',
        'A permanent +1 bonus to a primary stat' : '永久提升1点主要属性',
        'You cannot currently receive more than ' : '根据你目前的等级，你不能获得多于',
        'to any primary stat. This increases by one for every tenth level. ' : '点属性奖励，这个阈值每10级会提升1点。',
        'Gaining primary stats in this way will not increase how much EXP your next point costs.' : '利用这种方式获得的主属性提升不会增加你的加点消耗。',
        'Trophies can be exchanged for a piece of equipment.' : '奖杯可以兑换一件指定类型的装备',
        'The quality and tier of the item depends on the trophy you offer. ' : '获取的装备品质基于献祭的奖杯而骰动。',
        'You can select the major class of the item being granted from the list below.' : '在下方选择你想获取的装备类型。',
        'Offering ' : '献祭 ',
        '/need (\\d+) more/' : '还需要额外 $1 个以升级献祭',
        '/Offer (.+) for :/' : '献祭 $1 换取',
        '/You have (\\d+ / \\d+) items required for this offering/' : '当前持有 $1 献祭所需奖杯数',
        'You have handed in' : '你有总价值',
        'worth of trophies' : '的奖杯献祭记录',
        'Collectibles can be exchanged for a random selection of bindings and materials.' : '献祭一个收藏品可以获得随机种类的 1 个黏合剂和 1-3 个高阶基本素材',
        'Random Reward' : '随机奖励',
    },

    ///////////////////////////////////////////////////////怪物实验室
    monsterLabs: {
        'Unnamed' : '未命名的',
        'Arthropod' : '节肢动物',
        'Avion' : '飞禽',
        'Beast' : '野兽',
        'Celestial' : '天人',
        'Daimon' : '魔灵',
        'Dragonkin' : '龙类',
        '/^Elemental$/' : '元素',
        'Giant' : '巨人',
        'Humanoid' : '类人',
        'Mechanoid' : '机器人',
        'Reptilian' : '爬行动物',
        'Sprite' : '妖精',
        'Undead' : '不死族',

        'Required Feed:' : '需求食物:',
        'Feed Tier' : '需喂食食品',
        'Monster Chow' : '怪物饲料',
        'Monster Edibles' : '怪物食品',
        '/Monster Cuisines?/' : '怪物料理',
        '/Chaos Tokens?/' : '混沌令牌',
        '/Happy Pills?/' : '快乐药丸',
        '/Chows?/' : '饲料',
        '/Edibles?/' : '食品',
        '/Cuisines?/' : '料理',
        'Requires' : '需求',
        'Upgrade Cost' : '强化需要',
        'Upgrade With' : '升级需要',
        'Cost' : '消耗',
        'Needs:' : '需求：',
        'Stock' : '库存',
        'None' : '无',

        'Primary attributes' : '主属性',
        'Elemental mitigation' : '元素抗性',
        '/^Primary$/' : '主属性',
        '/^Element$/' : '元素抗性',
        'Other stats' : '其它属性',

        'Battles Won' : '战斗胜利次数',
        'Killing Blows' : '怪物击杀数',
        'Gift Factor' : '送礼概率倍率',
        'Double Gift' : '双倍礼物几率',
        'Attack Speed' : '攻击速度',
        'Health' : '体力',
        'Phys. Attack' : '物理攻击',
        'Mag. Attack' : '魔法攻击',
        'Phys. Defense' : '物理防御',
        'Mag. Defense' : '魔法防御',
        'Slashing Mit' : '斩击减伤',
        'Piercing Mit' : '刺击减伤',
        'Crushing Mit' : '敲击减伤',
        'Evade' : '闪避率',
        'Parry' : '招架率',
        'Block' : '格挡率',
        'Resist' : '抵抗率',
        'Anti-' : '反',

        'Powerlevel' : '战斗力',
        '/^Scavenging$/' : '寻宝',
        '/^Fortitude$/' : '刚毅',
        '/^Brutality$/' : '蛮横',
        '/^Accuracy$/' : '命中',
        '/^Precision$/' : '精密',
        '/^Overpower$/' : '压制',
        '/^Interception$/' : '拦截',
        '/^Dissipation$/' : '弥散',
        '/^Evasion$/' : '闪避',
        '/^Defense$/' : '防御',
        '/^Warding$/' : '魔防',
        '/^Swiftness$/' : '迅捷',
        'MAX' : '已满',

        'Increases the gift factor by ' : '增加送礼概率倍率',
        'Increases monster damage by' : '强化怪物的伤害力',
        'Increases monster accuracy by' : '增加怪物的命中',
        'Decreases effective target evade/block by' : '降低目标的有效回避/格挡率',
        'Decreases effective target parry/resist by' : '降低目标的有效招架/抵抗率',
        'Increases monster health by' : '提升怪物的体力值',
        'Increases monster parry by' : '强化怪物的招架率',
        'Increases monster resist by' : '强化怪物的抵抗率',
        'Increases monster evade by' : '强化怪物的回避率',
        'Increases monster physical mitigation by' : '强化怪物的物理减伤',
        'Increases monster magical mitigation by' : '强化怪物的魔法减伤',
        'Increases monster attack speed by' : '增加怪物的攻击速度',

        'Skill name' : '技能名',
        'Skill type' : '技能攻击类型',
        '/^Damage$/' : '伤害类型',
        '/^Magical$/' : '魔法',
        '/^Physical$/' : '物理',
        '/^Slashing$/' : '斩击',
        '/^Piercing$/' : '刺击',
        '/^Crushing$/' : '敲击',
        '/^Power$/' : '伤害',
        '/^Special$/' : '特殊',

        '/^Fire$/':'火焰',
        '/^Cold$/':'冰霜',
        '/^Elec$/':'闪电',
        '/^Wind$/':'狂风',
        '/^Holy$/':'神圣',
        '/^Dark$/':'黑暗',
        '/^Void$/':'虚空',

        'Empty Slot - Click To Create' : '空槽位 - 点击创建一个怪物',
        'You still have to feed this monsters enough crystals to reach powerlevel 25 and give it a name to activate it.' : '要激活这个怪物你必须喂食其水晶令其达到战斗力等级25，然后为其取名',
        'You still have to give this monster a name to activate it' : '你依然需要为这个怪物命名以激活它',
        'Next upgrade available at powerlevel ' : '强化到下一级需要此怪物达到战斗力等级 ',
    },

    ///////////////////////////////////////////////////////创建怪物说明
    //创建怪物说明内容实际是分行截断的，此处全部使用\n拼接了起来，为了避免怪物名称被打断使用此字典时应该放在怪物实验室词典前面
    monsterCreate: {
        'About Monster Creation:' : '关于怪物的创建:',
        'You can use the Monster Lab to create monsters that will roam free in the HentaiVerse. The monsters you create will be mixed in with the normal battles in all forms of play.' : '你可以用怪物实验室创造属于你的自创怪，这些怪物会在HV的世界里面自由遨游.这些你的自创怪会在任何普通模式的战斗中出现.',
        'The monsters you create will start out weak, but can be upgraded by infusing them with Power Crystals, and by unlocking special perks with Chaos Tokens.' : '这些你的自创怪起初相当脆弱，但是它们可以被能量水晶升级，以及通过混沌令牌进行特殊强化',
        'To get started, select a monster class from the list to the left' : '要开始创建怪物的话，请从左侧列表选择一个怪物类型',
        'The class determines a number of factors:' : '不同的怪物类型决定了',
        'The starting primary stats' : '怪物的初始属性',
        'The starting damage resistances' : '初始抗性',
        'Which melee attack types the monster can do' : '伤害类型',
        '(Future) Upgrade paths and specializations' : '升级路线和特殊技能（未实装）',
        'Choose Melee Damage Type' : '选择近战伤害类型',
        'After selecting a class, select the desired primary attack type of the monster to create it. ' : '在选择怪物的类型之后，点击属性下方按钮选择你一个你想要的怪物基础攻击类型，',
        'You will then be able to feed it some crystals and name it to make it active in the game.' : '然后你就可以通过喂食以及取名的方法激活这只怪物。怪物会定期赠送各种素材以及粘合剂作为礼物回馈玩家。',

        'Arthropods are a diverse phylum of invertebrate animals distinguished by having a segmented body with jointed appendages, encased in a hard exoskeleton. ' : '节肢动物是一种多元无脊椎动物且身体具有分节特性的动物门之一，节肢动物通常包裹在一个坚硬的外骨骼中。',
        'Variants include insects, spiders and scorpions, and they exist in many different forms and sizes. Remains of humanoid arthropods have been discovered in old ruins, but it is unknown whether such animals still exist, and whether or not they are intelligent.' : '其变种还包括昆虫、蜘蛛和蝎子等，它们有许多不同的形状和大小。在古老的废墟中已经发现了人形节肢动物的遗骸，但是这些动物是否仍然存在，它们是否存在智能，目前尚不清楚。',
        'Arthropods are typically equipped with crushing melee attacks using claws and similar appendages, or piercing attacks with stingers. There are rumors of massive mutated members of the species, large enough to crush other creatures with the sheer bulk of their bodies.' : '节肢动物通常使用爪子或者其他类似爪子的武器进行敲击攻击，或者使用刺进行突刺打击，还有传言曾说，有一些巨大变异种，大到可以直接用身体撞击摧毁大部分其他生物。',
        'Their natural armor provides a high degree of resistance against slashing attacks, but they are vulnerable to blunt weapons. The exoskeleton provides a heightened defense against most elemental attacks.' : '它们天然的装甲提供了非常高的斩击耐性，而且外骨骼的存在令其对绝大部分元素魔法具有抗性，但是它们对敲击攻击的抵抗力非常薄弱。',
        'Avions, also known as Aves or simply Birds, are a class of vertebrate endothermic animals distinguished by having wings. Variations exists, but typical Avions are bipedal with strong talons on their feet, covered in feathers, and equipped with a powerful beak. All Avions in the HentaiVerse have the ability to fly; non-flying birdlike creatures are classified as Beasts.' : '飞禽，也被称作鸟类或者干脆是鸟，是一种有翅膀的温血脊椎动物，虽然也有一些变异种存在，但是典型的鸟类双足均有爪子，全身覆盖着羽毛，并有强大的喙，在HV里面，所有的鸟类默认均会飞行，不会飞行的鸟类被分类至“野兽”一类。',
        'Avions can specialize into using their beak for piercing attacks or talons for slashing attacks. The superior mobility and keen eyesight of higher level avions let them accurately target weak or unprotected parts of their opponent, giving them a high chance of scoring critical hits or temporarily cripple the target. The naturally high mobility also makes it particularly hard to land good hits with piercing weapons.' : '鸟类精通用它们的喙进行刺击或者使用爪子进行斩击攻击，卓越的视力与高机动性使鸟类很擅长攻击敌人的弱点，令它们的攻击有高暴击率与高致残性，鸟类的高机动性也使其很难被刺击武器命中。',
        'While fast and agile, they do not have strong physical defenses. Due to their feather-covered body and flying nature, they are weak to fire and wind-based magicks. The fact that they are not grounded does however mean that they are resistant to electrical attacks.' : '虽然鸟类速度快而且敏捷，但他们没有强大的物理防御能力。由于它们的羽毛覆盖的身体和飞行的性质，它们普遍弱火与风。不过事实上，鸟类由于没有接地，所以它们可以抵抗闪电攻击。',
        'Beasts cover the wide range of vertebrate air-breathing animals known as Mammals. There are many variations in this class, but the majority are quadrupeds of sizes varying from smaller than mice to larger than elephants.' : '野兽这种种类囊括了广大呼吸氧气的脊椎动物，它们通常被认作是哺乳动物。它们的种类多种多样，但是主要由四足动物组成，从老鼠到大象，各种体型的野兽都存在。',
        'Beasts are typically either covered in fur or feathers, or more rarely, clad in a thick hairless hide. The fur makes them somewhat weak to fire-based magicks, but resistant to wind- and cold-based attacks. Most have average defense against physical weapons, but some have evolved a hard armor of keratin around vital points which heightenes these defenses significantly.' : '野兽通常覆盖有羽毛或者毛皮，极少数野兽没有毛皮，用厚厚的表皮保护自己，它们对大部分物理攻击都有防御力，由于有些野兽进化出了专门应对打击的坚硬表皮，所以它们对敲击攻击的抵抗力较强。',
        'Their natural range of weapons allow them to bite down with sharp teeth, shred their foes with large claws, and impale them on pointy tusks. The most powerful beasts can simply use the sheer bulk of their body to crush a target.' : '它们广泛的分布范围允许野兽使用锋利的牙齿刺穿它们的敌人或者使用利爪撕碎它们，最强大的野兽甚至只用身体撞击就可以击溃绝大部分敌人。',
        'Rumors persist about terrible Beasts corrupted beyond all recognition with dark magicks, but those who have encountered them are not in a state to give a coherent description of their abilities.' : '有确切传闻说，存在一些被黑魔法腐化的野兽，但是遇到它们的人都没有办法对它们做出连贯准确的描述。',
        'Celestials are supernatural divine beings that reside on a different plane of existence. From time to time, some of these beings enter our world for reasons they usually choose not to divulge to outsiders. While worshipped by some individuals and groups as inherently good, it is suspected that those who leave have their own agendas that do not necessarily mesh well with that ideal.' : '天人是一种超自然而且神圣的存在，他们居住在不同的星球上，有些时候一些天人也会因为一些不想被外人知道的原因进入我们世界。天人的固有特性使其被一些个人和团体所崇拜，但也有些人怀疑那些脱离大部队擅离的天人可能不是想象中的那么完美。',
        'Appearing as lithe humanoid creatures who refuse to wear any form of armor, they have below average resistance to most physical attacks but make up for it with high agility. They have high resistance to elemental magicks, and are nearly impervious to divine attacks. They are however very weak against forbidden magicks.' : '天人作为一种轻盈的人形生物拒绝任何形势的盔甲，因此他们的物理抗性很低，但是动作敏捷，天人有很高的元素魔法抗性，而且有很高的神圣魔法抗性，但是它们对黑暗魔法的抗性很弱。',
        'Celestials can use a wide variety of humanoid armaments, but for unknown reasons they do not employ piercing weapons in their arsenal. Higher level celestials can imbue their weapons with pure divine power that lets their melee attacks deal holy damage.' : '天人可以使用各种各样的装备，不过因为一些不明的原因，它们没有刺击用的武器，一些更高层次的天人可以使用神圣魔法的力量，它们可以给近战攻击附带上神圣属性伤害。',
        'Daimons are supposedly corporeal manifestations of impure and often malevolent supernatural spirits that, some say, originate from the same plane of existance as Celestials. Their exact nature and relation to Celestials is however unknown.' : '魔灵，它们在自然中的存在通常被推测为一种不纯净和恶毒的精神集合体，有人说，它们和天人起源于同一位面，不过它们和天人确切的关系尚未为人们所知。',
        'These spirits can take on any number of different appearances, but tend to choose one specifically tailored to the fears of their opponent. To allow for this shape changing capability, they do not wear any armor or use any other form of humanoid weaponry. This leaves them weak to physical attacks.' : '这些精神体外观各异，不过它们通常会选择敌人最恐惧的模样出现，为了保持这种能力的持续使用，魔灵不装备任何铠甲和装备，这使得它们无法进行物理攻击。',
        'Like Celestials, they have high resistances to elemental magicks. They are almost imprevious to forbidden magicks, but highly vulnerable to divine attacks.' : '与天人类似，魔灵对元素魔法具有高抗性，对黑暗魔法具有很高抗性，但是惧怕物理攻击和神圣魔法。',
        'Instead of forged weapons, these creatures take advantage of their physical malleability to reshape parts of their own body into blade-like weapons or sharp implements that they use for slashing and stabbing attacks. Higher level daimons are said to be able to conjure weapons of pure darkness that can bypass all defenses not especially enchanted to withstand it.' : '比起使用锻造的武器，魔灵更擅长使用自己身体塑性而成的肢体武器，这些肢体武器像刀片和尖刺一样锐利，使得魔灵可以使用刺击和斩击攻击，高阶的魔灵据说可以召唤纯净黑暗武器，能无视除了黑暗抗性之外的所有抗性对敌人造成伤害。',
        'Dragonkin consist of Dragons, Drakes, and all other creatures that could be mistaken for giant flying fire-breathing lizards. That is however somewhat of an over-simplification as not all Dragonkin can fly, while breath attacks are not always fire, and are only fully developed in mature members of the species.' : '龙类包括龙，双足飞龙，以及一切会被认为是巨大的飞天喷火蜥蜴的生物，这种分类可能有点过于简化，因为并不是所有的龙类都有飞行能力，它们的吐息也不一定是火焰，只有它们之中发展最为成熟的那些种类才具有这些特性。',
        'Elementals are metaphysical beings that manifest as crystalline beings of pure elemental energy. It is thought that they can change between different elemental forms at will, but this has never been observed in battle.' : '元素生物是一种抽象的存在，表现为纯粹元素的结晶，通常它们被认为可以自由的切换自身的元素魔法的形态，但是从来没有在战斗中观测到这种情况。',
        'Giants are huge, slow and stupid. The only reason they still thrive as a species is their extreme natural aggression and immense strength, combined with the fact that they are highly amused by smashing anything they can get a hold of.' : '巨人是一种缓慢巨大而且愚蠢的生物，它们之所以能茁壮成长的原因是因为它们自身极端的侵略性以及极强的力量，加上它们对粉碎一切它们能抓住的物体都非常感兴趣。',
        'Humanoids comprise the various intelligent bipedal primates found in the world. While they have no notable supernatural powers nor beastlike strength, and are largely covered in a soft and delicate skin which grants only minor protection from the elements, a variety of armor and weapons fill the gaps in their natural defenses and give them a surprisingly large amount of flexibility in their offensive capabilities.' : '类人类生物通常包括世界上发现的各种有智能的灵长类动物。虽然它们没有明显的超自然能力和野兽般的力量，而且大部分被柔软细腻的肌肤所保护，这使得它们对元素魔法几乎没有抵抗力，但是它们可以使用各式各样的铠甲和武器保护自己，使得这些生物具有惊人的延展性和潜力。',
        'Mechanoids are essentially living machines, remnants of ancient and highly advanced civilizations. The art of making such machinations has been long lost, but many still roam the world, oblivious of the fate that has befallen their deceased masters.' : '机器人本质上是一种有生命的机械，是古文明的遗物，制造这种阴谋般的产物的技术已经失传已久，很多机器人在世界游荡，在命运的指引下，不经意间邂逅了它们已故的主人。',
        'Many variants of Mechanoids exist, from large bipedal machines forged for destruction to smaller humanoid builds created for peaceful purposes. Some were originally fitted with a wide variety of weaponry, but due to wear and lack of maintenance, most of the Mechanoids that are still functional equip themselves with simple melee weapons.These are typically blade- and spike-shaped attachments in place of a limb or other tool.' : '机器人存在许多变种，由巨大的战斗双足机械到小型的民用人形机器人均有存在，一些机器人原本配备了多种武器装备，但是因为缺乏维护，大部分机器人还是只能使用简单的近战武器进行攻击，比如安装在肢体上的锯片以及穗形尖刺进行攻击。',
        'There are however rumors of terrible machines that are capable of searing a creature to the bones with a stream of fire, or shatter their bodies with a torrent of deadly metal.' : '不过有传言说，一些可怕的机器人能用火焰把其他生物烧焦，或者用一堆致命的金属构造物刺穿敌人的身体。',
        'Mechanoids are highly resistant to wind and cold-based magicks, and due to their artificial nature, they are almost imprevious to divine attacks. Their internal systems are however highly vulnerable to electrical shocks. Most have armor worn brittle with age, but stories of preserved heavily armored variants are told by the few who are fortunate enough to survive such an encounter.' : '机器人具有很高的疾风和冰冷以及火焰抗性，得益于它们的人工构造，它们对神圣魔法也有很强的抗性，但是它们的内部系统极度惧怕电击，大部分机器人的铠甲已经随时间风化，但是也存在一些保留了大部分铠甲的幸运儿。',
        'Reptilians are cold-blooded creatures that thrive in and near water. They comprise animals like crocodiles, snakes, turtles and lizards, but also intelligent biped humanoid variants that have evolved independently of their fellow primates. Their skin is covered in scales or scutes, and some have hardened shells covering parts of their bodies.' : '爬行动物就是所谓的冷血动物，通常生活在水边，包括鳄鱼、蛇、海龟和蜥蜴等动物，也有独立于灵长类动物进化的智能两足人型变体存在，它们的皮肤覆盖着鳞片或鳞甲，有硬化甲壳覆盖身体的大部分部位',
        'Sprites are diminuitive beings that seldom get involved in the Big World, prefering to remain with their own kin in the hidden places of the land where nature is still thick and undisturbed. Only a small minority choose to seek out the human world, where their high intelligence and small size make them excel for many tasks, ranging from accounting to assassination.' : '妖精是一种纤小的存在，它们通常极少进入人类的“大世界”，宁愿留在自己的熟悉的在土地或者不受干扰的隐蔽场所中。只有少数妖精会选择进入人类的世界，在那里他们的高智力和小尺寸使它们擅长执行许多任务，从会计到暗杀。',
        'Sprites are not a single species, but most of the big folk will be hard pressed to tell a pixie apart from a faery. They are commonly armed with using tiny swords and rapiers, and while they do not have much strength to put behind a thrust, their ability to seek out the most vulnerable parts of a target still make them a force to be reckoned with.' : '妖精并不是一种单一的物种，但是大部分人都难以分辨小精灵与精灵的区别，它们通常手持微小的剑或者细剑，而且通常没有多少力量用剑进行刺击攻击，但是它们能寻找敌人最脆弱的地点进行攻击依然是妖精一个不可小视的能力。',
        'Higher level Sprites can master powerful magicks, and many an unwary adventurer have engaged them recklessly only to be sent to an early grave.' : '高阶的妖精掌握了强大的法术，可以早早的把那些轻敌的冒险家送入坟墓。',
        'Physically weak, the best way of dealing with them is swatting them with a crushing attack, but they are fast and hard to hit. Their tiny size also makes them difficult to hit them with stabbing weapons. All Sprites have some resistance to elemental magicks, and depending on their natural affinity they can even be fully imprevious to some elements. They are however naturally weak to the forbidden magicks.' : '妖精的物理抗性较弱，惧怕敲击攻击，但是动作极其敏捷，难以击中，所以使用刺击武器更加难以击中它们，所有的妖精对元素魔法都有一定的抗性，而且因为它们的自然亲和力，它们对神圣魔法也有一定的抵抗，但是它们非常惧怕黑暗魔法。',
        'Undeads are animated necrotic remnants of living beings, cursed to an eternal lifeless existance with no warmth or joy. They range from mindless brutes such as zombies and animated skeletons, to higher undeads that have preserved parts of their mind but lost their soul, like liches, vampires and banshees.' : '不死族就是一些会动的残肢断尸，被诅咒而成为永生的存在的它们没有温暖和快乐的概念，它们的范围从无主的野兽尸骸比如亡灵或者僵尸，到高等的亡灵与巫妖，它们在保留意识的同时也失去了它们的灵魂。',
        'Having no need to maintain a body temperature and no vital processes that can be disturbed by electricity, undeads are highly resistant to cold and electrical magicks. Being born from darkness itself also makes them imprevious to forbidden magicks, but they are vulnerable to divine attacks and fire magicks.' : '尸体没有保持体温的必要，也不惧怕电的伤害，使其有较高的冰冷与闪电抗性，诞生与黑暗魔法本身的它们也对黑暗魔法有极高的抗性，但是它们惧怕神圣魔法和火焰魔法的攻击。',
        'Piercing and crushing attacks are ineffective due to a lack of weak points, but cutting off limbs works reasonably well.' : '刺击与敲击对亡灵并没有多大的意义，但是切断它们的四肢倒是非常有效的战术。',
        'Mindless undeads tend to use simple melee implements like swords, or just crush their targets using their own limbs. Higher level undeads can use more sophisticated weaponry, and some even master deadly forms of forbidden magicks.' : '无主的亡灵们通常倾向于使用简单的近战武器比如剑，一些干脆使用自己的肢体进行敲击攻击，更高级别的亡灵会使用更复杂的武器，甚至有精通黑暗魔法的大法师存在',

        'Create new monster with base damage type of' : '选择要创建的怪物的基础攻击类型',
        'Strength':'力量',
        'Dexterity':'灵巧',
        'Agility':'敏捷',
        'Endurance':'体质',
        'Intelligence':'智力',
        'Wisdom':'智慧',
    },

    ///////////////////////////////////////////////////////邮件
    mm: {
        'Inbox' : '收件箱',
        'Write New' : '写邮件',
        'Read Mail' : '已读邮件',
        'Sent Mail' : '已发送邮件',
        'Subject' : '主题',
        'Sent' : '发送时间',
        '/^Read$/' : '被阅读时间',
        'Never' : '还未',
        '/^To/' : '收件人',
        '/^From/' : '寄件人',
        '< Prev' : '< 上一页',
        'Next >' : '下一页 >',
        'No New Mail' : '没有新邮件',
        'Attaching items on Isekai is restricted to donators.' : '异世界模式下给邮件添加附件功能仅限捐赠玩家。',
        'Attachments also cannot be sent for the last month of each season.' : '同时在每个赛季最后一个月将无法发送附件。',
        'Welcome to MoogleMail. A Moogle approach to email.' : '欢迎来到莫古利邮务，莫古利将为你传送邮件。',
        'From here you can send messages and items to other people in the HentaiVerse, kupo!' : '在这里你可以向其他HV玩家传送信息和物品，咕波！',
        'You can click the buttons above to attach items, equipment, credits or hath to this message. ' : '你可以点击上面的按钮为此邮件添加道具、装备、Credit、Hath附件。',
        'You can click the buttons above to attach items or equipment to this message. ' : '你可以点击上面的按钮为此邮件添加道具、装备附件。',
        'Up to 10 different things can be attached to each message.' : '一封邮件最多可添加10件附件。',
        'You can optionally request payment for messages with attachments with the Credits on Delivery (CoD) setting after attaching at least one item. ' : '当你为一封邮件添加至少一个附件之后，你可以为邮件设置货到付款(CoD)功能。',
        'The receipient will have to pay the specified number of credits in order to remove the attachments from your message. ': 'CoD 功能会令收件人在提取附件时向你支付指定数额的Credits。',
        'To prevent misuse, a small fee is required to use this function unless you have the Postage Paid perk.' : '为了防止滥用，这个功能每次会收取少量费用，除非你购买了Hath能力“邮资已付”。',
        'To prevent misuse, a fee is required to use this function' : '为了防止滥用，这个功能每次会收取一些费用',
        ' unless you have the Postage Paid perk.' : '，除非你购买了Hath能力“邮资已付”。',
        'Until the CoD has been paid, the sender and the recipient can both choose to return the message. ' : '除非货到付款(CoD)已经被收件人支付，否则发件人与收件人可以在任意时刻撤回或者拒收CoD邮件。',
        'This allows the recepient to reject an unwanted message, and allows you to recover your items if the recipient does not accept it within a reasonable time.' : '这可以防止发出的邮件长时间得不到回应或者收到了不合理的CoD邮件的问题。',
        'Note that unsent drafts will be deleted after one month, and sent messages will be deleted after one year. Any remaining attachments for a deleted message will be permanently lost.' : '请注意，邮件草稿将于1个月后自动删除，已发送的邮件在保留1年后也会自动删除，如果被删除的邮件里仍有未提取的附件，它将永久丢失。',
        'Attach Item' : '选择附件',
        'Attach Equipment' : '选择装备',
        'Attached: ' : '已选择附件：',
        'Not Set' : '未设置',
        'Current Funds:' : '你目前拥有:',
        'items attached' : '个附件',
        'Requested Payment on Delivery' : '要求货到付款数额',
        'Your message has been discarded.' : '你的邮件信息已被丢弃。',
        'Any attachments have been returned.' : '邮件中附带的附件已归还仓库。',
        'Your message has been sent.' : '邮件已发送',

        '/According to your prices in HVtoolBox, COD should be (\\d+) credits/' : '根据你在HVToolBox里设置的价格，这个邮件的货到付款(CoD)价格应当是 $1 Credits',
    },

    ///////////////////////////////////////////////////////彩票
    prizes: {
        'January' : '1 月',
        'February' : '2 月',
        'March' : '3 月',
        'April' : '4 月',
        'May' : '5 月',
        'June' : '6 月',
        'July' : '7 月',
        'August' : '8 月',
        'September' : '9 月',
        'October' : '10 月',
        'November' : '11 月',
        'December' : '12 月',
        '1st:' : '1 日',
        '3rd:' : '3 日',
        '2nd:' : '2 日',
        'th:' : ' 日',
        'Grand Prize for' : '一等奖',
        '2nd Prize' : '二等奖',
        '3rd Prize' : '三等奖',
        '4th Prize' : '四等奖',
        '5th Prize' : '五等奖',
        'Equip Winner:' : '装备中奖者:',
        'Core Winner:' : '核心中奖者:',
        'TBD' : '暂未开奖',
        'You currently have' : '你目前拥有',
        'Each ticket costs' : '购买一张彩票将花费',
        'You already spent a Golden Lottery Ticket.' : '你已经使用了一张黄金彩票券',
        'Choose number to buy' : '输入购买数量',
        '/You hold ([\\d,]+) of/' : '你拥有 $1 /',
        'sold tickets' : '张已售出的彩票',
        'Stock:' : '库存：',
        'The Weapon Lottery lets you spend GP on a chance to win the specific equipment piece shown on the left.' : '使用GP购买武器彩票有机会赢取“无双”武器',
        'Each lottery period lasts 24 hours. At midnight UTC, a drawing is held, and a new lottery period starts.' : '每期彩票发行期为24小时，武器彩票于协调世界时 0点 开奖，同时发行新一期彩票',
        'In addition to normal tickets, you can also spend a Golden Lottery Ticket to add 100 tickets and double your effective ticket count at the time of drawing. This will not increase the effective ticket count past 10% of the total purchased tickets. Golden Lottery Tickets can only be acquired as a consolation prize from the lottery.' : '你也可以使用黄金彩票券兑换100张彩票，并且让自己持有的彩票数量翻倍（效果在开奖时计算，最高不超过10%总售出彩票）。黄金彩票券只能通过购买彩票中奖获得。',
        'The number of items granted by the 2nd-5th prize will increase with the size of the pot. You can only ever win one of the prizes no matter how many tickets you purchase.' : '2-5等奖的奖品数量取决于彩池的大小，无论你购买了多少注彩票，你只能中一个奖项，如果你不想要一等奖装备，那么你可以点击一等奖下面的DO NOT WANT按钮，这会令你放弃头奖装备，取而代之如果你抽中头奖你将获得对应的装备核心',
        'The Armor Lottery lets you spend GP on a chance to win the specific equipment piece shown on the left.' : '使用GP购买防具彩票有机会获得“无双”防具',
        'Each lottery period lasts 24 hours. At noon UTC, a drawing is held, and a new lottery period starts.' : '每期彩票持续24小时，防具彩票于协调世界时 12点 开奖，同时发行新一期彩票',
        'Today\'s ticket sale is closed.' : '本期彩票售卖已结束',
        'Today\'s drawing is in' : '距离今日开奖还剩',
        'hours and' : '小时',
        'hours' : '小时',
        'minutes' : '分钟',
        'Ticket sales will close up to ten' : '彩票售卖将于开奖前 10',
        'before this time.' : '结束',
        '/Chaos Tokens?/' : '混沌令牌',
        '/Caffeinated Cand(y|ies)/' : '咖啡因糖果',
        '/Golden Lottery Tickets?/' : '黄金彩票券',
        'You cannot opt out unless you have at least one ticket.' : '你必须至少购买一张彩票才能选择放弃头奖争夺',
        'You will not participate in the drawing for the grand prize of this lottery.' : '你已经放弃参与本次彩票的头奖争夺',
    },

    ///////////////////////////////////////////////////////战斗
    battle: {
        'First Blood' : '第一滴血',
        'Learning Curves' : '经验曲线',
        'Graduation' : '毕业典礼',
        'Road Less Traveled' : '荒凉之路',
        'A Rolling Stone' : '浪迹天涯',
        'Fresh Meat' : '鲜肉一族',
        'Dark Skies' : '乌云密布',
        'Growing Storm' : '风暴成形',
        'Power Flux' : '力量流失',
        'Killzone' : '杀戮地带',
        'Endgame' : '最终阶段',
        'Longest Journey' : '无尽旅程',
        'Dreamfall' : '梦殒之时',
        'Exile' : '流亡之途',
        'Sealed Power' : '封印之力',
        'New Wings' : '崭新之翼',
        'To Kill a God' : '弑神之路',
        'Eve of Death' : '死亡前夜',
        'The Trio and the Tree' : '命运三女神与树',
        'End of Days' : '世界末日',
        'Eternal Darkness' : '永恒黑暗',
        'A Dance with Dragons' : '与龙共舞',
        'Post-Game Content' : '赛后内容',
        'Secret Pony Level' : '秘密小马等级',
        'Konata' : '泉此方',
        'Mikuru Asahina' : '朝比奈实玖瑠',
        'Ryouko Asakura' : '朝仓凉子',
        'Yuki Nagato' : '长门有希',
        'Real Life' : '现实生活',
        'Invisible Pink Unicorn' : '隐形粉红独角兽',
        'Flying Spaghetti Monster' : '飞行意大利面怪物',
        'Triple Trio and the Tree' : '大树十重奏',

        'There are no challenges available at your level. Check back later!' : '没有适用于你当前等级的挑战。努力升级以后再来查看吧！',
        'Challenge' : '名称',
        'Highest Clear' : '最高通过难度',
        'EXP Mod' : '经验倍率',
        'Min Level' : '需求等级',
        'Rounds' : '战斗场次',
        'Clear Bonus' : '通关奖励',
        'Entry Cost' : '入场消耗',
        'Never' : '还未',
        '1 Token' : '1 令牌',
        '2 Tokens' : '2 令牌',
        '3 Tokens' : '3 令牌',
        '5 Tokens' : '5 令牌',
        '10 Tokens' : '10 令牌',
        'Cooldown' : '冷却中',
        'You have' : '你有',
        'tokens of blood.' : '块鲜血令牌',
        'token of blood.' : '块鲜血令牌',

        'The Tower is an Isekai-Only battle mode where the goal is to get as high as possible before the end of the season. ' : '塔楼(The Tower)是异世界独有的战斗模式，目标是在每个赛季结束前尽可能获得更高的排位。',
        'Ranking high in this mode at the end of the season will provide you with some permanent bonuses on HV Persistent.' : '在塔楼下取得高排位将在每个赛季结束后获得一些传统世界模式的永久奖励。',
        'The difficulty and monster level in this battle mode is locked to each floor, with an increase in monster level, difficulty or number of rounds for each floor.' : '此模式下的战斗难度和怪物等级与对应层级绑定，和你的设置及自身等级无关。每一层都会伴随着怪物等级、战斗难度或者战斗场次的提升。',
        'Your Ranking: ' : '你的排名: ',
        'Unranked' : '没有排名',
        '1st' : '1',
        '2nd' : '2',
        '3rd' : '3',
        '/(\\d)th/' : '$1',
        'Current Floor:' : '当前层级:',
        'Monster Level' : '怪物等级',
        'Daily Attempts: ' : '今日挑战: ',
        'Daily Clears:' : '今日清通:',

        'Welcome to the Grindfest.' : '欢迎来到压榨界',
        'A Grindfest consists of up to 1000 rounds of battle.' : '压榨界包含1000场连续且难度递增的战斗',
        'Starting a Grindfest will consume 1 point of Stamina.' : '进入压榨界战斗会消耗1点精力',
        'There is a small credit reward at the end,' : '完成全部的压榨界战斗',
        'if you make it all the way through.' : '可以获得5000C的奖励',

        'Welcome to the Portal to the Item World.' : '欢迎来到道具界的传送门',
        'Select a piece of equipment to enter the world contained within. ' : '选择一件装备进入其道具界，在这里你可以进入各种装备的道具界中，',
        'Clearing item worlds is the only way to unlock the full potential of your equipment.' : '完成道具界挑战是唯一能解锁装备完整潜能的方法。',
        'If you manage to fight your way through to the last level, you will gain some points towards unlocking new latent potencies. ' : '如果你成功的完成了道具界所有的战斗，你将获得一定的潜经验值来提升该装备潜能等级。',
        'These can improve existing qualities of your equipment, or add new abilities.' : '潜能等级的提升可以为装备增加新的能力，或加强已有的潜能力。',
        'The number of rounds you will be fighting depends on the quality of your item.' : '道具界的战斗场次取决于你的装备品质，',
        'More powerful items will have more powerful monsters inside them, and the monsters get more powerful the deeper you go.' : '越强大的装备所需战斗场次越多，里面的怪物也会越强，道具界的怪物随场次逐渐加强。',

    },

    ///////////////////////////////////////////////////////小马引导图
    riddlemaster: {
        'Choose the right answer based on the image below' : '请回答以下图片中小马的正确名称(输入A或B或C)，点击右侧PONY CHART按钮可查看小马名称参考',
        'Select ALL ponies you see in the image above then hit "Submit Answer" before the time limit runs out.': '请在时间限制结束之前选择你在上图认出的所有小马名称并点击“提交答案”',
        'Submit Answer' : '提交答案',
        'Timer' : '时间',
    },

    ///////////////////////////////////////////////////////正在战斗页面
    battling: {
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
        'Increases your defensive capabilities for the next turn.' : '本回合和下一回合你的物理和魔法缓伤增幅 +25%。消耗 25% 斗气恢复 10% 基础生命值。',
        'Reduces the chance that your next spell will be resisted. Your defenses and evade chances are lowered for the next turn.' : '降低本回合自身回避、格挡、招架和抵抗率，增加下一回合魔法命中和反抵抗率。消耗 25% 斗气恢复 5% 基础魔力值。',
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
        // 使用skills字典
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
        //由于和items物品字典并不是完全重合，为了效率考虑这里仍然单独重复写了物品字典
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
        'It is time to kick ass and chew bubble-gum... and here is some gum.' : '你的攻击和咒语伤害大幅提升+100%。必定命中且必定暴击，持续50回合。',
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
        'Spreading Poison' : '流动毒性',
        'Poison courses through the target\'s veins. This causes a damage-over-time effect, and eliminates its evade chance.' : '毒性在目标血管内流动，导致持续伤害效果，并消除其回避几率。',

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
        'Your attacks and spells deal twice as much damage for a short time, will always hit, and will always land critical hits.' : '你的攻击和咒语伤害短暂大幅提升。必定命中且必定暴击。',
        'Your attack/magic rating, attack/magic hit/crit chance and evade/resist chance increases significantly for a short time.' : '你的物理/魔法 伤害、命中、暴击率、回避、抵抗率短暂大幅提升。', //20210120验证，以下两条为WIKI内容暂保留
        'Your attacks and spells deal significantly more damage for a short time, will always hit, and will always land critical hits. Also replenishes 20% of base mana and health per turn.' : '你的攻击和咒语伤害短暂大幅提升。必定命中且必定暴击。同时每回合补充 20% 基础魔力与基础生命值。',
        'Your attack/magic damage, attack/magic hit/crit chance, and evade/resist chance increases significantly for a short time.' : '你的物理/魔法 伤害、命中、暴击率、回避、抵抗率短暂大幅提升。',

        //卷轴
        '(Scroll' : '(卷轴',
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
        '/^Regen$/' : '细胞活化[S]',
        '/^Protection$/' : '守护[S]',
        '/^Spirit Shield$/' : '灵力盾[S]',
        '/^Shadow Veil$/' : '影纱[S]',
        '/^Hastened$/' : '疾速[S]',
        '/^Absorbing Ward$/' : '吸收结界',
        '/^Spark of Life$/' : '生命火花[S]',
        '/^Cloak of the Fallen$/' : '陨落的披风[S]',
        '/^Heartseeker$/' : '穿心[S]',
        '/^Arcane Focus$/' : '奥术集成[S]',
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
    },

    ////////////////////////////////////////////////////////
    '' : {},
};








    //////////////////////////////////////////////////////////////////////////////
    // This is where the real code is
    // Don't edit below this
    // 翻译字典到上面为止全部结束，以下部分为真正的翻译代码
    // 除非你知道自己在干什么否则不要动下面的代码部分
    //////////////////////////////////////////////////////////////////////////////

    //原文切换功能所需变量
    var translatedList = new Map(), translated = true, changer;
    // translatedList格式：key:已翻译元素, value: 该元素已被翻译属性和原文键值对（目前没考虑无法直接用key赋值的属性）
    //原文切换功能
    function restoreTranslate() {
        translatedList.forEach((data, elem) => {
            for (var item in data) {
                [elem[item], data[item]] = [data[item], elem[item]];
            }
        });
        translated = !translated;
        changer.innerHTML = translated?'英':'中';
    }
    //初始化原文切换按钮
    function initRestoreButton() {
        if (changer) {
            return document.body.appendChild(changer);
        }
        document.addEventListener('keydown',(ev)=>{
            if(ev.altKey&&(ev.key=='a'||ev.key=='A')) {
                restoreTranslate();
            }
        });
        if(changer=document.getElementById('change-translate')) {
            return changer.addEventListener('click',restoreTranslate);
        }
        changer = document.createElement('span');
        changer.innerHTML = "英";
        changer.title = '点击切换翻译';
        changer.id = 'change-translate';
        changer.addEventListener('click',restoreTranslate);
        changer.style.cssText = "cursor:pointer;z-index:1000;font-size: 16px;position:fixed; top:200px; left:0px; color: white;background : black";
        document.body.appendChild(changer);
    }


    //战斗中切换翻译，与上面功能类似，但是更改的状态会持久性存储
    window.translateBattle = !!localStorage.translateBattle;
    function changeBattleTranslate() {
        if (changer && document.body.contains(changer)) {
            if (translated) changer.click();
            window.translateBattle = translated;
            delete localStorage.translateBattle;
            document.body.removeChild(changer);
            if (window.battle && window.battle.set_infopane) window.battle.set_infopane('Battle Time');
        }
        else {
            if (changer && !translated) changer.click();
            localStorage.translateBattle = translated = window.translateBattle = true;
            start();
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    // 以下部分是正文的翻译
    ////////////////////////////////////////////////////////////////////////////////


    var tagsWhitelist = ['BUTTON', 'TEXTAREA','SCRIPT','STYLE'],
        rIsRegexp = /^\/(.+)\/([gim]+)?$/;

    // prepareRegex by JoeSimmons
    // used to take a string and ready it for use in new RegExp()
    function prepareRegex(string) {
        return string.replace(/([\[\]\^\&\$\.\(\)\?\/\\\+\{\}\|])/g, '\\$1');
    }

    // function to decide whether a parent tag will have its text replaced or not
    function isTagOk(tag) {
        return !tagsWhitelist.includes(tag);
    }

    //翻译用到的字典变量
    const regexps = new Map(); //存储转换过的字典，key值和word字典对应分组名相同，value格式见下方buildDict;

    //转换字典，使用JoeSimmons的方法将字符串字典转换为带正则表达式的匹配数组
    function buildDict(group) {
        if (regexps.has(group)) return regexps.get(group);

        delete words[group][''];//删除空行
        var reg;

        const regexp = Object.entries(words[group]).map(([word,value])=>{
            if (reg = word.match(rIsRegexp)) {
                reg = new RegExp(reg[1], 'g')
            } else {
                reg = new RegExp(prepareRegex(word).replace(/\\?\*/g, function (fullMatch) {
                    return fullMatch === '\\*' ? '*' : '[^ ]*';
                }), 'g');
            }
            return {reg, value};
        });

        regexps.set(group, regexp);

        return regexp;
    }

    //执行查找的xpath表达式，查找目标元素下的所有文本
    var pathExpre = new XPathEvaluator().createExpression('.//text()[ normalize-space(.) != "" ]', null);
    // 翻译文本，使用指定字典对指定元素下的所有文字进行翻译
    // elem: 待翻译的页面元素, dict: 使用的翻译字典, dynamic: 是否动态元素
    // 动态元素将不会检查内容直接翻译，且不会保存切换原文，因为内容一旦变化就没有意义了
    function translateText(elem, dict, dynamic) {
        if (!elem || !dict) return;
        var texts = pathExpre.evaluate(elem, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, text; text = texts.snapshotItem(i); i += 1) {
            //console.log(text.parentNode.tagName)
            if (dynamic || isTagOk(text.parentNode.tagName) ) {
                var temp = text.data;
                for(var item of dict){
                    temp = temp.replace(item.reg, item.value);
                }
                if(temp!=text.data) {
                    if (!dynamic && !translatedList.has(elem)) {
                        translatedList.set(text, {data: text.data});
                    }
                    text.data = temp;
                }
            }
        }
    }

    // 翻译整个正文文本
    function translateAllText(dynamicDict=null, observer=null) {
        //动态元素字典、监听器，用来翻译动态变化的内容
        if(dynamicDict === null){
            dynamicDict = new Map();
        }
        if (observer === null)
        {
            observer = new MutationObserver((mutations,observer) => {
                //console.log(mutations);
                if(!translated) return;
                mutations.forEach(mutation => {
                    var elem = mutation.target;
                    if(elem.id === 'battle_main'){
                        observer.disconnect();
                        translateAllText(dynamicDict, observer);
                        return;
                    }
                    if(elem.style.visibility!='hidden') {
                        translateText(elem, dynamicDict.get(elem), true);
                        translateButtons(elem, dynamicDict.get(elem), true);
                        translateElemTitle(elem, dynamicDict.get(elem), true);
                    }
                });
            });
        }
        //遍历分组字典
        var battleMain = document.body.querySelector('#battle_main');
        if(battleMain){
            observer.observe(document.body.querySelector('#battle_main'), {childList:true, attribute: true, attributeFilter: ['value', 'title']}); //监听翻译动态内容
        }
        for (const [selector, value] of Object.entries(dictsMap)) {
            const elem = document.body.querySelector(selector);
            if (!elem) continue;

            const isDynamic = dynamicElem.includes(selector);
            const dict = value.map(buildDict).flat();

            translateText(elem, dict, isDynamic); //翻译文本
            translateButtons(elem, dict, isDynamic); //翻译表单按钮
            translateElemTitle(elem, dict, isDynamic); //翻译鼠标悬停文本
            if (isDynamic) {
                dynamicDict.set(elem, dict); //存储字典以备动态翻译使用
                observer.observe(elem, {childList:true, attribute: true, attributeFilter: ['value', 'title']}); //监听翻译动态内容
            }
        }
    }

    //翻译指定元素下的所有按钮，包含自身
    function translateButtons(target, dict, isDynamic) {
        if (target instanceof HTMLInputElement) translateButton(target, dict, isDynamic);
        else {
            Array.from(target.querySelectorAll('input[type="submit"]')).forEach(elem => {
                translateButton(elem, dict, isDynamic);
            });
        }
    }

    //翻译表单按钮
    function translateButton(elem, dict, isDynamic) {
        var value = elem.value;
        for(var item of dict){
            value = value.replace(item.reg, item.value);
        }
        if(value!=elem.value) {
            if (!isDynamic) translatedList.set(elem, {value: elem.value});
            elem.value = value;
        }
    }

    //翻译页面元素悬停的文字提示
    function translateElemTitle(target, dict, isDynamic) {
        Array.from(target.querySelectorAll('[title]')).forEach(elem=>{
            var txt = elem.title;
            for (var item of dict) {
                txt = txt.replace(item.reg, item.value);
            }
            if (txt!=elem.title) {
                if (!isDynamic) translatedList.set(elem, {title: elem.title});
                elem.title = txt;
            }
        });
    }

    //挟持浏览器弹窗方法并在弹窗之前先翻译文本
    function hookAlertTranslate() {
        var alertBk = window.alert, promptBk = window.prompt, confirmBk = window.confirm;
        var dict = buildDict('alerts');
        function translateAlert(txt) {
            if (txt==undefined) return '';
            else if (translated && typeof(txt)=='string') {
                for (var item of dict) {
                    txt = txt.replace(item.reg, item.value);
                }
            }
            return txt;
        }
        window.alert = function(txt) {alertBk(translateAlert(txt))}
        window.prompt = function(txt,value) {return promptBk(translateAlert(txt),value)}
        window.confirm = function(txt) {return confirmBk(translateAlert(txt))}
    }
    hookAlertTranslate();

    function start() {
        //console.time('hvtranslate');
        if (!window.inBattle || window.translateBattle || window.end_time) { // end_time → riddlemaster
            translateAllText();
            initRestoreButton();
        }
        //console.timeEnd('hvtranslate');
    }

    if (document.getElementById('textlog')) {
        if (document.querySelector('#expholder[title]')) return; //检测到已经有战斗汉化在运行则退出
        window.inBattle = true;
        if (!window.translateBattle) translated = false;
        document.addEventListener('DOMContentLoaded', start); // Hentaiverse Monsterbation ajax next round
        // 双击信息面板提示切换战斗翻译开关
        document.addEventListener('dblclick', function(ev){
            if (ev.target && ev.target.id == 'infopane') {
                changeBattleTranslate();
            }
        });
        document.head.appendChild(document.createElement('style')).innerHTML =
            '#change-translate{display:none;}#infopane{position:relative}' +
            '#infopane:hover::after{content:"双击此处切换战斗翻译开关";position:absolute;left:0; bottom: 5px;font-weight:bold}';
    }

    start();

}());
