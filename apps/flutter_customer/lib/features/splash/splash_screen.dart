import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/services/auth_service.dart';

/// Branded splash screen shown on cold start
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeIn;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _fadeIn = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    _scale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Minimum splash duration
    final minSplashFuture = Future.delayed(const Duration(milliseconds: 2000));
    
    // Ensure anonymous auth
    final authFuture = ref.read(authServiceProvider).ensureAnonymousSession();
    
    try {
      // Wait for both duration and auth
      await Future.wait([minSplashFuture, authFuture]);
    } catch (e) {
      debugPrint('Auth init failed in splash: $e');
      // Continue anyway, app will retry or show error states elsewhere
      await minSplashFuture;
    }

    if (mounted) {
      context.go('/');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Opacity(
              opacity: _fadeIn.value,
              child: Transform.scale(
                scale: _scale.value,
                child: child,
              ),
            );
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Logo container
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      ClayColors.primary,
                      ClayColors.primaryDark,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(ClayRadius.xl),
                  boxShadow: [
                    BoxShadow(
                      color: ClayColors.primary.withValues(alpha: 0.3),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.restaurant_menu_rounded,
                  color: Colors.white,
                  size: 56,
                ),
              ),
              const SizedBox(height: ClaySpacing.lg),
              // App name
              Text(
                'DineIn',
                style: ClayTypography.h1.copyWith(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: ClayColors.textPrimary,
                ),
              ),
              const SizedBox(height: ClaySpacing.sm),
              // Tagline
              Text(
                'Order at your table',
                style: ClayTypography.caption.copyWith(
                  fontSize: 16,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
