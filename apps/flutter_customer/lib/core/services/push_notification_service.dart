import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Handle background messages here
  // Note: You cannot access providers or app state from background handler
  debugPrint('FCM Background message: ${message.messageId}');
}

/// Push notification service for handling Firebase Cloud Messaging
class PushNotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  String? _fcmToken;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<String>? _tokenRefreshSubscription;

  String? get fcmToken => _fcmToken;

  /// Initialize the push notification service
  Future<void> init() async {
    // Request permission (required for iOS, Android 13+)
    final settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    debugPrint('FCM Permission status: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional) {
      // Get FCM token
      await _getToken();

      // Listen for token refresh
      _tokenRefreshSubscription =
          _messaging.onTokenRefresh.listen(_onTokenRefresh);

      // Handle foreground messages
      _foregroundSubscription =
          FirebaseMessaging.onMessage.listen(_onForegroundMessage);

      // Handle notification taps when app is in background/terminated
      FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpenedApp);

      // Check if app was opened from a notification
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleInitialMessage(initialMessage);
      }
    }
  }

  Future<void> _getToken() async {
    try {
      _fcmToken = await _messaging.getToken();
      debugPrint('FCM Token: $_fcmToken');

      // TODO: Send token to your backend for targeting
      // await _sendTokenToServer(_fcmToken);
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
    }
  }

  void _onTokenRefresh(String newToken) {
    _fcmToken = newToken;
    debugPrint('FCM Token refreshed: $newToken');
    // TODO: Update token on your backend
  }

  void _onForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message received: ${message.messageId}');
    debugPrint('Title: ${message.notification?.title}');
    debugPrint('Body: ${message.notification?.body}');
    debugPrint('Data: ${message.data}');

    // Handle foreground notification
    // You might want to show a local notification or in-app banner here
    _handleNotificationData(message.data);
  }

  void _onMessageOpenedApp(RemoteMessage message) {
    debugPrint('Message opened app: ${message.messageId}');
    // Navigate based on notification data
    _handleNotificationTap(message.data);
  }

  void _handleInitialMessage(RemoteMessage message) {
    debugPrint('App opened from terminated state via notification');
    _handleNotificationTap(message.data);
  }

  void _handleNotificationData(Map<String, dynamic> data) {
    // Handle notification data payload
    // Example: Update badges, sync data, etc.
    final type = data['type'];
    switch (type) {
      case 'order_update':
        // Handle order status change
        debugPrint('Order update: ${data['order_id']} -> ${data['status']}');
        break;
      case 'promo':
        // Handle new promotion
        debugPrint('New promo: ${data['promo_id']}');
        break;
      default:
        debugPrint('Unknown notification type: $type');
    }
  }

  void _handleNotificationTap(Map<String, dynamic> data) {
    // Navigate user based on notification type
    // This would typically use a router or navigation service
    final type = data['type'];
    switch (type) {
      case 'order_update':
        // Navigate to order details
        debugPrint('Navigate to order: ${data['order_id']}');
        break;
      case 'venue':
        // Navigate to venue
        debugPrint('Navigate to venue: ${data['venue_slug']}');
        break;
      default:
        debugPrint('No navigation for type: $type');
    }
  }

  /// Subscribe to a topic for targeted notifications
  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
    debugPrint('Subscribed to topic: $topic');
  }

  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
    debugPrint('Unsubscribed from topic: $topic');
  }

  /// Cleanup subscriptions
  void dispose() {
    _foregroundSubscription?.cancel();
    _tokenRefreshSubscription?.cancel();
  }
}

/// Provider for push notification service
final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  final service = PushNotificationService();
  ref.onDispose(service.dispose);
  return service;
});

/// Provider for FCM token (reactive)
final fcmTokenProvider = FutureProvider<String?>((ref) async {
  final service = ref.watch(pushNotificationServiceProvider);
  await service.init();
  return service.fcmToken;
});
