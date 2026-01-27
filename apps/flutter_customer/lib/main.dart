import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'app/router/app_router.dart';
import 'core/design/theme/app_theme.dart';

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'core/data/local/local_cache_service.dart';
import 'core/data/local/favorites_service.dart';
import 'core/telemetry/telemetry_config.dart';
import 'core/services/push_notification_service.dart';
import 'core/services/auth_service.dart';
import 'core/services/version_service.dart';
import 'core/design/widgets/force_update_dialog.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase with real project credentials
  // These can be overridden via --dart-define for different environments
  const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://elhlcdiosomutugpneoc.supabase.co',
  );
  const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY',
  );

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  // Initialize Firebase
  await Firebase.initializeApp();

  // Set up background message handler (must be before any foreground handlers)
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  // Initialize LocalCacheService (Hive) before app runs
  await LocalCacheService.ensureInitialized();

  // Initialize FavoritesService (also Hive-backed)
  await FavoritesService.ensureInitialized();

  // Kill Switch via Dart Define (e.g. flutter run --dart-define=TELEMETRY_ENABLED=true)
  const bool telemetryEnabled =
      bool.fromEnvironment('TELEMETRY_ENABLED', defaultValue: true);
  final cachedTelemetry = LocalCacheService.instance.getTelemetryEnabled();
  TelemetryConfig.enabled = telemetryEnabled && (cachedTelemetry ?? true);

  // Sentry DSN (Replace with real one in prod via dart-define)
  const String sentryDsn = String.fromEnvironment('SENTRY_DSN',
      defaultValue: 'https://examplePublicKey@o0.ingest.sentry.io/0');

  if (TelemetryConfig.enabled &&
      sentryDsn.isNotEmpty &&
      !sentryDsn.contains('example')) {
    await SentryFlutter.init(
      (options) {
        options.dsn = sentryDsn;
        options.tracesSampleRate = 1.0; // Adjust for prod
        options.environment = kReleaseMode ? 'production' : 'debug';
        options.beforeSend =
            (event, _) => TelemetryConfig.enabled ? event : null;
        options.beforeBreadcrumb =
            (breadcrumb, _) => TelemetryConfig.enabled ? breadcrumb : null;
      },
      appRunner: () => runApp(
        const ProviderScope(child: DineInApp()),
      ),
    );
  } else {
    runApp(const ProviderScope(child: DineInApp()));
  }
}

class DineInApp extends ConsumerStatefulWidget {
  const DineInApp({super.key});

  @override
  ConsumerState<DineInApp> createState() => _DineInAppState();
}

class _DineInAppState extends ConsumerState<DineInApp> {
  @override
  void initState() {
    super.initState();
    ref.read(telemetryServiceProvider).init();
    // Initialize push notifications
    ref.read(pushNotificationServiceProvider).init();
    // Ensure anonymous auth session exists
    _initializeAuth();
    // Check app version requirements
    _checkVersion();
  }

  Future<void> _initializeAuth() async {
    try {
      await ref.read(authServiceProvider).ensureAnonymousSession();
    } catch (e) {
      // Log but don't crash - auth will be retried on next interaction
      debugPrint('Auth init failed: $e');
    }
  }

  Future<void> _checkVersion() async {
    final result = await ref.read(versionCheckProvider.future);
    final (status, config) = result;
    
    if (!mounted) return;
    
    if (status == VersionStatus.forceUpdateRequired) {
      ForceUpdateDialog.show(
        context,
        message: config?.updateMessage,
        forceUpdate: true,
      );
    } else if (status == VersionStatus.updateAvailable) {
      ForceUpdateDialog.show(
        context,
        message: config?.updateMessage,
        forceUpdate: false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'DineIn',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
