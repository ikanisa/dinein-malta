import 'package:flutter/material.dart';

class Radii {
  // Chips
  static const double pill = 999.0;
  static final BorderRadius rPill = BorderRadius.circular(pill);

  // Cards
  static const double sm8 = 8.0;
  static final BorderRadius r8 = BorderRadius.circular(sm8);

  static const double md12 = 12.0;
  static final BorderRadius r12 = BorderRadius.circular(md12);

  static const double lg16 = 16.0;
  static final BorderRadius r16 = BorderRadius.circular(lg16);

  static const double xl24 = 24.0;
  static final BorderRadius r24 = BorderRadius.circular(xl24);
  
  // Bottom Sheet Top corners
  static const double sheet32 = 32.0;
  static const BorderRadius rSheetTop = BorderRadius.vertical(
    top: Radius.circular(sheet32),
  );
}
