class DmLogic {
  static String getRedirectJs(String targetUrl, int intervalMs) {
    return """
      (function() {
        // 콘텐츠 ID 추출 함수 (릴스, 게시물)
        function extractContentId(url) {
          // /reels/ABC123/ 또는 /reel/ABC123/
          const reelMatch = url.match(/\\/reels?\\/([A-Za-z0-9_-]+)/);
          if (reelMatch) return { type: 'reel', id: reelMatch[1] };
          
          // /p/ABC123/ (게시물)
          const postMatch = url.match(/\\/p\\/([A-Za-z0-9_-]+)/);
          if (postMatch) return { type: 'post', id: postMatch[1] };
          
          return null;
        }

        function checkAndApply() {
          const currentUrl = window.location.href;
          const target = "$targetUrl";
          const html = document.documentElement;

          // 1. 유효한 웹 주소(http/https)가 아니면 어떠한 처리도 하지 않음
          if (!currentUrl || !currentUrl.startsWith('http')) {
            return;
          }

          // 2. 로그인/회원가입 관련 페이지는 리다이렉트 제외
          const isAuthPage = currentUrl.includes('/accounts/') ||
                           currentUrl.includes('/login/') ||
                           currentUrl.includes('/signup/') ||
                           currentUrl.includes('/privacy/checks/');

          if (isAuthPage) {
            html.classList.remove('ns-dm-active');
            return;
          }

          // 3. 허용된 페이지 확인
          const isDmPage = currentUrl.includes('/direct/');
          const isStoryPage = currentUrl.includes('/stories/');
          const isReelPage = currentUrl.includes('/reel/') || currentUrl.includes('/reels/');
          const isPostPage = currentUrl.includes('/p/');

          // 4. 릴스/게시물 ID 변경 감지 (스크롤로 다음 콘텐츠 이동 시)
          const contentInfo = extractContentId(currentUrl);
          if (contentInfo) {
            // 첫 진입 시 ID 저장
            if (!window._lockedContentId) {
              window._lockedContentId = contentInfo.id;
              window._lockedContentType = contentInfo.type;
              console.log('Locked content: ' + contentInfo.type + '/' + contentInfo.id);
            } else {
              // ID가 변경되면 (= 스크롤로 다음 콘텐츠로 넘어감) → DM으로 리다이렉트
              if (window._lockedContentId !== contentInfo.id) {
                console.log('Content changed from ' + window._lockedContentId + ' to ' + contentInfo.id + '. Redirecting to DM.');
                window._lockedContentId = null;
                window._lockedContentType = null;
                html.classList.remove('ns-dm-active');
                window.location.replace(target);
                return;
              }
            }
          }

          // 5. DM 페이지 진입 시 잠금 해제
          if (isDmPage) {
            window._lockedContentId = null;
            window._lockedContentType = null;
          }

          // 6. 허용된 페이지에서는 CSS 클래스 적용
          if (isDmPage || isStoryPage || isReelPage || isPostPage) {
            if (!html.classList.contains('ns-dm-active')) {
              html.classList.add('ns-dm-active');
            }
          } else {
            // 그 외의 모든 페이지(홈, 탐색 등)는 즉시 DM함으로 리다이렉트
            html.classList.remove('ns-dm-active');
            window._lockedContentId = null;
            window._lockedContentType = null;
            console.log('Redirecting to DM Inbox from: ' + currentUrl);
            window.location.replace(target);
          }
        }

        if (window.dmRedirectInterval) clearInterval(window.dmRedirectInterval);
        window.dmRedirectInterval = setInterval(checkAndApply, $intervalMs);
        checkAndApply();
      })();
    """;
  }
}
