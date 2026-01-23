import 'package:flutter/material.dart';

class SettingsBottomSheet extends StatefulWidget {
  final Map<String, dynamic> config;
  final bool isInstagram;
  final Function(Map<String, dynamic>) onSave;

  const SettingsBottomSheet({
    super.key,
    required this.config,
    required this.isInstagram,
    required this.onSave,
  });

  @override
  State<SettingsBottomSheet> createState() => _SettingsBottomSheetState();
}

class _SettingsBottomSheetState extends State<SettingsBottomSheet> {
  late Map<String, dynamic> localConfig;

  @override
  void initState() {
    super.initState();
    localConfig = Map<String, dynamic>.from(widget.config);
  }

  @override
  Widget build(BuildContext context) {
    final options = widget.isInstagram
        ? [
            ['메인 피드 숨기기', 'ig_hideFeed'],
            ['사진 게시물 가리기', 'ig_hidePhotos'],
            ['동영상 게시물 가리기', 'ig_hideVideos'],
            ['홈 탭 숨기기', 'ig_hideHome'],
            ['탐색 탭 숨기기', 'ig_hideExplore'],
            ['릴스 숨기기', 'ig_hideReels'],
            ['스토리 숨기기', 'ig_hideStories'],
            ['숫자 숨기기 (팔로워 등)', 'ig_hideNumbers'],
            ['흑백 모드', 'ig_grayscale'],
            ['사이드바/추천 숨기기', 'ig_hideSidebar'],
          ]
        : [
            ['쇼츠 차단', 'yt_hideShorts'],
            ['알고리즘 숨기기 (홈/추천)', 'yt_hideAlgorithm'],
            ['시청 기록 숨기기', 'yt_hideHistory'],
            ['재생목록 숨기기', 'yt_hidePlaylists'],
            ['댓글 숨기기', 'yt_hideComments'],
            ['썸네일 블러', 'yt_blurThumbnails'],
            ['추가 메뉴 숨기기 (내 동영상 등)', 'yt_hideExtraMenu'],
          ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const Text(
            '🛡️ StopWaste 설정',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          Flexible(
            child: ListView(
              shrinkWrap: true,
              children: [
                ...options.map((opt) {
                  final label = opt[0];
                  final key = opt[1];
                  return SwitchListTile(
                    title: Text(label),
                    value: localConfig[key] ?? false,
                    onChanged: (val) {
                      setState(() {
                        localConfig[key] = val;
                      });
                    },
                  );
                }),
                const Divider(),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Text(
                    '⏳ 사용 시간 제한',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                ),
                SwitchListTile(
                  title: const Text('시간 제한 활성화'),
                  value: localConfig['usage_limit_enabled'] ?? false,
                  onChanged: (val) {
                    setState(() {
                      localConfig['usage_limit_enabled'] = val;
                    });
                  },
                ),
                if (localConfig['usage_limit_enabled'] ?? false)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('제한 시간(분)'),
                            Text(
                              '${localConfig['usage_limit_minutes'] ?? 30}분',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ),
                            ),
                          ],
                        ),
                        Slider(
                          value: (localConfig['usage_limit_minutes'] ?? 30)
                              .toDouble(),
                          min: 5,
                          max: 180,
                          divisions: 35,
                          label: '${localConfig['usage_limit_minutes'] ?? 30}분',
                          onChanged: (val) {
                            setState(() {
                              localConfig['usage_limit_minutes'] = val.toInt();
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                if (!widget.isInstagram)
                  SwitchListTile(
                    title: const Text('유튜브 즉시 차단'),
                    subtitle: const Text('유튜브 접속 시 즉시 차단'),
                    value: localConfig['yt_block_now'] ?? false,
                    activeTrackColor: Colors.red,
                    onChanged: (val) {
                      setState(() {
                        localConfig['yt_block_now'] = val;
                      });
                    },
                  ),
                if (widget.isInstagram)
                  SwitchListTile(
                    title: const Text('인스타그램 즉시 차단'),
                    subtitle: const Text('인스타그램 접속 시 즉시 차단'),
                    value: localConfig['ig_block_now'] ?? false,
                    activeTrackColor: Colors.red,

                    onChanged: (val) {
                      setState(() {
                        localConfig['ig_block_now'] = val;
                      });
                    },
                  ),
                SwitchListTile(
                  title: const Text('타이머 종료 후 사이트 차단'),
                  subtitle: const Text('시간 제한 종료 시 사이트 차단'),
                  value: localConfig['block_after_timer'] ?? false,
                  onChanged: (val) {
                    setState(() {
                      localConfig['block_after_timer'] = val;
                    });
                  },
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('취소'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      widget.onSave(localConfig);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF667EEA),
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('저장'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
