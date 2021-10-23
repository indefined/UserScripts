Bilibili App首页API
=========================

[脚本仓库](https://github.com/indefined/UserScripts)


-------------------------
## 获取首页内容
Host: app.bilibili.com

Methor: GET

Path: /x/v2/feed/index

Cookie: 使用access_key 鉴权，cookie非必要

#### QueryString

与之前相比差不多，只有`access_key`为必选项
|字段|必选|类型|说明|
|----|----|----|----|
|build|true|int|app版本号，不发送此字段将返回-400错误|
|access_key|true*|hexString*32|使用[OAuth2接口](https://github.com/czp3009/bilibili-api/blob/d08d1fbd8c26d2b6192e6a0cc420f0cc2332dc5d/src/main/java/com/hiczp/bilibili/api/BilibiliSecurityHelper.java#L134)登录获取到的accessToken。在20180727后不带该参数获取到的数据将和个人账户无关，之前网页端登陆cookie有效该参数非必要。**使用OAuth2获取到的token权限较高请小心保存以免给账户带来安全隐患。**|
|mobi_app|false|string|APP标识，不带该参数可正常获取数据，已知使用android标识在5000000以下build不会返回banner、广告、文章、直播内容|
|----|----|----|以下参数在目前(20180801)使用中非必要且没有意义或功能未知|
|ad_extra|false|hexString|如果使用会返回广告的mobi_app和build，app会上传该参数与之前获取到的广告里的参数值想对应，作用未知或许是提交点击率的|
|appkey|false|hexString|与app标识相对应的硬编码字符串，可自行抓包|
|banner_hash|false|hexString|如果使用会返回广告的mobi_app和build，上传的banner_hash如果是最新的则服务器不会返回banner|
|idx|false|int|返回的视频数据idx会以该数据为下标递增，不发送则返回的数据以当前10位时间戳为下标开始，作用未知|
|login_event|false|未知|未知|
|network|false|string|设备使用网络类型，作用未知，似乎返回数据并不会有什么区别|
|open_event|false|未知|未知|
|platform|false|string|设备平台，作用未知|
|pull|false|bool|作用未知|
|qn|false|int|未知|
|style|false|int|未知|
|ts|false|int|当前时间10位时间戳|
|sign|false|hexString*32|如果app完整鉴权被启用，需要使用[签名方法](https://github.com/czp3009/bilibili-api/blob/d08d1fbd8c26d2b6192e6a0cc420f0cc2332dc5d/src/main/java/com/hiczp/bilibili/api/BilibiliSecurityHelper.java#L80)对所有使用到的查询参数进行摘要后获得签名值并附在参数最后发送。当前该接口未启用完整app鉴权，但考虑到已经提升过一次鉴权了以后可能会使用|

#### 返回

|返回值字段|字段类型|字段说明|
|----------|--------|--------|
|code|int|为0表示执行成功，非0表示失败|
|message|string|code非0时此字段表示详细错误信息|
|ttl|int|未知|
|data|Object|和之前不同，主要数据在data.items|


