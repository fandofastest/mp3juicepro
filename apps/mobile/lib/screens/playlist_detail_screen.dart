import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/player_provider.dart';
import '../widgets/song_options_sheet.dart';

class PlaylistDetailScreen extends StatelessWidget {
  final Map<String, dynamic> playlist;

  const PlaylistDetailScreen({super.key, required this.playlist});

  void _showSongOptions(BuildContext context, Map<String, dynamic> track) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SongOptionsSheet(track: track),
    );
  }

  void _confirmDeletePlaylist(BuildContext context, PlayerProvider player) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xff1c1b1b),
        title: const Text('Delete Playlist', style: TextStyle(color: Colors.white)),
        content: Text(
          'Are you sure you want to delete "${playlist['name']}"?',
          style: const TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () {
              player.deletePlaylist(playlist['name']);
              Navigator.of(ctx).pop(); // close dialog
              Navigator.of(context).pop(); // close detail screen
            },
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);
    final isLikedSongs = playlist['name'] == 'Liked Songs';
    
    // Find the latest playlist data from provider
    final currentPlaylist = isLikedSongs 
        ? playlist 
        : player.playlists.firstWhere(
            (p) => p['name'] == playlist['name'],
            orElse: () => playlist,
          );

    final tracks = isLikedSongs 
        ? player.favorites 
        : (currentPlaylist['tracks'] as List<dynamic>? ?? []);

    return Scaffold(
      backgroundColor: const Color(0xff131313),
      appBar: AppBar(
        backgroundColor: const Color(0xff131313),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          isLikedSongs ? 'Liked Songs' : (currentPlaylist['name'] ?? 'Playlist Details'),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        actions: isLikedSongs
            ? null
            : [
                IconButton(
                  icon: const Icon(Icons.delete_sweep_rounded, color: Colors.redAccent),
                  onPressed: () => _confirmDeletePlaylist(context, player),
                ),
              ],
      ),
      body: tracks.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isLikedSongs ? Icons.favorite_border_rounded : Icons.playlist_play_rounded, 
                      color: Colors.grey[600], 
                      size: 60,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      isLikedSongs ? 'No liked songs yet' : 'This playlist is empty',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isLikedSongs 
                          ? 'Tap the heart icon next to any song to add it to your Liked Songs.'
                          : 'Browse songs and use the Options menu (three dots) to add tracks here.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              itemCount: tracks.length,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemBuilder: (context, index) {
                final track = tracks[index];
                
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
                        imageUrl: track['cover'] ?? '',
                        width: 50,
                        height: 50,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: Colors.grey[900]),
                        errorWidget: (context, url, error) => Container(color: Colors.grey[900]),
                      ),
                    ),
                    title: Text(
                      track['title'] ?? 'Unknown Track',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    subtitle: Text(
                      track['artist'] ?? 'Unknown Artist',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey[400], fontSize: 12),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.more_vert, color: Colors.grey),
                          onPressed: () => _showSongOptions(context, Map<String, dynamic>.from(track)),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.play_circle_fill_rounded, color: Color(0xff39ff14), size: 32),
                      ],
                    ),
                    onTap: () {
                      player.setPlaylist(tracks, index);
                    },
                  ),
                );
              },
            ),
    );
  }
}
