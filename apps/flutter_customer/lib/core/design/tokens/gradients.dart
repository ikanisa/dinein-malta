import 'package:flutter/material.dart';

class DineInGradients {
  // Candlelight Gradients
  static const candlelightScaffold = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFF241F1C),
      Color(0xFF1A1614),
    ],
  );

  static const candlelightGlass = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0x3338322E),
      Color(0x1438322E),
    ],
  );

  // Bright Bistro Gradients
  static const brightBistroScaffold = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFFFFFFFF),
      Color(0xFFF8F5F2),
    ],
  );

  static const brightBistroGlass = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xB3FFFFFF),
      Color(0x66FFFFFF),
    ],
  );
}
