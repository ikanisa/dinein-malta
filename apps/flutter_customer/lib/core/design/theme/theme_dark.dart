import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../tokens/colors.dart';
import '../tokens/typography.dart';
import '../tokens/radii.dart';

ThemeData darkTheme() {
  const palette = DineInColors.candlelight;

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,

    // Scaffolding
    scaffoldBackgroundColor: palette.background0,

    // Typography
    textTheme: DineInTypography.textTheme(palette.text0, palette.text1),

    // Color Scheme
    colorScheme: ColorScheme(
      brightness: Brightness.dark,
      primary: palette.accentPrimary,
      onPrimary:
          Colors.black, // Gold text usually implies dark text on top or white
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
      systemOverlayStyle: SystemUiOverlayStyle.light,
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
