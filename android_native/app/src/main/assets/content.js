/* global chrome */
console.log("%c NoShort Multi: Script Starting... ", "background: #333; color: #fff; padding: 2px 5px;");

let config = {
    ig_hideReelsPage: true, ig_redirectUrl: "/direct/inbox/",
    ig_hideVideos: true, ig_hidePhotos: true, ig_hideSidebarAndRec: false, ig_hideFeed: true,
    ig_hideHomeTab: false, ig_hideExploreTab: true, ig_hideReelsTab: true, ig_hideStories: false,
    ig_hideNumbers: false, ig_grayscaleMode: false,
    yt_hideShorts: true, yt_blurThumbnails: false, yt_hideHome: true, yt_hideSidebar: true,
    yt_hideHeader: false, yt_hideNotifications: false, yt_hideComments: true, yt_hideRelated: true,
    yt_hidePlaylist: false, yt_hideSubs: false, yt_hideYou: false, yt_hideExplore: false,
    yt_hideYou: false, yt_hideExplore: false,
    yt_hard_block_enabled: false, yt_hard_block_start: "09:00", yt_hard_block_end: "18:00",
    block_yt: true, block_ig: false,
    soft_reminders_enabled: false, soft_reminders_interval: 15
};

const i18nContent = {
    "en": { "focus": "It's Focus Time!", "restrict": "This site is restricted until {time}" },
    "ko": { "focus": "집중 시간입니다!", "restrict": "이 사이트가 {time}까지 제한됩니다" },
    "ja": { "focus": "集中する時間です！", "restrict": "このサイトは{time}まで制限されています" },
    "zh_CN": { "focus": "现在是专注时间！", "restrict": "该网站已限制访问，直至 {time}" },
    "hi": { "focus": "यह फोकस समय है!", "restrict": "यह 사이트 {time} तक प्रतिबंधित है" }
};

function getI18n(key) {
    const lang = navigator.language.split('-')[0];
    const data = i18nContent[lang] || i18nContent['en'];
    return data[key] || key;
}

const reminderTexts = {
    'ko': '지금 무엇을 하고 계신가요?',
    'en': 'What are you doing right now?',
    'ja': '今、何をしていますか？',
    'zh_CN': '你现在在做什么？',
    'hi': 'आप अभी क्या कर रहे हैं?'
};

function getReminderMessage() {
    const lang = navigator.language.split('-')[0];
    return reminderTexts[lang] || reminderTexts['en'];
}

let reminderTimer = null;
let lastReminderTime = Date.now();

const quotes = [
    "The future depends on what we do in the present.",
    "Regret for wasted time is more wasted time.",
    "Live in the moment.",
    "Lost time is never found again.",
    "Your time is limited, so don't waste it.",
    "Time stays long enough for those who use it.",
    "Focus on what matters.",
    "Disconnect to Reconnect.",
    "Life is happening right now, outside of this screen.",
    "Stop scrolling, start living."
];

function loadConfig() {
    console.log("NoShort: loadConfig called");
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(config, (items) => {
                console.log("NoShort: Storage Loaded", items);
                config = { ...config, ...items };
                applyConfig();
                startLogic();
            });
        } else {
            console.log("NoShort: No chrome.storage, using default");
            applyConfig();
            startLogic();
        }
    } catch (e) {
        console.error("NoShort: Error in loadConfig", e);
        applyConfig();
        startLogic();
    }
}

function startLogic() {
    const hostname = window.location.hostname;
    console.log("NoShort: startLogic for", hostname);
    if (hostname.includes("instagram.com")) {
        runInstagramLogic();
    } else if (hostname.includes("youtube.com")) {
        runYouTubeLogic();
    }
}

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            for (let key in changes) config[key] = changes[key].newValue;
            applyConfig();
        }
    });
}







function applyConfig() {
    console.log("NoShort: applyConfig called");
    const html = document.documentElement;
    const hostname = window.location.hostname;

    const configClasses = {
        'ns-ig-photos': config.ig_hidePhotos,
        'ns-ig-sidebar-rec': config.ig_hideSidebarAndRec,
        'ns-ig-feed': config.ig_hideFeed,
        'ns-ig-videos': config.ig_hideVideos,
        'ns-ig-home': config.ig_hideHomeTab,
        'ns-ig-explore': config.ig_hideExploreTab,
        'ns-ig-reels': config.ig_hideReelsTab,
        'ns-ig-stories': config.ig_hideStories,
        'ns-ig-numbers': config.ig_hideNumbers,
        'ns-grayscale': config.ig_grayscaleMode,
        'ns-yt-shorts': config.yt_hideShorts,
        'ns-yt-home': config.yt_hideHome,
        'ns-yt-sidebar': config.yt_hideSidebar,
        'ns-yt-header': config.yt_hideHeader,
        'ns-yt-notifications': config.yt_hideNotifications,
        'ns-yt-comments': config.yt_hideComments,
        'ns-yt-related': config.yt_hideRelated,
        'ns-yt-playlist': config.yt_hidePlaylist,
        'ns-yt-subs': config.yt_hideSubs,
        'ns-yt-you': config.yt_hideYou,
        'ns-yt-explore': config.yt_hideExplore,
        'ns-yt-blur-thumbnails': config.yt_blurThumbnails
    };

    for (const [className, enabled] of Object.entries(configClasses)) {
        // Only apply classes relevant to the current site
        const isIgClass = className.startsWith('ns-ig-') || className === 'ns-grayscale';
        const isYtClass = className.startsWith('ns-yt-');
        const isCurrentSite = (hostname.includes('instagram.com') && isIgClass) ||
            (hostname.includes('youtube.com') && isYtClass);

        if (isCurrentSite) {
            html.classList.toggle(className, enabled);
        } else {
            // Ensure classes from the other site are removed
            html.classList.remove(className);
        }
    }

    processExistingContent();
    setupReminder();
}

function setupReminder() {
    if (reminderTimer) clearInterval(reminderTimer);
    if (!config.soft_reminders_enabled) return;

    // Check every 30 seconds to see if it's time
    reminderTimer = setInterval(() => {
        const now = Date.now();
        const elapsedMinutes = (now - lastReminderTime) / (1000 * 60);

        if (elapsedMinutes >= config.soft_reminders_interval) {
            showReminder(getReminderMessage(), '🔔');
            // Show the second reminder after the first one's animation starts to fade
            setTimeout(() => {
                showReminder('Touch the Grass!', '🌿');
            }, 8000);
            lastReminderTime = now;
        }
    }, 30000);
}

function showReminder(message, icon) {
    // Remove existing if any
    const existing = document.getElementById('ns-soft-reminder');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ns-soft-reminder';

    const content = document.createElement('div');
    content.className = 'ns-reminder-content';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'ns-reminder-icon';
    iconDiv.textContent = icon;

    const text = document.createElement('div');
    text.className = 'ns-reminder-text';
    text.textContent = message;

    content.appendChild(iconDiv);
    content.appendChild(text);
    overlay.appendChild(content);

    // Inject styles if not present
    if (!document.getElementById('ns-reminder-styles')) {
        const style = document.createElement('style');
        style.id = 'ns-reminder-styles';
        style.textContent = `
            #ns-soft-reminder {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999999;
                pointer-events: none;
                animation: ns-fade-in-out 7s ease-in-out forwards;
            }
            .ns-reminder-content {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 30px 50px;
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.4);
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                transform: translateY(20px);
                animation: ns-slide-up 7s ease-in-out forwards;
            }
            .ns-reminder-icon {
                font-size: 40px;
                margin-bottom: 15px;
            }
            .ns-reminder-text {
                font-family: 'Inter', -apple-system, sans-serif;
                font-size: 24px;
                font-weight: 700;
                color: #222;
            }
            @keyframes ns-fade-in-out {
                0% { opacity: 0; }
                10% { opacity: 1; }
                85% { opacity: 1; }
                100% { opacity: 0; }
            }
            @keyframes ns-slide-up {
                0% { transform: translateY(40px); }
                10% { transform: translateY(0); }
                85% { transform: translateY(0); }
                100% { transform: translateY(-40px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    // Auto remove after animation
    setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
    }, 7500);
}

function neutralizeVideo(video) {
    if (config.ig_hideVideos) {
        if (!video.paused) {
            video.pause();
            video.muted = true;
        }
        if (!video.dataset.eventsAttached) {
            const p = () => { if (config.ig_hideVideos) video.pause(); };
            video.addEventListener('play', p);
            video.addEventListener('timeupdate', p);
            video.dataset.eventsAttached = "true";
        }
    }
}

function injectQuote(article) {
    if (!article.hasAttribute('data-quote')) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        article.setAttribute('data-quote', randomQuote);
    }
}

function processExistingContent() {
    const hostname = window.location.hostname;
    if (hostname.includes("instagram.com")) {
        document.querySelectorAll('video').forEach(neutralizeVideo);
        document.querySelectorAll('article').forEach(injectQuote);
    } else if (hostname.includes("youtube.com")) {
        disableYtAutoplay();
    }
}

function disableYtAutoplay() {
    const btn = document.querySelector(".ytp-autonav-toggle-button");
    if (btn && btn.getAttribute("aria-checked") === "true") {
        btn.click();
        console.log("NoShort: YouTube Autoplay Disabled");
    }
}

function runInstagramLogic() {
    console.log("NoShort: runInstagramLogic started");
    checkHardBlock();

    // Redirect logic - check every 500ms for SPA navigation
    setInterval(() => {
        const path = window.location.pathname;
        const target = config.ig_redirectUrl || "/direct/inbox/";

        // 1. Hide Reels Page logic (Legacy/Broad block)
        if (config.ig_hideReelsPage) {
            const blockedPaths = ["/reels", "/reel", "/explore", "/stories"];
            if (blockedPaths.some(p => path.startsWith(p)) && path !== target) {
                window.location.replace(target);
                return;
            }
        }

        // 2. Specific Tab Redirects
        // Home Tab
        if (config.ig_hideHomeTab && (path === "/" || path === "")) {
            if (path !== target) {
                window.location.replace(target);
                return;
            }
        }

        // Explore Tab
        if (config.ig_hideExploreTab && path.startsWith("/explore")) {
            if (path !== target) {
                window.location.replace(target);
                return;
            }
        }

        // Reels Tab
        if (config.ig_hideReelsTab && (path.startsWith("/reels") || path.startsWith("/reel"))) {
            if (path !== target) {
                window.location.replace(target);
                return;
            }
        }
    }, 500);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'VIDEO') neutralizeVideo(node);
                    else if (node.tagName === 'ARTICLE') injectQuote(node);
                    else {
                        node.querySelectorAll('video').forEach(neutralizeVideo);
                        node.querySelectorAll('article').forEach(injectQuote);
                    }
                }
            });
        });
    });

    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
}

function runYouTubeLogic() {
    console.log("NoShort: runYouTubeLogic started");
    checkHardBlock();
    disableYtAutoplay();

    let lastScrollBlockTime = 0;

    // Block Shorts scrolling but allow viewing
    const blockShortsScroll = (e) => {
        if (!config.yt_hideShorts) return;
        if (!window.location.pathname.startsWith("/shorts/")) return;

        // Key blocking
        if (e.type === "keydown") {
            const blockedKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp"];
            if (blockedKeys.includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                console.log("NoShort: Shorts Scroll Blocked (Key)");
            }
        }
        // Wheel blocking
        if (e.type === "wheel" || e.type === "mousewheel") {
            e.preventDefault();
            e.stopPropagation();
            // Throttle scroll blocking console log
            const now = Date.now();
            if (!lastScrollBlockTime || now - lastScrollBlockTime > 3000) {
                lastScrollBlockTime = now;
            }
            console.log("NoShort: Shorts Scroll Blocked (Wheel)");
        }
    };

    window.addEventListener("keydown", blockShortsScroll, true);
    window.addEventListener("wheel", blockShortsScroll, { passive: false, capture: true });

    const observer = new MutationObserver(() => {
        disableYtAutoplay();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
}

function checkHardBlock() {
    if (!config.yt_hard_block_enabled) return;

    const hostname = window.location.hostname;
    const isYt = hostname.includes('youtube.com');
    const isIg = hostname.includes('instagram.com');

    // Only proceed if the toggle for the current site is enabled
    if (isYt && !config.block_yt) return;
    if (isIg && !config.block_ig) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = config.yt_hard_block_start.split(':').map(Number);
    const [endH, endM] = config.yt_hard_block_end.split(':').map(Number);

    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    let isBlocked = false;
    if (startTime < endTime) {
        // Normal range (e.g., 09:00 to 18:00)
        isBlocked = currentTime >= startTime && currentTime < endTime;
    } else {
        // Overnight range (e.g., 22:00 to 06:00)
        isBlocked = currentTime >= startTime || currentTime < endTime;
    }

    if (isBlocked) {
        showHardBlockOverlay(config.yt_hard_block_end);
    }
}

function showHardBlockOverlay(endTime) {
    if (document.getElementById('ns-hard-block-overlay')) return;

    // Stop YouTube video if playing
    const video = document.querySelector('video');
    if (video) {
        video.pause();
        video.src = "";
        video.load();
    }

    const overlay = document.createElement('div');
    overlay.id = 'ns-hard-block-overlay';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 2147483647; font-family: 'Inter', -apple-system, sans-serif;
    `;

    const card = document.createElement('div');
    card.style = `
        background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(30px);
        padding: 50px 70px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 25px 50px rgba(0,0,0,0.1); text-align: center;
    `;

    const icon = document.createElement('div');
    icon.textContent = "🛡️";
    icon.style.fontSize = "64px";
    icon.style.marginBottom = "20px";

    const title = document.createElement('div');
    title.textContent = getI18n('focus');
    title.style.fontSize = "32px";
    title.style.fontWeight = "800";
    title.style.color = "#222";
    title.style.marginBottom = "10px";

    const sub = document.createElement('div');
    sub.textContent = getI18n('restrict').replace("{time}", endTime);
    sub.style.fontSize = "18px";
    sub.style.color = "#666";

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(sub);
    overlay.appendChild(card);

    document.documentElement.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';

    // Repeatedly check and ensure overlay stays
    setInterval(() => {
        if (!document.getElementById('ns-hard-block-overlay')) {
            document.documentElement.appendChild(overlay);
        }
        document.documentElement.style.overflow = 'hidden';
    }, 1000);
}

loadConfig();