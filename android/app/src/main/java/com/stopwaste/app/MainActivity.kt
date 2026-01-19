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
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.floatingactionbutton.FloatingActionButton
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var prefs: SharedPreferences
    private lateinit var fabSettings: FloatingActionButton
    private val TAG = "StopWaste"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = getSharedPreferences("stopwaste_prefs", Context.MODE_PRIVATE)
        webView = findViewById(R.id.webView)
        fabSettings = findViewById(R.id.fabSettings)
        
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
            }
        }
        
        webView.webChromeClient = WebChromeClient()

        fabSettings.setOnClickListener {
            showSettingsDialog()
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
            options = arrayOf("쇼츠 차단", "알고리즘 숨기기 (홈/추천)", "시청 기록 숨기기", "재생목록 숨기기", "댓글 숨기기", "썸네일 블러")
            keys = arrayOf("yt_hideShorts", "yt_hideAlgorithm", "yt_hideHistory", "yt_hidePlaylists", "yt_hideComments", "yt_blurThumbnails")
        }

        val checkedItems = BooleanArray(options.size) { i -> config.optBoolean(keys[i], false) }

        AlertDialog.Builder(this)
            .setTitle("\uD83D\uDEE1\uFE0F StopWaste 설정")
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
                                'ns-yt-blur-thumbnails': config.yt_blurThumbnails === true
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

                            // 5. PLAYLIST HIDING (Text-based)
                            if (config.yt_hidePlaylists === true) {
                                var playlistSections = document.querySelectorAll('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                                playlistSections.forEach(function(sec) {
                                    if (sec.style.display === 'none') return;
                                    var header = sec.querySelector('.ytm-section-header-renderer, h2, h3, .reel-shelf-header');
                                    if (header && (header.textContent.indexOf('재생목록') !== -1 || header.textContent.toLowerCase().indexOf('playlist') !== -1)) {
                                        sec.style.display = 'none';
                                    }
                                });
                            }

                            // 6. HISTORY HIDING (Text-based)
                            if (config.yt_hideHistory === true) {
                                var historySections = document.querySelectorAll('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                                historySections.forEach(function(sec) {
                                    if (sec.style.display === 'none') return;
                                    var header = sec.querySelector('.ytm-section-header-renderer, h2, h3, .reel-shelf-header');
                                    if (header && (header.textContent.indexOf('기록') !== -1 || header.textContent.toLowerCase().indexOf('history') !== -1)) {
                                        sec.style.display = 'none';
                                    }
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
            "yt_hideShorts":true,"yt_hideAlgorithm":false,"yt_hideHistory":false,"yt_hidePlaylists":false,"yt_hideComments":true,"yt_blurThumbnails":false,
            "ig_hideFeed":true,"ig_hidePhotos":false,"ig_hideVideos":false,"ig_hideHome":false,"ig_hideExplore":true,"ig_hideReels":true,"ig_hideStories":false,"ig_hideNumbers":false,"ig_grayscale":false,"ig_hideSidebar":true
        }""".trimIndent()
    }

    inner class StopWasteBridge {
        @JavascriptInterface
        fun getSettings(): String = prefs.getString("config", getDefaultConfig()) ?: getDefaultConfig()
    }
}
