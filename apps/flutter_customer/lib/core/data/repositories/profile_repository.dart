import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/supabase_client.dart';
import '../../utils/logger.dart';

/// User profile model
class UserProfile {
  final String userId;
  final String? displayName;
  final String? phone;
  final DateTime? updatedAt;

  UserProfile({
    required this.userId,
    this.displayName,
    this.phone,
    this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['id'] as String,
      displayName: json['display_name'] as String?,
      phone: json['phone'] as String?,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  factory UserProfile.empty(String userId) {
    return UserProfile(userId: userId);
  }

  bool get isEmpty => displayName == null && phone == null;
}

/// Repository for managing user profiles on the server
class ProfileRepository {
  final SupabaseClient _client;

  ProfileRepository(this._client);

  /// Get profile for a user
  Future<UserProfile?> getProfile(String userId) async {
    try {
      final response = await _client
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      if (response == null) return null;
      return UserProfile.fromJson(response);
    } catch (e, stackTrace) {
      // Profile might not exist yet - log and return null
      Logger.info('Profile not found for user: $userId', scope: 'ProfileRepository');
      Logger.error('Failed to fetch profile', e, scope: 'ProfileRepository', stackTrace: stackTrace);
      return null;
    }
  }

  /// Update or create profile
  Future<UserProfile> upsertProfile({
    required String userId,
    String? displayName,
    String? phone,
  }) async {
    final response = await _client.from('profiles').upsert({
      'id': userId,
      'display_name': displayName,
      'phone': phone,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    }).select().single();

    return UserProfile.fromJson(response);
  }

  /// Update just display name
  Future<void> updateDisplayName(String userId, String? name) async {
    await _client.from('profiles').upsert({
      'id': userId,
      'display_name': name,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    });
  }

  /// Update just phone
  Future<void> updatePhone(String userId, String? phone) async {
    await _client.from('profiles').upsert({
      'id': userId,
      'phone': phone,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    });
  }
}

// Provider
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.watch(supabaseClientProvider));
});

// Profile provider - fetches profile for given user ID
final userProfileProvider =
    FutureProvider.family<UserProfile?, String>((ref, userId) async {
  final repo = ref.watch(profileRepositoryProvider);
  return repo.getProfile(userId);
});
