import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/player_provider.dart';

class NowPlayingScreen extends StatelessWidget {
  const NowPlayingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);
    final currentTrack = player.currentTrack;

    if (currentTrack == null) {
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
              imageUrl: currentTrack['cover'] ?? '',
              fit: BoxFit.cover,
              errorWidget: (c, u, e) => Container(color: const Color(0xff131313)),
            ),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
              child: Container(
                color: Colors.black.withOpacity(0.75),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Column(
                children: [
                  // App Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 32),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                      const Column(
                        children: [
                          Text(
                            'NOW PLAYING',
                            style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Online Stream',
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      const SizedBox(width: 48), // Spacer to balance back button
                    ],
                  ),
                  const Spacer(),

                  // Safe Mode Banner Alert
                  if (player.isSafeModeActive)
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.red[950]!.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                      ),
                      child: Column(
                        children: [
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.security_rounded, color: Colors.redAccent, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Playback Restricted',
                                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'App is in Safe Mode. Music playback and downloads are disabled.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.redAccent, fontSize: 11),
                          ),
                        ],
                      ),
                    ),

                  // Cover Art
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 24),
                    width: 280,
                    height: 280,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: player.isSafeModeActive
                              ? Colors.red.withOpacity(0.15)
                              : const Color(0xff39ff14).withOpacity(0.15),
                          blurRadius: 30,
                          spreadRadius: 2,
                        )
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: CachedNetworkImage(
                        imageUrl: currentTrack['cover'] ?? '',
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: Colors.grey[900]),
                        errorWidget: (context, url, error) => Container(color: Colors.grey[900]),
                      ),
                    ),
                  ),

                  const Spacer(),

                   // Title & Artist with Favorite Button overlay
                   Padding(
                     padding: const EdgeInsets.symmetric(horizontal: 16.0),
                     child: Row(
                       children: [
                         const SizedBox(width: 48), // Spacer to balance favorite button
                         Expanded(
                           child: Column(
                             children: [
                               Text(
                                 currentTrack['title'] ?? 'Unknown Track',
                                 textAlign: TextAlign.center,
                                 maxLines: 1,
                                 overflow: TextOverflow.ellipsis,
                                 style: const TextStyle(
                                   color: Colors.white,
                                   fontSize: 20,
                                   fontWeight: FontWeight.bold,
                                 ),
                               ),
                               const SizedBox(height: 6),
                               Text(
                                 currentTrack['artist'] ?? 'Unknown Artist',
                                 textAlign: TextAlign.center,
                                 style: TextStyle(
                                   color: Colors.grey[400],
                                   fontSize: 14,
                                 ),
                               ),
                             ],
                           ),
                         ),
                         IconButton(
                           icon: Icon(
                             player.isFavorite(currentTrack['vid'] ?? currentTrack['id'] ?? '')
                                 ? Icons.favorite_rounded
                                 : Icons.favorite_border_rounded,
                             color: player.isFavorite(currentTrack['vid'] ?? currentTrack['id'] ?? '')
                                 ? Colors.redAccent
                                 : Colors.white70,
                             size: 28,
                           ),
                           onPressed: () {
                             player.toggleFavorite(currentTrack);
                           },
                         ),
                       ],
                     ),
                   ),

                  const SizedBox(height: 24),

                  // Progress Bar
                  Column(
                    children: [
                      SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 3,
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                          overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                          activeTrackColor: const Color(0xff39ff14),
                          inactiveTrackColor: Colors.white10,
                          thumbColor: const Color(0xff39ff14),
                          overlayColor: const Color(0xff39ff14).withOpacity(0.2),
                        ),
                        child: Slider(
                          value: player.duration.inSeconds > 0
                              ? player.position.inSeconds.clamp(0, player.duration.inSeconds).toDouble()
                              : 0.0,
                          min: 0.0,
                          max: player.duration.inSeconds > 0 ? player.duration.inSeconds.toDouble() : 1.0,
                          onChanged: player.isSafeModeActive
                              ? null
                              : (value) {
                                  player.seek(Duration(seconds: value.toInt()));
                                },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _formatDuration(player.position),
                              style: const TextStyle(color: Colors.grey, fontSize: 11),
                            ),
                            Text(
                              _formatDuration(player.duration),
                              style: const TextStyle(color: Colors.grey, fontSize: 11),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shuffle_rounded, color: Colors.grey, size: 22),
                        onPressed: () {},
                      ),
                      const SizedBox(width: 16),
                      IconButton(
                        icon: const Icon(Icons.skip_previous_rounded, color: Colors.white, size: 36),
                        onPressed: () => player.previous(),
                      ),
                      const SizedBox(width: 16),
                      // Play Button
                      GestureDetector(
                        onTap: () => player.togglePlay(),
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: player.isSafeModeActive
                                ? Colors.redAccent
                                : const Color(0xff39ff14),
                          ),
                          child: Icon(
                            player.isSafeModeActive
                                ? Icons.shield_outlined
                                : (player.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded),
                            color: player.isSafeModeActive ? Colors.white : Colors.black,
                            size: 36,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      IconButton(
                        icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 36),
                        onPressed: () => player.next(),
                      ),
                      const SizedBox(width: 16),
                      IconButton(
                        icon: const Icon(Icons.repeat_rounded, color: Colors.grey, size: 22),
                        onPressed: () {},
                      ),
                    ],
                  ),
                  const Spacer(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }
}
