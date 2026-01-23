import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'script_injector.dart';

class WebviewManager {
  InAppWebViewController? _controller;

  void setController(InAppWebViewController controller) {
    _controller = controller;
  }

  Future<void> injectDmOnlyLogic() async {
    if (_controller == null) return;

    final script = ScriptInjector.getInstagramInjectionScript();
    if (script.isNotEmpty) {
      await _controller!.evaluateJavascript(source: script);
    }
  }
}
