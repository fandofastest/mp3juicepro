import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import '../services/api_service.dart';

class PlayerProvider with ChangeNotifier {
  final AudioPlayer _audioPlayer = AudioPlayer();
  
  Map<String, dynamic>? _currentTrack;
  List<dynamic> _playlist = [];
  int _currentIndex = -1;
  bool _isPlaying = false;
  bool _isLoading = false;
  bool _isSafeModeActive = false;
  String? _errorMessage;
  List<Map<String, dynamic>> _favorites = [];
  List<Map<String, dynamic>> _history = [];
  List<Map<String, dynamic>> _playlists = [];
  List<Map<String, dynamic>> _downloads = [];

  // Position & Duration
  Duration _position = Duration.zero;
  Duration _bufferedPosition = Duration.zero;
  Duration _duration = Duration.zero;

  PlayerProvider() {
    _initAudioStreams();
    checkSafeModeStatus();
    _loadFavorites();
    _loadHistory();
    _loadPlaylists();
    _loadDownloads();
  }

  List<Map<String, dynamic>> get favorites => _favorites;
  List<Map<String, dynamic>> get downloads => _downloads;

  AudioPlayer get audioPlayer => _audioPlayer;
  Map<String, dynamic>? get currentTrack => _currentTrack;
  bool get isPlaying => _isPlaying;
  bool get isLoading => _isLoading;
  bool get isSafeModeActive => _isSafeModeActive;
  String? get errorMessage => _errorMessage;
  
  Duration get position => _position;
  Duration get bufferedPosition => _bufferedPosition;
  Duration get duration => _duration;

  void _initAudioStreams() {
    // Listen to player state
    _audioPlayer.playerStateStream.listen((state) {
      _isPlaying = state.playing;
      _isLoading = state.processingState == ProcessingState.loading ||
                   state.processingState == ProcessingState.buffering;
      if (state.processingState == ProcessingState.completed) {
        next();
      }
      notifyListeners();
    });

    // Listen to position changes
    _audioPlayer.positionStream.listen((pos) {
      _position = pos;
      notifyListeners();
    });

    // Listen to buffered position changes
    _audioPlayer.bufferedPositionStream.listen((bufferedPos) {
      _bufferedPosition = bufferedPos;
      notifyListeners();
    });

    // Listen to duration changes
    _audioPlayer.durationStream.listen((dur) {
      _duration = dur ?? Duration.zero;
      notifyListeners();
    });
  }

  // Periodically or manually fetch App Config to verify Safe Mode
  Future<void> checkSafeModeStatus() async {
    final config = await ApiService.fetchAppConfig();
    if (config.containsKey('safeMode')) {
      _isSafeModeActive = config['safeMode'] == true;
      notifyListeners();
    }
  }

  // Set active playlist
  void setPlaylist(List<dynamic> tracks, int startIndex) {
    _playlist = tracks;
    _currentIndex = startIndex;
    if (startIndex >= 0 && startIndex < tracks.length) {
      playTrack(tracks[startIndex]);
    }
  }

  // Play a specific track
  Future<void> playTrack(Map<String, dynamic> track) async {
    _errorMessage = null;
    _isLoading = true;
    _currentTrack = track;
    addToHistory(track);
    notifyListeners();

    // Check if song is downloaded and play offline if file exists
    final checkVid = track['vid'] ?? track['id'];
    if (checkVid != null) {
      final downloadedIndex = _downloads.indexWhere((item) => (item['vid'] ?? item['id']) == checkVid);
      if (downloadedIndex != -1) {
        final downloadedTrack = _downloads[downloadedIndex];
        if (downloadedTrack['localPath'] != null) {
          final file = File(downloadedTrack['localPath']);
          if (await file.exists()) {
            try {
              final source = AudioSource.file(
                file.path,
                tag: MediaItem(
                  id: checkVid.toString(),
                  album: "Mp3 Juice Pro",
                  title: track['title'] ?? 'Unknown Track',
                  artist: track['artist'] ?? 'Unknown Artist',
                  artUri: Uri.tryParse(track['cover'] ?? ''),
                ),
              );
              await _audioPlayer.setAudioSource(source);
              await _audioPlayer.play();
              _errorMessage = null;
              _isLoading = false;
              notifyListeners();
              return;
            } catch (e) {
              print("Failed to play local downloaded file, falling back to network: $e");
            }
          }
        }
      }
    }

    // Check Safe Mode state first locally (and refresh it)
    await checkSafeModeStatus();
    if (_isSafeModeActive) {
      _isLoading = false;
      _isPlaying = false;
      _errorMessage = "Song playback is disabled (Safe Mode Active)";
      await _audioPlayer.stop();
      notifyListeners();
      return;
    }

    try {
      String? streamUrl;

      // 1. If it's a mock track or has a direct audio stream URL, use it directly
      if (track['url'] != null && 
          (track['url'].toString().endsWith('.mp3') || 
           track['provider'] == 'mock' || 
           (track['url'].toString().startsWith('http') && 
            !track['url'].toString().contains('youtube.com') && 
            !track['url'].toString().contains('youtu.be')))) {
        streamUrl = track['url'];
      }

      // 2. Otherwise fetch play details from API
      if (streamUrl == null) {
        final vid = track['vid'] ?? track['id'];
        if (vid == null) throw Exception("Track Video ID not found");

        try {
          final playDetails = await ApiService.fetchPlayLink(vid);
          if (playDetails != null) {
            if (playDetails['blocked'] == true) {
              _isSafeModeActive = true;
              _errorMessage = playDetails['message'] ?? "Playback disabled by Safe Mode";
              await _audioPlayer.stop();
              _isLoading = false;
              notifyListeners();
              return;
            }
            streamUrl = playDetails['link'];
          }
        } catch (e) {
          print("Failed to fetch play link from server: $e");
        }

        // Fallback to mock audio stream in development if API key is not configured or fails
        if (streamUrl == null || streamUrl.isEmpty) {
          print("Play link resolution failed. Falling back to mock audio stream for demo.");
          // Assign a unique mock URL based on video id hash so they sound different or just a default stream
          streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }
      }

      if (streamUrl == null || streamUrl.isEmpty) {
        throw Exception("Streaming URL not provided");
      }

      final source = AudioSource.uri(
        Uri.parse(streamUrl),
        tag: MediaItem(
          id: checkVid.toString(),
          album: "Mp3 Juice Pro",
          title: track['title'] ?? 'Unknown Track',
          artist: track['artist'] ?? 'Unknown Artist',
          artUri: Uri.tryParse(track['cover'] ?? ''),
        ),
      );
      await _audioPlayer.setAudioSource(source);
      await _audioPlayer.play();
      _errorMessage = null;
    } catch (e) {
      print('Playback error: $e');
      _errorMessage = "Unable to play track. Server returned error.";
      _isPlaying = false;
      _isLoading = false;
      await _audioPlayer.stop();
    } finally {
      notifyListeners();
    }
  }

  // Play / Pause
  Future<void> togglePlay() async {
    if (_isPlaying) {
      await _audioPlayer.pause();
    } else {
      // If Safe Mode has been enabled in the meantime, block it
      await checkSafeModeStatus();
      if (_isSafeModeActive) {
        _errorMessage = "Song playback is disabled (Safe Mode Active)";
        notifyListeners();
        return;
      }
      if (_currentTrack != null) {
        await _audioPlayer.play();
      }
    }
  }

  // Seek
  void seek(Duration pos) {
    _audioPlayer.seek(pos);
  }

  // Next Track
  void next() {
    if (_playlist.isEmpty) return;
    _currentIndex = (_currentIndex + 1) % _playlist.length;
    playTrack(_playlist[_currentIndex]);
  }

  // Previous Track
  void previous() {
    if (_playlist.isEmpty) return;
    _currentIndex = _currentIndex - 1;
    if (_currentIndex < 0) {
      _currentIndex = _playlist.length - 1;
    }
    playTrack(_playlist[_currentIndex]);
  }

  Future<void> _loadFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favsString = prefs.getString('local_favorites');
      if (favsString != null) {
        final List<dynamic> decoded = json.decode(favsString);
        _favorites = decoded.map((item) => Map<String, dynamic>.from(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error loading favorites: $e');
    }
  }

  Future<void> toggleFavorite(Map<String, dynamic> track) async {
    final vid = track['vid'] ?? track['id'];
    if (vid == null) return;

    final isFav = isFavorite(vid);
    if (isFav) {
      _favorites.removeWhere((item) => (item['vid'] ?? item['id']) == vid);
    } else {
      _favorites.add(track);
    }
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('local_favorites', json.encode(_favorites));
    } catch (e) {
      print('Error saving favorites: $e');
    }
  }

  bool isFavorite(String vid) {
    return _favorites.any((item) => (item['vid'] ?? item['id']) == vid);
  }

  List<Map<String, dynamic>> get history => _history;

  Future<void> _loadHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyString = prefs.getString('local_history');
      if (historyString != null) {
        final List<dynamic> decoded = json.decode(historyString);
        _history = decoded.map((item) => Map<String, dynamic>.from(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error loading history: $e');
    }
  }

  Future<void> addToHistory(Map<String, dynamic> track) async {
    try {
      final vid = track['vid'] ?? track['id'];
      if (vid == null) return;

      _history.removeWhere((item) => (item['vid'] ?? item['id']) == vid);
      _history.insert(0, track);
      if (_history.length > 20) {
        _history.removeLast();
      }
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('local_history', json.encode(_history));
    } catch (e) {
      print('Error saving history: $e');
    }
  }

  List<Map<String, dynamic>> get playlists => _playlists;

  Future<void> _loadPlaylists() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final playlistsString = prefs.getString('local_playlists');
      if (playlistsString != null) {
        final List<dynamic> decoded = json.decode(playlistsString);
        _playlists = decoded.map((item) => Map<String, dynamic>.from(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error loading playlists: $e');
    }
  }

  Future<void> createPlaylist(String name) async {
    if (name.trim().isEmpty) return;
    if (_playlists.any((p) => p['name'] == name)) return;

    _playlists.add({
      'name': name,
      'tracks': [],
    });
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('local_playlists', json.encode(_playlists));
    } catch (e) {
      print('Error saving playlists: $e');
    }
  }

  Future<void> addTrackToPlaylist(String playlistName, Map<String, dynamic> track) async {
    final playlistIndex = _playlists.indexWhere((p) => p['name'] == playlistName);
    if (playlistIndex == -1) return;

    final List<dynamic> tracks = List.from(_playlists[playlistIndex]['tracks'] ?? []);
    final vid = track['vid'] ?? track['id'];
    
    if (tracks.any((t) => (t['vid'] ?? t['id']) == vid)) return;

    tracks.add(track);
    _playlists[playlistIndex]['tracks'] = tracks;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('local_playlists', json.encode(_playlists));
    } catch (e) {
      print('Error adding track to playlist: $e');
    }
  }

  Future<void> deletePlaylist(String name) async {
    _playlists.removeWhere((p) => p['name'] == name);
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('local_playlists', json.encode(_playlists));
    } catch (e) {
      print('Error deleting playlist: $e');
    }
  }

  Future<void> _loadDownloads() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final downloadsString = prefs.getString('local_downloads');
      if (downloadsString != null) {
        final List<dynamic> decoded = json.decode(downloadsString);
        _downloads = decoded.map((item) => Map<String, dynamic>.from(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error loading downloads: $e');
    }
  }

  Future<void> downloadTrack(Map<String, dynamic> track, {required Function(double) onProgress}) async {
    final vid = track['vid'] ?? track['id'];
    if (vid == null) return;

    if (isDownloaded(vid)) return;

    try {
      onProgress(0.05);

      // 1. Resolve streaming URL
      String? streamUrl;
      if (track['url'] != null && 
          (track['url'].toString().endsWith('.mp3') || 
           track['provider'] == 'mock' || 
           (track['url'].toString().startsWith('http') && 
            !track['url'].toString().contains('youtube.com') && 
            !track['url'].toString().contains('youtu.be')))) {
        streamUrl = track['url'];
      }

      if (streamUrl == null) {
        try {
          final playDetails = await ApiService.fetchPlayLink(vid);
          if (playDetails != null) {
            streamUrl = playDetails['link'];
          }
        } catch (e) {
          print("Failed to fetch download link from API: $e");
        }
        
        if (streamUrl == null || streamUrl.isEmpty) {
          streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }
      }

      onProgress(0.15);

      // 2. Fetch the audio stream
      final client = http.Client();
      final request = http.Request('GET', Uri.parse(streamUrl));
      final response = await client.send(request);

      final totalBytes = response.contentLength ?? 0;
      int receivedBytes = 0;
      
      final docsDir = await getApplicationDocumentsDirectory();
      final filePath = "${docsDir.path}/$vid.mp3";
      final file = File(filePath);
      final sink = file.openWrite();

      await response.stream.listen((chunk) {
        sink.add(chunk);
        receivedBytes += chunk.length;
        if (totalBytes > 0) {
          final progress = 0.15 + (receivedBytes / totalBytes) * 0.85;
          onProgress(progress);
        }
      }).asFuture();

      await sink.close();
      client.close();

      // 3. Save to downloads list
      final Map<String, dynamic> downloadedTrack = Map<String, dynamic>.from(track);
      downloadedTrack['localPath'] = filePath;

      _downloads.add(downloadedTrack);
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('local_downloads', json.encode(_downloads));
    } catch (e) {
      print("Real download error: $e");
      rethrow;
    }
  }

  Future<void> deleteDownload(String vid) async {
    final index = _downloads.indexWhere((item) => (item['vid'] ?? item['id']) == vid);
    if (index != -1) {
      final track = _downloads[index];
      if (track['localPath'] != null) {
        try {
          final file = File(track['localPath']);
          if (await file.exists()) {
            await file.delete();
          }
        } catch (e) {
          print("Error deleting local downloaded file: $e");
        }
      }
      _downloads.removeAt(index);
      notifyListeners();

      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('local_downloads', json.encode(_downloads));
      } catch (e) {
        print('Error saving downloads after delete: $e');
      }
    }
  }

  bool isDownloaded(String vid) {
    return _downloads.any((item) => (item['vid'] ?? item['id']) == vid);
  }

  Future<String?> exportToPublicDownloads(Map<String, dynamic> track) async {
    final vid = track['vid'] ?? track['id'];
    if (vid == null) throw Exception("Track Video ID not found");

    final downloadedIndex = _downloads.indexWhere((item) => (item['vid'] ?? item['id']) == vid);
    if (downloadedIndex == -1) {
      throw Exception("Track must be downloaded first");
    }
    
    final downloadedTrack = _downloads[downloadedIndex];
    final localPath = downloadedTrack['localPath'];
    if (localPath == null) throw Exception("Local file path not found");

    final sourceFile = File(localPath);
    if (!await sourceFile.exists()) {
      throw Exception("Downloaded file does not exist locally");
    }

    final sanitize = (String input) => input.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
    final filename = "${sanitize(track['title'] ?? 'Song')}.mp3";

    Directory? targetDir;
    
    if (Platform.isAndroid) {
      final publicDir = Directory('/storage/emulated/0/Download');
      if (await publicDir.exists()) {
        targetDir = publicDir;
      }
    }
    
    if (targetDir == null) {
      targetDir = await getDownloadsDirectory();
    }

    if (targetDir == null) {
      targetDir = await getTemporaryDirectory();
    }

    final targetPath = "${targetDir.path}/$filename";
    final targetFile = File(targetPath);
    
    await sourceFile.copy(targetFile.path);
    return targetFile.path;
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }
}
