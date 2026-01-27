import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../data/supabase/supabase_client.dart';
import '../design/tokens/clay_design.dart';

/// App version information
class AppVersion {
  final String version;
  final int buildNumber;

  AppVersion({required this.version, required this.buildNumber});

  @override
  String toString() => '$version ($buildNumber)';
}

/// Service for checking app version and force updates
class AppVersionService {
  final SupabaseClient _client;

  AppVersionService(this._client);

  /// Get current app version
  Future<AppVersion> getCurrentVersion() async {
    final info = await PackageInfo.fromPlatform();
    return AppVersion(
      version: info.version,
      buildNumber: int.tryParse(info.buildNumber) ?? 0,
    );
  }

  /// Check if an update is required
  /// Returns minimum required version from remote config, or null if no check needed
  Future<AppVersion?> checkMinimumVersion() async {
    try {
      final response = await _client
          .from('app_config')
          .select('value')
          .eq('key', 'minimum_app_version')
          .maybeSingle();

      if (response == null) return null;

      final value = response['value'];
      if (value is! Map) return null;

      final version = value['version'] as String?;
      final buildNumber = value['build_number'] as int?;

      if (version == null || buildNumber == null) return null;

      return AppVersion(version: version, buildNumber: buildNumber);
    } catch (e) {
      // If we can't check, don't block the user
      return null;
    }
  }

  /// Check if current version meets minimum requirements
  Future<bool> isUpdateRequired() async {
    final current = await getCurrentVersion();
    final minimum = await checkMinimumVersion();

    if (minimum == null) return false;

    // Compare build numbers (simpler than semantic versioning)
    return current.buildNumber < minimum.buildNumber;
  }
}

/// Provider for app version service
final appVersionServiceProvider = Provider<AppVersionService>((ref) {
  return AppVersionService(ref.watch(supabaseClientProvider));
});

/// Provider for current app version
final currentVersionProvider = FutureProvider<AppVersion>((ref) {
  final service = ref.watch(appVersionServiceProvider);
  return service.getCurrentVersion();
});

/// Provider to check if update is required
final updateRequiredProvider = FutureProvider<bool>((ref) {
  final service = ref.watch(appVersionServiceProvider);
  return service.isUpdateRequired();
});

/// Force update dialog widget
class ForceUpdateDialog extends StatelessWidget {
  final AppVersion? minimumVersion;

  const ForceUpdateDialog({super.key, this.minimumVersion});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // Prevent back button from closing
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ClayRadius.lg),
        ),
        child: Padding(
          padding: const EdgeInsets.all(ClaySpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(ClaySpacing.md),
                decoration: BoxDecoration(
                  color: ClayColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(ClayRadius.pill),
                ),
                child: const Icon(
                  Icons.system_update_rounded,
                  size: 48,
                  color: ClayColors.primary,
                ),
              ),
              const SizedBox(height: ClaySpacing.lg),
              Text(
                'Update Required',
                style: ClayTypography.h2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: ClaySpacing.md),
              Text(
                'A new version of DineIn is available. Please update to continue using the app.',
                style: ClayTypography.body,
                textAlign: TextAlign.center,
              ),
              if (minimumVersion != null) ...[
                const SizedBox(height: ClaySpacing.sm),
                Text(
                  'Minimum version: ${minimumVersion!.version}',
                  style: ClayTypography.caption,
                ),
              ],
              const SizedBox(height: ClaySpacing.xl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: Open app store link
                    // For iOS: LaunchReview.launch(iOSAppId: 'YOUR_APP_ID');
                    // For Android: LaunchReview.launch();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ClayColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: ClaySpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(ClayRadius.md),
                    ),
                  ),
                  child: const Text('Update Now'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Show force update dialog
  static void show(BuildContext context, {AppVersion? minimumVersion}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => ForceUpdateDialog(minimumVersion: minimumVersion),
    );
  }
}
