import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_customer/core/services/version_service.dart';

void main() {
  group('VersionConfig', () {
    test('parses JSON with all fields', () {
      final json = {
        'min_version': '2.0.0',
        'force_update': true,
        'update_message': 'Please update to continue',
      };

      final config = VersionConfig.fromJson(json);

      expect(config.minVersion, '2.0.0');
      expect(config.forceUpdate, true);
      expect(config.updateMessage, 'Please update to continue');
    });

    test('uses defaults for missing fields', () {
      final json = <String, dynamic>{};

      final config = VersionConfig.fromJson(json);

      expect(config.minVersion, '1.0.0');
      expect(config.forceUpdate, false);
      expect(config.updateMessage, null);
    });

    test('handles null values gracefully', () {
      final json = {
        'min_version': null,
        'force_update': null,
        'update_message': null,
      };

      final config = VersionConfig.fromJson(json);

      expect(config.minVersion, '1.0.0');
      expect(config.forceUpdate, false);
      expect(config.updateMessage, null);
    });
  });

  group('VersionStatus', () {
    test('has correct enum values', () {
      expect(VersionStatus.values, contains(VersionStatus.upToDate));
      expect(VersionStatus.values, contains(VersionStatus.updateAvailable));
      expect(VersionStatus.values, contains(VersionStatus.forceUpdateRequired));
      expect(VersionStatus.values, contains(VersionStatus.error));
    });
  });

  group('Version Comparison Logic', () {
    // Test helper that mimics _isVersionLower logic
    bool isVersionLower(String current, String minimum) {
      final currentParts =
          current.split('.').map((s) => int.tryParse(s) ?? 0).toList();
      final minimumParts =
          minimum.split('.').map((s) => int.tryParse(s) ?? 0).toList();

      while (currentParts.length < 3) {
        currentParts.add(0);
      }
      while (minimumParts.length < 3) {
        minimumParts.add(0);
      }

      for (var i = 0; i < 3; i++) {
        if (currentParts[i] < minimumParts[i]) return true;
        if (currentParts[i] > minimumParts[i]) return false;
      }
      return false; // Equal
    }

    test('returns false when versions are equal', () {
      expect(isVersionLower('1.0.0', '1.0.0'), false);
      expect(isVersionLower('2.5.3', '2.5.3'), false);
    });

    test('returns true when current is lower major version', () {
      expect(isVersionLower('1.0.0', '2.0.0'), true);
      expect(isVersionLower('1.9.9', '2.0.0'), true);
    });

    test('returns true when current is lower minor version', () {
      expect(isVersionLower('1.0.0', '1.1.0'), true);
      expect(isVersionLower('2.3.9', '2.4.0'), true);
    });

    test('returns true when current is lower patch version', () {
      expect(isVersionLower('1.0.0', '1.0.1'), true);
      expect(isVersionLower('2.5.3', '2.5.4'), true);
    });

    test('returns false when current is higher', () {
      expect(isVersionLower('2.0.0', '1.0.0'), false);
      expect(isVersionLower('1.5.0', '1.4.0'), false);
      expect(isVersionLower('1.0.5', '1.0.4'), false);
    });

    test('handles versions with missing parts', () {
      expect(isVersionLower('1', '1.0.0'), false);
      expect(isVersionLower('1.0', '1.0.0'), false);
      expect(isVersionLower('1', '1.1'), true);
      expect(isVersionLower('1.0', '1.0.1'), true);
    });

    test('handles non-numeric version parts', () {
      // Non-numeric parts become 0
      expect(isVersionLower('1.0.beta', '1.0.1'), true);
      expect(isVersionLower('1.alpha.0', '1.1.0'), true);
    });
  });
}
