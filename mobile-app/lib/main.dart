import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'app_config.dart';
import 'core/webview_manager.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DmOnlyApp());
}

class DmOnlyApp extends StatelessWidget {
  const DmOnlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Instagram DM Only',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.pinkAccent),
        useMaterial3: true,
      ),
      home: const DmScreen(),
    );
  }
}

class DmScreen extends StatefulWidget {
  const DmScreen({super.key});

  @override
  State<DmScreen> createState() => _DmScreenState();
}

class _DmScreenState extends State<DmScreen> {
  final WebviewManager _webviewManager = WebviewManager();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // 앱 종료 방지 및 뒤로가기 제어
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final controller = _webviewManager.controller;
        if (controller != null && await controller.canGoBack()) {
          // 뒤로가기 기록이 있어도 메인(홈)으로 가는 것은 방지하고 싶다면
          // 현재 URL을 체크하여 리다이렉트 로직에 맡기거나 여기서 처리합니다.
          await controller.goBack();
        }
      },
      child: Scaffold(
        backgroundColor: Colors.blueGrey,
        body: SafeArea(
          child: InAppWebView(
            initialUrlRequest: URLRequest(url: WebUri(AppConfig.instagramUrl)),
            initialSettings: InAppWebViewSettings(
              javaScriptEnabled: true,
              domStorageEnabled: true,
              databaseEnabled: true,
              mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
              userAgent:
                  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
              allowFileAccessFromFileURLs: true,
              allowUniversalAccessFromFileURLs: true,
              useHybridComposition: true,
              useShouldOverrideUrlLoading: true, // URL 로딩 가로채기 활성화
            ),
            onWebViewCreated: (controller) {
              _webviewManager.setController(controller);
            },
            shouldOverrideUrlLoading: (controller, navigationAction) async {
              final uri = navigationAction.request.url;
              if (uri == null) return NavigationActionPolicy.ALLOW;

              final url = uri.toString();

              // 1. 인증(로그인) 페이지 허용
              final isAuthPage =
                  url.contains('/accounts/') ||
                  url.contains('/login/') ||
                  url.contains('/signup/') ||
                  url.contains('/privacy/checks/');

              // 2. DM 관련 페이지 허용 (/direct/ 전체 - 인박스 + 개별 대화)
              final isDmPage = url.contains('/direct/');

              // 3. DM 상단에서 친구 스토리 보기 허용
              final isStoryPage = url.contains('/stories/');

              // 4. DM에서 공유받은 릴스 보기 허용
              final isReelPage =
                  url.contains('/reel/') || url.contains('/reels/');

              // 5. 프로필 페이지는 DM에서 프로필 클릭 시 필요할 수 있음 (선택적)
              // final isProfilePage = RegExp(r'^https://www\.instagram\.com/[^/]+/?$').hasMatch(url);

              if (isAuthPage || isDmPage || isStoryPage || isReelPage) {
                debugPrint("LOG: Navigation allowed -> $url");
                return NavigationActionPolicy.ALLOW;
              }

              // 그 외(홈, 탐색 등)는 차단하고 DM으로 리다이렉트
              debugPrint("LOG: Navigation blocked -> $url (Redirecting to DM)");
              await controller.loadUrl(
                urlRequest: URLRequest(url: WebUri(AppConfig.instagramUrl)),
              );
              return NavigationActionPolicy.CANCEL;
            },
            onLoadStart: (controller, url) {
              debugPrint("LOG: Load Started -> $url");
            },
            onLoadStop: (controller, url) async {
              debugPrint("LOG: Load Stopped -> $url");
              await _webviewManager.injectDmOnlyLogic();
            },
            onUpdateVisitedHistory: (controller, url, isReload) async {
              debugPrint("LOG: History Updated -> $url");
              await _webviewManager.injectDmOnlyLogic();
            },
            onConsoleMessage: (controller, consoleMessage) {
              debugPrint("JS CONSOLE: ${consoleMessage.message}");
            },
            onLoadError: (controller, url, code, message) {
              debugPrint("LOG: Load Error ($code) -> $message");
            },
          ),
        ),
      ),
    );
  }
}
