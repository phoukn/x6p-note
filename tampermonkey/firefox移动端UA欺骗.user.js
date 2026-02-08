// ==UserScript==
// @name         🔗 国内APP跳转修复（轻量版）
// @namespace    https://github.com/yourname
// @version      2.0
// @description  安卓Firefox访问国内主流APP网站时无法跳转？本脚本仅伪装vendor字段，不修改UA字符串，侵入性最低！
// @author       You
// @match        *://*.taobao.com/*
// @match        *://*.tmall.com/*
// @match        *://*.taobao.com.cn/*
// @match        *://*.meituan.com/*
// @match        *://*.maoyan.com/*
// @match        *://*.dianping.com/*
// @match        *://*.dpurl.cn/*
// @match        *://*.zhihu.com/*
// @match        *://*.pan.baidu.com/*
// @match        *://*.yun.baidu.com/*
// @match        *://*.jd.com/*
// @match        *://*.jingdong.com/*
// @match        *://*.weibo.com/*
// @match        *://*.weibo.cn/*
// @match        *://*.alipay.com/*
// @match        *://*.douyin.com/*
// @match        *://*.kuaishou.com/*
// @match        *://*.pinduoduo.com/*
// @match        *://*.xiaohongshu.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.music.163.com/*
// @match        *://*.qq.com/*
// @match        *://*.ele.me/*
// @match        *://*.ele.to/*
// @match        *://*.didi.cn/*
// @match        *://*.didichuxing.com/*
// @match        *://*.toutiao.com/*
// @match        *://*.v.qq.com/*
// @match        *://*.iqiyi.com/*
// @match        *://*.youku.com/*
// @match        *://*.mgtv.com/*
// @match        *://*.xmly.com/*
// @match        *://*.dewu.com/*
// @match        *://*.vip.com/*
// @match        *://*.suning.com/*
// @match        *://*.gome.com.cn/*
// @match        *://*.mogujie.com/*
// @match        *://*.ke.com/*
// @match        *://*.lianjia.com/*
// @match        *://*.58.com/*
// @match        *://*.ganji.com/*
// @match        *://*.autohome.com.cn/*
// @match        *://*.yiche.com/*
// @match        *://*.qunar.com/*
// @match        *://*.ctrip.com/*
// @match        *://*.ly.com/*
// @match        *://*.fliggy.com/*
// @match        *://*.mafengwo.cn/*
// @run-at       document-start
// @grant        none
// @icon         https://www.taobao.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // ===== 0. 浏览器检测（仅安卓端生效）=====
    const ua = navigator.userAgent;
    if (!/Android/.test(ua) || !/Firefox/.test(ua)) {
        console.log('[AppJumpFix] 非安卓Firefox，脚本已跳过');
        return;
    }

    // ===== 1. 仅修改 vendor 字段 =====
    // 多数国内网站用此字段快速判断是否 Chromium 内核
    try {
        Object.defineProperty(navigator, 'vendor', {
            get: () => 'Google Inc.',
            configurable: true,
            enumerable: true
        });
        console.log('[AppJumpFix] ✅ 已伪装 vendor = Google Inc.（UA保持原样）');
    } catch (e) {
        console.warn('[AppJumpFix] ⚠️ 无法修改 vendor:', e.message);
    }
})();
