import 'package:flutter/material.dart';

class DownloadQualitySheet extends StatefulWidget {
  final Map<String, dynamic> track;
  const DownloadQualitySheet({super.key, required this.track});

  @override
  State<DownloadQualitySheet> createState() => _DownloadQualitySheetState();
}

class _DownloadQualitySheetState extends State<DownloadQualitySheet> {
  bool _isDownloading = false;
  double _progress = 0.0;
  String _statusText = "";

  void _startDownload(String quality) async {
    setState(() {
      _isDownloading = true;
      _progress = 0.0;
      _statusText = "Initializing...";
    });

    // Simulate progress updates
    for (int i = 1; i <= 10; i++) {
      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      setState(() {
        _progress = i * 0.1;
        _statusText = "Downloading ($quality) - ${(i * 10)}%";
      });
    }

    if (mounted) {
      setState(() {
        _isDownloading = false;
      });
      Navigator.of(context).pop(); // close sheet
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Finished downloading '${widget.track['title']}' at $quality!"),
          backgroundColor: const Color(0xff39ff14),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: BoxDecoration(
        color: const Color(0xff1c1b1b),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: SafeArea(
        child: _isDownloading
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Downloading Track',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: _progress,
                    backgroundColor: Colors.white10,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _statusText,
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                ],
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Select Download Quality',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey, size: 20),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildQualityItem('MP3 - 320kbps (Extreme High Quality)', '8.5 MB', '320kbps'),
                  _buildQualityItem('MP3 - 192kbps (Standard High Quality)', '5.2 MB', '192kbps'),
                  _buildQualityItem('MP3 - 128kbps (Medium Quality)', '3.4 MB', '128kbps'),
                  _buildQualityItem('MP4 - 360p Video (MPEG-4 Audio/Video)', '12.4 MB', 'MP4 Video'),
                ],
              ),
      ),
    );
  }

  Widget _buildQualityItem(String label, String size, String qualityKey) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xff131313),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.02)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        title: Text(label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
        trailing: Text(size, style: const TextStyle(color: Color(0xff39ff14), fontSize: 12, fontWeight: FontWeight.bold)),
        onTap: () => _startDownload(qualityKey),
      ),
    );
  }
}
