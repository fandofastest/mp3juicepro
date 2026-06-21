import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../providers/player_provider.dart';
import '../providers/auth_provider.dart';
import 'category_detail_screen.dart';
import 'all_categories_screen.dart';
import '../widgets/song_options_sheet.dart';
import '../services/ad_service.dart';
import '../widgets/banner_ad_widget.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback onProfileTap;
  const HomeScreen({super.key, required this.onProfileTap});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _appConfig;
  List<dynamic> _homeSections = [];
  bool _isLoading = true;
  static bool _promoShownThisSession = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    // Fetch App Config
    final config = await ApiService.fetchAppConfig();
    await AdService.instance.initialize(config);
    
    // Fetch Home Sections (pass token if user logged in)
    String? token;
    if (mounted) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      token = auth.token;
    }
    
    final homeSections = await ApiService.fetchHomeSections(token);

    if (mounted) {
      setState(() {
        _appConfig = config;
        _homeSections = homeSections;
        _isLoading = false;
      });
      
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _checkForceUpdateAndPromo();
      });
    }
  }

  void _checkForceUpdateAndPromo() {
    if (_appConfig == null) return;

    // 1. Force Update check
    final appUpdate = _appConfig!['appUpdate'];
    if (appUpdate != null && appUpdate['forceUpdate'] == true) {
      final minVersion = appUpdate['minimumVersion'] ?? '1.0.0';
      const currentVersion = '1.0.0'; // App constant version
      
      if (_isVersionOlderOrEqual(currentVersion, minVersion)) {
        _showForceUpdateDialog(appUpdate['updateUrl'] ?? '');
        return; // Halt and require update
      }
    }

    // 2. Promo Dialog check
    final promo = _appConfig!['promoBanner'];
    if (promo != null && promo['enabled'] == true) {
      if (!_promoShownThisSession) {
        _promoShownThisSession = true;
        _showPromoDialog(promo);
      }
    }
  }

  bool _isVersionOlderOrEqual(String current, String minimum) {
    try {
      final currentParts = current.split('.').map(int.parse).toList();
      final minParts = minimum.split('.').map(int.parse).toList();
      
      for (int i = 0; i < 3; i++) {
        final currentPart = i < currentParts.length ? currentParts[i] : 0;
        final minPart = i < minParts.length ? minParts[i] : 0;
        if (currentPart < minPart) return true;
        if (currentPart > minPart) return false;
      }
      return true; // If equal, return true (forces update)
    } catch (e) {
      return current.compareTo(minimum) <= 0;
    }
  }

  void _showForceUpdateDialog(String updateUrl) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        return WillPopScope(
          onWillPop: () async => false,
          child: AlertDialog(
            backgroundColor: const Color(0xff1c1b1b),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Row(
              children: [
                Icon(Icons.system_update_rounded, color: Color(0xff39ff14)),
                SizedBox(width: 10),
                Text('Update Required', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'A newer version of the application is available. Please update the app to continue using it.',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            actions: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: ElevatedButton(
                  onPressed: () async {
                    final uri = Uri.parse(updateUrl);
                    try {
                      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
                      if (!launched && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("Could not open Play Store/Browser"),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text("Failed to open link: $e"),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff39ff14),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Update Now', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              )
            ],
          ),
        );
      },
    );
  }

  void _showPromoDialog(dynamic promo) {
    final imageUrl = promo['image'] ?? 'https://picsum.photos/500/500';
    final targetUrl = promo['targetUrl'] ?? '';

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Stack(
            alignment: Alignment.topRight,
            children: [
              GestureDetector(
                onTap: () async {
                  Navigator.of(dialogCtx).pop();
                  if (targetUrl.isNotEmpty) {
                    final uri = Uri.parse(targetUrl);
                    try {
                      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
                      if (!launched && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("Could not open URL"),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text("Failed to open link: $e"),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    }
                  }
                },
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xff39ff14).withOpacity(0.3), width: 1.5),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        height: 300,
                        color: const Color(0xff1c1b1b),
                        alignment: Alignment.center,
                        child: const CircularProgressIndicator(color: Color(0xff39ff14)),
                      ),
                      errorWidget: (context, url, error) => Container(
                        height: 300,
                        color: const Color(0xff1c1b1b),
                        alignment: Alignment.center,
                        child: const Icon(Icons.broken_image_rounded, color: Colors.grey, size: 50),
                      ),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white, size: 28),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black54,
                    shape: const CircleBorder(),
                  ),
                  onPressed: () => Navigator.of(dialogCtx).pop(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final player = Provider.of<PlayerProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xff131313),
      bottomNavigationBar: _isLoading ? null : const BannerAdWidget(),
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
          GestureDetector(
            onTap: widget.onProfileTap,
            child: Container(
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

                  // Render Home Builder Sections dynamically
                  if (_homeSections.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.0),
                      child: Center(
                        child: Text(
                          'No home sections configured yet.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ..._homeSections.map((sec) => _buildSection(sec, player)),

                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildSection(dynamic section, PlayerProvider player) {
    final title = section['title'] ?? '';
    final subtitle = section['subtitle'] ?? '';
    final layout = section['layout'] ?? 'carousel';
    final type = section['type'] ?? '';
    var items = section['items'] as List<dynamic>? ?? [];
    if (type == 'history' && items.isEmpty) {
      items = player.history;
    }

    if (items.isEmpty) return const SizedBox.shrink();

    // 1. Banner Layout
    if (layout == 'banner' || type == 'banner') {
      final banner = items[0];
      return Container(
        margin: const EdgeInsets.only(bottom: 24),
        height: 140,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          image: DecorationImage(
            image: CachedNetworkImageProvider(
              banner['image'] ?? 'https://picsum.photos/800/400',
            ),
            fit: BoxFit.cover,
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              colors: [Colors.black.withOpacity(0.7), Colors.transparent],
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
            ),
          ),
          alignment: Alignment.bottomLeft,
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                banner['title'] ?? 'Featured Spotlight',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (banner['subtitle'] != null) ...[
                const SizedBox(height: 4),
                Text(
                  banner['subtitle'],
                  style: TextStyle(color: Colors.grey[300], fontSize: 11),
                ),
              ],
            ],
          ),
        ),
      );
    }

    // 2. Grid Layout
    if (layout == 'grid') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(
            title,
            subtitle,
            onActionPressed: type == 'category' ? () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AllCategoriesScreen()),
              );
            } : null,
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
            ),
            itemBuilder: (context, index) {
              final item = items[index];
              final itemTitle = item['title'] ?? item['name'] ?? 'Playlist';
              final coverUrl = item['cover'] ?? 'https://picsum.photos/300/200';

              return GestureDetector(
                onTap: () {
                  if (type == 'category') {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CategoryDetailScreen(category: item),
                      ),
                    );
                  }
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xff1c1b1b).withOpacity(0.8),
                    borderRadius: BorderRadius.circular(16),
                    image: DecorationImage(
                      image: CachedNetworkImageProvider(coverUrl),
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
                        itemTitle,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (item['color'] != null)
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: Color(int.parse(item['color'].replaceAll('#', '0xff'))),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      );
    }

    // 3. Carousel Layout
    if (layout == 'carousel' || type == 'featured' || type == 'recommendation') {
      final isCategoryType = type == 'category';
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(title, subtitle),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];

                if (isCategoryType) {
                  return GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => CategoryDetailScreen(category: item),
                        ),
                      );
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
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.folder_open_rounded, color: Color(0xff39ff14), size: 40),
                          const SizedBox(height: 12),
                          Text(
                            item['title'] ?? item['name'] ?? 'Category',
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                // Render track items
                final track = item;
                final vid = track['vid'] ?? track['id'] ?? '';
                final isFav = player.isFavorite(vid);

                return GestureDetector(
                  onTap: () {
                    AdService.instance.showInterstitialAdIfReady();
                    player.setPlaylist(items, index);
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
                        Expanded(
                          child: Stack(
                            children: [
                              Positioned.fill(
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
                              Positioned(
                                top: 4,
                                right: 4,
                                child: GestureDetector(
                                  onTap: () {
                                    showModalBottomSheet(
                                      context: context,
                                      isScrollControlled: true,
                                      backgroundColor: Colors.transparent,
                                      builder: (_) => SongOptionsSheet(track: track),
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.6),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.more_vert_rounded,
                                      color: Colors.white70,
                                      size: 14,
                                    ),
                                  ),
                                ),
                              ),
                            ],
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
          const SizedBox(height: 24),
        ],
      );
    }

    // 4. List Layout
    if (layout == 'list' || type == 'history' || type == 'favorites') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(title, subtitle),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final track = items[index];
              final vid = track['vid'] ?? track['id'] ?? '';
              final isFav = player.isFavorite(vid);

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
                        icon: const Icon(
                          Icons.more_vert_rounded,
                          color: Colors.grey,
                          size: 22,
                        ),
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => SongOptionsSheet(track: track),
                          );
                        },
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.play_circle_fill_rounded, color: Color(0xff39ff14), size: 32),
                    ],
                  ),
                  onTap: () {
                    AdService.instance.showInterstitialAdIfReady();
                    player.setPlaylist(items, index);
                  },
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildSectionHeader(String title, String subtitle, {VoidCallback? onActionPressed}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (subtitle.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (onActionPressed != null)
          TextButton(
            onPressed: onActionPressed,
            child: const Text(
              'View All',
              style: TextStyle(color: Color(0xff39ff14), fontSize: 12),
            ),
          )
      ],
    );
  }
}
