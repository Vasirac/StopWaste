import 'dart:convert';
import 'package:flutter/services.dart';

class InjectionLogic {
  static const String styleId = 'sw-injected-css';

  static Future<String> getInjectionScript(String cssFile, Map<String, dynamic> config, bool isInstagram) async {
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
          
          applyClasses();
          if (window.swInterval) clearInterval(window.swInterval);
          window.swInterval = setInterval(applyClasses, 1000);
      })();
    """;
  }
}
