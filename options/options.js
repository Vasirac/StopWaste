/* global chrome */
const defaultOptions = {
    // Instagram
    ig_hideReelsPage: true,
    ig_redirectUrl: "/direct/inbox/",
    ig_hideVideos: true,
    ig_hidePhotos: false, // 기본값 False (새 기능)
    ig_hideSidebarAndRec: false,
    ig_hideFeed: true,
    ig_hideHomeTab: false,
    ig_hideExploreTab: true,
    ig_hideReelsTab: true,
    ig_hideStories: false,
    ig_hideNumbers: false,
    ig_grayscaleMode: false,

    // YouTube
    yt_hideShorts: true,
    yt_hideHome: true,
    yt_hideSidebar: true,
    yt_hideComments: true,
    yt_hideRelated: true,
    yt_hideSubs: false,
    yt_hideYou: false,
    yt_hideExplore: false,

    // Language
    userLocale: "auto"
};

const i18nData = {
    "en": {
        "extName": "StopWaste",
        "secIG": "📸 Instagram",
        "secBlock": "Block & Redirect",
        "optRedirect": "Redirect Reels/Explore",
        "descRedirect": "Redirect Target (e.g. / or /direct/inbox/)",
        "optRemoveVideo": "Remove Feed Videos",
        "optRemovePhoto": "Remove Feed Photos (NEW)",
        "optHideSidebarAndRec": "Hide Sidebar & Recommendations",
        "secHideUI": "Hide UI",
        "optHideFeed": "Hide Main Feed (Whole)",
        "optHideHome": "Hide Home Tab",
        "optHideExplore": "Hide Explore Tab",
        "optHideReels": "Hide Reels Tab",
        "optHideStories": "Hide Stories Bar",
        "secOthers": "Others",
        "optHideNumbers": "Hide Numbers",
        "optGrayscale": "Grayscale Mode",
        "secYT": "📺 YouTube",
        "optBlockShorts": "Block Shorts",
        "optMinimalHome": "Minimal Home (Search Only)",
        "optHideSidebar": "Hide Sidebar & Header",
        "optHideComments": "Hide Comments",
        "optHideRelated": "Hide Related Videos",
        "optHideSubs": "Hide Subscriptions",
        "optHideYou": "Hide 'You' Section",
        "optHideExplore": "Hide Explore",
        "statusSaved": "Settings saved automatically"
    },
    "ko": {
        "extName": "StopWaste",
        "secIG": "📸 인스타그램",
        "secBlock": "차단 및 리다이렉트",
        "optRedirect": "릴스/탐색 리다이렉트",
        "descRedirect": "리다이렉트 대상 (예: / 또는 /direct/inbox/)",
        "optRemoveVideo": "피드 동영상 제거",
        "optRemovePhoto": "피드 사진 제거 (NEW)",
        "optHideSidebarAndRec": "사이드바 및 추천 숨기기",
        "secHideUI": "UI 숨기기",
        "optHideFeed": "메인 피드 숨기기 (전체)",
        "optHideHome": "홈 탭 숨기기",
        "optHideExplore": "탐색 탭 숨기기",
        "optHideReels": "릴스 탭 숨기기",
        "optHideStories": "스토리 바 숨기기",
        "secOthers": "기타",
        "optHideNumbers": "숫자 숨기기",
        "optGrayscale": "흑백 모드",
        "secYT": "📺 유튜브",
        "optBlockShorts": "쇼츠 차단",
        "optMinimalHome": "미니멀 홈 (검색만 가능)",
        "optHideSidebar": "사이드바 및 헤더 숨기기",
        "optHideComments": "댓글 숨기기",
        "optHideRelated": "관련 동영상 숨기기",
        "optHideSubs": "구독 숨기기",
        "optHideYou": "내 페이지 숨기기",
        "optHideExplore": "탐색 숨기기",
        "statusSaved": "설정이 자동으로 저장되었습니다"
    },
    "ja": {
        "extName": "StopWaste",
        "secIG": "📸 Instagram",
        "secBlock": "ブロックとリダイレクト",
        "optRedirect": "リール/検索をリダイレクト",
        "descRedirect": "リダイレクト先 (例: / または /direct/inbox/)",
        "optRemoveVideo": "フィード動画を削除",
        "optRemovePhoto": "フィード写真を削除 (NEW)",
        "optHideSidebarAndRec": "サイドバーとおすすめを隠す",
        "secHideUI": "UIを隠す",
        "optHideFeed": "メインフィードを隠す (全体)",
        "optHideHome": "ホームタブを隠す",
        "optHideExplore": "検索タブを隠す",
        "optHideReels": "リールタブを隠す",
        "optHideStories": "ストーリーバーを隠す",
        "secOthers": "その他",
        "optHideNumbers": "数字を隠す",
        "optGrayscale": "グレースケールモード",
        "secYT": "📺 YouTube",
        "optBlockShorts": "Shortsをブロック",
        "optMinimalHome": "ミニマルホーム (検索のみ)",
        "optHideSidebar": "サイドバーとヘッダーを隠す",
        "optHideComments": "コメントを隠す",
        "optHideRelated": "関連動画を隠す",
        "statusSaved": "設定が自動的に保存されました"
    },
    "zh_CN": {
        "extName": "StopWaste",
        "secIG": "📸 Instagram",
        "secBlock": "拦截与重定向",
        "optRedirect": "重定向 Reels/探索",
        "descRedirect": "重定向目标 (例如 / 或 /direct/inbox/)",
        "optRemoveVideo": "移除动态视频",
        "optRemovePhoto": "移除动态照片 (NEW)",
        "optHideSidebarAndRec": "隐藏侧边栏和推荐",
        "secHideUI": "隐藏 UI",
        "optHideFeed": "隐藏主页动态 (全部)",
        "optHideHome": "隐藏主页标签",
        "optHideExplore": "隐藏探索标签",
        "optHideReels": "隐藏 Reels 标签",
        "optHideStories": "隐藏故事栏",
        "secOthers": "其他",
        "optHideNumbers": "隐藏数字",
        "optGrayscale": "黑白模式",
        "secYT": "📺 YouTube",
        "optBlockShorts": "拦截 Shorts",
        "optMinimalHome": "极简首页 (仅搜索)",
        "optHideSidebar": "隐藏侧边栏和顶部栏",
        "optHideComments": "隐藏评论",
        "optHideRelated": "隐藏相关视频",
        "optHideSubs": "隐藏订阅",
        "optHideYou": "隐藏“你”部分",
        "optHideExplore": "隐藏探索",
        "statusSaved": "设置已自动保存"
    },
    "hi": {
        "extName": "StopWaste",
        "secIG": "📸 Instagram",
        "secBlock": "ब्लॉक और पुनर्निर्देशन",
        "optRedirect": "रील्स/एक्सप्लोर रीडायरेक्ट करें",
        "descRedirect": "रीडायरेक्ट लक्ष्य (जैसे / या /direct/inbox/)",
        "optRemoveVideo": "फ़ीड वीडियो हटाएं",
        "optRemovePhoto": "फ़ीड फ़ोटो हटाएं (NEW)",
        "optHideSidebarAndRec": "साइडबार और अनुशंसाएं छिपाएं",
        "secHideUI": "UI छिपाएं",
        "optHideFeed": "मुख्य फ़ीड छिपाएं (पूर्ण)",
        "optHideHome": "होम टैब छिपाएं",
        "optHideExplore": "एक्सप्लोर टैब छिपाएं",
        "optHideReels": "रील्स टैब छिपाएं",
        "optHideStories": "स्टोरी बार छिपाएं",
        "secOthers": "अन्य",
        "optHideNumbers": "संख्याएं छिपाएं",
        "optGrayscale": "ग्रेस्केल मोड",
        "secYT": "📺 YouTube",
        "optBlockShorts": "Shorts ब्लॉक करें",
        "optMinimalHome": "न्यूनतम होम (केवल खोज)",
        "optHideSidebar": "साइडबार और हेडर छिपाएं",
        "optHideComments": "टिप्पणियाँ छिपाएं",
        "optHideRelated": "संबंधित वीडियो छिपाएं",
        "optHideSubs": "सदस्यता छिपाएं",
        "optHideYou": "'आपका' अनुभाग छिपाएं",
        "optHideExplore": "एक्सप्लोर छिपाएं",
        "statusSaved": "सेटिंग्स स्वचालित रूप से सहेजी गईं"
    }
};

function getSystemLocale() {
    const lang = navigator.language.replace('-', '_');
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('zh')) return 'zh_CN';
    if (lang.startsWith('hi')) return 'hi';
    return 'en';
}

function updateTexts(locale) {
    if (locale === 'auto') locale = getSystemLocale();

    const texts = i18nData[locale] || i18nData['en'];

    // Header
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) headerTitle.textContent = texts.extName;

    // IG Section
    document.querySelector('.ig-title').textContent = texts.secIG;

    // Helpers
    const setLabel = (id, text) => {
        const el = document.getElementById(id);
        if (el && el.parentElement) {
            const span = el.parentElement.querySelector('span');
            if (span) span.textContent = text;
        }
    };

    const setDesc = (id, text) => {
        const el = document.getElementById(id);
        if (el && el.previousElementSibling && el.previousElementSibling.classList.contains('input-desc')) {
            el.previousElementSibling.textContent = text;
        }
    };

    const setSubTitle = (index, text) => {
        const subs = document.querySelectorAll('.sub-title');
        if (subs[index]) subs[index].textContent = text;
    };

    // Block & Redirect
    setSubTitle(0, texts.secBlock);
    setLabel('ig_hideReelsPage', texts.optRedirect);
    setDesc('ig_redirectUrl', texts.descRedirect);
    setLabel('ig_hideVideos', texts.optRemoveVideo);
    setLabel('ig_hidePhotos', texts.optRemovePhoto);
    setLabel('ig_hideSidebarAndRec', texts.optHideSidebarAndRec);

    // Hide UI
    setSubTitle(1, texts.secHideUI);
    setLabel('ig_hideFeed', texts.optHideFeed);
    setLabel('ig_hideHomeTab', texts.optHideHome);
    setLabel('ig_hideExploreTab', texts.optHideExplore);
    setLabel('ig_hideReelsTab', texts.optHideReels);
    setLabel('ig_hideStories', texts.optHideStories);

    // Others
    setSubTitle(2, texts.secOthers);
    setLabel('ig_hideNumbers', texts.optHideNumbers);
    setLabel('ig_grayscaleMode', texts.optGrayscale);

    // YouTube Section
    document.querySelector('.yt-title').textContent = texts.secYT;
    setSubTitle(3, texts.secBlock);
    setSubTitle(4, texts.secHideUI);
    setLabel('yt_hideShorts', texts.optBlockShorts);
    setLabel('yt_hideHome', texts.optMinimalHome);
    setLabel('yt_hideSidebar', texts.optHideSidebar);
    setLabel('yt_hideComments', texts.optHideComments);
    setLabel('yt_hideRelated', texts.optHideRelated);
    setLabel('yt_hideSubs', texts.optHideSubs);
    setLabel('yt_hideYou', texts.optHideYou);
    setLabel('yt_hideExplore', texts.optHideExplore);

    // Footer
    document.getElementById('status').dataset.savedText = texts.statusSaved;
}

function saveOptions() {
    const options = {};
    Object.keys(defaultOptions).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                options[key] = el.checked;
            } else if (el.type === 'text' || el.tagName === 'SELECT') {
                options[key] = el.value || defaultOptions[key];
            }
        }
    });

    // userLocale manually
    options.userLocale = document.getElementById('userLocale').value;

    chrome.storage.sync.set(options, () => {
        const status = document.getElementById('status');
        const savedText = status.dataset.savedText || "Saved!";
        status.textContent = savedText;

        // Trigger fade in
        status.classList.add('show');

        setTimeout(() => {
            // Fade out
            status.classList.remove('show');
        }, 2000);

        // Update texts immediately
        updateTexts(options.userLocale);
    });
}

function restoreOptions() {
    chrome.storage.sync.get(defaultOptions, (items) => {
        Object.keys(defaultOptions).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = items[key];
                } else if (el.type === 'text') {
                    el.value = items[key];
                }
            }
        });

        // Restore Locale
        const localeEl = document.getElementById('userLocale');
        if (localeEl) {
            localeEl.value = items.userLocale || "auto";
        }

        updateTexts(items.userLocale);
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input').forEach(input => {
    if (input.type === 'text') {
        input.addEventListener('blur', saveOptions);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveOptions(); });
    } else {
        input.addEventListener('change', saveOptions);
    }
});
document.getElementById('userLocale').addEventListener('change', saveOptions);
