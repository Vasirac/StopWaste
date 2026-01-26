class DmLogic {
  static String getRedirectJs(String targetUrl, int intervalMs) {
    return """
      (function() {
        // 이전 URL 추적용 변수 초기화
        if (!window._previousUrl) window._previousUrl = '';
        if (!window._reelAllowedFromDM) window._reelAllowedFromDM = false;

        // 스크롤/터치 이벤트 차단 함수
        function blockScrollEvents(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }

        // 릴스의 현재 ID 추출
        function getCurrentReelId() {
          const match = window.location.href.match(/\\/reels?\\/([A-Za-z0-9_-]+)/);
          return match ? match[1] : null;
        }

        // 릴스 페이지 스크롤 차단 활성화/비활성화 (강화된 버전)
        function setReelScrollBlock(enabled) {
          const html = document.documentElement;
          const OVERLAY_ID = 'ns-swipe-blocker-overlay';
          
          if (enabled) {
            // 현재 릴스 ID 저장
            window._allowedReelId = getCurrentReelId();
            console.log('[DM-Only] Locked to reel ID: ' + window._allowedReelId);
            
            if (!html.classList.contains('ns-reel-locked')) {
              html.classList.add('ns-reel-locked');
            }
            
            // ★ 방법 1: 투명 오버레이로 터치 이벤트 가로채기
            if (!document.getElementById(OVERLAY_ID)) {
              const overlay = document.createElement('div');
              overlay.id = OVERLAY_ID;
              // pointer-events: none으로 시작해서 기본적으로 터치가 통과하도록
              overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;background:transparent;pointer-events:none;';
              
              // 문서에서 수직 스와이프만 감지하고 차단
              let startY = 0;
              let startX = 0;
              let isSwiping = false;
              
              // 터치 시작 시 위치 기록
              document.addEventListener('touchstart', function(e) {
                if (!document.documentElement.classList.contains('ns-reel-locked')) return;
                startY = e.touches[0].clientY;
                startX = e.touches[0].clientX;
                isSwiping = false;
              }, { passive: true, capture: true });
              
              // 수직 스와이프 감지 시 차단
              document.addEventListener('touchmove', function(e) {
                if (!document.documentElement.classList.contains('ns-reel-locked')) return;
                
                const deltaY = Math.abs(e.touches[0].clientY - startY);
                const deltaX = Math.abs(e.touches[0].clientX - startX);
                
                // 수직 이동이 10px 이상이면 스와이프로 간주하고 차단
                if (deltaY > 10 && deltaY > deltaX) {
                  isSwiping = true;
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }
              }, { passive: false, capture: true });
              
              document.body.appendChild(overlay);
              console.log('[DM-Only] Swipe blocker CREATED (pointer-events: none for back button)');
            }
            
            // ★ 방법 2: 문서 레벨 터치 이벤트 차단 (백업)
            if (!window._scrollBlockersAttached) {
              const options = { passive: false, capture: true };
              
              window._blockTouchMove = function(e) {
                if (!html.classList.contains('ns-reel-locked')) return;
                
                const deltaY = Math.abs(e.touches[0].clientY - (window._touchStartY || 0));
                const deltaX = Math.abs(e.touches[0].clientX - (window._touchStartX || 0));
                
                if (deltaY > deltaX && deltaY > 10) {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  return false;
                }
              };
              
              document.addEventListener('touchstart', function(e) {
                window._touchStartY = e.touches[0].clientY;
                window._touchStartX = e.touches[0].clientX;
              }, options);
              
              document.addEventListener('touchmove', window._blockTouchMove, options);
              document.addEventListener('wheel', blockScrollEvents, options);
              document.addEventListener('scroll', blockScrollEvents, options);
              
              window._scrollBlockersAttached = true;
              console.log('[DM-Only] Document-level scroll blocking ENABLED');
            }
            
            // ★ 방법 3: 인스타그램 릴스 컨테이너에 직접 스타일 적용
            const reelContainers = document.querySelectorAll('div[style*="transform"], div[style*="transition"], section, main');
            reelContainers.forEach(el => {
              el.style.overflow = 'hidden';
              el.style.touchAction = 'pan-x pinch-zoom';
              el.style.overscrollBehavior = 'none';
            });
            
          } else {
            // 차단 해제
            html.classList.remove('ns-reel-locked');
            window._allowedReelId = null;
            
            // 오버레이 제거
            const overlay = document.getElementById(OVERLAY_ID);
            if (overlay) {
              overlay.remove();
              console.log('[DM-Only] Swipe blocker overlay REMOVED');
            }
          }
        }
        
        // 릴스 ID 변경 감지 (다른 릴스로 넘어갔는지 체크)
        function checkReelIdChange() {
          if (!window._allowedReelId) return false;
          const currentId = getCurrentReelId();
          if (currentId && currentId !== window._allowedReelId) {
            console.log('[DM-Only] Reel changed from ' + window._allowedReelId + ' to ' + currentId + ' - redirecting!');
            return true; // 릴스가 바뀜
          }
          return false;
        }

        function checkAndApply() {
          const currentUrl = window.location.href;
          const target = "$targetUrl";
          const html = document.documentElement;
          
          // 디버그 인디케이터는 릴스 감지 후에 표시됨 (아래 로직에서 처리)

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
            setReelScrollBlock(false);
            window._previousUrl = currentUrl;
            return;
          }

          // 3. 페이지 유형 확인 (URL 기반)
          const isDmPage = currentUrl.includes('/direct/');
          const isStoryPage = currentUrl.includes('/stories/');
          const isReelUrlPage = currentUrl.includes('/reel/') || currentUrl.includes('/reels/');
          const isPostPage = currentUrl.includes('/p/');
          
          // ★ DOM 기반 릴스 감지 (모달로 열릴 때 URL이 안 바뀌므로)
          function isReelModalOpen() {
            // 방법 1: 전체화면 비디오가 있고 릴스 UI 요소가 있는지 확인
            const fullscreenVideo = document.querySelector('video[style*="object-fit"]');
            const reelIndicators = document.querySelectorAll('[aria-label*="reel" i], [aria-label*="릴스"], [data-interaction-id*="reel"]');
            
            // 방법 2: 릴스 특유의 세로 스크롤 컨테이너
            const reelContainer = document.querySelector('div[style*="scroll-snap-type"]');
            
            // 방법 3: 전체화면 비디오 + 좋아요/댓글 버튼이 오른쪽에 있는 구조
            const videoWithSideButtons = document.querySelector('video') && 
                                         document.querySelector('svg[aria-label*="좋아요"], svg[aria-label*="Like"]');
            
            const isReel = (fullscreenVideo && reelIndicators.length > 0) || 
                          reelContainer || 
                          (fullscreenVideo && videoWithSideButtons);
            
            if (isReel && !window._reelModalDetected) {
              console.log('[DM-Only] 🎬 Reel modal DETECTED via DOM');
              window._reelModalDetected = true;
            } else if (!isReel) {
              window._reelModalDetected = false;
            }
            
            return isReel;
          }
          
          const isReelPage = isReelUrlPage || isReelModalOpen();

          // 4. DM 페이지 진입 시 - 릴스 허용 플래그 설정
          if (isDmPage && !isReelPage) {
            window._reelAllowedFromDM = true;
            console.log('[DM-Only] In DM - reels will be allowed from here');
          }

          // 5. 릴스 페이지 처리 - 선택적 차단
          if (isReelPage) {
            // 먼저 릴스 ID 변경 체크 (스와이프로 다른 릴스로 넘어갔는지)
            if (checkReelIdChange()) {
              // 다른 릴스로 넘어감 → DM으로 리다이렉트
              console.log('[DM-Only] Scrolled to different reel - redirecting to DM');
              setReelScrollBlock(false);
              window._previousUrl = currentUrl;
              window.location.replace(target);
              return;
            }
            
            const wasInDM = window._previousUrl.includes('/direct/');
            const isAllowed = wasInDM || window._reelAllowedFromDM;
            
            if (isAllowed) {
              // DM에서 온 릴스 → 허용하되 스크롤 차단 (다음 릴스로 못 넘어가게)
              setReelScrollBlock(true);
              if (!html.classList.contains('ns-dm-active')) {
                html.classList.add('ns-dm-active');
              }
              console.log('[DM-Only] Reel ALLOWED (from DM) - scroll blocked');
            } else {
              // 다른 경로에서 온 릴스 → DM으로 리다이렉트
              console.log('[DM-Only] Reel BLOCKED - redirecting to DM (came from: ' + window._previousUrl + ')');
              setReelScrollBlock(false);
              window._previousUrl = currentUrl;
              window.location.replace(target);
              return;
            }
          } else {
            setReelScrollBlock(false);
            
            // DM이 아닌 다른 페이지로 이동하면 릴스 허용 플래그 리셋
            if (!isDmPage && !isReelPage) {
              window._reelAllowedFromDM = false;
            }
          }

          // 6. 허용된 페이지에서는 CSS 클래스 적용
          if (isDmPage || isStoryPage || isReelPage || isPostPage) {
            if (!html.classList.contains('ns-dm-active')) {
              html.classList.add('ns-dm-active');
            }
          } else {
            // 그 외의 모든 페이지(홈, 탐색 등)는 즉시 DM함으로 리다이렉트
            html.classList.remove('ns-dm-active');
            setReelScrollBlock(false);
            console.log('[DM-Only] Redirecting to DM Inbox from: ' + currentUrl);
            window._previousUrl = currentUrl;
            window.location.replace(target);
            return;
          }

          // 7. 현재 URL을 이전 URL로 저장 (다음 체크 시 비교용)
          window._previousUrl = currentUrl;
        }

        // ★ 로그인 모달에 로그아웃 버튼 주입 (메인 로그인 페이지 제외)
        function injectLogoutButton() {
          // 이미 버튼이 있으면 스킵
          if (document.getElementById('ns-logout-btn')) return;
          
          // 메인 로그인 페이지면 스킵 (URL에 /accounts/login 포함)
          if (window.location.href.includes('/accounts/')) return;
          
          // DM 페이지가 아니면 스킵
          if (!window.location.href.includes('/direct/')) return;
          
          // 비밀번호 입력 필드 찾기
          const passwordField = document.querySelector('input[name="password"], input[type="password"]');
          if (!passwordField) return;
          
          // 모달/다이얼로그 안에 있는지 확인
          const dialog = passwordField.closest('div[role="dialog"]');
          const fixedOverlay = passwordField.closest('div[style*="position: fixed"]');
          if (!dialog && !fixedOverlay) return; // 모달이 아니면 스킵
          
          // 부모 폼/컨테이너 찾기
          const form = passwordField.closest('form');
          const container = form || passwordField.parentElement?.parentElement?.parentElement?.parentElement;
          if (!container) return;
          
          // 로그아웃 버튼 생성
          const logoutBtn = document.createElement('button');
          logoutBtn.id = 'ns-logout-btn';
          logoutBtn.type = 'button';
          logoutBtn.textContent = 'Log out of current account';
          logoutBtn.style.cssText = 'width:100%;padding:12px;margin-top:15px;background:#ed4956;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;';
          
          logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 쿠키 삭제
            document.cookie.split(';').forEach(function(c) {
              document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/;domain=.instagram.com');
            });
            
            // 로그아웃 페이지로 이동
            window.location.href = 'https://www.instagram.com/accounts/logout/';
          });
          
          // 폼 끝에 버튼 추가
          container.appendChild(logoutBtn);
          console.log('[DM-Only] Logout button INJECTED into login modal');
        }

        const observer = new MutationObserver(function(mutations) {
          checkAndApply();
          injectLogoutButton();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false
        });

        // 초기 실행
        checkAndApply();
        injectLogoutButton();
      })();
    """;
  }
}
