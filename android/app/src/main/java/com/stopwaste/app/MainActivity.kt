package com.stopwaste.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.floatingactionbutton.FloatingActionButton
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var prefs: SharedPreferences
    private lateinit var fabSettings: FloatingActionButton
    private lateinit var bottomNav: com.google.android.material.bottomnavigation.BottomNavigationView
    private val TAG = "StopWaste"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable Edge-to-Edge design
        enableEdgeToEdge()
        
        setContentView(R.layout.activity_main)

        // Adjust view padding for system bars (status bar, nav bar)
        val mainLayout = findViewById<android.view.View>(android.R.id.content)
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(mainLayout) { v, insets ->
            val systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        prefs = getSharedPreferences("stopwaste_prefs", Context.MODE_PRIVATE)
        webView = findViewById(R.id.webView)
        fabSettings = findViewById(R.id.fabSettings)
        bottomNav = findViewById(R.id.bottomNav)
        
        WebView.setWebContentsDebuggingEnabled(true)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            javaScriptCanOpenWindowsAutomatically = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView.addJavascriptInterface(StopWasteBridge(), "AndroidBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectAll()
            }
            override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
                super.doUpdateVisitedHistory(view, url, isReload)
                injectAll()
                updateBottomNavSelection(url)
            }
        }
        
        webView.webChromeClient = WebChromeClient()

        fabSettings.setOnClickListener {
            showSettingsDialog()
        }

        bottomNav.setOnItemSelectedListener { item ->
            val isYoutube = packageName.contains("youtube")
            when (item.itemId) {
                R.id.nav_home -> {
                    if (isYoutube) webView.loadUrl("https://m.youtube.com")
                    else webView.loadUrl("https://www.instagram.com")
                    true
                }
                R.id.nav_subs -> {
                    if (isYoutube) webView.loadUrl("https://m.youtube.com/feed/subscriptions")
                    else webView.loadUrl("https://www.instagram.com/explore/")
                    true
                }
                R.id.nav_library -> {
                    if (isYoutube) webView.loadUrl("https://m.youtube.com/feed/library")
                    else webView.loadUrl("https://www.instagram.com/reels/")
                    true
                }
                R.id.nav_settings -> {
                    showSettingsDialog()
                    false // Don't highlight settings tab
                }
                else -> false
            }
        }

        val packageName = packageName
        if (packageName.contains("youtube")) {
            webView.loadUrl("https://m.youtube.com")
        } else if (packageName.contains("instagram")) {
            webView.loadUrl("https://www.instagram.com")
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack()
                else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun updateBottomNavSelection(url: String?) {
        if (url == null) return
        val isYoutube = packageName.contains("youtube")
        
        try {
            if (isYoutube) {
                when {
                    url.endsWith("m.youtube.com/") || url.contains("m.youtube.com/?") -> bottomNav.menu.findItem(R.id.nav_home).isChecked = true
                    url.contains("/feed/subscriptions") -> bottomNav.menu.findItem(R.id.nav_subs).isChecked = true
                    url.contains("/feed/library") || url.contains("/feed/you") -> bottomNav.menu.findItem(R.id.nav_library).isChecked = true
                }
            } else {
                when {
                    url.endsWith("instagram.com/") -> bottomNav.menu.findItem(R.id.nav_home).isChecked = true
                    url.contains("/explore/") -> bottomNav.menu.findItem(R.id.nav_subs).isChecked = true
                    url.contains("/reels/") -> bottomNav.menu.findItem(R.id.nav_library).isChecked = true
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Update nav error", e)
        }
    }

    private fun showSettingsDialog() {
        val configStr = prefs.getString("config", getDefaultConfig()) ?: getDefaultConfig()
        val config = JSONObject(configStr)
        val isInstagram = packageName.contains("instagram")

        val options: Array<String>
        val keys: Array<String>

        if (isInstagram) {
            options = arrayOf("메인 피드 숨기기", "사진 게시물 가리기", "동영상 게시물 가리기", "홈 탭 숨기기", "탐색 탭 숨기기", "릴스 숨기기", "스토리 숨기기", "숫자 숨기기 (팔로워 등)", "흑백 모드", "사이드바/추천 숨기기")
            keys = arrayOf("ig_hideFeed", "ig_hidePhotos", "ig_hideVideos", "ig_hideHome", "ig_hideExplore", "ig_hideReels", "ig_hideStories", "ig_hideNumbers", "ig_grayscale", "ig_hideSidebar")
        } else {
            options = arrayOf("쇼츠 차단", "알고리즘 숨기기 (홈/추천)", "시청 기록 숨기기", "재생목록 숨기기", "댓글 숨기기", "썸네일 블러", "추가 메뉴 숨기기 (내 동영상 등)")
            keys = arrayOf("yt_hideShorts", "yt_hideAlgorithm", "yt_hideHistory", "yt_hidePlaylists", "yt_hideComments", "yt_blurThumbnails", "yt_hideExtraMenu")
        }

        val checkedItems = BooleanArray(options.size) { i -> config.optBoolean(keys[i], false) }

        // TODO: Replace with modern BottomSheetDialogFragment
        AlertDialog.Builder(this)
            .setTitle("🛡️ StopWaste 설정")
            .setMultiChoiceItems(options, checkedItems) { _, which, isChecked ->
                checkedItems[which] = isChecked
            }
            .setPositiveButton("저장") { _, _ ->
                val newConfig = JSONObject(configStr) // Preserve existing other platform config
                for (i in options.indices) {
                    newConfig.put(keys[i], checkedItems[i])
                }
                prefs.edit().putString("config", newConfig.toString()).apply()
                injectAll()
            }
            .setNegativeButton("취소", null)
            .show()
    }

    private fun injectAll() {
        try {
            val isInstagram = packageName.contains("instagram")
            val cssFile = if (isInstagram) "instagram.css" else "youtube.css"
            
            val cssContent = assets.open(cssFile).bufferedReader().use { it.readText() }
                .replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$").replace("\n", " ")
            
            val configStr = prefs.getString("config", getDefaultConfig()) ?: getDefaultConfig()

            // Inject CSS and apply classes with JS cleaner
            val script = """
                (function() {
                    var styleId = 'sw-injected-css';
                    var style = document.getElementById(styleId);
                    if (!style) {
                        style = document.createElement('style');
                        style.id = styleId;
                        document.head.appendChild(style);
                    }
                    style.textContent = `$cssContent`;
                    
                    var config = $configStr;
                    
                    function applyClasses() {
                        var html = document.documentElement;
                        if (!html) return;
                        
                        var toggles = {};
                        if ($isInstagram) {
                            toggles = {
                                'ns-ig-feed': config.ig_hideFeed === true,
                                'ns-ig-photos': config.ig_hidePhotos === true,
                                'ns-ig-videos': config.ig_hideVideos === true,
                                'ns-ig-home': config.ig_hideHome === true,
                                'ns-ig-explore': config.ig_hideExplore === true,
                                'ns-ig-reels': config.ig_hideReels === true,
                                'ns-ig-stories': config.ig_hideStories === true,
                                'ns-ig-numbers': config.ig_hideNumbers === true,
                                'ns-grayscale': config.ig_grayscale === true,
                                'ns-ig-sidebar-rec': config.ig_hideSidebar === true
                            };
                        } else {
                            toggles = {
                                'ns-yt-shorts': config.yt_hideShorts !== false,
                                'ns-yt-algorithm': config.yt_hideAlgorithm === true,
                                'ns-yt-history': config.yt_hideHistory === true,
                                'ns-yt-playlists': config.yt_hidePlaylists === true,
                                'ns-yt-comments': config.yt_hideComments !== false,
                                'ns-yt-blur-thumbnails': config.yt_blurThumbnails === true,
                                'ns-yt-extra-menu': config.yt_hideExtraMenu === true
                            };
                        }
                        
                        for (var key in toggles) {
                            if (toggles[key]) {
                                if (!html.classList.contains(key)) html.classList.add(key);
                            } else {
                                if (html.classList.contains(key)) html.classList.remove(key);
                            }
                        }

                        // --- SIMPLE CORE SHORTS BLOCKER ---
                        if (!$isInstagram) {
                            var hideShorts = config.yt_hideShorts !== false;
                            
                            if (hideShorts) {
                                // 1. Hide any container that contains a /shorts/ link
                                var shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
                                shortsLinks.forEach(function(link) {
                                    var item = link.closest('ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-carousel-item-renderer, ytm-rich-item-renderer');
                                    if (item) item.style.display = 'none';
                                });

                                // 2. Hide dedicated Shorts shelves
                                var shelves = document.querySelectorAll('ytm-reel-shelf-renderer, ytm-shorts-lockup-view-model, ytm-reel-shelf-header-view-model');
                                shelves.forEach(function(s) { s.style.display = 'none'; });

                                // 3. Hide sections that have "Shorts" in header
                                var sections = document.querySelectorAll('ytm-item-section-renderer, ytm-rich-section-renderer');
                                sections.forEach(function(sec) {
                                    var header = sec.querySelector('h2, h3, .reel-shelf-header');
                                    if (header && (header.textContent.indexOf('Shorts') !== -1 || header.textContent.indexOf('쇼츠') !== -1)) {
                                        sec.style.display = 'none';
                                    }
                                });
                            } else {
                                // RESTORE ALL
                                var allHidden = document.querySelectorAll('ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-carousel-item-renderer, ytm-rich-item-renderer, ytm-reel-shelf-renderer, ytm-shorts-lockup-view-model, ytm-reel-shelf-header-view-model, ytm-item-section-renderer, ytm-rich-section-renderer, ytm-comments-entry-point-header-renderer, ytm-comment-teaser-renderer');
                                allHidden.forEach(function(el) {
                                    if (el.style.display === 'none') el.style.display = '';
                                });
                            }

                            // 4. EXTRA HELP FOR COMMENTS (Aggressive Text-based)
                            if (config.yt_hideComments !== false) {
                                // A. Specific tags
                                var commentTags = document.querySelectorAll('ytm-comments-entry-point-header-renderer, ytm-comment-teaser-renderer, .ytm-comments-entry-point-header-renderer, .ytm-comment-teaser-renderer');
                                commentTags.forEach(function(box) {
                                    if (box.style.display !== 'none') box.style.display = 'none';
                                });
                                
                                // B. Find section by text
                                var sections = document.querySelectorAll('ytm-item-section-renderer, .ytm-item-section-renderer');
                                sections.forEach(function(sec) {
                                    if (sec.style.display === 'none') return;
                                    var header = sec.querySelector('.ytm-section-header-renderer, h2, h3');
                                    if (header && (header.textContent.indexOf('댓글') !== -1 || header.textContent.indexOf('Comment') !== -1)) {
                                        sec.style.display = 'none';
                                    }
                                });
                            }

                            // 6. HISTORY HIDING (Aggressive Text-based)
                            if (config.yt_hideHistory === true) {
                                var historyHeaders = document.querySelectorAll('h2, h3, .ytm-section-header-renderer, .reel-shelf-header-view-model');
                                historyHeaders.forEach(function(h) {
                                    if (h.textContent.indexOf('기록') !== -1 || h.textContent.toLowerCase().indexOf('history') !== -1) {
                                        var section = h.closest('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                                        if (section) section.style.display = 'none';
                                    }
                                });
                            } else {
                                // Restore History
                                var historyHeaders = document.querySelectorAll('h2, h3, .ytm-section-header-renderer, .reel-shelf-header-view-model');
                                historyHeaders.forEach(function(h) {
                                    if (h.textContent.indexOf('기록') !== -1 || h.textContent.toLowerCase().indexOf('history') !== -1) {
                                        var section = h.closest('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                                        if (section && section.style.display === 'none') section.style.display = '';
                                    }
                                });
                            }

                            // 7. PLAYLIST HIDING (Aggressive Text-based)
                            if (config.yt_hidePlaylists === true) {
                                var playlistHeaders = document.querySelectorAll('h2, h3, .ytm-section-header-renderer, .reel-shelf-header-view-model');
                                playlistHeaders.forEach(function(h) {
                                    if (h.textContent.indexOf('재생목록') !== -1 || h.textContent.toLowerCase().indexOf('playlist') !== -1) {
                                        var section = h.closest('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                                        if (section) section.style.display = 'none';
                                    }
                                });
                            } else {
                                // Restore Playlists
                                var playlistHeaders = document.querySelectorAll('h2, h3, .ytm-section-header-renderer, .reel-shelf-header-view-model');
                                playlistHeaders.forEach(function(h) {
                                    if (h.textContent.indexOf('재생목록') !== -1 || h.textContent.toLowerCase().indexOf('playlist') !== -1) {
                                        var section = h.closest('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                                        if (section && section.style.display === 'none') section.style.display = '';
                                    }
                                });
                            }

                            // 8. ACCOUNT MENU HIDING (Your Videos, Your Movies, Feedback)
                            if (config.yt_hideExtraMenu === true) {
                                var keywords = ['내 동영상', '내 영화', '의견', '고객센터', 'Your videos', 'Your movies', 'Feedback', 'Help'];
                                var allLinks = document.querySelectorAll('ytm-compact-link-renderer, .ytm-compact-link-renderer, a');
                                allLinks.forEach(function(el) {
                                    var text = el.textContent;
                                    
                                    // EXCLUDE: Watch Later and Liked Videos
                                    if (text.indexOf('나중에 볼 동영상') !== -1 || text.indexOf('좋아요 표시한 동영상') !== -1 || 
                                        text.indexOf('Watch later') !== -1 || text.indexOf('Liked videos') !== -1) {
                                        return;
                                    }

                                    var shouldHide = keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
                                    
                                    // Also check icons/hrefs for hidden items
                                    var href = el.getAttribute('href') || (el.querySelector('a') ? el.querySelector('a').getAttribute('href') : "");
                                    if (!shouldHide && href) {
                                        // EXCLUDE Watch Later and Liked lists via href
                                        if (href.indexOf('list=WL') !== -1 || href.indexOf('list=LL') !== -1) return;
                                        
                                        shouldHide = (href.indexOf('/premium') !== -1 || href.indexOf('/purchases') !== -1 || href.indexOf('feedback') !== -1);
                                    }

                                    if (shouldHide) {
                                        var box = (el.tagName === 'YTM-COMPACT-LINK-RENDERER') ? el : el.closest('ytm-compact-link-renderer');
                                        if (box) box.style.display = 'none';
                                        else el.style.display = 'none';
                                    }
                                });
                            } else {
                                // Restore Account Menu
                                var allHidden = document.querySelectorAll('ytm-compact-link-renderer, .ytm-compact-link-renderer, a');
                                allHidden.forEach(function(el) {
                                    if (el.style.display === 'none') el.style.display = '';
                                });
                            }
                        }
                    }
                    
                    applyClasses();
                    if (window.swInterval) clearInterval(window.swInterval);
                    window.swInterval = setInterval(applyClasses, 1000);
                })();
            """.trimIndent()
            
            webView.post {
                webView.evaluateJavascript(script, null)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Injection error", e)
        }
    }
    
    private fun getDefaultConfig(): String {
        return """{
            "yt_hideShorts":true,"yt_hideAlgorithm":false,"yt_hideHistory":false,"yt_hidePlaylists":false,"yt_hideComments":true,"yt_blurThumbnails":false,"yt_hideExtraMenu":false,
            "ig_hideFeed":true,"ig_hidePhotos":false,"ig_hideVideos":false,"ig_hideHome":false,"ig_hideExplore":true,"ig_hideReels":true,"ig_hideStories":false,"ig_hideNumbers":false,"ig_grayscale":false,"ig_hideSidebar":true
        }""".trimIndent()
    }

    inner class StopWasteBridge {
        @JavascriptInterface
        fun getSettings(): String = prefs.getString("config", getDefaultConfig()) ?: getDefaultConfig()
    }
}
