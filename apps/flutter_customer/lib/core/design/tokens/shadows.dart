import 'package:flutter/material.dart';

class DineInShadows {
  static const BoxShadow softSm = BoxShadow(
    color: Color(0x1F000000),
    blurRadius: 4,
    offset: Offset(0, 2),
  );
  
  static const BoxShadow softMd = BoxShadow(
    color: Color(0x1F000000),
    blurRadius: 8,
    offset: Offset(0, 4),
  );
  
  static const BoxShadow glass = BoxShadow(
    color: Color(0x0A000000),
    blurRadius: 16,
    offset: Offset(0, 8),
  );
}
