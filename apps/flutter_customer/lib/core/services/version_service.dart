import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Version configuration from server
class VersionConfig {
  final String minVersion;
  final bool forceUpdate;
  final String? updateMessage;

  VersionConfig({
    required this.minVersion,
    required this.forceUpdate,
    this.updateMessage,
  });

  factory VersionConfig.fromJson(Map<String, dynamic> json) {
    return VersionConfig(
      minVersion: json['min_version'] as String? ?? '1.0.0',
      forceUpdate: json['force_update'] as bool? ?? false,
      updateMessage: json['update_message'] as String?,
    );
  }
}

/// Result of version check
enum VersionStatus {
  upToDate,
  updateAvailable,
  forceUpdateRequired,
  error,
}

/// Service for checking app version against server requirements
class VersionService {
  final SupabaseClient _supabase;

  VersionService(this._supabase);

  /// Check if current app version meets minimum requirements
  Future<(VersionStatus, VersionConfig?)> checkVersion() async {
    try {
      // Get current app version
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      // Fetch server config
      final response = await _supabase
          .from('app_config')
          .select('value')
          .eq('key', 'version')
          .maybeSingle();

      if (response == null) {
        return (VersionStatus.upToDate, null);
      }

      final config = VersionConfig.fromJson(
        response['value'] as Map<String, dynamic>,
      );

      // Compare versions
      if (_isVersionLower(currentVersion, config.minVersion)) {
        if (config.forceUpdate) {
          return (VersionStatus.forceUpdateRequired, config);
        }
        return (VersionStatus.updateAvailable, config);
      }

      return (VersionStatus.upToDate, config);
    } catch (e) {
      debugPrint('Version check failed: $e');
      return (VersionStatus.error, null);
    }
  }

  /// Compare semver versions: returns true if current < minimum
  bool _isVersionLower(String current, String minimum) {
    final currentParts = current.split('.').map((s) => int.tryParse(s) ?? 0).toList();
    final minimumParts = minimum.split('.').map((s) => int.tryParse(s) ?? 0).toList();

    // Pad to 3 parts
    while (currentParts.length < 3) currentParts.add(0);
    while (minimumParts.length < 3) minimumParts.add(0);

    for (var i = 0; i < 3; i++) {
      if (currentParts[i] < minimumParts[i]) return true;
      if (currentParts[i] > minimumParts[i]) return false;
    }
    return false; // Equal
  }
}

/// Provider for version service
final versionServiceProvider = Provider<VersionService>((ref) {
  return VersionService(Supabase.instance.client);
});

/// Provider for version check result
final versionCheckProvider = FutureProvider<(VersionStatus, VersionConfig?)>((ref) {
  final service = ref.watch(versionServiceProvider);
  return service.checkVersion();
});
