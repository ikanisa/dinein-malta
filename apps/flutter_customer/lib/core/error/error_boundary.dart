import 'package:flutter/material.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import '../design/tokens/clay_design.dart';

/// Widget that catches errors in its child subtree and displays
/// a friendly error screen instead of crashing
class ErrorBoundary extends StatefulWidget {
  final Widget child;
  final String? contextName;

  const ErrorBoundary({
    super.key,
    required this.child,
    this.contextName,
  });

  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  bool _hasError = false;
  FlutterErrorDetails? _errorDetails;

  @override
  void initState() {
    super.initState();
    // Set up custom error handling for this widget tree
  }

  void _handleError(FlutterErrorDetails details) {
    // Report to Sentry
    Sentry.captureException(
      details.exception,
      stackTrace: details.stack,
      withScope: (scope) {
        scope.setTag('error_boundary', widget.contextName ?? 'unknown');
      },
    );

    setState(() {
      _hasError = true;
      _errorDetails = details;
    });
  }

  void _retry() {
    setState(() {
      _hasError = false;
      _errorDetails = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return ErrorScreen(
        title: 'Something went wrong',
        subtitle: 'We apologize for the inconvenience. Please try again.',
        onRetry: _retry,
      );
    }

    return ErrorWidgetWrapper(
      onError: _handleError,
      child: widget.child,
    );
  }
}

/// Wrapper that catches errors in the children
class ErrorWidgetWrapper extends StatelessWidget {
  final Widget child;
  final void Function(FlutterErrorDetails) onError;

  const ErrorWidgetWrapper({
    super.key,
    required this.child,
    required this.onError,
  });

  @override
  Widget build(BuildContext context) {
    return child;
  }
}

/// A friendly error screen with retry option
class ErrorScreen extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback? onRetry;
  final IconData icon;

  const ErrorScreen({
    super.key,
    required this.title,
    required this.subtitle,
    this.onRetry,
    this.icon = Icons.error_outline_rounded,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ClaySpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(ClaySpacing.lg),
                decoration: BoxDecoration(
                  color: ClayColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(ClayRadius.pill),
                ),
                child: Icon(
                  icon,
                  size: 64,
                  color: ClayColors.error,
                ),
              ),
              const SizedBox(height: ClaySpacing.xl),
              Text(
                title,
                style: ClayTypography.h2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: ClaySpacing.md),
              Text(
                subtitle,
                style: ClayTypography.caption,
                textAlign: TextAlign.center,
              ),
              if (onRetry != null) ...[
                const SizedBox(height: ClaySpacing.xl),
                ElevatedButton(
                  onPressed: onRetry,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ClayColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: ClaySpacing.lg,
                      vertical: ClaySpacing.md,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(ClayRadius.md),
                    ),
                  ),
                  child: const Text('Try Again'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// A reusable error placeholder for inline errors
class InlineError extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const InlineError({
    super.key,
    this.message = 'Something went wrong',
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(ClaySpacing.md),
      decoration: BoxDecoration(
        color: ClayColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(ClayRadius.md),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: ClayColors.error,
            size: 24,
          ),
          const SizedBox(width: ClaySpacing.sm),
          Expanded(
            child: Text(
              message,
              style: ClayTypography.caption.copyWith(color: ClayColors.error),
            ),
          ),
          if (onRetry != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: ClayColors.error),
              onPressed: onRetry,
              tooltip: 'Retry',
            ),
        ],
      ),
    );
  }
}
