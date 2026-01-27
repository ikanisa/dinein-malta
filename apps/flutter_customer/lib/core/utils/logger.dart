import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import '../telemetry/telemetry_config.dart';

class Logger {
  static void log(String message,
      {String? scope, Object? error, StackTrace? stackTrace}) {
    // 1. Console Log (Dev)
    if (kDebugMode) {
      debugPrint('[${scope ?? 'App'}] $message');
      if (error != null) debugPrint('Error: $error');
    }

    if (!TelemetryConfig.enabled) return;

    // 2. Sentry Breadcrumb
    Sentry.addBreadcrumb(
      Breadcrumb(
        message: message,
        category: scope,
        level: error != null ? SentryLevel.error : SentryLevel.info,
      ),
    );

    // 3. Capture Exception if error exists
    if (error != null) {
      Sentry.captureException(
        error,
        stackTrace: stackTrace,
        withScope: (scope) {
          scope.setTag('logger_scope', scope.toString());
        },
      );
    }
  }

  static void info(String message, {String? scope}) =>
      log(message, scope: scope);

  static void error(String message, Object error,
          {String? scope, StackTrace? stackTrace}) =>
      log(message, scope: scope, error: error, stackTrace: stackTrace);
}
