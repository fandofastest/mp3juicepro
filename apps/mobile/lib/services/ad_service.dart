import 'dart:async';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:applovin_max/applovin_max.dart';

class AdService {
  static final AdService instance = AdService._internal();
  AdService._internal();

  String _provider = 'none';
  bool _bannerEnabled = false;
  bool _interstitialEnabled = false;
  bool _rewardedEnabled = false;
  bool _nativeEnabled = false;
  int _interstitialInterval = 5;
  int _actionCount = 0;

  // Unit IDs
  Map<String, dynamic> _admobKeys = {};
  Map<String, dynamic> _applovinKeys = {};

  // Interstitial States
  InterstitialAd? _admobInterstitialAd;
  bool _isAdmobInterstitialLoading = false;
  bool _isApplovinInterstitialLoaded = false;

  bool _isInitialized = false;

  bool _interSplashEnabled = false;

  String get provider => _provider;
  bool get bannerEnabled => _bannerEnabled;
  bool get interstitialEnabled => _interstitialEnabled;
  bool get interSplashEnabled => _interSplashEnabled;
  bool get isInitialized => _isInitialized;

  Future<void> initialize(Map<String, dynamic> config) async {
    final adsConf = (config['ads'] as Map<String, dynamic>?) ?? {};

    // 1. Master toggle check (ads.enabled)
    final bool masterEnabled = adsConf['enabled'] == true;
    if (!masterEnabled) {
      print('AdService: Master ads toggle is disabled (ads.enabled = false). Disabling all ads.');
      _provider = 'none';
      _bannerEnabled = false;
      _interstitialEnabled = false;
      _interSplashEnabled = false;
      _rewardedEnabled = false;
      _nativeEnabled = false;
      _isInitialized = true;
      return;
    }

    final String rawProvider = (adsConf['adProvider'] ?? adsConf['provider'] ?? config['adProvider'] ?? 'none').toString().toLowerCase();
    _provider = rawProvider;

    _bannerEnabled = adsConf['bannerEnabled'] == true || adsConf['banner'] == true;
    _interstitialEnabled = adsConf['interstitialEnabled'] == true || adsConf['interstitial'] == true;
    _interSplashEnabled = adsConf['interSplashEnabled'] == true;
    _rewardedEnabled = adsConf['rewardedEnabled'] == true || adsConf['reward'] == true;
    _nativeEnabled = adsConf['nativeEnabled'] == true || adsConf['native'] == true;
    
    final freq = adsConf['interstitialInterval'] ?? adsConf['frequency'];
    _interstitialInterval = (freq is int) ? freq : (int.tryParse(freq?.toString() ?? '') ?? 5);

    final rawAdmob = (config['admob'] as Map<String, dynamic>?) ?? (adsConf['admob'] as Map<String, dynamic>?) ?? {};
    final rawApplovin = (config['applovin'] as Map<String, dynamic>?) ?? (adsConf['applovin'] as Map<String, dynamic>?) ?? {};

    String admobAppId = rawAdmob['appId'] ?? rawAdmob['applicationId'] ?? '';
    String admobBannerUnitId = rawAdmob['bannerAdUnitId'] ?? rawAdmob['bannerId'] ?? rawAdmob['admobBanner'] ?? '';
    String admobInterUnitId = rawAdmob['interstitialAdUnitId'] ?? rawAdmob['interstitialId'] ?? rawAdmob['admobInterstitial'] ?? '';
    String admobSplashUnitId = rawAdmob['interSplashAdUnitId'] ?? admobInterUnitId;

    String applovinSdkKey = rawApplovin['sdkKey'] ?? '';
    String applovinBannerUnitId = rawApplovin['bannerAdUnitId'] ?? rawApplovin['bannerId'] ?? '';
    String applovinInterUnitId = rawApplovin['interstitialAdUnitId'] ?? rawApplovin['interstitialId'] ?? '';
    String applovinSplashUnitId = rawApplovin['interSplashAdUnitId'] ?? applovinInterUnitId;

    // AdMob test mode fallback (only when provider is explicitly 'admobtest')
    if (_provider == 'admobtest') {
      print('AdService: AdMob test mode requested. Setting AdMob test unit IDs.');
      _provider = 'admob';
      admobAppId = 'ca-app-pub-3940256099942544~3347511713';
      admobBannerUnitId = 'ca-app-pub-3940256099942544/6300978111';
      admobInterUnitId = 'ca-app-pub-3940256099942544/1033173712';
      admobSplashUnitId = 'ca-app-pub-3940256099942544/1033173712';
    }

    _admobKeys = {
      'appId': admobAppId,
      'bannerAdUnitId': admobBannerUnitId,
      'interstitialAdUnitId': admobInterUnitId,
      'interSplashAdUnitId': admobSplashUnitId,
    };

    _applovinKeys = {
      'sdkKey': applovinSdkKey,
      'bannerAdUnitId': applovinBannerUnitId,
      'interstitialAdUnitId': applovinInterUnitId,
      'interSplashAdUnitId': applovinSplashUnitId,
    };

    print('AdService Initializing with provider: $_provider (banner: $_bannerEnabled, inter: $_interstitialEnabled, interSplash: $_interSplashEnabled)');

    if (_provider == 'admob') {
      await MobileAds.instance.initialize();
      _loadAdmobInterstitial();
    } else if (_provider == 'applovin') {
      if (applovinSdkKey.isNotEmpty) {
        await AppLovinMAX.initialize(applovinSdkKey);
        _setupApplovinListeners();
        _loadApplovinInterstitial();
      }
    }
    _isInitialized = true;
  }

  // ADMOB LOGIC
  void _loadAdmobInterstitial() {
    if (!_interstitialEnabled || _isAdmobInterstitialLoading) return;
    final adUnitId = _admobKeys['interstitialAdUnitId'] ?? '';
    if (adUnitId.isEmpty) return;

    _isAdmobInterstitialLoading = true;
    InterstitialAd.load(
      adUnitId: adUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _admobInterstitialAd = ad;
          _isAdmobInterstitialLoading = false;
          print('AdMob Interstitial loaded');
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _admobInterstitialAd = null;
              _loadAdmobInterstitial(); // Preload next
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              _admobInterstitialAd = null;
              _loadAdmobInterstitial();
            },
          );
        },
        onAdFailedToLoad: (error) {
          _isAdmobInterstitialLoading = false;
          print('AdMob Interstitial failed to load: $error');
        },
      ),
    );
  }

  // APPLOVIN LOGIC
  void _setupApplovinListeners() {
    final adUnitId = _applovinKeys['interstitialAdUnitId'] ?? '';
    if (adUnitId.isEmpty) return;

    AppLovinMAX.setInterstitialListener(InterstitialListener(
      onAdLoadedCallback: (ad) {
        _isApplovinInterstitialLoaded = true;
        print('AppLovin Interstitial loaded');
      },
      onAdLoadFailedCallback: (adUnitId, error) {
        _isApplovinInterstitialLoaded = false;
        print('AppLovin Interstitial failed to load: $error');
      },
      onAdDisplayedCallback: (ad) {},
      onAdDisplayFailedCallback: (ad, error) {
        _isApplovinInterstitialLoaded = false;
        _loadApplovinInterstitial();
      },
      onAdClickedCallback: (ad) {},
      onAdHiddenCallback: (ad) {
        _isApplovinInterstitialLoaded = false;
        _loadApplovinInterstitial(); // Preload next
      },
    ));
  }

  void _loadApplovinInterstitial() {
    if (!_interstitialEnabled) return;
    final adUnitId = _applovinKeys['interstitialAdUnitId'] ?? '';
    if (adUnitId.isEmpty) return;
    AppLovinMAX.loadInterstitial(adUnitId);
  }

  // Unified show method
  Future<void> showInterstitialAdIfReady() async {
    if (!_interstitialEnabled) return;
    
    _actionCount++;
    if (_actionCount % _interstitialInterval != 0) {
      print('AdService: Interstitial interval not reached ($_actionCount/$_interstitialInterval)');
      return;
    }

    print('AdService: Triggering interstitial ad...');

    if (_provider == 'admob' && _admobInterstitialAd != null) {
      await _admobInterstitialAd!.show();
    } else if (_provider == 'applovin') {
      final adUnitId = _applovinKeys['interstitialAdUnitId'] ?? '';
      if (adUnitId.isNotEmpty && _isApplovinInterstitialLoaded) {
        final isReady = await AppLovinMAX.isInterstitialReady(adUnitId);
        if (isReady == true) {
          AppLovinMAX.showInterstitial(adUnitId);
        }
      }
    }
  }

  /// Show Interstitial Ad specifically on Splash launch, waiting until dismissed.
  Future<bool> showSplashInterstitialAd() async {
    if (!_interSplashEnabled && !_interstitialEnabled) {
      print('AdService [Splash]: Splash Interstitial ads are disabled.');
      return false;
    }

    print('AdService [Splash]: Checking splash interstitial ad...');

    // Wait up to 3 seconds if ad is currently loading
    int waitedMs = 0;
    while (waitedMs < 3000) {
      if (_provider == 'admob' && _admobInterstitialAd != null) break;
      if (_provider == 'applovin' && _isApplovinInterstitialLoaded) break;
      if (!_isAdmobInterstitialLoading && _provider == 'admob' && _admobInterstitialAd == null) break;
      await Future.delayed(const Duration(milliseconds: 200));
      waitedMs += 200;
    }

    if (_provider == 'admob' && _admobInterstitialAd != null) {
      final ad = _admobInterstitialAd!;
      _admobInterstitialAd = null; // consume
      final completer = Completer<bool>();

      ad.fullScreenContentCallback = FullScreenContentCallback(
        onAdDismissedFullScreenContent: (ad) {
          ad.dispose();
          _loadAdmobInterstitial();
          if (!completer.isCompleted) completer.complete(true);
        },
        onAdFailedToShowFullScreenContent: (ad, error) {
          ad.dispose();
          _loadAdmobInterstitial();
          if (!completer.isCompleted) completer.complete(false);
        },
      );

      await ad.show();
      return completer.future;
    } else if (_provider == 'applovin') {
      final adUnitId = _applovinKeys['interstitialAdUnitId'] ?? '';
      if (adUnitId.isNotEmpty) {
        final isReady = await AppLovinMAX.isInterstitialReady(adUnitId);
        if (isReady == true || _isApplovinInterstitialLoaded) {
          final completer = Completer<bool>();
          AppLovinMAX.setInterstitialListener(InterstitialListener(
            onAdLoadedCallback: (ad) { _isApplovinInterstitialLoaded = true; },
            onAdLoadFailedCallback: (adUnitId, error) { _isApplovinInterstitialLoaded = false; },
            onAdDisplayedCallback: (ad) {},
            onAdDisplayFailedCallback: (ad, error) {
              _isApplovinInterstitialLoaded = false;
              _loadApplovinInterstitial();
              if (!completer.isCompleted) completer.complete(false);
            },
            onAdClickedCallback: (ad) {},
            onAdHiddenCallback: (ad) {
              _isApplovinInterstitialLoaded = false;
              _loadApplovinInterstitial();
              _setupApplovinListeners();
              if (!completer.isCompleted) completer.complete(true);
            },
          ));

          AppLovinMAX.showInterstitial(adUnitId);
          return completer.future;
        }
      }
    }

    print('AdService [Splash]: No interstitial ad ready to display.');
    return false;
  }

  // Banner Unit ID Getters
  String getAdmobBannerUnitId() => _admobKeys['bannerAdUnitId'] ?? '';
  String getApplovinBannerUnitId() => _applovinKeys['bannerAdUnitId'] ?? '';
}
