// ==UserScript==
// @name         B站直播批量发送弹幕
// @namespace    indefined
// @version      0.1
// @description  个人觉得功能有限，不保证兼容维护
// @author       indefined
// @include      https://live.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let token = document.cookie.match(/bili_jct=(.{32})/);
    if (!token) return;
    token = token[1];
    $("div.right-container").prepend(`
    <div style="padding: 10px;">
      <p style="margin:0;font-size:20px;color:#333">批量发送弹幕</p>
      <div>
        <textarea placeholder="弹幕内容，每行一句，空行忽略，循环发送，发送过程中更改内容需停止后重新开始才生效"
        id="hanhuaText"style="width: 100%;height: 50px;border-radius: 3px;resize: none;margin-top: 3px;"></textarea>
        <span style="margin: 10px;">发送次数</span>
        <input type="number" style="width: 35px;" id="sendLimit" />
        <span style="margin: 10px;">发送间隔(s)</span>
        <input type="number" style="width: 35px;" id="sendTick" />
        <br />
        <input type="button" value="开始" id="quantitiesSend" style="margin: 5px;">
        <span id="sendStatus" style="color: blue;">0/0</span>
        <br />
      </div>
    </div>`);
    let sendStatus = false;
    $("body").on('click','#quantitiesSend',async ()=>{
        if (sendStatus) {
            sendStatus = false;
            $('#quantitiesSend').val('开始');
        } else {
            let text = $('#hanhuaText').val();
            let limit = +$('#sendLimit').val();
            let tick = +$('#sendTick').val();
            if (text.length<=0||limit<=0||tick<0) {
                $('#sendStatus').text('输入错误');
                return;
            }
            $('#quantitiesSend').val('停止');
            sendStatus = true;
            let sent = 0;
            const msgs = {
                data:text.split('\n'),
                next:function(){
                    while (this.data.length>0){
                        const msg = this.data.shift();
                        if (msg.length == 0) {
                            continue;
                        }
                        this.data.push(msg);
                        return msg;
                    }
                }
            };
            for (let i = 0;i<limit&&sendStatus;i++){
                const msg = msgs.next();
                if (!msg) {
                    $('#sendStatus').text('无可用发送数据');
                    break;
                }
                $.ajax('//api.live.bilibili.com/msg/send',{
                    type:'post',dataType:'json', xhrFields:{withCredentials:true},
                    data:{
                        color:16777215,
                        fontsize:25,
                        mode:1,
                        msg:msg,
                        bubble:0,
                        rnd:window.DANMU_RND||(Date.now()/1000).toFixed(0),
                        roomid:window.BilibiliLive.ROOMID,
                        csrf_token:token,
                        csrf:token
                    }
                }).success(result=>{
                    if (result.code!=0){
                        $('#sendStatus').text('发送错误:'+result.msg);
                        console.error(result);
                        sendStatus = false;
                        $('#quantitiesSend').val('开始');
                    }
                    else{
                        $('#sendStatus').text(++sent+'/'+limit);
                    }
                }).error(e=>{
                    $('#sendStatus').text('发送错误:'+e);
                    console.error(e);
                    sendStatus = false;
                    $('#quantitiesSend').val('开始');
                });
                if (i==limit-1) {
                    break;
                }
                await new Promise(resolve=>setTimeout(()=>resolve(),tick*1000));
            }
            $('#quantitiesSend').val('开始');
            sendStatus = false;
        }
    });
})();