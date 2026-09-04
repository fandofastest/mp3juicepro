import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/ad_service.dart';
import 'main_navigation.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  String _statusText = 'Starting MP3 Juices...';

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.92, end: 1.08).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );

    _fadeAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );

    _initAppAndShowAds();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _initAppAndShowAds() async {
    final startTime = DateTime.now();

    try {
      if (mounted) {
        setState(() => _statusText = 'Loading configurations...');
      }

      // 1. Fetch backend configuration
      final config = await ApiService.fetchAppConfig();

      if (mounted) {
        setState(() => _statusText = 'Preparing audio & ads service...');
      }

      // 2. Initialize AdService with configuration
      await AdService.instance.initialize(config);

      // Ensure minimum splash display time for visual smoothness (1.5 seconds)
      final elapsedTime = DateTime.now().difference(startTime).inMilliseconds;
      if (elapsedTime < 1500) {
        await Future.delayed(Duration(milliseconds: 1500 - elapsedTime));
      }

      // 3. Show Splash Interstitial Ad if ready & enabled
      if (mounted && (AdService.instance.interSplashEnabled || AdService.instance.interstitialEnabled)) {
        setState(() => _statusText = 'Loading advertisement...');
        await AdService.instance.showSplashInterstitialAd();
      }
    } catch (e) {
      print('SplashScreen init error: $e');
    } finally {
      if (mounted) {
        _navigateToMain();
      }
    }
  }

  void _navigateToMain() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const MainNavigation(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xff131313),
      body: Stack(
        children: [
          // Background subtle glowing circles
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xff39ff14).withOpacity(0.06),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xff39ff14).withOpacity(0.06),
                    blurRadius: 100,
                    spreadRadius: 20,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xff00e3fd).withOpacity(0.06),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xff00e3fd).withOpacity(0.06),
                    blurRadius: 90,
                    spreadRadius: 15,
                  ),
                ],
              ),
            ),
          ),

          // Main Center Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Glowing Animated Logo
                AnimatedBuilder(
                  animation: _animationController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _scaleAnimation.value,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xff39ff14), Color(0xff00e3fd)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xff39ff14).withOpacity(0.4 * _fadeAnimation.value),
                              blurRadius: 30,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Container(
                            width: 110,
                            height: 110,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xff131313),
                            ),
                            child: const Icon(
                              Icons.music_note_rounded,
                              size: 60,
                              color: Color(0xff39ff14),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 36),

                // App Title
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [Color(0xffffffff), Color(0xff39ff14)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ).createShader(bounds),
                  child: const Text(
                    'MP3 JUICE PRO',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.5,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Tagline
                Text(
                  'Unlimited High-Quality Music',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[400],
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 60),

                // Loading Indicator & Status Text
                SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      const Color(0xff39ff14).withOpacity(0.9),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _statusText,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Copyright / Version text
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'v1.0.4 • Powered by Mp3Juices Pro',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[600],
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
