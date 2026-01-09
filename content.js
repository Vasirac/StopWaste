console.log("%c NoShort Multi: Script Starting... ", "background: #333; color: #fff; padding: 2px 5px;");

let config = {
    ig_hideReelsPage: true, ig_redirectUrl: "/direct/inbox/",
    ig_hideVideos: true, ig_hidePhotos: true, ig_hideSidebarAndRec: false, ig_hideFeed: true, 
    ig_hideHomeTab: false, ig_hideExploreTab: true, ig_hideReelsTab: true, ig_hideStories: false,
    ig_hideNumbers: false, ig_grayscaleMode: false,
    yt_hideShorts: true, yt_hideHome: true, yt_hideSidebar: true, 
    yt_hideComments: true, yt_hideRelated: true
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

// 디버그 변수
let debugCounter = 0;

function loadConfig() {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(config, (items) => {
                config = { ...config, ...items };
                applyConfig();
            });
        } else {
            applyConfig();
        }
    } catch (e) {
        applyConfig();
    }
}

// Initial load fallback
setTimeout(() => { applyConfig(); }, 100);
setTimeout(() => { applyConfig(); }, 1000);

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            for (let key in changes) config[key] = changes[key].newValue;
            applyConfig();
        }
    });
}

function applyConfig() {
    const html = document.documentElement;
    html.classList.toggle('ns-ig-photos', config.ig_hidePhotos);
    html.classList.toggle('ns-ig-sidebar-rec', config.ig_hideSidebarAndRec);
    html.classList.toggle('ns-ig-feed', config.ig_hideFeed); 
    html.classList.toggle('ns-ig-videos', config.ig_hideVideos);
    html.classList.toggle('ns-ig-home', config.ig_hideHomeTab);
    html.classList.toggle('ns-ig-explore', config.ig_hideExploreTab);
    html.classList.toggle('ns-ig-reels', config.ig_hideReelsTab);
    html.classList.toggle('ns-ig-stories', config.ig_hideStories);
    html.classList.toggle('ns-ig-numbers', config.ig_hideNumbers);
    html.classList.toggle('ns-grayscale', config.ig_grayscaleMode);
    
    html.classList.toggle('ns-yt-shorts', config.yt_hideShorts);
    html.classList.toggle('ns-yt-home', config.yt_hideHome);
    html.classList.toggle('ns-yt-sidebar', config.yt_hideSidebar);
    html.classList.toggle('ns-yt-comments', config.yt_hideComments);
    html.classList.toggle('ns-yt-related', config.yt_hideRelated);

    processInstagramContent();
}

// CSS Injection is now handled by manifest.json, but we keep this function if needed dynamically
// function injectCSS(fileName) { ... } 

const hostname = window.location.hostname;
if (hostname.includes("instagram.com")) {
    runInstagramLogic();
} else if (hostname.includes("youtube.com")) {
    runYouTubeLogic();
}
loadConfig();


function neutralizeVideo(video) {
    if (!video.paused && config.ig_hideVideos) {
        video.pause();
        video.muted = true;
    }
    if (video.dataset.neutralized === "true") return;
    
    if (!video.dataset.eventsAttached) {
        const p = (e) => { if (config.ig_hideVideos) video.pause(); };
        video.addEventListener('play', p);
        video.addEventListener('timeupdate', p);
        video.dataset.eventsAttached = "true";
    }
    video.dataset.neutralized = "true";
}

function injectQuote(article) {
    // 이미 있는지 확인
    if (article.hasAttribute('data-quote')) return;
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    article.setAttribute('data-quote', randomQuote);
}

function processInstagramContent() {
    // 1. Video 처리
    if (config.ig_hideVideos) {
        document.querySelectorAll('video').forEach(neutralizeVideo);
    }

    // 2. 명언 주입
    const articles = document.querySelectorAll('article');
    if (articles.length > 0) {
        articles.forEach(injectQuote);
    }
}

function runInstagramLogic() {
    setInterval(() => {
        const path = window.location.pathname;
        if (config.ig_hideReelsPage) {
            const target = config.ig_redirectUrl || "/direct/inbox/";
            const blockedPaths = ["/reels", "/reel", "/explore", "/stories"];
            if (blockedPaths.some(p => path.startsWith(p)) && path !== target) {
                window.location.assign(target);
            }
        }
    }, 500);

    setInterval(processInstagramContent, 500);
    new MutationObserver(processInstagramContent).observe(document.documentElement, { childList: true, subtree: true });
}

function runYouTubeLogic() {
    setInterval(() => {
        const btn = document.querySelector(".ytp-autonav-toggle-button");
        if (btn && btn.getAttribute("aria-checked") === "true") btn.click();
    }, 2000);
}
