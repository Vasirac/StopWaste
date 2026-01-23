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
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri(AppConfig.instagramUrl)),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            domStorageEnabled: true,
            databaseEnabled: true,
            mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
            // 모바일 웹 뷰 최적화
            useShouldOverrideUrlLoading: true,
            mediaPlaybackRequiresUserGesture: false,
          ),
          onWebViewCreated: (controller) {
            _webviewManager.setController(controller);
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
            // JS의 console.log를 터미널에서 볼 수 있게 함
            debugPrint("JS CONSOLE: ${consoleMessage.message}");
          },
          onLoadError: (controller, url, code, message) {
            debugPrint("LOG: Load Error ($code) -> $message");
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        child: const Icon(Icons.refresh),
        onPressed: () async {
          await InAppWebViewController.clearAllCache();
          debugPrint("LOG: Cache cleared, refreshing...");
        },
      ),
    );
  }
}
