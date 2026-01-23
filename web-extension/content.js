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
    yt_hideExtraMenu: false,
    yt_hard_block_enabled: false, yt_hard_block_start: "09:00", yt_hard_block_end: "18:00",
    block_yt: true, block_ig: false,
    soft_reminders_enabled: false, soft_reminders_interval: 15,
    usage_limit_enabled: false, usage_limit_minutes: 30,
    yt_block_now: false, ig_block_now: false, block_after_timer: false,
    darkMode: false
};




const i18nContent = {
    "en": { "focus": "It's Focus Time!", "restrict": "touch the grass!", "countdown": "{n}s remaining", "ytBlocked": "YouTube is blocked! touch the grass!", "igBlocked": "Instagram is blocked! touch the grass!", "timerEnded": "Time's up!" },
    "ko": { "focus": "집중 시간입니다!", "restrict": "touch the grass!", "countdown": "{n}초 후 화면이 차단됩니다", "ytBlocked": "유튜브는 차단되었습니다! touch the grass!", "igBlocked": "인스타그램은 차단되었습니다! touch the grass!", "timerEnded": "사용 시간이 종료되었습니다!" },
    "ja": { "focus": "集中する時間です！", "restrict": "touch the grass!", "countdown": "あと{n}秒", "ytBlocked": "YouTubeはブロックされています！", "igBlocked": "Instagramはブロックされています！", "timerEnded": "使用時間が終了しました！" },
    "zh_CN": { "focus": "现在是专注时间！", "restrict": "touch the grass!", "countdown": "{n} 秒后将屏蔽屏幕", "ytBlocked": "YouTube 已被屏蔽！", "igBlocked": "Instagram 已被屏蔽！", "timerEnded": "使用时间已结束！" },
    "hi": { "focus": "यह फोकस समय है!", "restrict": "touch the grass!", "countdown": "{n} सेकंड शेष", "ytBlocked": "YouTube ब्लॉक है!", "igBlocked": "Instagram ब्लॉक है!", "timerEnded": "समय समाप्त!" }
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
let usageLimitTimer = null;

// Persist session start time across page reloads using localStorage
function getSessionStartTime() {
    const stored = localStorage.getItem('ns_session_start');
    if (stored) {
        return parseInt(stored, 10);
    }
    const now = Date.now();
    localStorage.setItem('ns_session_start', now.toString());
    return now;
}
const sessionStartTime = getSessionStartTime();


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
        'ns-yt-extra-menu': config.yt_hideExtraMenu,
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
    setupUsageLimit();
    updateBlockingState();

}

// Consolidated Blocking Logic
function updateBlockingState() {
    const isYt = window.location.hostname.includes('youtube.com');
    const isIg = window.location.hostname.includes('instagram.com');

    let blockReason = null;
    let blockMessageKey = '';

    // 1. Immediate Block
    if ((isYt && config.yt_block_now) || (isIg && config.ig_block_now)) {
        blockReason = 'immediate';
        blockMessageKey = isYt ? 'ytBlocked' : 'igBlocked';
    }

    // 2. Schedule Block (Hard Block)
    if (!blockReason && config.yt_hard_block_enabled) {
        if ((isYt && config.block_yt) || (isIg && config.block_ig)) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [startH, startM] = config.yt_hard_block_start.split(':').map(Number);
            const [endH, endM] = config.yt_hard_block_end.split(':').map(Number);
            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;

            let isBlocked = false;
            if (startTime < endTime) {
                isBlocked = currentTime >= startTime && currentTime < endTime;
            } else {
                isBlocked = currentTime >= startTime || currentTime < endTime;
            }

            if (isBlocked) {
                blockReason = 'schedule';
                // For schedule block, we pass the time directly to the overlay, not a key
            }
        }
    }

    // 3. Usage Limit Block
    if (!blockReason && config.usage_limit_enabled) {
        const now = Date.now();
        const elapsedSeconds = (now - sessionStartTime) / 1000;
        const limitSeconds = config.usage_limit_minutes * 60;

        if (elapsedSeconds >= limitSeconds) {
            // If timer ends, we only block if block_after_timer is true OR if we consider usage limit a hard stop
            // Based on previous logic: 
            // If block_after_timer is TRUE -> Block with "Time's up"
            // If block_after_timer is FALSE -> Show "Time's up" overlay but maybe allow dismissal? 
            // The previous code showed hard block overlay in BOTH cases.
            // So we will treat it as a block.
            blockReason = 'limit';
            blockMessageKey = 'timerEnded';
        }
    }

    // Apply Blocking or Unblocking
    const overlayId = 'ns-hard-block-overlay';
    const existingOverlay = document.getElementById(overlayId);

    if (blockReason) {
        if (!existingOverlay) {
            let message = '';
            if (blockReason === 'schedule') {
                // Special handling for schedule message
                const endTime = config.yt_hard_block_end;
                showHardBlockOverlay(endTime, true); // true indicates it's a schedule time
            } else {
                showHardBlockOverlay(getI18n(blockMessageKey));
            }
        }
    } else {
        // If no reason to block, remove overlay if it exists
        if (existingOverlay) {
            existingOverlay.remove();
        }
        // Always ensure we clean up the lock and interval if not blocked
        document.documentElement.style.overflow = '';
        if (window.hardBlockInterval) clearInterval(window.hardBlockInterval);
    }
}


// Logic loop for blocking status
setInterval(updateBlockingState, 1000);

// Timer for usage limit countdown display (separate from blocking logic)
function setupUsageLimit() {
    if (usageLimitTimer) clearInterval(usageLimitTimer);
    if (!config.usage_limit_enabled) return;

    usageLimitTimer = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - sessionStartTime) / 1000;
        const limitSeconds = config.usage_limit_minutes * 60;
        const remainingSeconds = Math.max(0, Math.floor(limitSeconds - elapsedSeconds));

        // Just handle countdown display here
        if (remainingSeconds > 0 && remainingSeconds <= 60) {
            if (remainingSeconds <= 10) showStrongCountdown(remainingSeconds);
            else showCountdownOverlay(remainingSeconds);
        } else {
            // Remove countdowns if time is up (blocking logic handles the rest) or not yet close
            const small = document.getElementById('ns-usage-countdown');
            if (small) small.remove();
            const strong = document.getElementById('ns-strong-countdown');
            if (strong) strong.remove();
        }
    }, 1000);
}


function showStrongCountdown(seconds) {
    // Remove smaller one if exists
    const small = document.getElementById('ns-usage-countdown');
    if (small) small.remove();

    let overlay = document.getElementById('ns-strong-countdown');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ns-strong-countdown';
        overlay.style = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px); border-radius: 40px;
            padding: 40px 60px; border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            z-index: 2147483646; text-align: center;
            font-family: 'Inter', -apple-system, sans-serif;
            animation: ns-pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        `;
        overlay.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">⌛</div>
            <div id="ns-strong-timer" style="font-size: 120px; font-weight: 900; color: #ff3b30; line-height: 1;">10</div>
            <div style="font-size: 24px; font-weight: 600; color: #333; margin-top: 15px; opacity: 0.8;">Touch the Grass!</div>
        `;
        document.body.appendChild(overlay);

        // Add style for animation if not present
        if (!document.getElementById('ns-styles-extra')) {
            const style = document.createElement('style');
            style.id = 'ns-styles-extra';
            style.textContent = `
                @keyframes ns-pop-in {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes ns-pulse-fast {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    const timerText = document.getElementById('ns-strong-timer');
    if (timerText) {
        timerText.textContent = seconds;
        overlay.style.animation = 'ns-pulse-fast 0.5s ease-in-out infinite';
    }
}


function showCountdownOverlay(seconds) {
    let overlay = document.getElementById('ns-usage-countdown');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ns-usage-countdown';
        overlay.style = `
            position: fixed; bottom: 20px; right: 20px;
            background: rgba(0, 0, 0, 0.8); color: #fff;
            padding: 10px 20px; border-radius: 12px;
            font-family: 'Inter', sans-serif; font-size: 16px;
            z-index: 9999999; pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        document.body.appendChild(overlay);
    }
    const text = (getI18n('countdown') || "{n}s remaining").replace("{n}", seconds);
    overlay.textContent = "⌛ " + text;

    // Pulse effect when below 10s
    if (seconds <= 10) {
        overlay.style.background = "rgba(255, 0, 0, 0.8)";
        overlay.style.transform = "scale(1.1)";
    }
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


function showHardBlockOverlay(messageOrEndTime, isSchedule = false) {
    if (document.getElementById('ns-hard-block-overlay')) return;

    // Stop YouTube video if playing
    const video = document.querySelector('video');
    if (video) {
        video.pause();
        video.src = "";
        video.load();
    }

    const isDark = config.darkMode;

    const overlay = document.createElement('div');
    overlay.id = 'ns-hard-block-overlay';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: ${isDark ? 'linear-gradient(135deg, #121212 0%, #2c2c2c 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'};
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 2147483647; font-family: 'Inter', -apple-system, sans-serif;
    `;

    const card = document.createElement('div');
    card.style = `
        background: ${isDark ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)'}; 
        backdrop-filter: blur(30px);
        padding: 50px 70px; border-radius: 32px; 
        border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
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
    title.style.color = isDark ? "#fff" : "#222";
    title.style.marginBottom = "10px";

    const sub = document.createElement('div');

    if (isSchedule) {
        sub.textContent = getI18n('restrict').replace("{time}", messageOrEndTime);
    } else {
        sub.textContent = messageOrEndTime;
    }

    sub.style.fontSize = "18px";
    sub.style.color = isDark ? "#ccc" : "#666";

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(sub);
    overlay.appendChild(card);

    document.documentElement.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';

    // Repeatedly check and ensure overlay stays
    // Clear any existing interval to prevent duplicates if function called repeatedly (though guard prevents it)
    if (window.hardBlockInterval) clearInterval(window.hardBlockInterval);

    window.hardBlockInterval = setInterval(() => {
        if (!document.getElementById('ns-hard-block-overlay')) {
            document.documentElement.appendChild(overlay);
        }
        document.documentElement.style.overflow = 'hidden';
    }, 1000);
}


loadConfig();