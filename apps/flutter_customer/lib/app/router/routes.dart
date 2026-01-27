class Routes {
  // Shell Branches
  static const String home = '/';
  static const String settings = '/settings';
  static const String splash = '/splash';

  // Venue Integration
  // /v/:slug
  static const String venuePrefix = '/v';
  static const String venueSlugParam = 'slug';
  static String venuePath(String slug) => '$venuePrefix/$slug';
  static const String venueInfo = 'info'; // Relative to venue

  // Order Flow
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String order = '/order';
  static const String bell = '/bell';
  
  // Settings sub-routes
  static const String ordersHistory = 'orders'; // Relative to settings
  static const String help = 'help'; // Relative to settings
  static const String favorites = 'favorites'; // Relative to settings
  static const String privacy = 'privacy'; // Relative to settings
}
