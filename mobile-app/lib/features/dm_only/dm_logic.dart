class DmLogic {
  static String getRedirectJs(String targetUrl, int intervalMs) {
    return """
      (function() {
        // --- 진단용 오버레이 추가 ---
        const diagId = 'ns-diagnostic-overlay';
        let overlay = document.getElementById(diagId);
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = diagId;
          overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:999999;font-size:12px;padding:5px;text-align:center;pointer-events:none;';
          document.body.appendChild(overlay);
        }

        function checkAndApply() {
          const currentUrl = window.location.href;
          const target = "$targetUrl";
          const html = document.documentElement;
          
          overlay.textContent = "DEBUG: " + currentUrl;

          // 1. 유효한 웹 주소(http/https)가 아니면 어떠한 처리도 하지 않음
          if (!currentUrl || !currentUrl.startsWith('http')) {
            return;
          }

          // 2. 로그인/회원가입 관련 페이지 및 메인 루트 페이지는 리다이렉트 제외
          const isAuthPage = currentUrl.includes('/accounts/') || 
                           currentUrl.includes('/login/') || 
                           currentUrl.includes('/signup/');
          
          const isSafePath = currentUrl === 'https://www.instagram.com/' || 
                            currentUrl === 'https://www.instagram.com' ||
                            currentUrl.endsWith('/direct/') ||
                            currentUrl.endsWith('/direct');

          if (isAuthPage || isSafePath) {
            html.classList.remove('ns-dm-active');
            overlay.style.background = 'blue';
            overlay.textContent += " (Auth/Safe - No Redirect)";
            return;
          }

          // 3. DM 인박스 페이지인지 확인
          const isDmPage = currentUrl.includes('/direct/inbox');

          if (isDmPage) {
            if (!html.classList.contains('ns-dm-active')) {
              html.classList.add('ns-dm-active');
            }
            overlay.style.background = 'green';
            overlay.textContent += " (DM Page - Active)";
          } else {
            // 그 외의 유혹적인 페이지(릴스, 탐색 등)는 즉시 리다이렉트
            html.classList.remove('ns-dm-active');
            console.log('Final Safeguard: Redirecting from ' + currentUrl);
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
