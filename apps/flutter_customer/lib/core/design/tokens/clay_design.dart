import 'package:flutter/material.dart';

/// Claymorphism Design System
/// Friendly, relaxed style with soft 3D shapes and smooth surfaces

class ClayColors {
  ClayColors._();

  // === BACKGROUNDS ===
  /// Warm cream background
  static const Color background = Color(0xFFFFF8F0);
  
  /// Soft beige alternative background
  static const Color backgroundAlt = Color(0xFFFAF5F0);
  
  /// Pure white for cards
  static const Color surface = Color(0xFFFFFFFF);

  // === PRIMARY PALETTE ===
  /// Soft coral/peach - primary action color
  static const Color primary = Color(0xFFFF8A65);
  static const Color primaryLight = Color(0xFFFFBB93);
  static const Color primaryDark = Color(0xFFE5735A);

  // === SECONDARY PALETTE ===
  /// Mint green - success, positive actions
  static const Color secondary = Color(0xFF81C784);
  static const Color secondaryLight = Color(0xFFB2F5B5);
  static const Color secondaryDark = Color(0xFF66BB6A);

  // === ACCENT PALETTE ===
  /// Soft lavender - highlights, badges
  static const Color accent = Color(0xFFB39DDB);
  static const Color accentLight = Color(0xFFE6CEFF);
  static const Color accentDark = Color(0xFF9575CD);

  // === TEXT COLORS ===
  /// Warm dark brown for primary text
  static const Color textPrimary = Color(0xFF3E2723);
  
  /// Warm gray for secondary text
  static const Color textSecondary = Color(0xFF8D6E63);
  
  /// Muted text
  static const Color textMuted = Color(0xFFBCAAA4);

  // === UTILITY COLORS ===
  static const Color error = Color(0xFFE57373);
  static const Color warning = Color(0xFFFFB74D);
  static const Color success = Color(0xFF81C784);
  static const Color info = Color(0xFF64B5F6);

  // === SHADOWS ===
  /// Soft shadow color
  static const Color shadowColor = Color(0x18000000);
  
  /// Light inner shadow color
  static const Color innerShadow = Color(0xFFFFFFFF);
}

/// Claymorphism shadow styles
class ClayShadows {
  ClayShadows._();

  /// Standard card shadow - soft 3D effect
  static List<BoxShadow> card = [
    // Top-left inner highlight
    BoxShadow(
      color: Colors.white.withValues(alpha: 0.8),
      offset: const Offset(-2, -2),
      blurRadius: 4,
    ),
    // Bottom-right outer shadow
    const BoxShadow(
      color: Color(0x18000000),
      offset: Offset(4, 4),
      blurRadius: 12,
      spreadRadius: 1,
    ),
  ];

  /// Elevated button shadow
  static List<BoxShadow> button = [
    BoxShadow(
      color: Colors.white.withValues(alpha: 0.6),
      offset: const Offset(-2, -2),
      blurRadius: 4,
    ),
    const BoxShadow(
      color: Color(0x20000000),
      offset: Offset(3, 3),
      blurRadius: 8,
    ),
  ];

  /// Pressed button shadow (flatter)
  static List<BoxShadow> buttonPressed = [
    const BoxShadow(
      color: Color(0x10000000),
      offset: Offset(1, 1),
      blurRadius: 2,
    ),
  ];

  /// Subtle shadow for smaller elements
  static List<BoxShadow> subtle = [
    const BoxShadow(
      color: Color(0x10000000),
      offset: Offset(2, 2),
      blurRadius: 6,
    ),
  ];
}

/// Spacing and sizing constants
class ClaySpacing {
  ClaySpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

/// Border radius constants
class ClayRadius {
  ClayRadius._();

  static const double sm = 12;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 28;
  static const double pill = 999;
}

/// Claymorphism typography
class ClayTypography {
  ClayTypography._();

  static const TextStyle h1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    color: ClayColors.textPrimary,
    letterSpacing: -0.5,
  );

  static const TextStyle h2 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: ClayColors.textPrimary,
    letterSpacing: -0.3,
  );

  static const TextStyle h3 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: ClayColors.textPrimary,
  );

  static const TextStyle body = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: ClayColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: ClayColors.textPrimary,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: ClayColors.textSecondary,
  );

  static const TextStyle small = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: ClayColors.textMuted,
  );

  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.3,
  );

  static const TextStyle price = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: ClayColors.primary,
  );
}
