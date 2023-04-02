// ==UserScript==
// @name         Bing Chat Everywhere
// @namespace    indefined
// @version      0.3.10
// @description  try to bing over the world!
// @author       indefined
// @match        *://*/*
// @exclude      *://www.bing.com/*
// @exclude      *://github.com/*
// @homepage     https://github.com/indefined/Bing-Chat-Everywhere/
// @icon         https://www.bing.com/rp/SOP97zQpFD4pG6teqCTC-c4LEgE.svg
// @require      https://cdn.bootcdn.net/ajax/libs/marked/4.2.12/marked.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/showdown/2.1.0/showdown.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/markdown-it/13.0.1/markdown-it.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @connect      edgeservices.bing.com
// @connect      www.bing.com
// @connect      cn.bing.com
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    const localStorage = new Proxy({}, {
        set:function(target, key, value) {
            GM_setValue(key, value);
            return true;
        },
        get:function(target, key) {
            return GM_getValue(key);
        },
        deleteProperty: function(target, key) {
            GM_deleteValue(key);
            return true;
        }
    });

    let _debug = localStorage._debug;

    const ICON = `
    <span id="chat-show" class="chat-body" title="Bing Chat!"><style>
    body>span#chat-show {
        position: fixed;
        right: 0;
        top: 40px;
        width: 22px;
        height: 20px;
        background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUyIiBoZWlnaHQ9IjEzNiIgdmlld0JveD0iMCAwIDE1MiAxMzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMzguMzEwMyA2MS45Nkg2My43NjAzQzY2LjEwMDMgNjEuOTYgNjguMDAwMyA2My44NiA2OC4wMDAzIDY2LjJDNjguMDAwMyA2OC4zNSA2Ni40MDAzIDcwLjEyIDY0LjMzMDMgNzAuNDFMNjMuNzUwMyA3MC40NUgzOC4zMDAzQzM1Ljk2MDMgNzAuNDUgMzQuMDYwMyA2OC41NSAzNC4wNjAzIDY2LjIxQzM0LjA2MDMgNjQuMDYgMzUuNjYwMyA2Mi4yOSAzNy43MzAzIDYyTDM4LjMxMDMgNjEuOTZINjMuNzYwM0gzOC4zMTAzWk0zOC4zMTAzIDQyLjE2SDc1LjExMDNDNzcuNDUwMyA0Mi4xNiA3OS4zNTAzIDQ0LjA2IDc5LjM1MDMgNDYuNEM3OS4zNTAzIDQ4LjU1IDc3Ljc1MDMgNTAuMzIgNzUuNjgwMyA1MC42MUw3NS4xMDAzIDUwLjY1SDM4LjMwMDNDMzUuOTYwMyA1MC42NSAzNC4wNjAzIDQ4Ljc1IDM0LjA2MDMgNDYuNDFDMzQuMDYwMyA0NC4yNiAzNS42NjAzIDQyLjQ5IDM3LjczMDMgNDIuMjFMMzguMzEwMyA0Mi4xN0g3NS4xMTAzSDM4LjMxMDNWNDIuMTZaTTU3LjQ1MDMgMEMyNi4zMzAzIDAgMS4xMDAzMyAyNS4yMyAxLjEwMDMzIDU2LjM0QzEuMTAwMzMgNjQuODUgMi45OTAzMyA3Mi45MyA2LjM4MDMzIDgwLjE4QzQuNDcwMzMgODcuNjggMi4zNDAzMyA5Ni4wNCAwLjk0MDMyNiAxMDEuNTJDLTAuODA5Njc1IDEwOC4zOCA1LjM3MDMzIDExNC42MiAxMi4yNDAzIDExMi45N0MxNy44ODAzIDExMS42MiAyNi41NDAzIDEwOS41NCAzNC4yNjAzIDEwNy43QzQxLjM0MDMgMTEwLjkgNDkuMTkwMyAxMTIuNjggNTcuNDUwMyAxMTIuNjhDODguNTcwMyAxMTIuNjggMTEzLjc5IDg3LjQ1IDExMy43OSA1Ni4zNEMxMTMuNzkgMjUuMjMgODguNTYwMyAwIDU3LjQ1MDMgMFpNMTIuMzcwMyA1Ni4zNEMxMi4zNzAzIDMxLjQ1IDMyLjU1MDMgMTEuMjcgNTcuNDQwMyAxMS4yN0M4Mi4zMzAzIDExLjI3IDEwMi41MSAzMS40NSAxMDIuNTEgNTYuMzRDMTAyLjUxIDgxLjIzIDgyLjMzMDMgMTAxLjQxIDU3LjQ0MDMgMTAxLjQxQzUwLjIyMDMgMTAxLjQxIDQzLjQyMDMgOTkuNzIgMzcuMzgwMyA5Ni43MUwzNS41NTAzIDk1LjhMMzMuNTYwMyA5Ni4yN0MyNi42MzAzIDk3LjkyIDE4LjYyMDMgOTkuODQgMTIuNjIwMyAxMDEuMjhDMTQuMTEwMyA5NS40MyAxNi4wOTAzIDg3LjY3IDE3LjgwMDMgODAuOTRMMTguMzMwMyA3OC44N0wxNy4zNTAzIDc2Ljk3QzE0LjE2MDMgNzAuNzkgMTIuMzYwMyA2My43OCAxMi4zNjAzIDU2LjMzTDEyLjM3MDMgNTYuMzRaTTk1LjAxMDMgMTM1LjIyQzgwLjIyMDMgMTM1LjIyIDY2Ljc1MDMgMTI5LjUyIDU2LjcwMDMgMTIwLjE5QzU2Ljk1MDMgMTIwLjE5IDU3LjIwMDMgMTIwLjE5IDU3LjQ1MDMgMTIwLjE5QzYyLjg0MDMgMTIwLjE5IDY4LjA4MDMgMTE5LjUyIDczLjA4MDMgMTE4LjI2Qzc5LjU3MDMgMTIxLjg4IDg3LjA1MDMgMTIzLjk0IDk1LjAxMDMgMTIzLjk0QzEwMi4yMyAxMjMuOTQgMTA5LjAzIDEyMi4yNSAxMTUuMDcgMTE5LjI0TDExNi45IDExOC4zM0wxMTguODkgMTE4LjhDMTI1LjgxIDEyMC40NSAxMzMuNjUgMTIyLjE1IDEzOS40NyAxMjMuMzhDMTM4LjE2IDExNy43NCAxMzYuMzYgMTEwLjE5IDEzNC42NSAxMDMuNDdMMTM0LjEyIDEwMS40TDEzNS4xIDk5LjVDMTM4LjI5IDkzLjMyIDE0MC4wOSA4Ni4zMSAxNDAuMDkgNzguODZDMTQwLjA5IDYyLjk3IDEzMS44NyA0OS4wMSAxMTkuNDUgNDAuOThDMTE4LjExIDM1LjU1IDExNi4wNyAzMC4zOSAxMTMuNDQgMjUuNkMxMzUuNTEgMzMuMjQgMTUxLjM1IDU0LjIgMTUxLjM1IDc4Ljg2QzE1MS4zNSA4Ny4zNyAxNDkuNDYgOTUuNDYgMTQ2LjA3IDEwMi43QzE0Ny45NyAxMTAuMjcgMTQ5LjkgMTE4LjQ4IDE1MS4xMiAxMjMuNzZDMTUyLjY2IDEzMC40MSAxNDYuOCAxMzYuNDMgMTQwLjEgMTM1LjAyQzEzNC42NCAxMzMuODggMTI2LjA1IDEzMi4wNSAxMTguMjEgMTMwLjIxQzExMS4xMyAxMzMuNDEgMTAzLjI3IDEzNS4xOSA5NS4wMTAzIDEzNS4xOVYxMzUuMjJaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTkwMF82NTgwMikiLz4NCjxkZWZzPg0KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzE5MDBfNjU4MDIiIHgxPSIxNC4yMzAzIiB5MT0iMTkuODciIHgyPSIxMzcuNzQiIHkyPSIxNDMuMzkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4NCjxzdG9wIHN0b3AtY29sb3I9IiMyRDlGRUUiLz4NCjxzdG9wIG9mZnNldD0iMC4xOCIgc3RvcC1jb2xvcj0iIzFGOENFOCIvPg0KPHN0b3Agb2Zmc2V0PSIwLjQzIiBzdG9wLWNvbG9yPSIjMTE3QUUzIi8+DQo8c3RvcCBvZmZzZXQ9IjAuNyIgc3RvcC1jb2xvcj0iIzA5NkZFMCIvPg0KPHN0b3Agb2Zmc2V0PSIwLjk5IiBzdG9wLWNvbG9yPSIjMDc2Q0RGIi8+DQo8L2xpbmVhckdyYWRpZW50Pg0KPC9kZWZzPg0KPC9zdmc+DQo=);
        background-size: cover;
        transform: translateX(21px);
        cursor: pointer;
        z-index: 222222;
    }
    body>span#chat-show:hover, html.chat-active #chat-show{
        transform: translateX(0);
    }
    </style></span>`;
    // UI https://www.cnblogs.com/l-yf/p/13879730.html
    const UI = `<div class="chat-container chat-body" id="chat-container">
        <div class="chat-content" id="chat-content">
            <div class="chat-item chat-item-center"><span>现在可以开始聊天了。</span></div>
        </div>
        <div id="chat-resize"></div>
        <div class="chat-popup hidden" id="chat-popup"></div>
        <div class="chat-input-area">
            <div class="chat-suggest-area" id="chat-suggest"></div>
            <textarea name="text" id="chat-input" class="chat-textarea"></textarea>
            <div class="chat-button-area" id="chat-bottom">
                <button id="chat-save" class="${_debug? '' : 'hidden'}">保存会话</button>
                <select id="chat-mode"><option value="balance">平衡</option><option value="precise">精准</option><option value="creative">创造性</option></select>
                <button id="chat-clear">清 空</button>
                <button id="chat-reset">重 置</button>
                <button id="chat-send">发 送</button>
            </div>
        </div>
    </div>
    <style>
    html.chat-fullscreen.chat-active, html.chat-fullscreen.chat-active>body {
        overflow: hidden;
    }
    html.chat-active.chat-fullscreen>body>:not(.chat-body){
        disply: none !important;
    }

    .chat-container{
        height: 100vh;
        right: 0;
        top:0;
        border-radius: 4px;
        background-color: #f5f5f5;
        display: flex;
        text-align: left;
        flex-flow: column;
        overflow: hidden;
        position: fixed;
        z-index: 222222;
        transition: width 0.2s;
    }
    body.resizing #chat-container{
        transition: none;
    }
    html.chat-active>body>.chat-container{
        width: 360px;
    }
    html:not(.chat-active)>body>.chat-container{
        width: 0 !important;
    }
    html.chat-active.chat-fullscreen>body>.chat-container {
        width: 100vw !important;
    }
    span#chat-hide {
        position: absolute;
        cursor: pointer;
        right: 0;
        top: 40px;
    }
    div#chat-resize {
        height: 100%;
        width: 10px;
        left: 0;
        top: 0;
        display: block;
        position: absolute;
        cursor: w-resize;
    }
    .chat-content{
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }
    .chat-content:hover::-webkit-scrollbar-thumb{
        background:#ffffff02;
    }
    .chat-item.chat-item-right:hover:before {
        content: '\uD83D\uDD01';
        display: block;
        margin: 10px;
        cursor: pointer;
    }
    .chat-bubble{
        word-wrap:break-word;
        max-width: 90%;
        padding: 10px;
        border-radius: 5px;
        position: relative;
        color: #000;
        font-size: 16px;
        line-height: 20px;
        box-shadow: 0px 0.3px 0.9px#0000001f, 0px 1.6px 3.6px#00000029;
    }
    .chat-bubble:after {
        content: attr(data-limit);
        position: absolute;
        right: 10px;
        bottom: 10px;
        background: white;
        padding-left: 4px;
    }
    .chat-bubble .chat-footer {
        border-top: solid 1px #0000004f;
        display: flex;
        flex-wrap: wrap;
    }
    .chat-footer .chat-limit {
        background: white;
        color: black;
        margin-left: auto;
    }
    .chat-bubble pre, .chat-bubble code {
        background: aliceblue;
        overflow: hidden;
    }
    .chat-bubble pre {
        padding: 10px;
        position: relative;
    }
    .chat-bubble table {
        border-spacing: 2px;
        border-collapse: separate;
    }
    .chat-bubble th, .chat-bubble td {
        padding: 0.2em;
    }
    .chat-bubble tr:nth-child(2n), .chat-bubble th {
        background: aliceblue;
    }
    .chat-bubble th {
        background: antiquewhite;
    }
    .chat-bubble pre:after {
        content: '\uD83D\uDCCB';
        position: absolute;
        right: 0;;
        bottom: 0;
        font-size: 20px;
        cursor: pointer;
    }
    .chat-bubble pre.copied:after {
        content: '\u2714';
    }
    .chat-bubble p, .chat-bubble ul {
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
    }
    .chat-bubble ul {
        padding-inline-start: 0.5em;
    }
    .chat-bubble li {
        margin-block-start: 0.2em;
    }
    .chat-bubble ul li {
        list-style: inside;
    }
    .chat-bubble a {
        color: #123bb6;
        background: #d1dbfa;
        border-radius: 3px;
        margin: 0px 1px;
        padding: 0px 2px;
        font-size: 14px;
    }
    .chat-bubble a.chat-tooltip {
        background: none;
        color: initial;
        font-size: inherit;
        cursor: pointer;
        text-decoration-line: underline;
        text-decoration-color: #919191;
        text-decoration-style: dotted;
    }
    .chat-bubble a.chat-tooltip:hover {
        background: #E2E9FF;
    }
    div#chat-popup {
        position: fixed;
        background: #F3F3F3;
        padding: 10px;
        border-radius: 6px;
        max-width: 60%;
        z-index: 22;
        box-shadow: 0px 0.3px 0.9px#0000001f, 0px 1.6px 3.6px#00000029;
    }
    div#chat-popup a{
        padding: 10px;
        display: block;
        color: #000;
        text-decoration: none;
    }
    div#chat-popup a:hover {
        background: #fff;
    }
    .chat-container .hidden {
        display:none;
    }
    div#chat-popup * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .chat-bubble .chat-footer * {
        padding: 1px 8px;
        display: inline-block;
        margin-block-start: 6px;
        margin-inline-end: 6px;
        line-height: 18px;
    }
    .chat-item-left .chat-bubble{
        background-color: #fff;
        text-align: left;
    }
    .chat-item-right .chat-bubble{
        background-color: #9eea6a;
    }
    .chat-item{
        margin-top: 15px;
        display: flex;
        width: 100%;
    }
    .chat-item.chat-item-right{
        justify-content: flex-end;
    }
    .chat-item.chat-item-center{
        justify-content: center;
    }
    .chat-item.chat-item-split {
        height: 1px;
        border-top: solid 1px;
        padding: 20px;
        width: calc(100% - 40px);
    }
    .chat-item span{
        font-size: 12px;
        padding: 2px 4px;
        color: #fff;
        background-color: #dadada;
        border-radius: 3px;
    }
    .chat-input-area{
        border-top:0.5px solid #e0e0e0;
        height: 150px;
        display: flex;
        flex-flow: column;
        position: relative;
        background-color: #fff;
    }
    .chat-suggest-area {
        position: absolute;
        right: 20px;
        bottom: calc(100% + 4px);
        text-align: right;
        font-size: 14px;
        background: none;
    }
    .chat-suggest-area span {
        background: #ffffffb3;
        color: #174AE4;
        border: solid 1px #174AE4;
        line-height: 28px;
        border-radius: 8px;
        font-size: 14px;
        margin: 2px;
        padding: 0 10px;
        cursor: pointer;
        text-align: center;
        display: inline-block;
    }
    .chat-textarea {
        flex: 1;
        padding: 5px;
        font-size: 14px;
        border: none;
        overflow-y: auto;
        overflow-x: hidden;
        outline:none;
        resize:none;
    }
    .chat-button-area{
        display: flex;
        height: 32px;
        margin-right: 10px;
        line-height: 32px;
        padding: 5px;
        justify-content: flex-end;
    }
    .chat-button-area *{
        width: 66px;
        height: 26px;
        line-height: 26px;
        font-size: 13px;
        border: none;
        outline: none;
        border-radius: 4px;
        float: right;
        margin: 2px;
        cursor: pointer;
    }
    </style>
    `;

    function uuidv4() {
        var temp_url = URL.createObjectURL(new Blob());
        var uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
        URL.revokeObjectURL(temp_url);
        return uuid.substr(uuid.lastIndexOf("/") + 1);
    }

    // BingChat https://github.com/transitive-bullshit/bing-chat
    // MIT License
    // Copyright (c) 2023 Travis Fischer
    var terminalChar = "";
    var BingChat = class {
        constructor(opts) {
            const { cookie, debug = _debug, mode = "balance" } = opts;
            this._modes = {
                balance: "harmonyv3",
                precise: "h3precise",
                creative: "h3imaginative"
            };
            this._mode = mode;
            this._debug = !!debug;
        }
        getMode(mode) {
            this._mode = mode;
            return this._modes[mode] || this._modes.balance;
        }
        async sendMessage(text, opts = {}) {
            const {
                invocationId = "1",
                onProgress,
                locale = "zh-CN",
                market = "zh-CN",
                region = "CN",
                mode = this._mode,
                location
            } = opts;
            let { conversationId, clientId, conversationSignature } = opts;
            const isStartOfSession = !(conversationId && clientId && conversationSignature);
            if (isStartOfSession) {
                const conversation = await this.createConversation();
                conversationId = conversation.conversationId;
                clientId = conversation.clientId;
                conversationSignature = conversation.conversationSignature;
            }
            const result = {
                author: "bot",
                id: uuidv4(),
                conversationId,
                clientId,
                mode,
                conversationSignature,
                invocationId: `${parseInt(invocationId, 10) + 1}`,
                text: ""
            };
            const responseP = new Promise(
                async (resolve, reject) => {
                    const chatWebsocketUrl = "wss://sydney.bing.com/sydney/ChatHub";
                    const ws = new WebSocket(chatWebsocketUrl);
                    let isFulfilled = false;
                    let timer = setInterval(()=>ws.send(`{"type":6}${terminalChar}`), 10e3);;
                    let limit;
                    function cleanup() {
                        ws.close();
                        //ws.removeAllListeners();
                        clearInterval(timer);
                    }
                    ws.addEventListener("error", (error) => {
                        console.warn("WebSocket error:", error);
                        cleanup();
                        if (!isFulfilled) {
                            isFulfilled = true;
                            reject(new Error(`WebSocket error: ${error.toString()}`));
                        }
                    });
                    ws.addEventListener("close", () => {
                        if (!isFulfilled) {
                            isFulfilled = true;
                            reject(new Error(`Unexpected ended`));
                        }
                        cleanup();
                    });
                    ws.addEventListener("open", () => {
                        ws.send(`{"protocol":"json","version":1}${terminalChar}`);
                    });
                    let stage = 0;
                    ws.addEventListener("message", ({data}) => {
                        var _a;
                        const objects = data.toString().split(terminalChar);
                        const messages = objects.map((object) => {
                            try {
                                return JSON.parse(object);
                            } catch (error) {
                                return object;
                            }
                        }).filter(Boolean);
                        if (!messages.length) {
                            return;
                        }
                        if (stage === 0) {
                            ws.send(`{"type":6}${terminalChar}`);
                            const traceId = Math.random().toString(16).slice(-8);
                            const locationStr = location ? `lat:${location.lat};long:${location.lng};re=${location.re || "1000m"};` : void 0;
                            const params = {
                                arguments: [
                                    {
                                        source: "cib",
                                        optionsSets: [
                                            "nlu_direct_response_filter",
                                            "deepleo",
                                            "enable_debug_commands",
                                            "disable_emoji_spoken_text",
                                            "responsible_ai_policy_235",
                                            "enablemm",
                                            "jbf",
                                            "galileo",
                                            // "chathealthmon",
                                            this.getMode(mode),
                                            //"blocklistv2",
                                            "dv3sugg"
                                        ],
                                        allowedMessageTypes: [
                                            "Chat",
                                            "InternalSearchQuery",
                                            "InternalSearchResult",
                                            "InternalLoaderMessage",
                                            "RenderCardRequest",
                                            "AdsQuery",
                                            "SemanticSerp"
                                        ],
                                        sliceIds: [],
                                        traceId,
                                        isStartOfSession,
                                        message: {
                                            locale,
                                            market,
                                            region,
                                            location: locationStr,
                                            author: "user",
                                            inputMethod: "Keyboard",
                                            messageType: "Chat",
                                            text
                                        },
                                        conversationSignature,
                                        participant: { id: clientId },
                                        conversationId
                                    }
                                ],
                                invocationId,
                                target: "chat",
                                type: 4
                            };
                            if (this._debug) {
                                console.log(chatWebsocketUrl, JSON.stringify(params, null, 2));
                            }
                            ws.send(`${JSON.stringify(params)}${terminalChar}`);
                            ++stage;
                            return;
                        }
                        for (const message of messages) {
                            if (message.type === 1) {
                                const update = message;
                                let msg = update?.arguments?.[0]?.messages?.[0];
                                // if (!msg.messageType) {
                                if (msg) {
                                    result.author = msg.author;
                                    result.text = msg.text;
                                    result.detail = msg;
                                    result.throttling = msg.throttling = limit;
                                    result.messageType = msg.messageType;
                                    onProgress == null ? void 0 : onProgress(result);
                                }
                                else if (msg = update?.arguments?.[0]?.throttling) {
                                    limit = msg;
                                }
                            } else if (message.type === 2) {
                                const response = message;
                                if (this._debug) {
                                    console.log("RESPONSE", JSON.stringify(response, null, 2));
                                }
                                const validMessages = (_a = response.item.messages) == null ? void 0 : _a.filter(
                                    (m) => !m.messageType
                                );
                                const lastMessage = validMessages == null ? void 0 : validMessages[(validMessages == null ? void 0 : validMessages.length) - 1];
                                if (lastMessage) {
                                    lastMessage.throttling = response.item.throttling;
                                    lastMessage.firstNewMessageIndex = response.item.firstNewMessageIndex;
                                    lastMessage.conversationExpiryTime = response.item.conversationExpiryTime;
                                    result.conversationId = response.item.conversationId;
                                    result.conversationExpiryTime = response.item.conversationExpiryTime;
                                    result.author = lastMessage.author;
                                    result.text = lastMessage.text;
                                    result.detail = lastMessage;
                                    if (!isFulfilled) {
                                        isFulfilled = true;
                                        resolve(result);
                                    }
                                } else {
                                    if ((_a = response.item?.result) && (_a.error??_a.value)) reject(new Error(_a.error??_a.value, {cause: _a}));
                                }
                            } else if (message.type === 3) {
                                if (!isFulfilled) {
                                    isFulfilled = true;
                                    resolve(result);
                                }
                                cleanup();
                                return;
                            } else {
                            }
                        }
                    });
                }
            );
            return responseP;
        }
        async createConversation() {
            const requestId = uuidv4();
            return new Promise((resolve, reject)=>{
                GM_xmlhttpRequest({
                    url: "https://www.bing.com/turing/conversation/create",
                    headers: {
                        accept: "application/json",
                        referer: "https://www.bing.com/search",
                        "content-type": "application/json",
                        "sec-ch-ua": '"Not_A Brand";v="99", "Microsoft Edge";v="111", "Chromium";v="111"',
                        "sec-ch-ua-arch": '"x86"',
                        "sec-ch-ua-bitness": '"64"',
                        "sec-ch-ua-full-version": '"110.0.1587.41"',
                        "sec-ch-ua-full-version-list": '"Not_A Brand";v="111.0.0.0", "Microsoft Edge";v="110.0.1587.41", "Chromium";v="110.0.1587.41"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "",
                        "sec-ch-ua-platform": '"macOS"',
                        "sec-ch-ua-platform-version": '"12.6.0"',
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-edge-shopping-flag": "1",
                        "x-ms-client-request-id": requestId,
                        "x-forwarded-for" : "13.105.123.22",
                        "x-ms-useragent": "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/MacIntel",
                        "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41"
                    },
                    timeout: 15e3,
                    ontimeout: function(res){
                        reject(new Error('init connect timeout'));
                    },
                    onload: function(res){
                        if (res.status >= 200 && res.status < 300) {
                            try{
                                resolve(JSON.parse(res.responseText))
                            }
                            catch(e){
                                reject(new Error('init connect return error: ' + res.responseText));
                            }
                        }
                        reject(new Error('init connect error: ' + res.status, {cause: res}));
                    },
                    onerror: function(e) {
                        reject(new Error('init connect network error', {cause: e}));
                    }
                });
            });
            return fetch("/turing/conversation/create", {
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "sec-ch-ua": '"Not_A Brand";v="99", "Microsoft Edge";v="109", "Chromium";v="109"',
                    "sec-ch-ua-arch": '"x86"',
                    "sec-ch-ua-bitness": '"64"',
                    "sec-ch-ua-full-version": '"109.0.1518.78"',
                    "sec-ch-ua-full-version-list": '"Not_A Brand";v="99.0.0.0", "Microsoft Edge";v="109.0.1518.78", "Chromium";v="109.0.5414.120"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "",
                    "sec-ch-ua-platform": '"macOS"',
                    "sec-ch-ua-platform-version": '"12.6.0"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-edge-shopping-flag": "1",
                    "x-ms-client-request-id": requestId,
                    "x-ms-useragent": "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/MacIntel"
                },
                referrer: "https://www.bing.com/search",
                referrerPolicy: "origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "include"
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error(
                        `unexpected HTTP error createConversation ${res.status}: ${res.statusText}`
                    );
                }
            });
        }
    };

    class Chat {
        constructor(opts = {}) {
            const { onmessage, onanswer, onerror, debug = false, mode = localStorage._chatmode||"balance", restore } = opts;
            this._debug = debug;
            this._mode = {mode};
            this.onmessage = onmessage;
            this.onanswer = onanswer;
            this.onerror = onerror;
            this._bot = new BingChat({debug: this._debug>2, mode});
            if (restore) {
                this._session = localStorage._session??false;
            }
        }
        get lastMessage(){
            return this._session?.detail;
        }
        handleError(error) {
            if (this._debug) console.error(error);
            if (error.toString() == 'Error: WebSocket error: [object Event]') {
                if (this._errored) {
                    this._errored = false;
                }
                else if (this._lastSend){
                    this._errored = true;
                    if (this._debug) console.error(error, '正在重试');
                    this.send(this._lastSend);
                    return;
                }
            }
            if (this.onerror) this.onerror(error);
        }
        handleMessage(message, ended) {
            this._session = message;
            if (this._debug) console.log(message);
            let result = message.detail;
            if (ended) {
                if (this.onanswer) this.onanswer(result);
            }
            else {
                if (this.onmessage) this.onmessage(result);
            }
        }
        saveSession(del){
            if (del) delete localStorage._session;
            else localStorage._session = this._session;
        }
        setMode(mode = "balance") {
            this._mode = {mode};
            localStorage._chatmode = mode;
        }
        async send(message){
            this._lastSend = message;
            return this._bot
                .sendMessage(message, Object.assign({},this._session,this._mode,{onProgress: message=>this.handleMessage(message)}))
                .then(message=>this.handleMessage(message, true)).catch(e=>this.handleError(e));
        }
        on(action, handler){
            if (action == 'message') this.onmessage = handler;
            else if (action == 'answer') this.onanswer = handler;
            else if (action == 'error') this.onerror = handler;
        }
    }
    class MarkdownParser{
        constructor(type = 'markdownit'){
            this.type = type;
            if (type == 'markdownit') {
                this.md = markdownit({breaks:true})
                unsafeWindow.md = this.md;
                this.md.inline.ruler.push('custom_links', function (state) {
                    state.tokens.forEach((token, i)=>token.type == 'link_open' && token.attrSet('target', '_blank'));
                });
                var defaultTextRule = this.md.renderer.rules.text;
                this.md.renderer.rules.text = function(tokens, idx, options, env, self){
                    if (tokens[idx-1]?.type == 'link_open' && tokens[idx+1]?.type == 'link_close') {
                        tokens[idx].content = tokens[idx].content.replace(/^\^|\^$/g, '');
                    }
                    else if (tokens[idx+1]?.type == 'link_open') {
                        if (tokens[idx-1]?.type == 'link_close') {
                            if (tokens[idx].content.trim() === '') return '';
                        }
                        var text = tokens[idx].content.match(/^(.*(\s\.|。))*(.+)$/);
                        if (text && text[1]) {
                            tokens[idx].content = text[1];
                            var t1 = defaultTextRule(tokens, idx, options, env,self)
                            tokens[idx].content = text[3];
                            var t2 = defaultTextRule(tokens, idx, options, env,self)
                            return `${t1}<a class="chat-tooltip">${t2}</a>`;
                        }
                        return `<a class="chat-tooltip">${defaultTextRule(tokens, idx, options, env,self)}</a>`;
                    }
                    return defaultTextRule(tokens, idx, options, env, self);
                }
            } else if (type == 'showdown') {
                showdown.setFlavor('github');
                this.converter = new showdown.Converter({simplifiedAutoLink: false});
                this.converter = this.converter.makeHtml.bind(this.converter);
            } else if (type == 'marked') {
                this.converter = marked.parse.bind(marked);
            }
        }
        parseWithShowdown(markdown, args) {
            var used = [], codes = [];
            // var coding = !((html.split('```').length ?? 1) % 2);
            // if (coding) html += '\n```';
            return this.converter(markdown?.replace(/```.*?\n[\s\S]*?(\n```|\n`{0,3}$|$)/g, match=>{
                // let text = /^```.*?\n([\s\S]*?)(\n`{0,3})?$/.test(match);
                // codes.push(`<pre>${encodeHTML(RegExp.$1)}</pre>`);
                if (!match.endsWith('\n```')) match += '\n```';
                codes.push(this.converter(match));
                return '{{{CODE_PLACEHOLDER}}}';
            })?.replace(/</g, '&lt;'))?.replace(/[^\.。\]\[\n\>]*[\.\s。]*\[[\^\s]+?\d+[\s\^]+?\]/g, match=>{
                /([^\.。]*[\.。]?)\[[\^\s]+?(\d+)[\s\^]+?\]/.test(match);
                let text = RegExp.$1 ?? '', id = RegExp.$2, item;
                if ((item = used.findIndex(i=>i==id))>-1) item = args[item];
                else {
                    item = args?.[used.length];
                    if (item) used.push(id);
                }
                if (text = text.trim()) text = `<a class="chat-tooltip" target="_blank">${text}</a>`;
                if (item) return `${text}<a href="${item.seeMoreUrl}" title="${item.providerDisplayName}" target="_blank">${id}</a>`;
                return match;
            })?.replace(/{{{CODE_PLACEHOLDER}}}/g, ()=>codes.shift());
        }
        parseWithMarkdownit(markdown, args){
            return this.md.render(markdown, args);
        }
        parse(markdown, args) {
            switch(this.type){
                case 'marked': case 'showdown': return this.parseWithShowdown(markdown, args);
                case 'markdownit': return this.parseWithMarkdownit(markdown, args);
                default: throw new Error('unknow parser type');
            }
        }
    }

    function appendSend(message) {
        const div = document.createElement('div');
        div.className = "chat-item chat-item-right";
        div.innerHTML = `<div class="chat-bubble">${message}</div>`;
        containers.content.appendChild(div);
        containers.content.scrollTo(0, containers.content.scrollHeight);
    }
    function appendResponse(message, div) {
        if (!div) {
            div = document.createElement('div');
            div.className = "chat-item chat-item-left";
            containers.content.appendChild(div);
        }
        div.innerHTML = `<div class="chat-bubble">${message}</div>`;
        return div;
    }
    function appendAlert(message, position="center") {
        var bottom = containers.content.scrollTop + containers.content.offsetHeight == containers.content.scrollHeight;
        const div = document.createElement('div');
        div.className = `chat-item chat-item-${position}`;
        div.innerHTML = `<span>${message}</div>`;
        containers.content.appendChild(div);
        if (bottom) containers.content.scrollTo(0, containers.content.scrollHeight);
    }
    function appendSplit(message, topSplit = false) {
        var bottom = containers.content.scrollTop + containers.content.offsetHeight == containers.content.scrollHeight;
        if (!topSplit) appendAlert(message);
        const div = document.createElement('div');
        div.className = "chat-item chat-item-center chat-item-split";
        containers.content.appendChild(div);
        if (topSplit) appendAlert(message);
        if (bottom) containers.content.scrollTo(0, containers.content.scrollHeight);
    }
    function updateSuggest(suggests){
        containers.suggest.innerHTML = suggests? suggests.map(suggest=>`<span>${suggest.text}</span>`).join('') :'';
    }

    let containers, chat, converter, resultDiv, curtarget, encodeDiv;
    function createChat(){
        if (chat) {
            appendSplit(`已开始新聊天，以上为历史记录。`, true);
            chat.onanswer = chat.onmessage = chat.onerror = null;
            chat = new Chat({debug: _debug>1 && _debug});
        }
        else {
            chat = new Chat({restore:true, debug: _debug>1 && _debug});
            let message = chat.lastMessage;
            if (message) {
                parse(message, true);
                const date = new Date(message.conversationExpiryTime);
                if (date > new Date()) {
                    appendAlert('会话已恢复，以上为最后一个回复内容，如需开始新会话请点击重置');
                }
                else {
                    appendAlert(`已尝试恢复会话，以上为最后一个回复内容。但会话可能已于${date}过期，你可能需要重置会话`);
                }
            }
        }
        chat.onanswer = function(e){
            parse(e, true)
        };
        chat.onmessage = parse;
        chat.onerror = function(e){
            console.error(e);
            if (e.toString == 'Error: WebSocket error: [object Event]') e = '会话流断开，请重试';
            appendAlert(e);
        }
    }
    function encodeHTML(text) {
        if (!encodeDiv) encodeDiv = document.createElement('div');
        encodeDiv.innerText = text;
        return encodeDiv.innerHTML;
    }

    function parse(message, ended){
        if (_debug) console.log(message);
        var bottom = containers.content.scrollTop + containers.content.offsetHeight == containers.content.scrollHeight;
        if (!message) {
            appendAlert('Error: unexpected empty message');
        }
        else if (message.messageType) {
            if (message.text) appendAlert(message.text, 'left');
        }
        else {
            var html = converter.parse(message?.adaptiveCards?.[0]?.body?.[0]?.text ?? message?.text ?? '', message.sourceAttributions);
            var more = message.sourceAttributions?.length ?`<span>参考 </span>${message.sourceAttributions.map((link,id)=>{
                return `<a target="_blank" href="${link.seeMoreUrl}" title="${link.providerDisplayName}">${id+1}. ${new URL(link.seeMoreUrl).host.replace(/^www\./,'')}</a>`
            }).join('')}` : '';
            var limit = message.throttling;
            var ltxt = limit ? `<span class="chat-limit">${limit.numUserMessagesInConversation} / ${limit.maxNumUserMessagesInConversation}</span>` : '';
            resultDiv = appendResponse(`${html}${ended? '': ' ...'}<div class="chat-footer">${more}${ltxt}</div>`, resultDiv);
            updateSuggest(message.suggestedResponses);
            if (ended) {
                if (limit?.numUserMessagesInConversation && limit.numUserMessagesInConversation >= limit.maxNumUserMessagesInConversation) {
                    appendAlert('已达到对话限制，点击重置开始新话题');
                }
                else if (!message.firstNewMessageIndex) {
                    appendAlert('话题可能已经被强制结束，点击重置开始新话题');
                }
                resultDiv = null;
            }
        }
        if (bottom) containers.content.scrollTo(0, containers.content.scrollHeight);
    }
    function popup(event) {
        let target = event.target;
        if (target == containers.popup) return;
        else if (!target.classList.contains('chat-tooltip')) {
            containers.popup.classList.add('hidden');
        }
        else {
            if (target != curtarget) {
                const links = []
                curtarget = target;
                while(target.nextSibling instanceof HTMLAnchorElement) {
                    target = target.nextSibling;
                    if (target.classList.contains('chat-tooltip')) break;
                    links.push({title: target.title, url: target.href});
                }
                containers.popup.innerHTML = links.map(item=>`<a href="${item.url}" title="${item.title}" target="_blank"><div>${item.title}</div><div>${item.url}</div></a>`).join('');
            }
            containers.popup.classList.remove('hidden');
            containers.popup.style.left = '';
            containers.popup.style.right = '';
            let x = event.clientX, y = event.clientY, w = containers.popup.offsetWidth, bound = target.getBoundingClientRect(), top = bound.top + 17;
            // console.log(y, bound)
            // while (top < y) top += 19;
            containers.popup.style.top = top + 'px';
            if (w - x > 20 || x - w/2 < 0) containers.popup.style.left = '20px';
            else if (x + w - 40 > window.innerWidth) containers.popup.style.right = "20px";
            else containers.popup.style.left = x - w/2 + "px";
        }
    }
    function send(text){
        let input = (typeof text == "string" ? text : containers.input.value).trim();
        if (!input) return;
        containers.input.value = '';
        appendSend(input);
        resultDiv = null;
        if (!chat) chat = new Chat();
        chat.send(input);
        updateSuggest();
    }
    function initUI() {
        document.body.insertAdjacentHTML('afterbegin', UI);
        containers = Object.fromEntries(
            ["container","content", "input", "reset", "clear", "send", "alert", "save", "enable", "show", "hide", "suggest", "mode", "popup", "bottom", "resize"]
            .map(name=>([name, document.getElementById("chat-"+name)]))
        );
        containers.mode.value = localStorage._chatmode || 'balance';
        containers.input.onkeydown = function(e){
            if (e.code == "Enter" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                containers.send.click();
            }
        }
        containers.suggest.onclick = function({target}){
            send(target.textContent)
        }
        containers.save.onclick = function(ev){
            chat.saveSession(ev.ctrlKey);
            appendAlert(ev.ctrlKey ? '会话已删除' : '已保存会话');
            if (_debug) console.log(chat._session);
        }
        containers.mode.onchange = function(){
            chat.setMode(this.value);
        }
        containers.clear.onclick = function(){
            updateSuggest();
            containers.content.innerHTML = `<div class="chat-item chat-item-center"><span>已清空。</span></div>`;
        }
        containers.content.onclick = function(event){
            if (event.target.classList.contains('chat-item-right')) {
                return send(event.target.textContent);
            }
            if (event.target instanceof HTMLPreElement &&
                event.offsetY > event.target.clientHeight - 20 && event.offsetX > event.target.clientWidth - 20) {
                event.target.classList.add('copied');
                navigator.clipboard.writeText(event.target.textContent);
            }
        }
        function resize(ev){
            switch(ev.type) {
                case 'dblclick':
                    document.documentElement.classList.toggle('chat-fullscreen');
                    break;
                case 'mousedown':
                    document.documentElement.classList.remove('chat-fullscreen');
                    containers.container.startx = ev.pageX + containers.container.clientWidth;
                    document.body.classList.add('resizing');
                    document.body.addEventListener('mousemove', resize);
                    document.body.addEventListener('mouseup', resize);
                    break;
                case 'mouseup':
                    document.body.classList.remove('resizing');
                    document.body.removeEventListener('mousemove', resize);
                    document.body.removeEventListener('mouseup', resize);
                    break;
                case 'mousemove':
                    var x = containers.container.startx - ev.pageX;
                    if (x < 200) x = 200;
                    containers.container.style.width = x + 'px';
                    break;
                default:
                    break;
            }
        }
        containers.resize.onmousedown = containers.resize.ondblclick = containers.show.ondblclick = resize;
        containers.show.onclick = function(){
            document.documentElement.classList.toggle('chat-active');
        }
        containers.bottom.ondblclick = ()=>{
            _debug = !_debug;
            containers.save.classList.toggle('hidden');
        }
        containers.reset.onclick = createChat;
        containers.send.onclick = send;
        containers.content.onmouseover = popup;
    }
    function initChat(){
        converter = new MarkdownParser();
        createChat();
        if (localStorage._samples) localStorage._samples.forEach(item=>parse(item.detail??item, true));
        setTimeout(()=>document.documentElement.classList.add('chat-active'));
        document.addEventListener('mouseup', function(event){
            if (!event.ctrlKey) return;
            var selection = document.getSelection();
            if (containers.input.parentNode == selection.focusNode) return;
            var text = selection.toString();
            if (text && event.ctrlKey) {
                if(event.shiftKey) containers.input.value = text;
                else containers.input.value += text;
            }
        });
    }
    function init(){
        document.body.insertAdjacentHTML('afterbegin', ICON);
        document.getElementById('chat-show').onclick = function(){
            initUI();
            initChat();
        }
    }
    init();
})();