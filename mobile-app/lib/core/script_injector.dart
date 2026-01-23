import '../features/dm_only/dm_styles.dart';
import '../features/dm_only/dm_logic.dart';
import '../app_config.dart';

class ScriptInjector {
  static String getInstagramInjectionScript() {
    if (!AppConfig.isDmOnlyMode) return "";

    // 1. CSS 주입 (UI 정화)
    final String css = DmStyles.purificationCss
        .replaceAll('\n', ' ')
        .replaceAll('"', '\\"');
    final String injectCssScript =
        """
      (function() {
        const styleId = 'dm-only-styles';
        let style = document.getElementById(styleId);
        if (!style) {
          style = document.createElement('style');
          style.id = styleId;
          document.head.appendChild(style);
        }
        style.textContent = "$css";
      })();
    """;

    // 2. JS 주입 (리다이렉트 로직)
    final String redirectJs = DmLogic.getRedirectJs(
      AppConfig.instagramUrl,
      AppConfig.redirectIntervalMs,
    );

    return injectCssScript + "\n" + redirectJs;
  }
}
