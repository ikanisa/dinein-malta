import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DineInTypography {
  // Using 'Outfit' for headings and 'Inter' for body for that premium feel
  // Fallback to standard if offline or package issue

  static TextTheme textTheme(Color text0, Color text1) {
    return TextTheme(
      // Headings (Outfit)
      displayLarge: GoogleFonts.outfit(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        color: text0,
        letterSpacing: -0.5,
      ),
      displayMedium: GoogleFonts.outfit(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: text0,
        letterSpacing: -0.5,
      ),
      displaySmall: GoogleFonts.outfit(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: text0,
      ),

      // Body (Inter)
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: text0,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: text0,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: text1,
      ),

      // Labels (Buttons/Chips)
      labelLarge: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: text0,
        letterSpacing: 0.2,
      ),
    );
  }
}
