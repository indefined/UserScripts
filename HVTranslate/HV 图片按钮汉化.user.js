// ==UserScript==
// @name           HV 图片按钮汉化
// @namespace      hentaiverse.org
// @author         indefined
// @icon           https://hentaiverse.org/y/favicon.png
// @description    汉化Hentaiverse里面的图片按钮，执行方式比较奇葩效率或者兼容性堪忧，慎用
// @notice         仅翻译带功能的按钮图片，也就是在设置中开启自定义字体之后剩下的图片，HV原始图片字体不会被翻译；默认不翻译战斗页面图片
// @notice         由于兼容问题不同浏览器之间存在不同执行方式逻辑，有兴趣有一定基础的可以自己读一下代码注释
// @include        *://hentaiverse.org/*
// @include        *://alt.hentaiverse.org/*
// @exclude        *://*hentaiverse.org/y/*
// @exclude        *://*hentaiverse.org/equip/*
// @exclude        *://*hentaiverse.org/pages/showequip.php?*
// @version        2020.10.07
// @grant none
// ==/UserScript==
(function () {


    var imgWords = [
        //图片翻译字典，每个单位包含 'text'：翻译结果； 'active'：激活状态（金色描边）的图片链接； 'disactive'：未激活状态（灰色）的图片链接(可能没有)
        //不包含战斗界面，主菜单大字号的5个图片以及怪物实验室的饥饿和精神图片已在最终翻译方法处单独处理，装备套装尺寸需要额外处理样式对齐
        {
            'text' : '创建一个克隆角色',
            'active' : '/y/character/persona_create_clone.png',
            'disactive' : '/y/character/persona_create_clone_d.png'
        },{
            'text' : '创建一个全新角色',
            'active' : '/y/character/persona_create_blank.png',
            'disactive' : '/y/character/persona_create_blank_d.png'
        },{
            'text' : '训练',
            'active' : '/y/training/train.png',
            'disactive' : '/y/training/train_d.png'
        },{
            'text' : '套装一',
            'active' : '/y/equip/set1_on.png',
            'disactive' : '/y/equip/set1_off.png'
        },{
            'text' : '套装二',
            'active' : '/y/equip/set2_on.png',
            'disactive' : '/y/equip/set2_off.png'
        },{
            'text' : '套装三',
            'active' : '/y/equip/set3_on.png',
            'disactive' : '/y/equip/set3_off.png'
        },{
            'text' : '套装四',
            'active' : '/y/equip/set4_on.png',
            'disactive' : '/y/equip/set4_off.png'
        },{
            'text' : '套装五',
            'active' : '/y/equip/set5_on.png',
            'disactive' : '/y/equip/set5_off.png'
        },{
            'text' : '套装六',
            'active' : '/y/equip/set6_on.png',
            'disactive' : '/y/equip/set6_off.png'
        },{
            'text' : '套装七',
            'active' : '/y/equip/set7_on.png',
            'disactive' : '/y/equip/set7_off.png'
        },

        {
            'text' : '常规',
            'active' : '/y/ab/tageneral.png',
            'disactive' : '/y/ab/tdgeneral.png'
        },{
            'text' : '重甲',
            'active' : '/y/ab/taheavy.png',
            'disactive' : '/y/ab/tdheavy.png'
        },{
            'text' : '布甲',
            'active' : '/y/ab/tacloth.png',
            'disactive' : '/y/ab/tdcloth.png'
        },{
            'text' : '轻甲',
            'active' : '/y/ab/talight.png',
            'disactive' : '/y/ab/tdlight.png'
        },{
            'text' : '双持',
            'active' : '/y/ab/tadualwield.png',
            'disactive' : '/y/ab/tddualwield.png'
        },{
            'text' : '二天',
            'active' : '/y/ab/taniten.png',
            'disactive' : '/y/ab/tdniten.png'
        },{
            'text' : '单手',
            'active' : '/y/ab/taonehanded.png',
            'disactive' : '/y/ab/tdonehanded.png'
        },{
            'text' : '双手',
            'active' : '/y/ab/tatwohanded.png',
            'disactive' : '/y/ab/tdtwohanded.png'
        },{
            'text' : '法杖',
            'active' : '/y/ab/tastaff.png',
            'disactive' : '/y/ab/tdstaff.png'
        },{
            'text' : '增益魔法1',
            'active' : '/y/ab/tasupportive1.png',
            'disactive' : '/y/ab/tdsupportive1.png'
        },{
            'text' : '增益魔法2',
            'active' : '/y/ab/tasupportive2.png',
            'disactive' : '/y/ab/tdsupportive2.png'
        },{
            'text' : '减益魔法1',
            'active' : '/y/ab/tadeprecating1.png',
            'disactive' : '/y/ab/tddeprecating1.png'
        },{
            'text' : '减益魔法2',
            'active' : '/y/ab/tadeprecating2.png',
            'disactive' : '/y/ab/tddeprecating2.png'
        },{
            'text' : '神圣魔法',
            'active' : '/y/ab/tadivine.png',
            'disactive' : '/y/ab/tddivine.png'
        },{
            'text' : '元素魔法',
            'active' : '/y/ab/taelemental.png',
            'disactive' : '/y/ab/tdelemental.png'
        },{
            'text' : '黑暗魔法',
            'active' : '/y/ab/taforbidden.png',
            'disactive' : '/y/ab/tdforbidden.png'
        },{
            'text' : '重置',
            'active' : '/y/ab/reset_a.png',
            'disactive' : '/y/ab/reset_d.png'
        },

        {
            'text' : '确定',
            'active' : '/y/shops/accept.png',
            'disactive' : '/y/shops/accept_d.png'
        },{
            'text' : '附魔',
            'active' : '/y/shops/enchant.png',
            'disactive' : '/y/shops/enchant_d.png'
        },{
            'text' : '强化',
            'active' : '/y/shops/upgrade.png',
            'disactive' : '/y/shops/upgrade_d.png'
        },{
            'text' : '重命名',
            'active' : '/y/shops/rename.png',
            'disactive' : '/y/shops/rename_d.png'
        },{
            'text' : '重铸选中装备',
            'active' : '/y/shops/reforge.png',
            'disactive' : '/y/shops/reforge_d.png'
        },{
            'text' : '修复选中装备',
            'active' : '/y/shops/repair.png',
            'disactive' : '/y/shops/repair_d.png'
        },{
            'text' : '全部修复',
            'active' : '/y/shops/repairall.png',
            'disactive' : '/y/shops/repairall_d.png',
        },{
            'text' : '分解选中装备',
            'active' : '/y/shops/salvage.png',
            'disactive' : '/y/shops/salvage_d.png'
        },{
            'text' : '查看可用附魔',
            'active' : '/y/shops/showenchants.png',
            'disactive' : '/y/shops/showenchants_d.png'
        },{
            'text' : '查看可用强化',
            'active' : '/y/shops/showupgrades.png',
            'disactive' : '/y/shops/showupgrades_d.png'
        },{
            'text' : '灵魂绑定装备',
            'active' : '/y/shops/soulfuse.png',
            'disactive' : '/y/shops/soulfuse_d.png'
        },

        {
            'text' : '武器：单手',
            'active' : '/y/shops/1handed_on.png',
            'disactive' : '/y/shops/1handed_off.png'
        },{
            'text' : '武器：双手',
            'active' : '/y/shops/2handed_on.png',
            'disactive' : '/y/shops/2handed_off.png'
        },{
            'text' : '武器：法杖',
            'active' : '/y/shops/staff_on.png',
            'disactive' : '/y/shops/staff_off.png'
        },{
            'text' : '护甲：盾牌',
            'active' : '/y/shops/shield_on.png',
            'disactive' : '/y/shops/shield_off.png'
        },{
            'text' : '护甲：布甲',
            'active' : '/y/shops/acloth_on.png',
            'disactive' : '/y/shops/acloth_off.png'
        },{
            'text' : '护甲：重甲',
            'active' : '/y/shops/aheavy_on.png',
            'disactive' : '/y/shops/aheavy_off.png'
        },{
            'text' : '护甲：轻甲',
            'active' : '/y/shops/alight_on.png',
            'disactive' : '/y/shops/alight_off.png'
        },{
            'text' : '献祭',
            'active' : '/y/shops/offering.png',
            'disactive' : '/y/shops/offering_d.png'
        },{
            'text' : '放弃头奖',
            'active' : '/y/shops/lottery_donotwant_a.png',
            'disactive' : '/y/shops/lottery_donotwant_d.png'
        },{
            'text' : '使用黄金彩票券',
            'active' : '/y/shops/lottery_golden_a.png',
            'disactive' : '/y/shops/lottery_golden_d.png'
        },{
            'text' : '下一期彩票>',
            'active' : '/y/shops/lottery_next_a.png',
            'disactive' : '/y/shops/lottery_next_d.png'
        },{
            'text' : '<上一期彩票',
            'active' : '/y/shops/lottery_prev_a.png',
            'disactive' : '/y/shops/lottery_prev_d.png'
        },{
            'text' : '今天的彩票',
            'active' : '/y/shops/lottery_today_a.png',
            'disactive' : '/y/shops/lottery_today_d.png'
        },{
            'text' : '购买彩票',
            'active' : '/y/shops/buytickets.png',
            'disactive' : '/y/shops/buytickets_d.png'
        },

        {
            'text' : '创建怪物',
            'active' : '/y/monster/createmonster.png',
            'disactive' : '/y/monster/createmonster_d.png'
        },{
            'text' : '安抚所有怪物',
            'active' : '/y/monster/drugallmonsters.png',
            'disactive' : '/y/monster/drugallmonsters_d.png'
        },{
            'text' : '安抚怪物',
            'active' : '/y/monster/drugmonster.png',
            'disactive' : '/y/monster/drugmonster_d.png'
        },{
            'text' : '喂养所有怪物',
            'active' : '/y/monster/feedallmonsters.png',
            'disactive' : '/y/monster/feedallmonsters_d.png'
        },{
            'text' : '喂养怪物',
            'active' : '/y/monster/feedmonster.png',
            'disactive' : '/y/monster/feedmonster_d.png'
        },{
            'text' : '解锁新培养槽',
            'active' : '/y/monster/unlock_slot.png',
            'disactive' : '/y/monster/unlock_slot_d.png'
        },{
            'text' : '力量',
            'active' : '/y/monster/str_a.png',
            'disactive' : '/y/monster/str.png'
        },{
            'text' : '灵巧',
            'active' : '/y/monster/dex_a.png',
            'disactive' : '/y/monster/dex.png'
        },{
            'text' : '敏捷',
            'active' : '/y/monster/agi_a.png',
            'disactive' : '/y/monster/agi.png'
        },{
            'text' : '体质',
            'active' : '/y/monster/end_a.png',
            'disactive' : '/y/monster/end.png'
        },{
            'text' : '智力',
            'active' : '/y/monster/int_a.png',
            'disactive' : '/y/monster/int.png'
        },{
            'text' : '智慧',
            'active' : '/y/monster/wis_a.png',
            'disactive' : '/y/monster/wis.png'
        },{
            'text' : '火焰',
            'active' : '/y/monster/fire_a.png',
            'disactive' : '/y/monster/fire.png'
        },{
            'text' : '寒冰',
            'active' : '/y/monster/cold_a.png',
            'disactive' : '/y/monster/cold.png'
        },{
            'text' : '雷电',
            'active' : '/y/monster/elec_a.png',
            'disactive' : '/y/monster/elec.png'
        },{
            'text' : '狂风',
            'active' : '/y/monster/wind_a.png',
            'disactive' : '/y/monster/wind.png'
        },{
            'text' : '神圣',
            'active' : '/y/monster/holy_a.png',
            'disactive' : '/y/monster/holy.png'
        },{
            'text' : '黑暗',
            'active' : '/y/monster/dark_a.png',
            'disactive' : '/y/monster/dark.png'
        },{
            'text' : '怪物状态',
            'active' : '/y/monster/ml_monstats.png',
            'disactive' : '/y/monster/ml_monstats_a.png'
        },{
            'text' : '编辑怪物技能',
            'active' : '/y/monster/ml_skilledit.png',
            'disactive' : '/y/monster/ml_skilledit_a.png'
        },{
            'text' : '节肢动物',
            'active' : '/y/monster/arthropod_a.png',
            'disactive' : '/y/monster/arthropod.png'
        },{
            'text' : '飞禽',
            'active' : '/y/monster/avion_a.png',
            'disactive' : '/y/monster/avion.png'
        },{
            'text' : '野兽',
            'active' : '/y/monster/beast_a.png',
            'disactive' : '/y/monster/beast.png'
        },{
            'text' : '天人',
            'active' : '/y/monster/celestial_a.png',
            'disactive' : '/y/monster/celestial.png'
        },{
            'text' : '魔灵',
            'active' : '/y/monster/daimon_a.png',
            'disactive' : '/y/monster/daimon.png'
        },{
            'text' : '龙类',
            'active' : '/y/monster/dragonkin_a.png',
            'disactive' : '/y/monster/dragonkin.png'
        },{
            'text' : '元素',
            'active' : '/y/monster/elemental_a.png',
            'disactive' : '/y/monster/elemental.png'
        },{
            'text' : '巨人',
            'active' : '/y/monster/giant_a.png',
            'disactive' : '/y/monster/giant.png'
        },{
            'text' : '类人',
            'active' : '/y/monster/humanoid_a.png',
            'disactive' : '/y/monster/humanoid.png'
        },{
            'text' : '机器人',
            'active' : '/y/monster/mechanoid_a.png',
            'disactive' : '/y/monster/mechanoid.png'
        },{
            'text' : '爬行动物',
            'active' : '/y/monster/reptilian_a.png',
            'disactive' : '/y/monster/reptilian.png'
        },{
            'text' : '妖精',
            'active' : '/y/monster/sprite_a.png',
            'disactive' : '/y/monster/sprite.png'
        },{
            'text' : '不死族',
            'active' : '/y/monster/undead_a.png',
            'disactive' : '/y/monster/undead.png'
        },{
            'text' : '敲击',
            'active' : '/y/monster/crsh_a.png',
            'disactive' : '/y/monster/crsh.png'
        },{
            'text' : '刺击',
            'active' : '/y/monster/prcg_a.png',
            'disactive' : '/y/monster/prcg.png'
        },{
            'text' : '斩击',
            'active' : '/y/monster/slsh_a.png',
            'disactive' : '/y/monster/slsh.png'
        },

        {
            'text' : '等级 1~100',
            'active' : '/y/arena/pg1_a.png',
            'disactive' : '/y/arena/pg1.png'
        },{
            'text' : '等级 101~300',
            'active' : '/y/arena/pg2_a.png',
            'disactive' : '/y/arena/pg2.png'
        },{
            'text' : '开始挑战',
            'active' : '/y/arena/startchallenge.png',
            'disactive' : '/y/arena/startchallenge_d.png'
        },{
            'text' : '进入道具界',
            'active' : '/y/shops/enteritemworld.png',
            'disactive' : '/y/shops/enteritemworld_d.png'
        },

        {
            'text' : '进入压榨界',
            'active' : '/y/grindfest/startgrindfest.png',
        },{
            'text' : '取消训练',
            'active' : '/y/training/canceltrain.png',
        },{
            'text' : '提交',
            'active' : '/y/character/apply.png',
        },{
            'text' : '全部重置',
            'active' : '/y/ab/resetall.png',
        },{
            'text' : '转移装备',
            'active' : '/y/equip/eqinv_transfer.png',
        },{
            'text' : '取消穿戴',
            'active' : '/y/equip/unequip.png',
        },{
            'text' : '返回',
            'active' : '/y/equip/back.png',
        },

        {
            'text' : '写一封新邮件',
            'active' : '/y/mmail/writenew.png',
        },{
            'text' : '丢弃',
            'active' : '/y/mmail/discard.png',
        },{
            'text' : '回复',
            'active' : '/y/mmail/reply.png',
        },{
            'text' : '保存',
            'active' : '/y/mmail/save.png',
        },{
            'text' : '发送',
            'active' : '/y/mmail/send.png',
        },{
            'text' : '拒收邮件',
            'active' : '/y/mmail/returnmail.png',
        },{
            'text' : '召回邮件',
            'active' : '/y/mmail/recallmail.png',
        },{
            'text' : '附带',
            'active' : '/y/mmail/attach_attach.png',
        },{
            'text' : '附带绅士币',
            'active' : '/y/mmail/attach_credits.png',
        },{
            'text' : '附带装备',
            'active' : '/y/mmail/attach_equip.png',
        },{
            'text' : '附带Hath',
            'active' : '/y/mmail/attach_hath.png',
        },{
            'text' : '附带物品',
            'active' : '/y/mmail/attach_item.png',
        },{
            'text' : '移除所有附件',
            'active' : '/y/mmail/attach_removeall.png',
        },{
            'text' : '移除',
            'active' : '/y/mmail/attach_remove.png',
        },{
            'text' : '设置货到付款(CoD)',
            'active' : '/y/mmail/setcod.png',
        },{
            'text' : '确认领取附件',
            'active' : '/y/mmail/attach_takeall.png',
        },

        {
            'text' : '删除',
            'active' : '/y/monster/delete.png',
        },{
            'text' : '下一个>>',
            'active' : '/y/monster/next.png',
        },{
            'text' : '<<上一个',
            'active' : '/y/monster/prev.png',
        },{
            'text' : '重命名',
            'active' : '/y/monster/rename.png',
        },{
            'text' : '保存技能',
            'active' : '/y/monster/saveskills.png',
        },

        {
            'text' : '使用精神恢复剂',
            'active' : '/y/userestorative.png',
        },

        {
            'text' : '返回选择装备',
            'active' : '/y/shops/equipselect.png',
        },{
            'text' : '提交自动采购任务',
            'active' : '/y/shops/addbottask.png',
        },{
            'text' : '全部出售',
            'active' : '/y/shops/sellall.png',
        },

    ];//翻译字典到此结束




    //注释翻译法，仅将字典中能找到的图片加上注释（即鼠标悬停时显示的文字提示）
    //默认不使用此方法，在控制台输入localStorage.translateWithTitle=true回车强制使用本方法，delete localStorage.translateWithTitle删除标志使用默认
    //在设置了translateWithTitle的前提下优先级比其它翻译法高，意味着如果需要启用其它翻译法不能启用此翻译方法
    if (localStorage.translateWithTitle) {
        if (document.getElementById('pane_log')) return; //不翻译战斗界面（没有意义）

        //怪物状态图片因为是背景图逻辑不同需要额外处理
        Object.entries({
            '.msl>div:nth-child(5)>div' : '饥饿',
            '.msl>div:nth-child(6)>div' : '情绪',
        }).forEach(([selector,text])=>{
            Array.from(document.querySelectorAll(selector)).forEach(item=>(item.title = text));
        });

        //把小马图引导以及主菜单的5个按钮一起扔进去统一处理……
        imgWords.unshift(
            {
                'text' :'回答',
                'active' : '/y/battle/answer.png'
            },
            {
                'text' :'名称参考',
                'active' : '/y/battle/ponychartbutton.png'
            },

            {
                'text' :'角色',
                'disactive' : '/y/m/Character.png'
            },
            {
                'text' :'商店',
                'disactive' : '/y/m/Bazaar.png'
            },
            {
                'text' :'战斗',
                'disactive' : '/y/m/Battle.png'
            },
            {
                'text' :'强化',
                'disactive' : '/y/m/Forge.png'
            },
            {
                'text' :'百科',
                'disactive' : '/y/m/Wiki.png'
            },
            {
                'text' : '精力充沛，你将获得+100%经验奖励',
                'disactive' : '/y/s/sticon4.gif',
            },
            {
                'text' : '精力正常，你既不会收到额外的奖励也不会受到惩罚',
                'disactive' : '/y/s/sticon3.gif',
            },
            {
                'text' : '精力耗竭，你将无法从怪物那里收到任何经验或者掉落，也无法获得熟练度奖励',
                'disactive' : '/y/s/sticon1.gif',
            },
            {
                'text' : '你必须至少购买一张彩票才能选择放弃头奖争夺',
                'disactive' : '/y/shops/lottery_donotwant_d.png',
            },
            {
                'text' : '你已经放弃参与本次彩票的头奖争夺',
                'disactive' : '/y/shops/lottery_donotwant_s.png',
            }
        );
        Array.from(document.querySelectorAll('img')).forEach(img=>{
            var src = img.getAttribute('src');
            const item = imgWords.find(i=>src==i.active||src==i.disactive)
            if (item) img.title = item.text;
        });
        return;//注释译法不提供原文切换功能，毕竟图片仍然显示为英文在非悬停状态下注释并不会被显示，同时也不依赖其它变量，直接此处返回结束整个翻译方法
    }//注释翻译法END



    //画布，样式文件，图片翻译法的核心所在，也是文字翻译法的辅助所需
    //！修改注意，此脚本内注入样式带缓存以避免无意义重复执行图片翻译，如果修改了翻译样式，需要删除session storage里的缓存或者关闭浏览器重开才会生效
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var translateStyle = document.createElement('style');


    //图片翻译法，所有图片的翻译内容全都塞到样式里让浏览器自己去渲染，因为是非标准样式所以并不是所有浏览器都支持，效率较差但是翻译完美且不会影响其它内容
    //在Chrome下默认使用图片翻译法，如需使用其它译法根据其它译法注释提示设置标志位
    //在非Chrome下默认不会使用该方法，控制台中输入localStorage.translateWithImg=true回车可强制启用此译法，delete localStorage.translateWithImg删除标志使用默认
    if (localStorage.translateWithImg || (
        window.navigator.userAgent.includes("Chrome") && !localStorage.translateWithText
    )) {
        //文字转换为图片方法
        function word2img(word,stroke) {
            var height = 14;
            canvas.height = height + 2;
            canvas.width = word.length*height + 5;
            ctx.font = 'bold '+height+'px 微软雅黑';
            if (stroke) {
                ctx.strokeStyle = stroke.strokeStyle;
                ctx.strokeText(word,0,height);
                ctx.fillStyle = stroke.fillStyle;
                ctx.fillText(word,2,height);
            }
            else {
                ctx.fillStyle = '#202020';
                ctx.fillText(word,2,height);
            }
            return canvas.toDataURL();
        }
        function activeWord2img(value) {
            return word2img(value,{strokeStyle:'#EFD34F',fillStyle:'#5C0D11'});
        }

        if (document.getElementById('pane_log')) {
            //战斗中，默认直接跳过不翻译战斗图片， 功能可用，但没什么意义……
            //想要的话也可以在控制台输入localStorage.translateBattle=true回车强制开启，delete localStorage.translateBattle删除标志则返回默认不开启
            //战斗翻译开关标志位和hentaiverse汉化共用，意味着如果你安装了hentaiverse汉化20200922版本以上，双击战斗底部经验条会同步开关文字和图片汉化，但可能需要刷新页面才会生效
            if (!localStorage.translateBattle) return;
            translateStyle.innerHTML = sessionStorage.battleImgTranslate || (
                sessionStorage.battleImgTranslate = [
                    //战斗界面的图片字典，为了效率考虑使用独立字典。6个战斗行动图片单独处理
                    {
                        'text' : '技巧',
                        'active' : 'sbsel_skills_s.png',
                        'disactive' : 'sbsel_skills_n.png'
                    },{
                        'text' : '法术',
                        'active' : 'sbsel_spells_s.png',
                        'disactive' : 'sbsel_spells_n.png'
                    },{
                        'text' : '先天技巧',
                        'disactive' : 'skills_innate.png'
                    },{
                        'text' : '武器技巧',
                        'disactive' : 'skills_weapon.png'
                    },{
                        'text' : '治疗法术',
                        'disactive' : 'magic_curative.png'
                    },{
                        'text' : '攻击法术',
                        'disactive' : 'magic_damage.png'
                    },{
                        'text' : '乏抑法术',
                        'disactive' : 'magic_debuff.png'
                    },{
                        'text' : '辅助法术',
                        'disactive' : 'magic_support.png'
                    },
                    {
                        'text' : '继续下一轮竞技场挑战',
                        'active' : 'arenacontinue.png'
                    },{
                        'text' : '继续下一层压榨界挑战',
                        'active' : 'grindfestcontinue.png'
                    },{
                        'text' : '深入下一层道具界挑战',
                        'active' : 'itemworldcontinue.png'
                    },{
                        'text' : '结束战斗',
                        'active' : 'finishbattle.png'
                    },
                    //因为Monsterbation不刷新战斗页面，所以战斗翻译中也需要加入小马图的翻译
                    {
                        'text' :'回答',
                        'active' : '/y/battle/answer.png'
                    },{
                        'text' :'名称参考',
                        'active' : '/y/battle/ponychartbutton.png'
                    },

                ].map(item=>{
                    var txt = '';
                    if (item.disactive) txt += `img[src*="${item.disactive}"]{content:url(${word2img(item.text)})}`;
                    if (item.active) txt += `img[src*="${item.active}"]{content:url(${activeWord2img(item.text)})}`;
                    return txt;
                }).join('\n') + Object.entries({
                    'attack' : '攻击',
                    'skill' : '技能书',
                    'items' : '道具',
                    'spirit' : '灵动架式',
                    'defend' : '防御',
                    'focus' : '专注',
                }).map(([key,value])=>{
                    var ret = '';
                    ret += `img[src*="${key}_n.png"]{content:url(${activeWord2img(value)})}`;
                    ret += `img[src*="${key}_s.png"]{content:url(${word2img(value,{strokeStyle:'#F8DA34',fillStyle:'#0030CB'})})}`;
                    ret += `img[src*="${key}_a.png"]{content:url(${word2img(value,{strokeStyle:'#EE3632',fillStyle:'#000000'})})}`;
                    return ret;
                }).join('\n')
            );
        }
        else if (document.getElementById('riddlemaster')) {
            //小马图引导
            translateStyle.innerHTML = sessionStorage.riddleImgTranslate || (
                sessionStorage.riddleImgTranslate = Object.entries({
                    'answer.png' : '回答',
                    'ponychartbutton.png' : '名称参考',
                }).map(([key,value])=>{
                    return `img[src*="${key}"]{content:url(${activeWord2img(value)})}`;
                }).join('\n')
            );
        }
        else {
            //不在战斗中，翻译其它图片内容
            translateStyle.innerHTML = sessionStorage.translateStyle || (
                sessionStorage.translateStyle = [
                    '#eqsl>div {height: 20px; width: 71px;}',
                    ...imgWords.map(item=>{
                        var txt = '';
                        if (item.disactive) txt += `img[src*="${item.disactive}"]{content:url(${word2img(item.text)})}\n`;
                        if (item.active) txt += `img[src*="${item.active}"]{content:url(${activeWord2img(item.text)})}\n`;
                        return txt
                    }),
                    ...Object.entries({
                        '/y/m/Character.png' : '角色',
                        '/y/m/Bazaar.png' : '商店',
                        '/y/m/Battle.png' : '战斗',
                        '/y/m/Forge.png' : '强化',
                        '/y/m/Wiki.png' : '百科'
                    }).map(([img,txt])=>{
                        canvas.height = 21;
                        canvas.width = 120;
                        ctx.font = 'bold 19px 微软雅黑';
                        ctx.fillStyle = '#000';
                        ctx.fillText(txt,40,16);
                        return `img[src*="${img}"]{content:url(${canvas.toDataURL()})}\n`
                    }),
                    ...Object.entries({
                        '.msl>div:nth-child(5)>div' : '饥饿',
                        '.msl>div:nth-child(6)>div' : '情绪',
                    }).map(([selector,txt])=>{
                        canvas.height = 22;
                        canvas.width = 200;
                        ctx.font = '12px bold';
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(63,6,122,10);
                        ctx.fillStyle = '#000';
                        ctx.fillText(txt,30,15);
                        return `${selector}{background:url(${canvas.toDataURL()})}\n`
                    }),
                    ...Object.entries({
                        '/y/shops/lottery_donotwant_s.png' : '放弃头奖',
                    }).map(([key,value])=>{
                        return `img[src*="${key}"]{content:url(${word2img(value,{fillStyle:'#ff0000',strokeStyle:'#00000000'})})}`
                    })
                ].join('\n')
            );
        }
    }//图片翻译法END



    //文字翻译法，使用文字代替图片，需要处理问题较多，如有特殊图片漏处理可能造成按钮功能出错且可能其它脚本冲突
    //在非Chrome中默认使用此方法翻译，如需使用其它译法根据其它译法注释设置标志
    //在Chrome下默认不会使用此译法，在控制台中输入localStorage.translateWithText=true回车强制启用此方法，delete localStorage.translateWithText删除标志使用默认
    else {
        if (document.getElementById('pane_log')) return; //不翻译战斗界面（需要处理较多问题且没有意义）

        var words = [];//已翻译的字典，用于切换原文

        //使用的文字样式和特殊图片样式。仍然需要使用图片法翻译怪物实验室的饥饿和情绪图片背景框，这两个是标准样式所以不会有兼容问题
        translateStyle.innerHTML = sessionStorage.translateTextStyle || (
            sessionStorage.translateTextStyle = [
                '#eqsl>div {height: 20px; width: 71px;}',
                '.image2block {display: inline;font: bold 15px 微软雅黑; padding: 1px 5px; color:#202020}',
                '.image2block.active {text-shadow: 2px 2px 2px #EFD34F; color:#5C0D11}',
                '.image2block.title {font-size: 18px; padding: 0px 30px;}',
                '.image2block.red {color:#ff0000}',
                ...Object.entries({
                    '.msl>div:nth-child(5)>div' : '饥饿',
                    '.msl>div:nth-child(6)>div' : '情绪',
                }).map(([selector,txt])=>{
                    canvas.height = 22;
                    canvas.width = 200;
                    ctx.font = '12px bold';
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(63,6,122,10);
                    ctx.fillStyle = '#000';
                    ctx.fillText(txt,30,15);
                    return `${selector}{background:url(${canvas.toDataURL()})}`
                })
            ].join('\n')
        );

        /*
         * 获取转换后的文字样式，原则上使用激活状态，如有特殊样式则使用特殊样式。
         * src:  原图片地址
         * item: 翻译字典，带active/disactive/style属性
        */
        function getClassName(src, item) {
            return 'image2block ' + (src==item.active?'active ':'') + (item.style || '');
        }
        //图片替换为文字元素核心方法
        function replaceImg2Word(img) {
            var src = img.getAttribute('src');
            var item = imgWords.find(i=>src==i.active||src==i.disactive);
            if (!item) return;
            var div = document.createElement('div');
            div.innerHTML = item.text;
            if (img.onclick) {
                div.setAttribute('onclick',img.getAttribute('onclick'));
            }
            if (img.onmouseover) {
                div.setAttribute('onmouseover',img.getAttribute('onmouseover'));
            }
            div.className = getClassName(img.getAttribute('src'), item);
            if (img.id) {
                div.id = img.id;
                //图片存在id时意味着该图片会被寻址并更改，hook替换后的src变更并同步更改原图src和文字状态
                Object.defineProperty(div,'src',{
                    set:function(value){
                        img.setAttribute('src',value);
                        this.className = getClassName(value, item);
                    }
                });
                if (item.text=='确定'&&location.href.includes('s=Bazaar&ss=es')) {
                    //已知在装备商店中，确定交易图片按钮在商店初始化时即被局部变量缓存，因此需hook原图src以获知后续变动
                    Object.defineProperty(img,'src',{
                        set:function(value){
                            img.setAttribute('src',value);
                            div.src = value;
                            div.className = getClassName(value, item);
                            if (value==item.active) {
                                div.setAttribute('onclick','equipshop.commit_transaction()');
                            }
                            else {
                                div.removeAttribute("onclick");
                            }
                        }
                    });
                }
            }
            img.replaceWith(div);
            words.push({div,img});
            return div;
        }

        //将通用字典之外的特殊图片一起扔进去统一翻译……
        imgWords.push(
            {
                'text' :'回答',
                'active' : '/y/battle/answer.png'
            },
            {
                'text' :'名称参考',
                'active' : '/y/battle/ponychartbutton.png'
            },

            //主菜单图片
            {
                'text' :'角色',
                'disactive' : '/y/m/Character.png',
                'style' : 'title'
            },
            {
                'text' :'商店',
                'disactive' : '/y/m/Bazaar.png',
                'style' : 'title'
            },
            {
                'text' :'战斗',
                'disactive' : '/y/m/Battle.png',
                'style' : 'title'
            },
            {
                'text' :'强化',
                'disactive' : '/y/m/Forge.png',
                'style' : 'title'
            },
            {
                'text' :'百科',
                'disactive' : '/y/m/Wiki.png',
                'style' : 'title'
            },
            //已抽奖图片，使用红色特殊样式
            {
                'text' :'放弃头奖',
                'disactive' : '/y/shops/lottery_donotwant_s.png',
                'style' : 'red'
            }
        );
        Array.from(document.querySelectorAll('img')).forEach(replaceImg2Word);
    }


    //将翻译样式注入到网页中
    document.head.appendChild(translateStyle);



    //原文切换功能
    var translated = true, changer;
    function restore() {
        if (translated) {
            document.head.removeChild(translateStyle);
            words&&words.forEach(item=>item.div.replaceWith(item.img));
        }
        else {
            document.head.appendChild(translateStyle);
            words&&words.forEach(item=>item.img.replaceWith(item.div));
        }
        translated = !translated;
        changer.innerHTML = translated?'英':'中';
    }
    //初始化原文切换按钮
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
    initRestore();

})();