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

  String get provider => _provider;
  bool get bannerEnabled => _bannerEnabled;

  Future<void> initialize(Map<String, dynamic> config) async {
    final adsConf = config['ads'] ?? {};
    _provider = adsConf['adProvider'] ?? 'none';
    _bannerEnabled = adsConf['bannerEnabled'] ?? false;
    _interstitialEnabled = adsConf['interstitialEnabled'] ?? false;
    _rewardedEnabled = adsConf['rewardedEnabled'] ?? false;
    _nativeEnabled = adsConf['nativeEnabled'] ?? false;
    _interstitialInterval = adsConf['interstitialInterval'] ?? 5;

    _admobKeys = config['admob'] ?? {};
    _applovinKeys = config['applovin'] ?? {};

    print('AdService Initializing with provider: $_provider');

    if (_provider == 'admob') {
      await MobileAds.instance.initialize();
      _loadAdmobInterstitial();
    } else if (_provider == 'applovin') {
      final sdkKey = _applovinKeys['sdkKey'] ?? '';
      if (sdkKey.isNotEmpty) {
        await AppLovinMAX.initialize(sdkKey);
        _setupApplovinListeners();
        _loadApplovinInterstitial();
      }
    }
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

  // Banner Unit ID Getters
  String getAdmobBannerUnitId() => _admobKeys['bannerAdUnitId'] ?? '';
  String getApplovinBannerUnitId() => _applovinKeys['bannerAdUnitId'] ?? '';
}
