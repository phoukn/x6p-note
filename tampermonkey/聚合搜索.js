// ==UserScript==
// @name         移动端聚合搜索引擎导航 SearchSwitcher
// @namespace    Violentmonkey Scripts
// @version      1.4.3
// @author       artificial intelligence
// @license      MIT
// @description  移动端搜索引擎切换，支持自定义隐藏、排序、展开、半悬浮和滚动隐藏。
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const searchEngines = {
        Google: {
            name: 'Google',
            icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
            url: 'https://www.google.com/search?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)google\.[a-z.]+$/i
        },
        Baidu: {
            name: '百度',
            icon: 'https://www.google.com/s2/favicons?domain=baidu.com&sz=64',
            url: 'https://www.baidu.com/s?word=',
            parameter: 'word|wd',
            hostnameRegex: /(^|\.)baidu\.com$/i
        },
        Bing: {
            name: 'Bing',
            icon: 'https://www.google.com/s2/favicons?domain=bing.com&sz=64',
            url: 'https://cn.bing.com/search?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)bing\.com$/i
        },
        Zhihu: {
            name: '知乎',
            icon: 'https://www.google.com/s2/favicons?domain=zhihu.com&sz=64',
            url: 'https://www.zhihu.com/search?type=content&q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)zhihu\.com$/i
        },
        Yandex: {
            name: 'Yandex',
            icon: 'https://www.google.com/s2/favicons?domain=yandex.com&sz=64',
            url: 'https://yandex.com/search/?text=',
            parameter: 'text',
            hostnameRegex: /(^|\.)yandex\.[a-z.]+$/i
        },
        KuaKe: {
            name: '夸克',
            icon: 'https://www.google.com/s2/favicons?domain=quark.sm.cn&sz=64',
            url: 'https://quark.sm.cn/s?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)quark\.sm\.cn$/i
        },
        QiHu360: {
            name: '360',
            icon: 'https://www.google.com/s2/favicons?domain=so.com&sz=64',
            url: 'https://m.so.com/s?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)so\.com$/i
        },
        SouGou: {
            name: '搜狗',
            icon: 'https://www.google.com/s2/favicons?domain=sogou.com&sz=64',
            url: 'https://m.sogou.com/web/searchList.jsp?keyword=',
            parameter: 'keyword|query',
            hostnameRegex: /(^|\.)sogou\.com$/i
        },
        WeiXin: {
            name: '微信',
            icon: 'https://www.google.com/s2/favicons?domain=weixin.sogou.com&sz=64',
            url: 'https://weixin.sogou.com/weixinwap?type=2&query=',
            parameter: 'query',
            hostnameRegex: /(^|\.)weixin\.sogou\.com$/i
        },
        TouTiao: {
            name: '头条',
            icon: 'https://www.google.com/s2/favicons?domain=so.toutiao.com&sz=64',
            url: 'https://so.toutiao.com/search?keyword=',
            parameter: 'keyword',
            hostnameRegex: /(^|\.)so\.toutiao\.com$/i
        },
        ShenMa: {
            name: '神马',
            icon: 'https://www.google.com/s2/favicons?domain=sm.cn&sz=64',
            url: 'https://m.sm.cn/s?from=smor&safe=1&q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)sm\.cn$/i
        },
        DuckDuckGo: {
            name: 'DuckDuckGo',
            icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=64',
            url: 'https://duckduckgo.com/?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)duckduckgo\.com$/i
        },
        Bilibili: {
            name: 'B站',
            icon: 'https://www.google.com/s2/favicons?domain=bilibili.com&sz=64',
            url: 'https://m.bilibili.com/search?keyword=',
            parameter: 'keyword',
            hostnameRegex: /(^|\.)bilibili\.com$/i
        },
        Yuanbao: {
            name: '元宝',
            icon: 'https://www.google.com/s2/favicons?domain=so.qq.com&sz=64',
            url: 'https://so.qq.com/isearch?query=',
            parameter: 'query|q|wd',
            hostnameRegex: /(^|\.)so\.qq\.com$/i
        },
        Brave: {
            name: 'Brave',
            icon: 'https://www.google.com/s2/favicons?domain=search.brave.com&sz=64',
            url: 'https://search.brave.com/search?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)search\.brave\.com$/i
        },
        Startpage: {
            name: 'Startpage',
            icon: 'https://www.google.com/s2/favicons?domain=startpage.com&sz=64',
            url: 'https://www.startpage.com/sp/search?query=',
            parameter: 'query',
            hostnameRegex: /(^|\.)startpage\.com$/i
        },
        Yahoo: {
            name: 'Yahoo',
            icon: 'https://www.google.com/s2/favicons?domain=search.yahoo.com&sz=64',
            url: 'https://search.yahoo.com/search?p=',
            parameter: 'p',
            hostnameRegex: /(^|\.)search\.yahoo\.com$/i
        },
        Mojeek: {
            name: 'Mojeek',
            icon: 'https://www.google.com/s2/favicons?domain=mojeek.com&sz=64',
            url: 'https://www.mojeek.com/search?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)mojeek\.com$/i
        },
        Qwant: {
            name: 'Qwant',
            icon: 'https://www.google.com/s2/favicons?domain=qwant.com&sz=64',
            url: 'https://www.qwant.com/?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)qwant\.com$/i
        },
        Ecosia: {
            name: 'Ecosia',
            icon: 'https://www.google.com/s2/favicons?domain=ecosia.org&sz=64',
            url: 'https://www.ecosia.org/search?q=',
            parameter: 'q',
            hostnameRegex: /(^|\.)ecosia\.org$/i
        }
    };

    const get = (key, fallback) => GM_getValue(key, fallback);
    const set = (key, value) => GM_setValue(key, value);

    const hostname = location.hostname;
    const currentEngine = Object.keys(searchEngines)
        .find(
    key => searchEngines[key].hostnameRegex.test(hostname));

    if (!currentEngine) return;

    const engine = searchEngines[currentEngine];

    function getQuery() {
        const params = new URLSearchParams(location.search);

        for (const key of engine.parameter.split('|')) {
            const value = params.get(key);
            if (value) return value;
        }

        return '';
    }

    const query = getQuery();
    if (!query) return;

    let engineOrder = get('engineOrder', Object.keys(searchEngines));
    let hiddenStates = get('hiddenStates', {});

    Object.keys(searchEngines)
        .forEach(key => {
        if (!engineOrder.includes(key)) engineOrder.push(key);
    });

    engineOrder = engineOrder.filter(key => searchEngines[key]);

    set('engineOrder', engineOrder);

    const style = document.createElement('style');

    style.textContent = `
    #searchengine_container {
      width: 100vw !important;
      max-width: 100vw !important;
      box-sizing: border-box !important;
      padding: 5px 5px !important;
      margin: 5px 0 10px !important;
      text-align: left !important;
      font-size: 0 !important;
      overflow-x: auto;
      overflow-y: visible;
      white-space: nowrap;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      z-index: 10000;
      background: transparent;
      transition: transform .3s ease, opacity .3s ease;
    }

    #searchengine_container::-webkit-scrollbar {
      display: none;
    }

    #searchengine_container.ss-expanded {
      white-space: normal;
      overflow: visible;
    }

    #searchengine_container .ss-engine {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      min-height: 35px;
      box-sizing: border-box;
      padding: 5px 9px;
      margin: 5px;
      border-radius: 14px;
      background: #DEEDFF;
      color: #172B4D;
      font-size: 16px;
      line-height: 25px;
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    #searchengine_container .ss-engine:active {
      opacity: .65;
    }

    #searchengine_container .ss-engine img {
      display: block;
      width: 22px;
      height: 22px;
      object-fit: contain;
      margin-right: 5px;
      flex-shrink: 0;
    }

    #searchengine_container .ss-settings {
      background: #e5e5e5;
      color: #172B4D;
    }

    #searchengine_top_container {
      position: relative;
      z-index: 10000;
      width: 100%;
      height: 0;
    }

    #searchengine_container.ss-floating {
      position: fixed !important;
      left: 0 !important;
      top: 0;
      margin: 0 !important;
      background: rgba(255,255,255,.96);
      box-shadow: 0 2px 8px rgba(0,0,0,.12);
      transition: transform .3s ease, opacity .3s ease, top .15s ease;
    }

    #settings_dialog {
      display: none;
      position: fixed;
      z-index: 100001;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      width: min(92vw, 520px);
      max-height: 82vh;
      overflow-y: auto;
      padding: 16px;
      box-sizing: border-box;
      border-radius: 14px;
      background: #fff;
      color: #222;
      box-shadow: 0 5px 30px rgba(0,0,0,.3);
      font-size: 14px;
      white-space: normal;
    }

    #settings_dialog .ss-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    #settings_dialog .ss-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px;
      margin: 5px 0;
      border-radius: 7px;
      background: #f1f6fc;
    }

    #settings_dialog .ss-row.ss-hidden {
      opacity: .55;
    }

    #settings_dialog .ss-row .ss-name {
      flex: 1;
      min-width: 0;
    }

    #settings_dialog button {
      border: 0;
      border-radius: 6px;
      padding: 6px 9px;
      background: #1677ff;
      color: white;
      font-size: 13px;
    }

    #settings_dialog button:disabled {
      opacity: .3;
    }

    #settings_dialog .ss-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 14px 0;
    }

    #settings_dialog .ss-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 14px;
    }

    #settings_dialog .ss-tips {
      margin-top: 12px;
      color: #777;
      font-size: 12px;
    }
  `;

    document.documentElement.appendChild(style);

    const container = document.createElement('div');
    container.id = 'searchengine_container';

    if (get('expandSearchEngineChecked', false)) {
        container.classList.add('ss-expanded');
    }

    const floatChecked = get('floatChecked', false);
    const hideOnScroll = get('hideOnScrollCheckboxed', false);

    if (floatChecked || hideOnScroll) {
        container.classList.add('ss-floating');
    }

    function setIcon(img, domain, name) {
        const fallback = () => {
            img.onerror = null;
            img.removeAttribute('src');
            img.style.display = 'none';

            const letter = document.createElement('span');
            letter.textContent = name.slice(0, 1);
            letter.style.cssText =
                'width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border-radius:5px;background:#fff;color:#1677ff;font-weight:bold;font-size:16px;margin-right:5px';

            img.replaceWith(letter);
        };

        img.onerror = () => {
            img.onerror = fallback;
            img.src = 'https://icons.duckduckgo.com/ip3/' + domain + '.ico';
        };

        img.src =
            'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64';
    }

    function createEngineButton(key) {
        const item = searchEngines[key];

        if (!item || hiddenStates[key] || key === currentEngine) {
            return null;
        }

        const button = document.createElement('a');
        button.className = 'ss-engine';
        button.href = item.url + encodeURIComponent(query);
        button.title = item.name;

        const icon = document.createElement('img');
        icon.alt = '';
        icon.loading = 'lazy';

        setIcon(icon, new URL(item.url)
            .hostname, item.name);

        const text = document.createElement('span');
        text.textContent = item.name;

        button.append(icon, text);

        return button;
    }

    function renderEngines() {
        container.replaceChildren();

        engineOrder.forEach(key => {
            const button = createEngineButton(key);
            if (button) container.appendChild(button);
        });

        const settingsButton = document.createElement('button');
        settingsButton.className = 'ss-engine ss-settings';
        settingsButton.type = 'button';
        settingsButton.textContent = '⚙ 设置';

        settingsButton.addEventListener('click', openSettings);
        container.appendChild(settingsButton);
    }

    const dialog = document.createElement('div');
    dialog.id = 'settings_dialog';

    function openSettings() {
        renderSettings();
        dialog.style.display = 'block';
    }

    function renderSettings() {
        dialog.replaceChildren();

        const title = document.createElement('div');
        title.className = 'ss-title';
        title.textContent = '搜索引擎设置';
        dialog.appendChild(title);

        const list = document.createElement('div');

        engineOrder.forEach((key, index) => {
            const item = searchEngines[key];
            if (!item) return;

            const row = document.createElement('div');
            row.className = 'ss-row' + (hiddenStates[key] ? ' ss-hidden' : '');

            const name = document.createElement('span');
            name.className = 'ss-name';
            name.textContent = item.name;

            const toggle = document.createElement('button');
            toggle.textContent = hiddenStates[key] ? '显示' : '隐藏';

            toggle.addEventListener('click', () => {
                hiddenStates[key] = !hiddenStates[key];
                renderSettings();
            });

            const up = document.createElement('button');
            up.textContent = '↑';
            up.disabled = index === 0;

            up.addEventListener('click', () => {
                [engineOrder[index - 1], engineOrder[index]] = [engineOrder[index], engineOrder[index - 1]];
                renderSettings();
            });

            const down = document.createElement('button');
            down.textContent = '↓';
            down.disabled = index === engineOrder.length - 1;

            down.addEventListener('click', () => {
                [engineOrder[index + 1], engineOrder[index]] = [engineOrder[index], engineOrder[index + 1]];
                renderSettings();
            });

            row.append(name, toggle, up, down);
            list.appendChild(row);
        });

        dialog.appendChild(list);

        const options = document.createElement('div');
        options.className = 'ss-options';

        function checkbox(label, key, value) {
            const wrapper = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = value;
            input.dataset.key = key;
            wrapper.append(input, document.createTextNode(' ' + label));
            return {
                wrapper, input
            };
        }

        const expand = checkbox(
            '展开搜索引擎',
            'expandSearchEngineChecked',
        get('expandSearchEngineChecked', false));

        const floating = checkbox(
            '半悬浮在顶部',
            'floatChecked',
        floatChecked);

        const scrolling = checkbox(
            '向下滚动时隐藏',
            'hideOnScrollCheckboxed',
        hideOnScroll);

        floating.input.addEventListener('change', () => {
            if (floating.input.checked) scrolling.input.checked = false;
        });

        scrolling.input.addEventListener('change', () => {
            if (scrolling.input.checked) floating.input.checked = false;
        });

        options.append(
        expand.wrapper,
        floating.wrapper,
        scrolling.wrapper);

        dialog.appendChild(options);

        const tips = document.createElement('div');
        tips.className = 'ss-tips';
        tips.textContent =
            '开启悬浮模式后，向上滑动搜索引擎栏可以将其关闭。';
        dialog.appendChild(tips);

        const actions = document.createElement('div');
        actions.className = 'ss-actions';

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        cancel.addEventListener('click', () => {
            dialog.style.display = 'none';
        });

        const save = document.createElement('button');
        save.textContent = '保存';

        save.addEventListener('click', () => {
            const visible = engineOrder.filter(
            key => !hiddenStates[key]);

            if (visible.length < 2) {
                alert('必须至少显示两个搜索引擎。');
                return;
            }

            set('engineOrder', engineOrder);
            set('hiddenStates', hiddenStates);
            set('expandSearchEngineChecked', expand.input.checked);
            set('floatChecked', floating.input.checked);
            set('hideOnScrollCheckboxed', scrolling.input.checked);

            alert('刷新页面生效。');
            dialog.style.display = 'none';
        });

        actions.append(cancel, save);
        dialog.appendChild(actions);
    }

    document.body.appendChild(dialog);

    renderEngines();

    // Google 搜索框识别
    function findGoogleSearchBox() {
        const selectors = [
            'form[role="search"]',
            'form:has(input[name="q"])',
            'form:has(textarea[name="q"])',
            'form:has(input[aria-label*="Search"])',
            'form:has(textarea[aria-label*="Search"])',
            '#searchform'];

        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.getBoundingClientRect()
                    .height > 0) {
                    return element;
                }
            } catch (_) {}
        }

        return null;
    }

    function isFixedOrSticky(element) {
        if (!element) return false;

        let current = element;

        while (current && current !== document.body) {
            const position = getComputedStyle(current)
                .position;

            if (position === 'fixed' || position === 'sticky') {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }

    function updateGoogleFloatingPosition() {
        if (!container.classList.contains('ss-floating')) return;

        const searchBox = findGoogleSearchBox();

        if (searchBox && isFixedOrSticky(searchBox)) {
            const rect = searchBox.getBoundingClientRect();

            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                container.style.top = Math.max(0, rect.bottom) + 'px';
                return;
            }
        }

        container.style.top = '0px';
    }

    // 普通模式插入位置
    function insertNormal() {
        if (currentEngine === 'Bing') {
            const selectors = [
                '#sb_form',
                'form#sb_form',
                'form[role="search"]',
                'form:has(input[name="q"])',
                'form:has(input[type="search"])'];

            for (const selector of selectors) {
                try {
                    const searchBox = document.querySelector(selector);

                    if (
                    searchBox && searchBox.getBoundingClientRect()
                        .height > 0) {
                        searchBox.insertAdjacentElement('afterend', container);
                        return true;
                    }
                } catch (_) {}
            }

            const header = document.querySelector('#b_header');

            if (header) {
                header.appendChild(container);
                return true;
            }
        }
        if (currentEngine === 'Google') {
            const searchBox = findGoogleSearchBox();

            if (searchBox && searchBox.parentNode) {
                searchBox.insertAdjacentElement('afterend', container);
                return true;
            }

            const fallback = document.querySelector(
                '#search, #rso, main, [role="main"]');

            if (fallback && fallback.parentNode) {
                fallback.parentNode.insertBefore(container, fallback);
                return true;
            }
        }

        const selectors = {
            Baidu: ['#page-hd'],
            Bing: [],
            Zhihu: ['#SearchMain', 'main'],
            Yandex: ['main'],
            KuaKe: ['#page-channel-tab'],
            QiHu360: ['header'],
            SouGou: ['#mainBody', 'header'],
            WeiXin: ['.hhy-navcontainer'],
            TouTiao: ['#head-bar', 'header'],
            ShenMa: ['#header'],
            DuckDuckGo: ['#header', 'header'],
            Bilibili: ['.order-tabs', 'header']
        };

        const candidates = selectors[currentEngine] || [
            'main',
            'header',
            '[role="main"]'];

        for (const selector of candidates) {
            const target = document.querySelector(selector);

            if (!target) continue;

            if (
            selector === '#page-hd' || selector === '#header' || selector === '.hhy-navcontainer') {
                target.appendChild(container);
            } else {
                target.parentNode.insertBefore(container, target);
            }

            return true;
        }

        document.body.prepend(container);
        return true;
    }

    // 悬浮模式
    function insertFloating() {
        container.classList.add('ss-floating');
        document.body.appendChild(container);

        if (currentEngine === 'Google') {
            updateGoogleFloatingPosition();
        } else {
            container.style.top = '0px';
        }
    }

    // 滑动隐藏
    let startX = 0;
    let startY = 0;
    let dismissed = false;

    container.addEventListener('touchstart', event => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    }, {
        passive: true
    });

    container.addEventListener('touchend', event => {
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;

        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -35) {
            dismissed = true;
            container.style.transform = 'translateY(-110%)';
            container.style.opacity = '0';
        }
    }, {
        passive: true
    });

    // 页面滚动行为
    let lastScrollY = window.scrollY;
    let scrollTimer = null;

    function updateScroll() {
        if (!container.isConnected) return;

        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;

        if (currentEngine === 'Google' && floatChecked) {
            updateGoogleFloatingPosition();
        }

        if (dismissed) {
            lastScrollY = currentY;
            return;
        }

        if (floatChecked) {
            if (currentY > 25 && delta > 0) {
                container.style.transform = 'translateY(calc(-100% + 30px))';
                container.style.opacity = '.65';
            } else if (delta < 0 || currentY <= 25) {
                container.style.transform = 'translateY(0)';
                container.style.opacity = '1';
            }
        } else if (hideOnScroll) {
            if (currentY > 15 && delta > 0) {
                container.style.transform = 'translateY(calc(-100% + 30px))';
                container.style.opacity = '.65';
            } else if (delta < 0 || currentY <= 15) {
                container.style.transform = 'translateY(0)';
                container.style.opacity = '1';
            }
        }

        lastScrollY = currentY;

        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(() => {
            if (!dismissed && window.scrollY <= 25) {
                container.style.transform = 'translateY(0)';
                container.style.opacity = '1';
            }
        }, 250);
    }

    window.addEventListener('scroll', updateScroll, {
        passive: true
    });
    window.addEventListener('resize', updateGoogleFloatingPosition);

    // 初始化
    function initialize() {
        if (floatChecked || hideOnScroll) {
            insertFloating();
        } else {
            insertNormal();
        }

        updateGoogleFloatingPosition();
        updateScroll();
    }

    // 等待动态页面元素加载
    let attempts = 0;

    const observer = new MutationObserver(() => {
        if (container.isConnected) {
            if (currentEngine === 'Google' && floatChecked) {
                updateGoogleFloatingPosition();
            }
            return;
        }

        if (attempts++ < 30) {
            initialize();
        }
    });

    initialize();

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

})();