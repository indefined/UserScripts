const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = __dirname;
const cc = fs.readFileSync(path.join(root, 'bilibiliCCHelper.user.js'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
function dom(html = '') {
  const d = new JSDOM('<!doctype html><body>'+html+'</body>', {url:'https://www.bilibili.com/video/BVtest/',runScripts:'outside-only',pretendToBeVisual:true});
  d.window.console = {log(){},error(){},debug(){},warn(){}};
  return d;
}
const menu = '<div class="bpx-player-ctrl-subtitle-major-content"><div class="bpx-player-ctrl-subtitle-major-inner"><div class="bpx-player-ctrl-subtitle-language-item" data-lan="ai-zh"><div class="bpx-player-ctrl-subtitle-language-item-text">中文</div><span><svg></svg></span></div></div></div>';
function ccFixture() {
  const d=dom('<div id="bilibili-player">'+menu+'</div>');
  const w=d.window;
  let cid=1, requests=0;
  const pending=[];
  w.playerRaw={getManifest:()=>({cid,aid:1,bvid:'BVtest'})};
  w.XMLHttpRequest=class {
    open(){} send(){requests++;pending.push(()=>{this.status=200;this.readyState=4;this.responseText=JSON.stringify({code:0,data:{subtitle:{subtitles:[{lan:'ai-zh',lan_doc:'中文',subtitle_url:'https://example.test/subtitle'}]}}});this.onreadystatechange();});}
  };
  w.eval(cc.replace('    bilibiliCCHelper.init();','    window.testHelper = bilibiliCCHelper;'));
  return {d,w,h:w.testHelper,pending,requests:()=>requests,setCid:x=>{cid=x;}};
}
test('CC initialization shares pending network work and supports nested AI language nodes',async()=>{
  const f=ccFixture();
  try {
    const work=Array.from({length:12},()=>f.h.tryInit());
    assert.equal(f.requests(),1);
    assert.ok(work.every(p=>p===work[0]));
    f.pending.shift()(); await Promise.all(work);
    let downloaded;
    f.h.downloadSubtitle=(...args)=>{downloaded=args;};
    const item=f.w.document.querySelector('.bpx-player-ctrl-subtitle-language-item');
    item.getBoundingClientRect=()=>({right:100});
    item.querySelector('svg').dispatchEvent(new f.w.MouseEvent('click',{bubbles:true,cancelable:true,clientX:95}));
    assert.deepEqual(Array.from(downloaded).slice(0,2),['ai-zh','中文']);
    await f.h.tryInit(); assert.equal(f.requests(),1);
    // Same document, next part, and a recreated current-player subtitle menu.
    f.setCid(2);
    f.w.document.querySelector('#bilibili-player').innerHTML=menu;
    const next=f.h.tryInit();assert.equal(f.requests(),2);
    f.pending.shift()();await next;
    assert.ok(f.w.document.querySelector('#bilibili-player-subtitle-btn'));
    assert.equal(f.h.pcid,2);
  } finally {f.d.window.close();}
});
test('CC does not subscribe to document-wide subtitle/danmaku churn',async()=>{
  const f=ccFixture();
  try {
    let scans=0;
    const setup=f.h.setupData;
    f.h.setupData=function(...args){scans++;return setup.apply(this,args);};
    f.h.init();f.pending.shift()();await tick();
    const baseline=scans;
    const title=f.w.document.createElement('div');title.className='tit';f.w.document.body.append(title);
    for(let i=0;i<100;i++){title.replaceChildren(f.w.document.createTextNode('frame '+i));await Promise.resolve();}
    await tick();assert.equal(scans,baseline);
    f.w.dispatchEvent(new f.w.Event('pagehide'));assert.equal(f.h.discoveryTimer,undefined);
  } finally {f.d.window.close();}
});
