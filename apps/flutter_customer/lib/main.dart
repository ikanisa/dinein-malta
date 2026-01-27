import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app/router/app_router.dart';
import 'core/design/theme/app_theme.dart';

import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'core/data/local/local_cache_service.dart';
// Note: We need to ensure LocalCacheService is ready before app if needed, 
// or let Providers handle it. TelemetryService also needs init.

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
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY',
  );

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  // Initialize LocalCacheService (Hive) before app runs
  await LocalCacheService.ensureInitialized();
  
  // Kill Switch via Dart Define (e.g. flutter run --dart-define=TELEMETRY_ENABLED=true)
  const bool telemetryEnabled = bool.fromEnvironment('TELEMETRY_ENABLED', defaultValue: true);
  
  // Sentry DSN (Replace with real one in prod via dart-define)
  const String sentryDsn = String.fromEnvironment('SENTRY_DSN', defaultValue: 'https://examplePublicKey@o0.ingest.sentry.io/0');

  if (telemetryEnabled && sentryDsn.isNotEmpty && !sentryDsn.contains('example')) {
    await SentryFlutter.init(
      (options) {
        options.dsn = sentryDsn;
        options.tracesSampleRate = 1.0; // Adjust for prod
        options.environment = kReleaseMode ? 'production' : 'debug';
      },
      appRunner: () => runApp(
        const ProviderScope(child: DineInApp()),
      ),
    );
  } else {
    runApp(const ProviderScope(child: DineInApp()));
  }
}


class DineInApp extends ConsumerWidget {
  const DineInApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);
    
    // Initialize Telemetry
    ref.read(telemetryServiceProvider).init();
    
    // Simple theme mode logic placeholder - in real app this connects to a provider
    final isDark = true; 

    return MaterialApp.router(
      title: 'DineIn',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
