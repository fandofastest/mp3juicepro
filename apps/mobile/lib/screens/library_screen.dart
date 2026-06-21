import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/player_provider.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);

    // Seed some offline tracks for demo
    final List<Map<String, dynamic>> favoriteTracks = [
      {
        'vid': 'UxxajLWwzqY',
        'title': 'Icona Pop - I Love It (feat. Charli XCX)',
        'artist': 'Icona Pop',
        'cover': 'https://i.ytimg.com/vi/UxxajLWwzqY/hqdefault.jpg',
        'duration': 180,
      },
      {
        'vid': '2d2r03Jq2x4',
        'title': 'Midnight Horizon - Synthwave Special',
        'artist': 'Synthwave Collective',
        'cover': 'https://picsum.photos/id/111/200/200',
        'duration': 224,
      },
      {
        'vid': '0Vj0z-1Yk54',
        'title': 'Acoustic Chill Hits',
        'artist': 'Cozy Indie',
        'cover': 'https://picsum.photos/id/123/200/200',
        'duration': 310,
      }
    ];

    return Scaffold(
      backgroundColor: const Color(0xff131313),
      appBar: AppBar(
        backgroundColor: const Color(0xff131313),
        elevation: 0,
        title: const Text(
          'Library',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Library Quick Headers
          Row(
            children: [
              _buildCategoryChip(Icons.favorite_rounded, 'Favorites', '3 Songs', Colors.redAccent),
              const SizedBox(width: 12),
              _buildCategoryChip(Icons.download_for_offline_rounded, 'Downloads', 'Empty', Colors.teal),
            ],
          ),

          const SizedBox(height: 24),

          const Text(
            'Favorite Tracks',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: favoriteTracks.length,
            itemBuilder: (context, index) {
              final track = favoriteTracks[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: const Color(0xff1c1b1b).withOpacity(0.5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.02)),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: CachedNetworkImage(
                      imageUrl: track['cover']!,
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: Colors.grey[900]),
                      errorWidget: (context, url, error) => Container(color: Colors.grey[900]),
                    ),
                  ),
                  title: Text(
                    track['title']!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  subtitle: Text(
                    track['artist']!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey[400], fontSize: 12),
                  ),
                  trailing: const Icon(Icons.play_circle_fill_rounded, color: Color(0xff39ff14), size: 32),
                  onTap: () {
                    player.setPlaylist(favoriteTracks, index);
                  },
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(IconData icon, String label, String count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xff1c1b1b),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.03)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 2),
            Text(
              count,
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
