import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/player_provider.dart';
import 'playlists_sheet.dart';

class SongOptionsSheet extends StatelessWidget {
  final Map<String, dynamic> track;
  const SongOptionsSheet({super.key, required this.track});

  void _showPlaylists(BuildContext context) {
    Navigator.of(context).pop(); // close options sheet
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PlaylistsSheet(track: track),
    );
  }

  void _startDownload(BuildContext context) {
    Navigator.of(context).pop(); // close options sheet
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        double progress = 0.0;
        bool isDone = false;

        return StatefulBuilder(
          builder: (context, setState) {
            if (progress == 0.0 && !isDone) {
              isDone = true; // prevent re-entry
              Future.microtask(() async {
                try {
                  final player = Provider.of<PlayerProvider>(dialogCtx, listen: false);
                  await player.downloadTrack(
                    track,
                    onProgress: (val) {
                      if (dialogCtx.mounted) {
                        setState(() {
                          progress = val;
                        });
                      }
                    },
                  );
                  if (dialogCtx.mounted) {
                    Navigator.of(dialogCtx).pop(); // close dialog
                    ScaffoldMessenger.of(dialogCtx).showSnackBar(
                      SnackBar(
                        content: Text("Finished downloading '${track['title']}'!"),
                        backgroundColor: const Color(0xff39ff14),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  }
                } catch (e) {
                  if (dialogCtx.mounted) {
                    Navigator.of(dialogCtx).pop(); // close dialog
                    ScaffoldMessenger.of(dialogCtx).showSnackBar(
                      SnackBar(
                        content: Text("Failed to download track: $e"),
                        backgroundColor: Colors.redAccent,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  }
                }
              });
            }

            return AlertDialog(
              backgroundColor: const Color(0xff1c1b1b),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Downloading Track', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.white10,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Downloading - ${(progress * 100).toInt()}%',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _shareTrack(BuildContext context) {
    Navigator.of(context).pop(); // close options sheet
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Link for '${track['title']}' copied to clipboard!"),
        backgroundColor: const Color(0xff39ff14),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _saveToPublicDownloads(BuildContext context, PlayerProvider player) async {
    Navigator.of(context).pop(); // close options sheet

    final vid = track['vid'] ?? track['id'];
    if (vid == null) return;

    final isDownloaded = player.isDownloaded(vid);

    if (isDownloaded) {
      try {
        final savedPath = await player.exportToPublicDownloads(track);
        if (savedPath != null && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("Saved to Downloads folder!"),
              backgroundColor: const Color(0xff39ff14),
              duration: const Duration(seconds: 3),
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("Failed to save: $e"),
              backgroundColor: Colors.redAccent,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
      return;
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        double progress = 0.0;
        bool isDone = false;

        return StatefulBuilder(
          builder: (context, setState) {
            if (progress == 0.0 && !isDone) {
              isDone = true;
              Future.microtask(() async {
                try {
                  await player.downloadTrack(
                    track,
                    onProgress: (val) {
                      if (dialogCtx.mounted) {
                        setState(() {
                          progress = val;
                        });
                      }
                    },
                  );
                  await player.exportToPublicDownloads(track);
                  if (dialogCtx.mounted) {
                    Navigator.of(dialogCtx).pop(); // close dialog
                    ScaffoldMessenger.of(dialogCtx).showSnackBar(
                      SnackBar(
                        content: Text("Downloaded & saved to Downloads folder!"),
                        backgroundColor: const Color(0xff39ff14),
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  }
                } catch (e) {
                  if (dialogCtx.mounted) {
                    Navigator.of(dialogCtx).pop(); // close dialog
                    ScaffoldMessenger.of(dialogCtx).showSnackBar(
                      SnackBar(
                        content: Text("Failed to download & save: $e"),
                        backgroundColor: Colors.redAccent,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  }
                }
              });
            }

            return AlertDialog(
              backgroundColor: const Color(0xff1c1b1b),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Saving to Downloads', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.white10,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Downloading - ${(progress * 100).toInt()}%',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);
    final vid = track['vid'] ?? track['id'] ?? '';
    final isFav = player.isFavorite(vid);
    final isDownloaded = player.isDownloaded(vid);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
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
            // Handle
            Center(
              child: Container(
                width: 48,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Header info
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: track['cover'] ?? '',
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: Colors.grey[900]),
                    errorWidget: (context, url, error) => Container(color: Colors.grey[900]),
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
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: Colors.grey[400], fontSize: 13),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const Divider(color: Colors.white10, height: 28),

            // Menu Items
            _buildOptionItem(
              Icons.play_arrow_rounded,
              'Play Now',
              onTap: () {
                Navigator.of(context).pop();
                player.playTrack(track);
              },
            ),
            _buildOptionItem(
              isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              isFav ? 'Remove from Favorites' : 'Add to Favorites',
              iconColor: isFav ? Colors.redAccent : Colors.grey,
              onTap: () {
                Navigator.of(context).pop();
                player.toggleFavorite(track);
              },
            ),
            _buildOptionItem(
              Icons.playlist_add_rounded,
              'Add to Playlist',
              onTap: () => _showPlaylists(context),
            ),
            _buildOptionItem(
              isDownloaded ? Icons.delete_outline_rounded : Icons.download_rounded,
              isDownloaded ? 'Remove Download' : 'Download Track',
              iconColor: isDownloaded ? Colors.redAccent : null,
              trailing: isDownloaded ? null : Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xff39ff14).withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: const Text('PRO', style: TextStyle(color: Color(0xff39ff14), fontSize: 9, fontWeight: FontWeight.bold)),
              ),
              onTap: () {
                if (isDownloaded) {
                  Navigator.of(context).pop();
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      backgroundColor: const Color(0xff1c1b1b),
                      title: const Text('Delete Download', style: TextStyle(color: Colors.white)),
                      content: Text(
                        'Are you sure you want to delete the offline download for "${track['title']}"?',
                        style: const TextStyle(color: Colors.grey),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                        ),
                        TextButton(
                          onPressed: () {
                            player.deleteDownload(vid);
                            Navigator.of(ctx).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text("Removed '${track['title']}' from downloads."),
                                backgroundColor: Colors.redAccent,
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
                        ),
                      ],
                    ),
                  );
                } else {
                  _startDownload(context);
                }
              },
            ),
            _buildOptionItem(
              Icons.save_alt_rounded,
              'Save to Downloads',
              onTap: () => _saveToPublicDownloads(context, player),
            ),
            _buildOptionItem(
              Icons.share_outlined,
              'Share Track',
              onTap: () => _shareTrack(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionItem(IconData icon, String label, {Color? iconColor, Widget? trailing, required VoidCallback onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.03),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: iconColor ?? const Color(0xff39ff14), size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
              if (trailing != null) trailing,
            ],
          ),
        ),
      ),
    );
  }
}
