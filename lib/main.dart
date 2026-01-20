import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'injection_logic.dart';
import 'settings_ui.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const StopWasteApp());
}

class StopWasteApp extends StatelessWidget {
  const StopWasteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'StopWaste',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF667EEA)),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  InAppWebViewController? webViewController;
  String? currentUrl;
  bool isInstagram = false;
  SharedPreferences? prefs;
  Map<String, dynamic> config = {};

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    final packageInfo = await PackageInfo.fromPlatform();
    isInstagram = packageInfo.packageName.contains('instagram');

    prefs = await SharedPreferences.getInstance();
    final configStr = prefs!.getString('config') ?? _getDefaultConfig();

    setState(() {
      config = jsonDecode(configStr);
    });
  }

  String _getDefaultConfig() {
    return '''{
      "yt_hideShorts":true,"yt_hideAlgorithm":false,"yt_hideHistory":false,"yt_hidePlaylists":false,"yt_hideComments":true,"yt_blurThumbnails":false,"yt_hideExtraMenu":false,
      "ig_hideFeed":true,"ig_hidePhotos":false,"ig_hideVideos":false,"ig_hideHome":false,"ig_hideExplore":true,"ig_hideReels":true,"ig_hideStories":false,"ig_hideNumbers":false,"ig_grayscale":false,"ig_hideSidebar":true
    }''';
  }

  void _inject() async {
    if (webViewController == null || config.isEmpty) return;
    final script = await InjectionLogic.getInjectionScript(
      isInstagram ? 'instagram.css' : 'youtube.css',
      config,
      isInstagram,
    );
    await webViewController!.evaluateJavascript(source: script);
  }

  void _showSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SettingsBottomSheet(
        config: config,
        isInstagram: isInstagram,
        onSave: (newConfig) {
          setState(() {
            config = newConfig;
          });
          prefs?.setString('config', jsonEncode(newConfig));
          _inject();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (config.isEmpty) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final initialUrl = isInstagram
        ? "https://www.instagram.com"
        : "https://m.youtube.com";

    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri(initialUrl)),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            domStorageEnabled: true,
            databaseEnabled: true,
            mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
          ),
          onWebViewCreated: (controller) {
            webViewController = controller;
          },
          onLoadStop: (controller, url) {
            _inject();
            setState(() {
              currentUrl = url?.toString();
            });
          },
          onUpdateVisitedHistory: (controller, url, isReload) {
            _inject();
            setState(() {
              currentUrl = url?.toString();
            });
          },
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _getNavIndex(),
        selectedItemColor: const Color(0xFF667EEA),
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          if (index == 3) {
            _showSettings();
          } else {
            _handleNav(index);
          }
        },
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(
            icon: Icon(isInstagram ? Icons.explore : Icons.subscriptions),
            label: isInstagram ? '탐색' : '구독',
          ),
          BottomNavigationBarItem(
            icon: Icon(isInstagram ? Icons.movie : Icons.video_library),
            label: isInstagram ? '릴스' : '보관함',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: '설정',
          ),
        ],
      ),
    );
  }

  int _getNavIndex() {
    if (currentUrl == null) return 0;
    if (isInstagram) {
      if (currentUrl!.contains('/explore/')) return 1;
      if (currentUrl!.contains('/reels/')) return 2;
      return 0;
    } else {
      if (currentUrl!.contains('/feed/subscriptions')) return 1;
      if (currentUrl!.contains('/feed/library') ||
          currentUrl!.contains('/feed/you')) {
        return 2;
      }

      return 0;
    }
  }

  void _handleNav(int index) {
    if (webViewController == null) return;
    String url = "";
    if (isInstagram) {
      switch (index) {
        case 0:
          url = "https://www.instagram.com";
          break;
        case 1:
          url = "https://www.instagram.com/explore/";
          break;
        case 2:
          url = "https://www.instagram.com/reels/";
          break;
      }
    } else {
      switch (index) {
        case 0:
          url = "https://m.youtube.com";
          break;
        case 1:
          url = "https://m.youtube.com/feed/subscriptions";
          break;
        case 2:
          url = "https://m.youtube.com/feed/library";
          break;
      }
    }
    if (url.isNotEmpty) {
      webViewController!.loadUrl(urlRequest: URLRequest(url: WebUri(url)));
    }
  }
}
