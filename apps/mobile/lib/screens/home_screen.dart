import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/api_service.dart';
import '../providers/player_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _appConfig;
  List<dynamic> _categories = [];
  Map<String, List<dynamic>> _categoryTracks = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    // Fetch App Config
    final config = await ApiService.fetchAppConfig();
    
    // Fetch Categories
    final categories = await ApiService.fetchCategories();
    
    // Fetch tracks for top 3 categories
    final Map<String, List<dynamic>> catTracks = {};
    for (var cat in categories.take(3)) {
      final slug = cat['slug'];
      if (slug != null) {
        final tracks = await ApiService.fetchCategoryTracks(slug);
        catTracks[slug] = tracks;
      }
    }

    if (mounted) {
      setState(() {
        _appConfig = config;
        _categories = categories;
        _categoryTracks = catTracks;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xff131313),
      appBar: AppBar(
        backgroundColor: const Color(0xff131313).withOpacity(0.8),
        elevation: 0,
        title: const Text(
          'Mp3 Juices',
          style: TextStyle(
            color: Color(0xff39ff14),
            fontSize: 22,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.8,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadData,
          ),
          Container(
            margin: const EdgeInsets.only(right: 16),
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xff39ff14), width: 1.5),
            ),
            child: const CircleAvatar(
              backgroundImage: NetworkImage('https://i.pravatar.cc/100'),
            ),
          )
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xff39ff14)),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xff39ff14),
              backgroundColor: const Color(0xff1c1b1b),
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  // Safe Mode Header warning if active
                  if (player.isSafeModeActive)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red[950]!.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.security_rounded, color: Colors.redAccent, size: 24),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Safe Mode Enabled',
                                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'App is in catalog-only mode. Audio playback and downloads are restricted.',
                                  style: TextStyle(color: Colors.redAccent, fontSize: 11),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),

                  // Promotional Banner from App Config
                  if (_appConfig != null &&
                      _appConfig!['promoBanner'] != null &&
                      _appConfig!['promoBanner']['enabled'] == true)
                    Container(
                      margin: const EdgeInsets.only(bottom: 24),
                      height: 120,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        image: DecorationImage(
                          image: CachedNetworkImageProvider(
                            _appConfig!['promoBanner']['image'] ?? 'https://picsum.photos/600/200',
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            colors: [Colors.black.withOpacity(0.6), Colors.transparent],
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                          ),
                        ),
                        alignment: Alignment.bottomLeft,
                        padding: const EdgeInsets.all(12),
                        child: const Text(
                          'Promo Banner Active',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                  // Welcome Section
                  Container(
                    height: 140,
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xff1c1b1b),
                          const Color(0xff2a2a2a).withOpacity(0.6),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      border: Border.all(color: Colors.white.withOpacity(0.03)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Good Day, Listener',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'The perfect soundtrack is ready. Dive into your personalized mixes.',
                          style: TextStyle(color: Colors.grey[400], fontSize: 13),
                        ),
                      ],
                    ),
                  ),

                  // Dynamic Categories Lists
                  if (_categories.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24.0),
                      child: Center(
                        child: Text(
                          'No categories found.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ..._categories.take(3).map((cat) {
                      final slug = cat['slug'] ?? '';
                      final tracks = _categoryTracks[slug] ?? [];
                      if (tracks.isEmpty) return const SizedBox.shrink();

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12.0, top: 12.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  cat['name'] ?? 'Category',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                TextButton(
                                  onPressed: () {},
                                  child: const Text(
                                    'View All',
                                    style: TextStyle(color: Color(0xff39ff14), fontSize: 12),
                                  ),
                                )
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 200,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: tracks.length,
                              itemBuilder: (context, index) {
                                final track = tracks[index];
                                return GestureDetector(
                                  onTap: () {
                                    player.setPlaylist(tracks, index);
                                  },
                                  child: Container(
                                    width: 140,
                                    margin: const EdgeInsets.only(right: 16),
                                    decoration: BoxDecoration(
                                      color: const Color(0xff1c1b1b).withOpacity(0.6),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: Colors.white.withOpacity(0.04)),
                                    ),
                                    padding: const EdgeInsets.all(8),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Image Cover
                                        Expanded(
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(12),
                                            child: CachedNetworkImage(
                                              imageUrl: track['cover'] ?? '',
                                              width: double.infinity,
                                              fit: BoxFit.cover,
                                              placeholder: (context, url) => Container(color: Colors.grey[900]),
                                              errorWidget: (context, url, error) => Container(color: Colors.grey[900]),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          track['title'] ?? 'Unknown Track',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          track['artist'] ?? 'Unknown Artist',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            color: Colors.grey[500],
                                            fontSize: 10,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      );
                    }),

                  const SizedBox(height: 20),

                  // Recent Playlists Bento
                  const Text(
                    'Recent Playlists',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.5,
                    children: [
                      _buildPlaylistCard('Midnight Chill', 'https://picsum.photos/id/10/300/200', '24 Tracks'),
                      _buildPlaylistCard('Deep House', 'https://picsum.photos/id/103/300/200', 'Selected Beats'),
                      _buildPlaylistCard('Focus Flow', 'https://picsum.photos/id/180/300/200', 'Lofi Focus'),
                      _buildPlaylistCard('Indie Pop', 'https://picsum.photos/id/45/300/200', 'New Finds'),
                    ],
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildPlaylistCard(String title, String imageUrl, String subtitle) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xff1c1b1b).withOpacity(0.8),
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(
          image: CachedNetworkImageProvider(imageUrl),
          fit: BoxFit.cover,
          opacity: 0.25,
        ),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            subtitle,
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
