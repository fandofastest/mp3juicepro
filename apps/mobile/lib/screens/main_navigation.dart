import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/player_provider.dart';
import 'home_screen.dart';
import 'search_screen.dart';
import 'library_screen.dart';
import 'profile_screen.dart';
import 'now_playing_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(onProfileTap: () {
        setState(() {
          _currentIndex = 3;
        });
      }),
      const SearchScreen(),
      const LibraryScreen(),
      const ProfileScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);
    final currentTrack = player.currentTrack;

    return Scaffold(
      backgroundColor: const Color(0xff131313),
      body: Stack(
        children: [
          // Screens Area
          Padding(
            padding: EdgeInsets.only(
              bottom: currentTrack != null ? 140 : 70,
            ),
            child: IndexedStack(
              index: _currentIndex,
              children: _screens,
            ),
          ),

          // Mini Player
          if (currentTrack != null)
            Positioned(
              bottom: 75,
              left: 12,
              right: 12,
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const NowPlayingScreen(),
                    ),
                  );
                },
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.55),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: player.isSafeModeActive
                              ? Colors.red.withOpacity(0.3)
                              : Colors.white.withOpacity(0.08),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            children: [
                              // Cover Art
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: CachedNetworkImage(
                                  imageUrl: currentTrack['cover'] ?? '',
                                  width: 48,
                                  height: 48,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    color: Colors.grey[900],
                                    child: const Icon(Icons.music_note, color: Colors.grey),
                                  ),
                                  errorWidget: (context, url, error) => Container(
                                    color: Colors.grey[900],
                                    child: const Icon(Icons.music_note, color: Colors.grey),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Title & Artist
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      currentTrack['title'] ?? 'Unknown Track',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      currentTrack['artist'] ?? 'Unknown Artist',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.grey[400],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Safe Mode block indicator or Audio Visualizer/Play Button
                              if (player.isSafeModeActive)
                                const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                                  child: Icon(Icons.shield_outlined, color: Colors.redAccent, size: 22),
                                )
                              else ...[
                                if (player.isLoading)
                                  const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
                                    ),
                                  )
                                else
                                  IconButton(
                                    icon: Icon(
                                      player.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                                      color: Colors.white,
                                      size: 28,
                                    ),
                                    onPressed: () => player.togglePlay(),
                                  ),
                                IconButton(
                                  icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 24),
                                  onPressed: () => player.next(),
                                ),
                              ]
                            ],
                          ),
                          // Safe Mode Warning or Progress bar
                          if (player.isSafeModeActive)
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.only(top: 6),
                              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                              decoration: BoxDecoration(
                                color: Colors.red[950]!.withOpacity(0.4),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 14),
                                  SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      'Safe Mode Active: Catalog browsing only',
                                      style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else if (player.duration.inSeconds > 0)
                            Padding(
                              padding: const EdgeInsets.only(top: 6, left: 4, right: 4),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(2),
                                child: LinearProgressIndicator(
                                  value: player.position.inMilliseconds / player.duration.inMilliseconds,
                                  backgroundColor: Colors.white10,
                                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
                                  minHeight: 2.5,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

          // Bottom Navigation Bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ClipRRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  height: 65,
                  decoration: BoxDecoration(
                    color: const Color(0xff131313).withOpacity(0.85),
                    border: Border(
                      top: BorderSide(
                        color: Colors.white.withOpacity(0.05),
                        width: 0.5,
                      ),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildNavItem(Icons.home_filled, 'Home', 0),
                      _buildNavItem(Icons.search_rounded, 'Search', 1),
                      _buildNavItem(Icons.library_music_rounded, 'Library', 2),
                      _buildNavItem(Icons.person_rounded, 'Profile', 3),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: isSelected ? const Color(0xff39ff14) : Colors.grey[500],
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? const Color(0xff39ff14) : Colors.grey[500],
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
