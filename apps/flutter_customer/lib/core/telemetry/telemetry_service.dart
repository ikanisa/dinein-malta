import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:uuid/uuid.dart';
import '../data/local/local_cache_service.dart';
import '../utils/logger.dart';

class TelemetryService {
  final LocalCacheService _cache;
  String? _sessionId;
  bool _enabled = true; // Default to true, controlled by kill switch

  TelemetryService(this._cache);

  Future<void> init() async {
    // 1. Session ID (Anonymous)
    var sid = _cache.getData('session_id');
    if (sid == null) {
      _sessionId = const Uuid().v4();
      await _cache.cacheData('session_id', {'id': _sessionId}, ttl: const Duration(days: 90));
    } else {
      _sessionId = sid['id'];
    }

    // 2. Set User Context (Anonymous)
    Sentry.configureScope((scope) {
      scope.setUser(SentryUser(id: _sessionId));
      scope.setTag('session_id', _sessionId ?? 'unknown');
    });
    
    Logger.info('Telemetry Initialized', scope: 'Telemetry');
  }

  void setEnabled(bool enabled) {
    _enabled = enabled;
    // Sentry SDK doesn't have a simple runtime disable, typically configured at init.
    // But we can filter events effectively here.
  }

  // --- Funnel Events ---

  void trackAppOpen() {
    _trackEvent('app_open');
  }

  void trackVenueVisit(String venueId) {
    _trackEvent('venue_visit', data: {'venue_id': venueId});
  }

  void trackAddToCart(String venueId, String itemId) {
    _trackEvent('add_to_cart', data: {'venue_id': venueId, 'item_id': itemId});
  }

  void trackCheckoutStart(String venueId) {
    _trackEvent('checkout_start', data: {'venue_id': venueId});
  }

  void trackOrderPlaced(String venueId, String orderId) {
    // PII Check: Do NOT log order contents or notes.
    _trackEvent('order_placed', data: {'venue_id': venueId, 'order_id': orderId});
  }

  void _trackEvent(String name, {Map<String, dynamic>? data}) {
    if (!_enabled) return;
    
    Logger.info('Event: $name', scope: 'Analytics');
    
    // Add breadcrumb for crash context
    Sentry.addBreadcrumb(
      Breadcrumb(
        message: name,
        category: 'analytics',
        data: data,
        level: SentryLevel.info,
      ),
    );
    
    // In a real setup, we might send this to a separate Analytics backend (PostHog/Mixpanel).
    // For now, Sentry Transaction or Breadcrumb is sufficient for minimal observability.
  }
}
