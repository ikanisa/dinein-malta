import 'dart:async';
import 'dart:math';
import 'package:sentry_flutter/sentry_flutter.dart';

/// Retry utility with exponential backoff
/// Used for API calls that may fail due to temporary network issues
class RetryHelper {
  /// Execute a function with retry logic
  /// 
  /// [operation] - The async operation to execute
  /// [maxAttempts] - Maximum number of attempts (default: 3)
  /// [initialDelay] - Initial delay between retries (default: 1 second)
  /// [maxDelay] - Maximum delay between retries (default: 10 seconds)
  /// [retryIf] - Optional function to determine if an exception should trigger a retry
  /// [onRetry] - Optional callback when a retry occurs
  static Future<T> retry<T>({
    required Future<T> Function() operation,
    int maxAttempts = 3,
    Duration initialDelay = const Duration(seconds: 1),
    Duration maxDelay = const Duration(seconds: 10),
    bool Function(Exception)? retryIf,
    void Function(Exception, int)? onRetry,
  }) async {
    int attempt = 0;
    Duration delay = initialDelay;

    while (true) {
      attempt++;
      try {
        return await operation();
      } on Exception catch (e, stackTrace) {
        // Check if we should retry this exception
        final shouldRetry = retryIf?.call(e) ?? _isRetryableException(e);

        if (!shouldRetry || attempt >= maxAttempts) {
          // Log final failure to Sentry
          Sentry.captureException(
            e,
            stackTrace: stackTrace,
            withScope: (scope) {
              scope.setTag('retry_attempts', attempt.toString());
              scope.setTag('max_attempts', maxAttempts.toString());
            },
          );
          rethrow;
        }

        // Call retry callback
        onRetry?.call(e, attempt);

        // Wait with exponential backoff + jitter
        final jitter = Random().nextDouble() * 0.5 + 0.75; // 0.75 to 1.25
        await Future.delayed(delay * jitter);

        // Increase delay for next attempt (exponential backoff)
        delay = Duration(milliseconds: min(
          delay.inMilliseconds * 2,
          maxDelay.inMilliseconds,
        ));
      }
    }
  }

  /// Check if an exception is typically retryable
  static bool _isRetryableException(Exception e) {
    final message = e.toString().toLowerCase();
    
    // Network-related errors
    if (message.contains('socket') ||
        message.contains('timeout') ||
        message.contains('connection') ||
        message.contains('network') ||
        message.contains('failed host lookup')) {
      return true;
    }

    // HTTP 5xx errors (server errors)
    if (message.contains('500') ||
        message.contains('502') ||
        message.contains('503') ||
        message.contains('504')) {
      return true;
    }

    return false;
  }
}

/// Extension on Future to add retry capability
extension FutureRetryExtension<T> on Future<T> Function() {
  /// Execute this function with retry logic
  Future<T> withRetry({
    int maxAttempts = 3,
    Duration initialDelay = const Duration(seconds: 1),
    bool Function(Exception)? retryIf,
    void Function(Exception, int)? onRetry,
  }) {
    return RetryHelper.retry(
      operation: this,
      maxAttempts: maxAttempts,
      initialDelay: initialDelay,
      retryIf: retryIf,
      onRetry: onRetry,
    );
  }
}

/// Custom exception types for better error handling
class NetworkException implements Exception {
  final String message;
  const NetworkException(this.message);

  @override
  String toString() => 'NetworkException: $message';
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  const ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';

  bool get isRetryable => statusCode >= 500 && statusCode < 600;
}

class AuthException implements Exception {
  final String message;
  const AuthException(this.message);

  @override
  String toString() => 'AuthException: $message';
}

class ValidationException implements Exception {
  final String message;
  final Map<String, String>? fieldErrors;
  const ValidationException(this.message, {this.fieldErrors});

  @override
  String toString() => 'ValidationException: $message';
}
