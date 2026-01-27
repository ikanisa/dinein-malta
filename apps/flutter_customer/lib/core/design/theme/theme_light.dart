import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../tokens/colors.dart';
import '../tokens/typography.dart';
import '../tokens/radii.dart';

ThemeData lightTheme() {
  const palette = DineInColors
      .brightBistro; // Or Candlelight "Light Mode" equivalent if we had one defined
  // For this exercise, let's map "Bright Bistro" to Light Mode and "Candlelight" to Dark Mode
  // OR we can make a Light variant of Candlelight.
  // The Prompt asked for "Candlelight" and "Bright Bistro" as "Moods".
  // Let's implement Bright Bistro as the "Light" default for now.

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,

    // Scaffolding
    scaffoldBackgroundColor: palette.background0,

    // Typography
    textTheme: DineInTypography.textTheme(palette.text0, palette.text1),

    // Color Scheme
    colorScheme: ColorScheme(
      brightness: Brightness.light,
      primary: palette.accentPrimary,
      onPrimary: Colors.white,
      secondary: palette.accentSecondary,
      onSecondary: Colors.white,
      error: palette.error,
      onError: Colors.white,
      surface: palette.surface0,
      onSurface: palette.text0,
    ),

    // AppBar
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      titleTextStyle:
          DineInTypography.textTheme(palette.text0, palette.text1).displaySmall,
      iconTheme: IconThemeData(color: palette.text0),
    ),

    // Card
    cardTheme: CardThemeData(
      color: palette.surface0,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: Radii.r12),
      margin: EdgeInsets.zero,
    ),

    // Divider
    dividerTheme: DividerThemeData(
      color: palette.divider,
      thickness: 1,
      space: 1,
    ),
  );
}
