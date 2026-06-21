import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart' as admob;
import 'package:applovin_max/applovin_max.dart' as applovin;
import '../services/ad_service.dart';

class BannerAdWidget extends StatefulWidget {
  const BannerAdWidget({super.key});

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  admob.BannerAd? _admobBanner;
  bool _isAdmobBannerLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadBanner();
  }

  void _loadBanner() {
    final provider = AdService.instance.provider;
    final enabled = AdService.instance.bannerEnabled;

    if (!enabled) return;

    if (provider == 'admob') {
      final unitId = AdService.instance.getAdmobBannerUnitId();
      if (unitId.isEmpty) return;

      _admobBanner = admob.BannerAd(
        adUnitId: unitId,
        size: admob.AdSize.banner,
        request: const admob.AdRequest(),
        listener: admob.BannerAdListener(
          onAdLoaded: (ad) {
            setState(() {
              _isAdmobBannerLoaded = true;
            });
          },
          onAdFailedToLoad: (ad, error) {
            ad.dispose();
            print('AdMob BannerAd failed to load: $error');
          },
        ),
      );
      _admobBanner!.load();
    }
  }

  @override
  void dispose() {
    _admobBanner?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = AdService.instance.provider;
    final enabled = AdService.instance.bannerEnabled;

    if (!enabled || provider == 'none') {
      return const SizedBox.shrink();
    }

    if (provider == 'admob') {
      if (_admobBanner != null && _isAdmobBannerLoaded) {
        return Container(
          alignment: Alignment.center,
          width: _admobBanner!.size.width.toDouble(),
          height: _admobBanner!.size.height.toDouble(),
          child: admob.AdWidget(ad: _admobBanner!),
        );
      }
    } else if (provider == 'applovin') {
      final unitId = AdService.instance.getApplovinBannerUnitId();
      if (unitId.isNotEmpty) {
        return Container(
          alignment: Alignment.center,
          height: 50,
          child: applovin.MaxAdView(
            adUnitId: unitId,
            adFormat: applovin.AdFormat.banner,
            listener: applovin.AdViewAdListener(
              onAdLoadedCallback: (ad) {
                print('AppLovin BannerAd loaded');
              },
              onAdLoadFailedCallback: (adUnitId, error) {
                print('AppLovin BannerAd failed to load: $error');
              },
              onAdExpandedCallback: (ad) {},
              onAdCollapsedCallback: (ad) {},
              onAdClickedCallback: (ad) {},
            ),
          ),
        );
      }
    }

    return const SizedBox.shrink();
  }
}
