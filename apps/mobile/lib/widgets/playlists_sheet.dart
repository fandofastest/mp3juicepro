import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/player_provider.dart';

class PlaylistsSheet extends StatefulWidget {
  final Map<String, dynamic> track;
  const PlaylistsSheet({super.key, required this.track});

  @override
  State<PlaylistsSheet> createState() => _PlaylistsSheetState();
}

class _PlaylistsSheetState extends State<PlaylistsSheet> {
  final _newPlaylistController = TextEditingController();

  @override
  void dispose() {
    _newPlaylistController.dispose();
    super.dispose();
  }

  void _showCreateDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xff1c1b1b),
          title: const Text('Create New Playlist', style: TextStyle(color: Colors.white)),
          content: TextField(
            controller: _newPlaylistController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              hintText: 'Playlist Name',
              hintStyle: TextStyle(color: Colors.grey),
              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
              focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xff39ff14))),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                _newPlaylistController.clear();
                Navigator.of(ctx).pop();
              },
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () {
                final name = _newPlaylistController.text.trim();
                if (name.isNotEmpty) {
                  Provider.of<PlayerProvider>(context, listen: false).createPlaylist(name);
                }
                _newPlaylistController.clear();
                Navigator.of(ctx).pop();
              },
              child: const Text('Create', style: TextStyle(color: Color(0xff39ff14))),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);
    final playlists = player.playlists;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: BoxDecoration(
        color: const Color(0xff1c1b1b),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Add to Playlist',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: _showCreateDialog,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xff131313),
                foregroundColor: const Color(0xff39ff14),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: const Color(0xff39ff14).withOpacity(0.3)),
                ),
              ),
              icon: const Icon(Icons.add, size: 20),
              label: const Text('Create New Playlist', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            if (playlists.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24.0),
                child: Center(
                  child: Text(
                    'No playlists created yet.',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ),
              )
            else
              ConstrainedBox(
                constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.4),
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: playlists.length,
                  itemBuilder: (context, index) {
                    final playlist = playlists[index];
                    final name = playlist['name'] ?? '';
                    final tracksCount = (playlist['tracks'] as List?)?.length ?? 0;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xff131313),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.01)),
                      ),
                      child: ListTile(
                        leading: const Icon(Icons.playlist_add_rounded, color: Color(0xff39ff14)),
                        title: Text(name, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                        subtitle: Text('$tracksCount songs', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        onTap: () {
                          player.addTrackToPlaylist(name, widget.track);
                          Navigator.of(context).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Added track to playlist '$name'!"),
                              backgroundColor: const Color(0xff39ff14),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
