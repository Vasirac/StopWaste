/* global chrome */
console.log("%c NoShort Multi: Script Starting... ", "background: #333; color: #fff; padding: 2px 5px;");

let config = {
    ig_hideReelsPage: true, ig_redirectUrl: "/direct/inbox/",
    ig_hideVideos: true, ig_hidePhotos: true, ig_hideSidebarAndRec: false, ig_hideFeed: true,
    ig_hideHomeTab: false, ig_hideExploreTab: true, ig_hideReelsTab: true, ig_hideStories: false,
    ig_hideNumbers: false, ig_grayscaleMode: false,
    yt_hideShorts: true, yt_hideHome: true, yt_hideSidebar: true,
    yt_hideComments: true, yt_hideRelated: true,
    yt_hideSubs: false, yt_hideYou: false, yt_hideExplore: false
};

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
        'ns-yt-comments': config.yt_hideComments,
        'ns-yt-related': config.yt_hideRelated,
        'ns-yt-subs': config.yt_hideSubs,
        'ns-yt-you': config.yt_hideYou,
        'ns-yt-explore': config.yt_hideExplore
    };

    for (const [className, enabled] of Object.entries(configClasses)) {
        html.classList.toggle(className, enabled);
    }

    processExistingContent();
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

    // Redirect logic - check every 500ms for SPA navigation
    setInterval(() => {
        const path = window.location.pathname;
        const target = config.ig_redirectUrl || "/direct/inbox/";

        if (config.ig_hideReelsPage) {
            const blockedPaths = ["/reels", "/reel", "/explore", "/stories"];
            if (blockedPaths.some(p => path.startsWith(p)) && path !== target) {
                window.location.replace(target);
                return;
            }
        }

        if (config.ig_hideHomeTab && (path === "/" || path === "")) {
            if (path !== target) {
                window.location.replace(target);
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
    disableYtAutoplay();

    const observer = new MutationObserver(() => {
        disableYtAutoplay();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
}

loadConfig();