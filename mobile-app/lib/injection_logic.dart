import 'dart:convert';
import 'package:flutter/services.dart';

class InjectionLogic {
  static const String styleId = 'sw-injected-css';

  static Future<String> getInjectionScript(
    String cssFile,
    Map<String, dynamic> config,
    bool isInstagram,
  ) async {
    String cssContent = await rootBundle.loadString('assets/$cssFile');

    // Minimal sanitation for JS template literal
    cssContent = cssContent
        .replaceAll('\\', '\\\\')
        .replaceAll('`', '\\`')
        .replaceAll(r'$', r'\$')
        .replaceAll('\n', ' ');

    final String configStr = jsonEncode(config);

    return """
      (function() {
          var styleId = '$styleId';
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
                      var shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
                      shortsLinks.forEach(function(link) {
                          var item = link.closest('ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-carousel-item-renderer, ytm-rich-item-renderer');
                          if (item) item.style.display = 'none';
                      });

                      var shelves = document.querySelectorAll('ytm-reel-shelf-renderer, ytm-shorts-lockup-view-model, ytm-reel-shelf-header-view-model');
                      shelves.forEach(function(s) { s.style.display = 'none'; });

                      var sections = document.querySelectorAll('ytm-item-section-renderer, ytm-rich-section-renderer');
                      sections.forEach(function(sec) {
                          var header = sec.querySelector('h2, h3, .reel-shelf-header');
                          if (header && (header.textContent.indexOf('Shorts') !== -1 || header.textContent.indexOf('쇼츠') !== -1)) {
                              sec.style.display = 'none';
                          }
                      });
                  } else {
                      var allHidden = document.querySelectorAll('ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-carousel-item-renderer, ytm-rich-item-renderer, ytm-reel-shelf-renderer, ytm-shorts-lockup-view-model, ytm-reel-shelf-header-view-model, ytm-item-section-renderer, ytm-rich-section-renderer, ytm-comments-entry-point-header-renderer, ytm-comment-teaser-renderer');
                      allHidden.forEach(function(el) {
                          if (el.style.display === 'none') el.style.display = '';
                      });
                  }

                  if (config.yt_hideComments !== false) {
                      var commentTags = document.querySelectorAll('ytm-comments-entry-point-header-renderer, ytm-comment-teaser-renderer, .ytm-comments-entry-point-header-renderer, .ytm-comment-teaser-renderer');
                      commentTags.forEach(function(box) {
                          if (box.style.display !== 'none') box.style.display = 'none';
                      });
                      
                      var sections = document.querySelectorAll('ytm-item-section-renderer, .ytm-item-section-renderer');
                      sections.forEach(function(sec) {
                          if (sec.style.display === 'none') return;
                          var header = sec.querySelector('.ytm-section-header-renderer, h2, h3');
                          if (header && (header.textContent.indexOf('댓글') !== -1 || header.textContent.indexOf('Comment') !== -1)) {
                              sec.style.display = 'none';
                          }
                      });
                  }

                  if (config.yt_hideHistory === true) {
                      var historyHeaders = document.querySelectorAll('h2, h3, .ytm-section-header-renderer, .reel-shelf-header-view-model');
                      historyHeaders.forEach(function(h) {
                          if (h.textContent.indexOf('기록') !== -1 || h.textContent.toLowerCase().indexOf('history') !== -1) {
                              var section = h.closest('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                              if (section) section.style.display = 'none';
                          }
                      });
                  }

                  if (config.yt_hidePlaylists === true) {
                      var playlistHeaders = document.querySelectorAll('h2, h3, .ytm-section-header-renderer, .reel-shelf-header-view-model');
                      playlistHeaders.forEach(function(h) {
                          if (h.textContent.indexOf('재생목록') !== -1 || h.textContent.toLowerCase().indexOf('playlist') !== -1) {
                              var section = h.closest('ytm-item-section-renderer, .ytm-item-section-renderer, ytm-rich-section-renderer');
                              if (section) section.style.display = 'none';
                          }
                      });
                  }

                  if (config.yt_hideExtraMenu === true) {
                      var keywords = ['내 동영상', '내 영화', '의견', '고객센터', 'Your videos', 'Your movies', 'Feedback', 'Help'];
                      var allLinks = document.querySelectorAll('ytm-compact-link-renderer, .ytm-compact-link-renderer, a');
                      allLinks.forEach(function(el) {
                          var text = el.textContent;
                          if (text.indexOf('나중에 볼 동영상') !== -1 || text.indexOf('좋아요 표시한 동영상') !== -1 || 
                              text.indexOf('Watch later') !== -1 || text.indexOf('Liked videos') !== -1) {
                              return;
                          }
                          var shouldHide = keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
                          var href = el.getAttribute('href') || (el.querySelector('a') ? el.querySelector('a').getAttribute('href') : "");
                          if (!shouldHide && href) {
                              if (href.indexOf('list=WL') !== -1 || href.indexOf('list=LL') !== -1) return;
                              shouldHide = (href.indexOf('/premium') !== -1 || href.indexOf('/purchases') !== -1 || href.indexOf('feedback') !== -1);
                          }
                          if (shouldHide) {
                              var box = (el.tagName === 'YTM-COMPACT-LINK-RENDERER') ? el : el.closest('ytm-compact-link-renderer');
                              if (box) box.style.display = 'none';
                              else el.style.display = 'none';
                          }
                      });
                  }
              }
          }
          
          function showHardBlockOverlay(customText) {
              if (document.getElementById('ns-hard-block-overlay')) return;
              var video = document.querySelector('video');
              if (video) { video.pause(); video.src = ""; video.load(); }
              var overlay = document.createElement('div');
              overlay.id = 'ns-hard-block-overlay';
              overlay.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2147483647;font-family:sans-serif;';
              var card = document.createElement('div');
              card.style = 'background:rgba(255,255,255,0.7);backdrop-filter:blur(30px);padding:30px 40px;border-radius:32px;border:1px solid rgba(255,255,255,0.4);box-shadow:0 25px 50px rgba(0,0,0,0.1);text-align:center;width:80%;';
              var msg = customText || '사용 시간이 종료되었습니다.';
              card.innerHTML = '<div style="font-size:48px;margin-bottom:20px;">🛡️</div><div style="font-size:24px;font-weight:800;color:#222;margin-bottom:10px;">집중 시간입니다!</div><div style="font-size:16px;color:#666;line-height:1.4;">' + msg + '</div>';
              overlay.appendChild(card);
              document.documentElement.appendChild(overlay);
              document.documentElement.style.overflow = 'hidden';
          }

          function showStrongCountdown(seconds) {
              var small = document.getElementById('ns-usage-countdown');
              if (small) small.remove();
              var overlay = document.getElementById('ns-strong-countdown');
              if (!overlay) {
                  overlay = document.createElement('div');
                  overlay.id = 'ns-strong-countdown';
                  overlay.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.2);backdrop-filter:blur(20px);border-radius:30px;padding:30px 50px;border:1px solid rgba(255,255,255,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.2);z-index:2147483646;text-align:center;font-family:sans-serif;pointer-events:none;';
                  overlay.innerHTML = '<div style="font-size:60px;margin-bottom:10px;">⌛</div><div id="ns-strong-timer" style="font-size:100px;font-weight:900;color:#ff3b30;line-height:1;">10</div><div style="font-size:20px;font-weight:600;color:#333;margin-top:10px;opacity:0.8;">Touch the Grass!</div>';
                  document.body.appendChild(overlay);
              }
              var timerText = document.getElementById('ns-strong-timer');
              if (timerText) timerText.textContent = seconds;
          }

          function showCountdownOverlay(seconds) {
              var overlay = document.getElementById('ns-usage-countdown');
              if (!overlay) {
                  overlay = document.createElement('div');
                  overlay.id = 'ns-usage-countdown';
                  overlay.style = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:12px;font-family:sans-serif;font-size:16px;z-index:9999999;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.3s ease;border:1px solid rgba(255,255,255,0.1);';
                  document.body.appendChild(overlay);
              }
              overlay.textContent = "⌛ " + seconds + "초 후 화면 차단";
          }


          function checkImmediateBlock() {
              var isYt = window.location.hostname.indexOf('youtube.com') !== -1;
              var isIg = window.location.hostname.indexOf('instagram.com') !== -1;
              if (isYt && config.yt_block_now) {
                  var video = document.querySelector('video');
                  if (video) { video.pause(); video.src = ""; video.load(); }
                  showHardBlockOverlay("유튜브는 차단되었습니다! touch the grass!");
              }
              if (isIg && config.ig_block_now) {
                  showHardBlockOverlay("인스타그램은 차단되었습니다! touch the grass!");
              }
          }

          function blockSiteAfterTimerEnd() {
              var video = document.querySelector('video');
              if (video) { video.pause(); video.src = ""; video.load(); }
              showHardBlockOverlay("사용 시간이 종료되었습니다!");
          }

          if (config.usage_limit_enabled) {
              var storedStart = localStorage.getItem('ns_session_start');
              if (!storedStart) {
                  storedStart = Date.now().toString();
                  localStorage.setItem('ns_session_start', storedStart);
              }
              window.sessionStartTime = parseInt(storedStart, 10);
              if (window.usageLimitTimer) clearInterval(window.usageLimitTimer);
              window.usageLimitTimer = setInterval(function() {
                  var elapsed = (Date.now() - window.sessionStartTime) / 1000;
                  var limit = (config.usage_limit_minutes || 30) * 60;
                  var remaining = Math.max(0, Math.floor(limit - elapsed));
                  if (remaining <= 0) {
                      clearInterval(window.usageLimitTimer);
                      localStorage.removeItem('ns_session_start');
                      if (config.block_after_timer) {
                          blockSiteAfterTimerEnd();
                      } else {
                          showHardBlockOverlay("사용 시간이 종료되었습니다!");
                      }

                  } else if (remaining <= 10) {
                      showStrongCountdown(remaining);
                  } else if (remaining <= 60) {
                      showCountdownOverlay(remaining);
                  }
              }, 1000);
          }
          
          checkImmediateBlock();
          applyClasses();
          if (window.swInterval) clearInterval(window.swInterval);

          window.swInterval = setInterval(applyClasses, 1000);
      })();
    """;
  }
}
