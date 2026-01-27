class GlassEffects {
  // Blur limits for performance
  static const double blurLight = 10.0;
  static const double blurHeavy = 14.0;

  // Opacities
  static const double overlayOpacityLow = 0.08;
  static const double overlayOpacityMedium = 0.12;
  static const double borderOpacity = 0.1;
  
  // No blur below Android 10 or low-end devices if needed (handled in widget logic)
}
