import 'package:flutter/services.dart';

class Haptics {
  // Prevent instantiation
  Haptics._();

  /// Light impact for standard interactions (e.g., tap)
  static Future<void> lightImpact() async {
    await HapticFeedback.lightImpact();
  }

  /// Medium impact for more significant actions (e.g., add to cart)
  static Future<void> mediumImpact() async {
    await HapticFeedback.mediumImpact();
  }

  /// Heavy impact for destructive actions or important confirmations
  static Future<void> heavyImpact() async {
    await HapticFeedback.heavyImpact();
  }

  /// Success feedback (e.g., order placed)
  static Future<void> success() async {
    // Vibrate/Selection Click is often good for "Success" if platform doesn't support specific patterns
    // But verify on device. For now, we use standard vibration or selection.
    await HapticFeedback.selectionClick();
  }

  /// Error feedback
  static Future<void> error() async {
    await HapticFeedback.vibrate();
  }
}
