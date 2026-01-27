import 'package:flutter/material.dart';

abstract class DineInColors {
  // Candlelight Theme (Warm, Premium, Cozy)
  static const candlelight = _DineInPalette(
    background0: Color(0xFF1A1614), // Very dark warm grey
    background1: Color(0xFF241F1C), // Slightly lighter warm grey
    surface0: Color(0xFF2D2825), // Card surface
    surface1: Color(0xFF38322E), // Elevated surface
    surfaceGlass: Color(0x1F38322E), // Low opacity for glass

    text0: Color(0xFFF7F2EB), // off-white cream
    text1: Color(0xFFD6CEC6), // muted cream
    muted: Color(0xFF8F8882),

    accentPrimary: Color(0xFFE6B062), // Gold
    accentSecondary: Color(0xFFC48B4A), // Bronze

    divider: Color(0x1FFFFFFF),
    border: Color(0x33FFFFFF),

    success: Color(0xFF8BC34A),
    warning: Color(0xFFFFB74D),
    error: Color(0xFFE57373),
  );

  // Bright Bistro Theme (Clean, Sharp, Modern - Uber Eats inspired)
  static const brightBistro = _DineInPalette(
    background0: Color(0xFFFFFFFF), // Pure white
    background1: Color(0xFFF6F6F6), // Light gray
    surface0: Color(0xFFFFFFFF), // White cards
    surface1: Color(0xFFF0F0F0), // Slightly elevated
    surfaceGlass: Color(0xE6FFFFFF), // Glass effect

    text0: Color(0xFF1F1F1F), // Near black (Uber Eats style)
    text1: Color(0xFF545454), // Medium gray
    muted: Color(0xFF8A8A8A), // Muted gray

    accentPrimary: Color(0xFF06C167), // Uber Eats green
    accentSecondary: Color(0xFFE8A037), // Warm gold (for DineIn branding)

    divider: Color(0xFFEEEEEE),
    border: Color(0xFFE0E0E0),

    success: Color(0xFF06C167), // Same as primary
    warning: Color(0xFFFFA000),
    error: Color(0xFFE53935),
  );
}

class _DineInPalette {
  final Color background0;
  final Color background1;
  final Color surface0;
  final Color surface1;
  final Color surfaceGlass;

  final Color text0;
  final Color text1;
  final Color muted;

  final Color accentPrimary;
  final Color accentSecondary;

  final Color divider;
  final Color border;

  final Color success;
  final Color warning;
  final Color error;

  const _DineInPalette({
    required this.background0,
    required this.background1,
    required this.surface0,
    required this.surface1,
    required this.surfaceGlass,
    required this.text0,
    required this.text1,
    required this.muted,
    required this.accentPrimary,
    required this.accentSecondary,
    required this.divider,
    required this.border,
    required this.success,
    required this.warning,
    required this.error,
  });
}
