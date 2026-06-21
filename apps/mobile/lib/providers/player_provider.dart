import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
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

  // Position & Duration
  Duration _position = Duration.zero;
  Duration _bufferedPosition = Duration.zero;
  Duration _duration = Duration.zero;

  PlayerProvider() {
    _initAudioStreams();
    checkSafeModeStatus();
  }

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
    notifyListeners();

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
      final vid = track['vid'] ?? track['id'];
      if (vid == null) throw Exception("Track Video ID not found");

      // Fetch play details from API
      final playDetails = await ApiService.fetchPlayLink(vid);
      
      if (playDetails == null) {
        throw Exception("Failed to fetch stream details");
      }

      if (playDetails['blocked'] == true) {
        _isSafeModeActive = true;
        _errorMessage = playDetails['message'] ?? "Playback disabled by Safe Mode";
        await _audioPlayer.stop();
        _isLoading = false;
        notifyListeners();
        return;
      }

      final streamUrl = playDetails['link'];
      if (streamUrl == null || streamUrl.isEmpty) {
        throw Exception("Streaming URL not provided");
      }

      // Configure player stream
      await _audioPlayer.setUrl(streamUrl);
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

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }
}
