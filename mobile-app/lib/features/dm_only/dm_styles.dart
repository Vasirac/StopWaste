class DmStyles {
  static const String purificationCss = """
    /* ===== DM 전용 모드 CSS ===== */

    /* 1. 하단 네비게이션 바 숨김 (홈, 검색, 릴스, 쇼핑 등) */
    .ns-dm-active nav[role="navigation"],
    .ns-dm-active footer,
    .ns-dm-active [aria-label="Home"],
    .ns-dm-active [aria-label="홈"],
    .ns-dm-active [aria-label="Search"],
    .ns-dm-active [aria-label="검색"],
    .ns-dm-active [aria-label="Explore"],
    .ns-dm-active [aria-label="탐색"],
    .ns-dm-active [aria-label="Reels"],
    .ns-dm-active [aria-label="릴스"],
    .ns-dm-active [aria-label="Shop"],
    .ns-dm-active [aria-label="쇼핑"],
    .ns-dm-active [aria-label="Create"],
    .ns-dm-active [aria-label="만들기"] {
      display: none !important;
    }

    /* 2. 홈 버튼 및 인스타그램 로고 클릭 차단 */
    .ns-dm-active a[href="/"],
    .ns-dm-active a[href="/"] svg[aria-label="Instagram"],
    .ns-dm-active a[href="/"] svg[aria-label="인스타그램"] {
      pointer-events: none !important;
      cursor: default !important;
    }

    /* 3. 추천 섹션 숨김 */
    .ns-dm-active div[role="complementary"],
    .ns-dm-active aside {
      display: none !important;
    }

    /* 4. 레이아웃 최적화 */
    .ns-dm-active main[role="main"] {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }

    /* 5. 가로 스크롤 방지 */
    html.ns-dm-active,
    .ns-dm-active body {
      overflow-x: hidden !important;
    }

    /* 6. 스토리/릴스 뷰어에서 다른 콘텐츠로 이동하는 버튼 숨김 */
    .ns-dm-active [aria-label="See All"],
    .ns-dm-active [aria-label="모두 보기"] {
      display: none !important;
    }

    /* 7. DM 인박스 상단 스토리는 유지 (친구 스토리 확인용) */
    /* 스토리 바는 DM 페이지에서 기본적으로 보이므로 별도 처리 불필요 */

    /* 8. 릴스 페이지 스크롤 완전 차단 (강화됨) */
    html.ns-reel-locked,
    html.ns-reel-locked body {
      overflow: hidden !important;
      touch-action: pan-x pinch-zoom !important;
      overscroll-behavior: none !important;
      -webkit-overflow-scrolling: auto !important;
      scroll-behavior: auto !important;
    }

    /* 릴스 컨테이너 및 모든 자식 요소 스크롤 차단 */
    html.ns-reel-locked main,
    html.ns-reel-locked section,
    html.ns-reel-locked div[style*="transform"],
    html.ns-reel-locked div[style*="transition"],
    html.ns-reel-locked *[style*="scroll"],
    html.ns-reel-locked *[style*="overflow"] {
      overflow: hidden !important;
      touch-action: pan-x pinch-zoom !important;
      overscroll-behavior: none !important;
      scroll-snap-type: none !important;
    }
    
    /* 릴스 스와이프 영역 비활성화 */
    html.ns-reel-locked article,
    html.ns-reel-locked [role="presentation"],
    html.ns-reel-locked [role="dialog"] {
      touch-action: pan-x pinch-zoom !important;
    }
  """;
}
