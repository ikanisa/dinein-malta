class Routes {
  // Shell Branches
  static const String home = '/';
  static const String settings = '/settings';

  // Venue Integration
  // /v/:slug
  static const String venuePrefix = '/v';
  static const String venueSlugParam = 'slug';
  static String venuePath(String slug) => '$venuePrefix/$slug';

  // Order Flow
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String order = '/order';
  static const String bell = '/bell';
  static const String ordersHistory = 'orders'; // Relative to settings
}
