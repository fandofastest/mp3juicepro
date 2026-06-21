import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/player_provider.dart';

class LyricsScreen extends StatefulWidget {
  const LyricsScreen({super.key});

  @override
  State<LyricsScreen> createState() => _LyricsScreenState();
}

class _LyricsScreenState extends State<LyricsScreen> {
  final List<String> _defaultLyrics = [
    "I see the lights flicker in the rain",
    "Reflections of a world I used to know",
    "The circuits hum a lonely refrain",
    "Walking through the shadows of the code",
    "Can you feel the rhythm in your soul?",
    "Binary pulses taking full control",
    "We're lost inside the frequency tonight",
    "Chasing ghosts until the morning light",
    "Beneath the neon grid so bright",
    "Lost in translation, out of sight"
  ];

  int _activeLyricIndex = 3; // mock highlight index

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);
    final track = player.currentTrack;

    if (track == null) {
      return const Scaffold(
        backgroundColor: Color(0xff131313),
        body: Center(child: Text("No track selected", style: TextStyle(color: Colors.white))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xff131313),
      body: Stack(
        children: [
          // Blurred background image
          Positioned.fill(
            child: CachedNetworkImage(
              imageUrl: track['cover'] ?? '',
              fit: BoxFit.cover,
              errorWidget: (c, u, e) => Container(color: const Color(0xff131313)),
            ),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
              child: Container(
                color: Colors.black.withOpacity(0.85),
              ),
            ),
          ),

          // Main contents
          SafeArea(
            child: Column(
              children: [
                // AppBar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 30),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                      Column(
                        children: [
                          const Text(
                            'LYRICS',
                            style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            track['title'] ?? 'Unknown Track',
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(width: 48), // balance back button
                    ],
                  ),
                ),

                // Header details: Art & Artist info
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: CachedNetworkImage(
                          imageUrl: track['cover'] ?? '',
                          width: 64,
                          height: 64,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              track['title'] ?? 'Unknown Track',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              track['artist'] ?? 'Unknown Artist',
                              style: const TextStyle(color: Color(0xff39ff14), fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Scrollable lyrics list
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                    itemCount: _defaultLyrics.length,
                    itemBuilder: (context, index) {
                      final isCurrent = index == _activeLyricIndex;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _activeLyricIndex = index;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12.0),
                          child: Text(
                            _defaultLyrics[index],
                            style: TextStyle(
                              color: isCurrent ? const Color(0xff39ff14) : Colors.white.withOpacity(0.35),
                              fontSize: isCurrent ? 22 : 18,
                              fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                              height: 1.4,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Sticky playback control bar at bottom
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xff1c1b1b).withOpacity(0.9),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
                    border: Border.all(color: Colors.white.withOpacity(0.03)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Progress Bar
                      LinearProgressIndicator(
                        value: player.duration.inSeconds > 0
                            ? player.position.inSeconds / player.duration.inSeconds
                            : 0.0,
                        backgroundColor: Colors.white10,
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
                        minHeight: 3,
                      ),
                      const SizedBox(height: 16),
                      // Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.shuffle_rounded, color: Colors.grey, size: 22),
                            onPressed: () {},
                          ),
                          IconButton(
                            icon: const Icon(Icons.skip_previous_rounded, color: Colors.white, size: 30),
                            onPressed: () => player.previous(),
                          ),
                          GestureDetector(
                            onTap: () => player.togglePlay(),
                            child: Container(
                              width: 50,
                              height: 50,
                              decoration: const BoxDecoration(
                                color: Color(0xff39ff14),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                player.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                                color: Colors.black,
                                size: 28,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 30),
                            onPressed: () => player.next(),
                          ),
                          IconButton(
                            icon: const Icon(Icons.repeat_rounded, color: Colors.grey, size: 22),
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ],
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
