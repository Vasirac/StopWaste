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
        
        val options = arrayOf("쇼츠 차단", "알고리즘 숨기기 (홈/추천)", "재생목록 숨기기", "댓글 숨기기", "썸네일 블러")
        val keys = arrayOf("yt_hideShorts", "yt_hideAlgorithm", "yt_hidePlaylists", "yt_hideComments", "yt_blurThumbnails")
        val checkedItems = BooleanArray(options.size) { i -> config.optBoolean(keys[i], false) }

        AlertDialog.Builder(this)
            .setTitle("🛡️ StopWaste 설정")
            .setMultiChoiceItems(options, checkedItems) { _, which, isChecked ->
                checkedItems[which] = isChecked
            }
            .setPositiveButton("저장") { _, _ ->
                val newConfig = JSONObject()
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
            val youtubeCss = assets.open("youtube.css").bufferedReader().use { it.readText() }
                .replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$").replace("\n", " ")
            
            val configStr = prefs.getString("config", getDefaultConfig()) ?: getDefaultConfig()
            val config = JSONObject(configStr)

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
                    style.textContent = `$youtubeCss`;
                    
                    var config = $configStr;
                    
                    function applyClasses() {
                        var html = document.documentElement;
                        if (!html) return;
                        
                        var toggles = {
                            'ns-yt-shorts': config.yt_hideShorts !== false,
                            'ns-yt-algorithm': config.yt_hideAlgorithm === true,
                            'ns-yt-playlists': config.yt_hidePlaylists === true,
                            'ns-yt-comments': config.yt_hideComments !== false,
                            'ns-yt-blur-thumbnails': config.yt_blurThumbnails === true
                        };
                        
                        for (var key in toggles) {
                            if (toggles[key]) {
                                if (!html.classList.contains(key)) html.classList.add(key);
                            } else {
                                if (html.classList.contains(key)) html.classList.remove(key);
                            }
                        }

                        // SECONDARY JS CLEANER (for elements that escape CSS)
                        if (config.yt_hideShorts !== false) {
                            var headers = document.querySelectorAll('.reel-shelf-header, .ytm-carousel-header-view-model, .reel-shelf-header-view-model, ytm-carousel-header-view-model');
                            headers.forEach(function(h) {
                                if (h.textContent.indexOf('Shorts') !== -1 || h.textContent.indexOf('쇼츠') !== -1) {
                                    var parent = h.closest('ytm-item-section-renderer, ytm-rich-section-renderer, .ytm-item-section-renderer, .ytm-rich-section-renderer');
                                    if (parent) parent.style.display = 'none';
                                    h.style.display = 'none';
                                }
                            });
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
        return """{"yt_hideShorts":true,"yt_hideAlgorithm":false,"yt_hidePlaylists":false,"yt_hideComments":true,"yt_blurThumbnails":false}"""
    }

    inner class StopWasteBridge {
        @JavascriptInterface
        fun getSettings(): String = prefs.getString("config", getDefaultConfig()) ?: getDefaultConfig()
    }
}
