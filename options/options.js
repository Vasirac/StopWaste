/* global chrome */
console.log('[StopWaste] options.js loaded at ' + new Date().toLocaleTimeString());

const defaultOptions = {
    // Strict Mode
    strict_mode: false,

    // Instagram
    ig_block_now: false,
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
    yt_block_now: false,
    yt_hideShorts: true,

    yt_blurThumbnails: false,
    yt_hideHome: true,
    yt_hideSidebar: true,
    yt_hideHeader: false,
    yt_hideNotifications: false,
    yt_hideComments: true,
    yt_hideRelated: true,
    yt_hidePlaylist: false,
    yt_hideSubs: false,
    yt_hideYou: false,
    yt_hideExplore: false,
    yt_hideExtraMenu: false,
    yt_hard_block_enabled: false,
    yt_hard_block_start: "09:00",
    yt_hard_block_end: "18:00",
    block_yt: true,
    block_ig: false,



    // Reminder
    soft_reminders_enabled: false,
    soft_reminders_interval: 15,

    // Usage Limit
    usage_limit_enabled: false,
    usage_limit_minutes: 30,
    block_after_timer: false,

    // Language

    userLocale: "auto",
    darkMode: false
};


const i18nData = {
    "en": {
        "extName": "StopWaste",
        "secStrict": "🔐 Strict Mode",
        "optStrictDesc": "Enable Strict Mode",
        "descStrictHelper": "Prevents changing settings when enabled.",
        "msgWait": "Wait {n}s...",
        "msgUnlock": "Unlocked",
        "secIG": "📸 Instagram",
        "optBlockIGNow": "🚫 Block Instagram Now",
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
        "optBlockYTNow": "🚫 Block YouTube Now",
        "optBlockShorts": "Block Shorts",


        "optBlurThumbnails": "Blur Thumbnails",
        "optMinimalHome": "Hide Home Feed",
        "optHideSidebar": "Hide Sidebar",
        "optHideHeader": "Hide Header",
        "optHideNotifications": "Hide Notifications",
        "optHideComments": "Hide Comments",
        "optHideRelated": "Hide Related Videos",
        "optHidePlaylist": "Hide Playlist",
        "optHideSubs": "Hide Subscriptions",
        "optHideYou": "Hide 'You' Section",
        "optHideExplore": "Hide Explore",
        "optHideExtraMenu": "Clean Account Menu (Videos, Movies, etc.)",
        "secReminder": "🔔 Reminder",
        "optEnableReminder": "Soft Reminders",
        "optReminderInterval": "Interval",
        "msgReminderEvery": "Every {n} minutes",
        "secHardBlock": "⏰ Site Blocking Schedule",
        "optEnableHardBlock": "Enable Blocking",
        "optStartTime": "Start Time",
        "optEndTime": "End Time",
        "optBlockYT": "Apply to YouTube",
        "optBlockIG": "Apply to Instagram",
        "secUsageLimit": "⏳ Usage Time Limit",
        "optEnableUsageLimit": "Enable Time Limit",
        "optUsageLimitMinutes": "Limit (Minutes)",
        "msgUsageMinutes": "{n} minutes",
        "msgCountdown": "Time limit in {n}s",
        "optBlockEntireYT": "Explicit YouTube Block",
        "optBlockAfterTimer": "Block sites after timer ends",
        "msgYoutubeBlocked": "YouTube is blocked! touch the grass!",

        "msgFocusTime": "It's Focus Time!",

        "msgTakeABreak": "touch the grass!",
        "statusSaved": "Settings saved automatically"
    },

    "ko": {
        "extName": "StopWaste",
        "secStrict": "🔐 엄격 모드",
        "optStrictDesc": "엄격 모드 활성화",
        "descStrictHelper": "활성화 시 다른 설정을 변경할 수 없습니다.",
        "msgWait": "{n}초 대기...",
        "msgUnlock": "해제됨",
        "secIG": "📸 인스타그램",
        "optBlockIGNow": "🚫 인스타그램 즉시 차단",
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
        "optBlockYTNow": "🚫 유튜브 즉시 차단",
        "optBlockShorts": "쇼츠 차단",

        "optBlurThumbnails": "썸네일 블러 처리",
        "optMinimalHome": "메인화면 알고리즘 숨기기",
        "optHideSidebar": "사이드바 숨기기",
        "optHideHeader": "헤더 숨기기",
        "optHideNotifications": "알림 버튼 숨기기",
        "optHideComments": "댓글 숨기기",
        "optHideRelated": "관련 동영상 숨기기",
        "optHidePlaylist": "플레이리스트 숨기기",
        "optHideSubs": "구독 숨기기",
        "optHideYou": "내 페이지 숨기기",
        "optHideExplore": "탐색 숨기기",
        "optHideExtraMenu": "내 페이지 항목 정리(내 동영상, 내 영화 등)",
        "secReminder": "🔔 리마인더",
        "optEnableReminder": "소프트 리마인더 활성화",
        "optReminderInterval": "알림 간격",
        "msgReminderEvery": "{n}분마다",
        "secHardBlock": "⏰ 사이트 차단 스케줄",
        "optEnableHardBlock": "차단 활성화",
        "optStartTime": "시작 시간",
        "optEndTime": "종료 시간",
        "optBlockYT": "유튜브에 적용",
        "optBlockIG": "인스타그램에 적용",
        "secUsageLimit": "⏳ 사용 시간 제한",
        "optEnableUsageLimit": "시간 제한 활성화",
        "optUsageLimitMinutes": "제한 시간(분)",
        "msgUsageMinutes": "{n}분",
        "msgCountdown": "{n}초 후 화면 차단",
        "optBlockEntireYT": "타이머 종료 후 사이트 차단",
        "optBlockAfterTimer": "타이머 종료 후 사이트 차단",
        "msgYoutubeBlocked": "유튜브는 차단되었습니다! touch the grass!",

        "msgFocusTime": "집중 시간입니다!",

        "msgTakeABreak": "touch the grass!",
        "statusSaved": "설정이 자동으로 저장되었습니다"
    },

    "ja": {
        "extName": "StopWaste",
        "secStrict": "🔐 厳格モード",
        "optStrictDesc": "厳格モードを有効化",
        "descStrictHelper": "有効化すると他の設定を変更できません。",
        "msgWait": "{n}秒お待ちください...",
        "msgUnlock": "解除されました",
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
        "optBlurThumbnails": "サムネイルをぼかす",
        "optMinimalHome": "ホームフィードを隠す",
        "optHideSidebar": "サイドバーを隠す",
        "optHideHeader": "ヘッダーを隠す",
        "optHideNotifications": "通知ボタンを隠す",
        "optHideComments": "コメントを隠す",
        "optHideRelated": "関連動画を隠す",
        "optHidePlaylist": "プレイリストを隠す",
        "optHideSubs": "サブスクリプションを隠す",
        "optHideYou": "「あなた」セクションを隠す",
        "optHideExplore": "探索を隠す",
        "optHideExtraMenu": "「あなた」の項目をクリーンアップ（動画、映画など）",
        "secReminder": "🔔 ️リマインダー",
        "optEnableReminder": "ソフトリマインダーを有効にする",
        "optReminderInterval": "通知間隔",
        "msgReminderEvery": "{n}分ごとに",
        "secHardBlock": "⏰ サイトブロック スケジュール",
        "optEnableHardBlock": "ブロックを有効化",
        "optStartTime": "開始時間",
        "optEndTime": "終了時間",
        "optBlockYT": "YouTubeに適用",
        "optBlockIG": "Instagramに適用",
        "secUsageLimit": "⏳ 利用時間制限",
        "optEnableUsageLimit": "時間制限を有効化",
        "optUsageLimitMinutes": "制限時間（分）",
        "msgUsageMinutes": "{n}分",
        "msgCountdown": "あと{n}秒で画面をブロック",
        "optBlockYTNow": "🚫 YouTubeを今すぐブロック",
        "optBlockIGNow": "🚫 Instagramを今すぐブロック",
        "optBlockAfterTimer": "タイマー終了後にサイトをブロック",
        "msgFocusTime": "集中する時間です！",
        "msgTakeABreak": "touch the grass!",
        "statusSaved": "設定が自動的に保存されました"
    },

    "zh_CN": {
        "extName": "StopWaste",
        "secStrict": "🔐 严格模式",
        "optStrictDesc": "启用严格模式",
        "descStrictHelper": "启用后无法更改其他设置。",
        "msgWait": "请等待 {n} 秒...",
        "msgUnlock": "已解锁",
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
        "optBlurThumbnails": "模糊缩略图",
        "optMinimalHome": "隐藏主页推荐",
        "optHideSidebar": "隐藏侧边栏",
        "optHideHeader": "隐藏顶部栏",
        "optHideNotifications": "隐藏通知按钮",
        "optHideComments": "隐藏评论",
        "optHideRelated": "隐藏相关视频",
        "optHidePlaylist": "隐藏播放列表",
        "optHideSubs": "隐藏订阅",
        "optHideYou": "隐藏“你”部分",
        "optHideExplore": "隐藏探索",
        "optHideExtraMenu": "清理帐户菜单（视频、电影等）",
        "secReminder": "🔔 提醒",
        "optEnableReminder": "开启软提醒",
        "optReminderInterval": "提醒间隔",
        "msgReminderEvery": "每 {n} 分钟",
        "secHardBlock": "⏰ 网站屏蔽计划",
        "optEnableHardBlock": "开启屏蔽",
        "optStartTime": "开始时间",
        "optEndTime": "结束时间",
        "optBlockYT": "应用于 YouTube",
        "optBlockIG": "应用于 Instagram",
        "secUsageLimit": "⏳ 使用时间限制",
        "optEnableUsageLimit": "启用时间限制",
        "optUsageLimitMinutes": "限制时间（分钟）",
        "msgUsageMinutes": "{n}分钟",
        "msgCountdown": "{n}秒后屏蔽屏幕",
        "optBlockYTNow": "🚫 立即屏蔽 YouTube",
        "optBlockIGNow": "🚫 立即屏蔽 Instagram",
        "optBlockAfterTimer": "计时器结束后屏蔽网站",
        "msgFocusTime": "现在是专注时间！",
        "msgTakeABreak": "touch the grass!",
        "statusSaved": "设置已自动保存"
    },

    "hi": {
        "extName": "StopWaste",
        "secStrict": "🔐 सख्त मोड",
        "optStrictDesc": "सख्त मोड सक्षम करें",
        "descStrictHelper": "सक्षम होने पर सेटिंग्स नहीं बदली जा सकतीं।",
        "msgWait": "{n} सेकंड प्रतीक्षा करें...",
        "msgUnlock": "अनलॉक किया गया",
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
        "optBlurThumbnails": "थंबनेल धुंधला करें",
        "optMinimalHome": "होम फ़ीड छिपाएं",
        "optHideSidebar": "साइडबार छिपाएं",
        "optHideHeader": "हेडर छिपाएं",
        "optHideNotifications": "सूचनाएं छिपाएं",
        "optHideComments": "टिप्पणियाँ छिपाएं",
        "optHideRelated": "संबंधित वीडियो छिपाएं",
        "optHidePlaylist": "प्लेलिस्ट छिपाएं",
        "optHideSubs": "सदस्यता छिपाएं",
        "optHideYou": "'आपका' अनुभाग छिपाएं",
        "optHideExplore": "एक्सप्लोर छिपाएं",
        "optHideExtraMenu": "खाता मेनू साफ करें (वीडियो, फिल्में, आदि)",
        "secReminder": "🔔 रिमाइंडर",
        "optEnableReminder": "सॉफ्ट रिमाइंडर सक्षम करें",
        "optReminderInterval": "अंतराल",
        "msgReminderEvery": "प्रत्येक {n} मिनट",
        "secHardBlock": "⏰ साइट ब्लॉक शेड्यूल",
        "optEnableHardBlock": "ब्लॉकिंग सक्षम करें",
        "optStartTime": "शुरू होने का समय",
        "optEndTime": "समाप्ति का समय",
        "optBlockYT": "YouTube पर लागू करें",
        "optBlockIG": "Instagram पर लागू करें",
        "secUsageLimit": "⏳ उपयोग समय सीमा",
        "optEnableUsageLimit": "समय सीमा सक्षम करें",
        "optUsageLimitMinutes": "सीमा समय (मिनट)",
        "msgUsageMinutes": "{n} मिनट",
        "msgCountdown": "{n} सेकंड में स्क्रीन ब्लॉक",
        "optBlockYTNow": "🚫 YouTube अभी ब्लॉक करें",
        "optBlockIGNow": "🚫 Instagram अभी ब्लॉक करें",
        "optBlockAfterTimer": "टाइमर समाप्त होने पर साइट ब्लॉक करें",
        "msgFocusTime": "यह फोकस समय है!",
        "msgTakeABreak": "touch the grass!",
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

function updateTimerLabel() {
    const val = document.getElementById('soft_reminders_interval').value;
    const locale = document.getElementById('userLocale').value;
    const currentLang = (locale === 'auto') ? getSystemLocale() : locale;
    const texts = i18nData[currentLang] || i18nData['en'];
    document.getElementById('timer-label').textContent = texts.msgReminderEvery.replace("{n}", val);
}

function updateUsageLimitLabel() {
    const val = document.getElementById('usage_limit_minutes').value;
    const locale = document.getElementById('userLocale').value;
    const currentLang = (locale === 'auto') ? getSystemLocale() : locale;
    const texts = i18nData[currentLang] || i18nData['en'];
    document.getElementById('usage-limit-label').textContent = texts.msgUsageMinutes.replace("{n}", val);
}


function updateTexts(locale) {
    if (locale === 'auto') locale = getSystemLocale();

    const texts = i18nData[locale] || i18nData['en'];

    // Header
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) headerTitle.textContent = texts.extName;

    // Strict Mode
    document.querySelector('.strict-title').textContent = texts.secStrict;
    document.querySelector('.optStrictDesc').textContent = texts.optStrictDesc;
    document.querySelector('.strict-helper').textContent = texts.descStrictHelper;

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
    setLabel('yt_blurThumbnails', texts.optBlurThumbnails);
    setLabel('yt_hideHome', texts.optMinimalHome);
    setLabel('yt_hideSidebar', texts.optHideSidebar);
    setLabel('yt_hideHeader', texts.optHideHeader);
    setLabel('yt_hideNotifications', texts.optHideNotifications);
    setLabel('yt_hideComments', texts.optHideComments);
    setLabel('yt_hideRelated', texts.optHideRelated);
    setLabel('yt_hidePlaylist', texts.optHidePlaylist);
    setLabel('yt_hideSubs', texts.optHideSubs);
    setLabel('yt_hideYou', texts.optHideYou);
    setLabel('yt_hideExplore', texts.optHideExplore);
    setLabel('yt_hideExtraMenu', texts.optHideExtraMenu);

    // Hard Block Section
    const hardBlockTitle = document.querySelector('.yt-hardblock-title');
    if (hardBlockTitle) hardBlockTitle.textContent = texts.secHardBlock;
    setLabel('yt_hard_block_enabled', texts.optEnableHardBlock);
    setDesc('yt_hard_block_start', texts.optStartTime);
    setDesc('yt_hard_block_end', texts.optEndTime);
    setLabel('block_yt', texts.optBlockYT);
    setLabel('block_ig', texts.optBlockIG);

    // Reminder Section
    document.querySelector('.reminder-title').textContent = texts.secReminder;
    document.querySelector('.optReminderDesc').textContent = texts.optEnableReminder;
    document.querySelector('.optReminderInterval').textContent = texts.optReminderInterval;
    updateTimerLabel();

    // Usage Limit Section
    const usageLimitTitle = document.querySelector('.usage-limit-title');
    if (usageLimitTitle) usageLimitTitle.textContent = texts.secUsageLimit;
    const optEnableUsageLimit = document.querySelector('.optEnableUsageLimit');
    if (optEnableUsageLimit) optEnableUsageLimit.textContent = texts.optEnableUsageLimit;
    const optUsageLimitMinutes = document.querySelector('.optUsageLimitMinutes');
    if (optUsageLimitMinutes) optUsageLimitMinutes.textContent = texts.optUsageLimitMinutes;
    const optBlockEntireYT = document.querySelector('.optBlockEntireYT');
    if (optBlockEntireYT) optBlockEntireYT.textContent = texts.optBlockEntireYT;
    const optBlockYTNow = document.querySelector('.optBlockYTNow');
    if (optBlockYTNow) optBlockYTNow.textContent = texts.optBlockYTNow;
    const optBlockIGNow = document.querySelector('.optBlockIGNow');
    if (optBlockIGNow) optBlockIGNow.textContent = texts.optBlockIGNow;
    updateUsageLimitLabel();






    // Footer
    document.getElementById('status').dataset.savedText = texts.statusSaved;
}

function updateDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    const btn = document.getElementById('toggleDarkMode');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function saveOptions() {
    const options = {};
    Object.keys(defaultOptions).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                options[key] = el.checked;
            } else if (el.type === 'range') {
                options[key] = parseInt(el.value);
            } else if (el.type === 'text' || el.type === 'time' || el.tagName === 'SELECT') {
                options[key] = el.value || defaultOptions[key];
            }
        }
    });

    // userLocale manually
    options.userLocale = document.getElementById('userLocale').value;
    options.darkMode = document.body.classList.contains('dark-mode');

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

        // Update Lock State
        updateLockState(options.strict_mode);
        updateTimerLabel();
    });
}



function restoreOptions() {
    chrome.storage.sync.get(defaultOptions, (items) => {
        Object.keys(defaultOptions).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = items[key];
                } else if (el.type === 'range') {
                    el.value = items[key];
                } else if (el.type === 'text' || el.type === 'time') {
                    el.value = items[key] || defaultOptions[key];
                }
            }
        });

        // Restore Locale
        const localeEl = document.getElementById('userLocale');
        if (localeEl) {
            localeEl.value = items.userLocale || "auto";
        }

        updateTexts(items.userLocale);
        updateLockState(items.strict_mode);
        updateDarkMode(items.darkMode);
        handleUsageLimitToggle(); // Initialize state
    });
}

function handleUsageLimitToggle() {
    const isEnabled = document.getElementById('usage_limit_enabled').checked;
    const blockAfterTimer = document.getElementById('block_after_timer');
    const slider = document.getElementById('usage_limit_minutes');
    const blockRow = document.getElementById('block_after_timer_row');
    const sliderRow = document.getElementById('usage_limit_minutes_row');

    // Block After Timer Section
    if (blockAfterTimer) {
        blockAfterTimer.disabled = !isEnabled;
        if (!isEnabled) blockAfterTimer.checked = false;
    }
    if (blockRow) {
        blockRow.style.opacity = isEnabled ? '1' : '0.4';
        blockRow.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }

    // Slider Section
    if (slider) {
        slider.disabled = !isEnabled;
    }
    if (sliderRow) {
        sliderRow.style.opacity = isEnabled ? '1' : '0.4';
        sliderRow.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }
}

function updateLockState(isLocked) {
    // Disable inputs
    const inputs = document.querySelectorAll('input:not(#strict_mode, #userLocale)');
    inputs.forEach(input => {
        input.disabled = isLocked;

        // SKIP opacity update for usage limit sub-options (they are handled by handleUsageLimitToggle)
        if (input.id === 'usage_limit_minutes' || input.id === 'block_after_timer') {
            return;
        }

        if (isLocked) {
            input.parentElement.style.opacity = "0.5";
            input.parentElement.style.pointerEvents = "none";
        } else {
            input.parentElement.style.opacity = "1";
            input.parentElement.style.pointerEvents = "auto";
        }
    });

    // Disable Section Hover Effects
    const sections = document.querySelectorAll('.platform-section');
    sections.forEach(section => {
        if (isLocked) {
            section.style.pointerEvents = "none";
            section.style.transform = "none";
        } else {
            section.style.pointerEvents = "auto";
            section.style.transform = "";
        }
    });

    const strictInput = document.getElementById('strict_mode');
    if (strictInput) strictInput.checked = isLocked;
}

let unlockTimer = null;

function handleStrictToggle(e) {
    const isChecked = e.target.checked;

    if (isChecked) {
        // Engaging Strict Mode: Immediate
        saveOptions();
    } else {
        // Disabling Strict Mode: Delay required
        e.preventDefault(); // Prevent immediate toggle

        if (unlockTimer) return; // Already unlocking

        const msgEl = document.getElementById('unlock-msg');
        let seconds = 10;

        // Get current locale for message
        const locale = document.getElementById('userLocale').value;
        const currentLang = (locale === 'auto') ? getSystemLocale() : locale;
        const texts = i18nData[currentLang] || i18nData['en'];

        msgEl.style.opacity = "1";
        msgEl.textContent = texts.msgWait.replace("{n}", seconds);

        unlockTimer = setInterval(() => {
            seconds--;
            msgEl.textContent = texts.msgWait.replace("{n}", seconds);

            if (seconds <= 0) {
                clearInterval(unlockTimer);
                unlockTimer = null;

                // Allow unlock
                e.target.checked = false;
                msgEl.textContent = texts.msgUnlock;
                saveOptions();

                setTimeout(() => {
                    msgEl.style.opacity = "0";
                }, 2000);
            }
        }, 1000);
    }
}

document.getElementById('soft_reminders_interval').addEventListener('input', updateTimerLabel);
document.getElementById('usage_limit_minutes').addEventListener('input', updateUsageLimitLabel);

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input').forEach(input => {
    if (input.id === 'strict_mode') {
        input.addEventListener('click', handleStrictToggle);
    } else if (input.type === 'text') {
        input.addEventListener('blur', saveOptions);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveOptions(); });
    } else {
        input.addEventListener('change', saveOptions);
    }
});
document.getElementById('userLocale').addEventListener('change', saveOptions);
document.getElementById('toggleDarkMode').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    updateDarkMode(isDark);
    saveOptions();
});
document.getElementById('usage_limit_enabled').addEventListener('change', () => {
    handleUsageLimitToggle();
    saveOptions();
});
const blockAfterTimerEl = document.getElementById('block_after_timer');
if (blockAfterTimerEl) {
    blockAfterTimerEl.addEventListener('change', (e) => {
        // Enforce dependency: if parent is off, force this off too
        const parentEnabled = document.getElementById('usage_limit_enabled').checked;
        if (!parentEnabled) {
            e.target.checked = false;
        }
        saveOptions();
    });
}


