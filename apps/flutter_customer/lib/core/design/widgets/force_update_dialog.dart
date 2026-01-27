import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io' show Platform;
import '../tokens/clay_design.dart';

/// Dialog shown when app requires a force update
class ForceUpdateDialog extends StatelessWidget {
  final String? message;
  final bool isDismissible;

  const ForceUpdateDialog({
    super.key,
    this.message,
    this.isDismissible = false,
  });

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: isDismissible,
      child: AlertDialog(
        backgroundColor: ClayColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(
              Icons.system_update_rounded,
              color: ClayColors.primary,
              size: 28,
            ),
            const SizedBox(width: 12),
            Text(
              'Update Required',
              style: ClayTypography.h3.copyWith(
                color: ClayColors.textPrimary,
              ),
            ),
          ],
        ),
        content: Text(
          message ??
              'A new version is available. Please update to continue using the app.',
          style: ClayTypography.body.copyWith(
            color: ClayColors.textSecondary,
          ),
        ),
        actions: [
          if (isDismissible)
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Later',
                style: TextStyle(color: ClayColors.textMuted),
              ),
            ),
          FilledButton(
            onPressed: _openStore,
            style: FilledButton.styleFrom(
              backgroundColor: ClayColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Update Now'),
          ),
        ],
      ),
    );
  }

  void _openStore() {
    final String storeUrl;
    
    // Detect platform and open appropriate store
    try {
      if (Platform.isIOS) {
        storeUrl = 'https://apps.apple.com/app/dinein'; // Replace with actual ID
      } else if (Platform.isAndroid) {
        storeUrl = 'https://play.google.com/store/apps/details?id=com.dinein.customer'; // Replace with actual ID
      } else {
        // Web - no store
        return;
      }
      
      launchUrl(Uri.parse(storeUrl), mode: LaunchMode.externalApplication);
    } catch (_) {
      // Platform detection not available (web)
    }
  }

  /// Show the force update dialog
  static Future<void> show(
    BuildContext context, {
    String? message,
    bool forceUpdate = true,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: !forceUpdate,
      builder: (context) => ForceUpdateDialog(
        message: message,
        isDismissible: !forceUpdate,
      ),
    );
  }
}
