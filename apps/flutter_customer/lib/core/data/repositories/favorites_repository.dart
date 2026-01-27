import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/supabase_client.dart';

/// Favorite type enum for type safety
enum FavoriteType {
  venue,
  item;

  String get value => name;

  static FavoriteType fromString(String s) {
    return FavoriteType.values.firstWhere(
      (e) => e.value == s,
      orElse: () => FavoriteType.venue,
    );
  }
}

/// Model for a user favorite
class UserFavorite {
  final String id;
  final String userId;
  final FavoriteType type;
  final String targetId;
  final DateTime createdAt;

  UserFavorite({
    required this.id,
    required this.userId,
    required this.type,
    required this.targetId,
    required this.createdAt,
  });

  factory UserFavorite.fromJson(Map<String, dynamic> json) {
    return UserFavorite(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: FavoriteType.fromString(json['favorite_type'] as String),
      targetId: json['target_id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

/// Repository for managing user favorites on the server
class FavoritesRepository {
  final SupabaseClient _client;

  FavoritesRepository(this._client);

  /// Get all favorites for a user, optionally filtered by type
  Future<List<UserFavorite>> getFavorites({
    required String userId,
    FavoriteType? type,
  }) async {
    var query = _client
        .from('user_favorites')
        .select()
        .eq('user_id', userId);

    if (type != null) {
      query = query.eq('favorite_type', type.value);
    }

    final response = await query.order('created_at', ascending: false);
    return (response as List)
        .map((e) => UserFavorite.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Get favorite venue IDs for a user
  Future<List<String>> getFavoriteVenueIds(String userId) async {
    final favorites = await getFavorites(userId: userId, type: FavoriteType.venue);
    return favorites.map((f) => f.targetId).toList();
  }

  /// Get favorite item IDs for a user
  Future<List<String>> getFavoriteItemIds(String userId) async {
    final favorites = await getFavorites(userId: userId, type: FavoriteType.item);
    return favorites.map((f) => f.targetId).toList();
  }

  /// Add a favorite
  Future<void> addFavorite({
    required String userId,
    required FavoriteType type,
    required String targetId,
  }) async {
    await _client.from('user_favorites').upsert({
      'user_id': userId,
      'favorite_type': type.value,
      'target_id': targetId,
    }, onConflict: 'user_id,favorite_type,target_id');
  }

  /// Remove a favorite
  Future<void> removeFavorite({
    required String userId,
    required FavoriteType type,
    required String targetId,
  }) async {
    await _client
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('favorite_type', type.value)
        .eq('target_id', targetId);
  }

  /// Check if an item is favorited
  Future<bool> isFavorited({
    required String userId,
    required FavoriteType type,
    required String targetId,
  }) async {
    final response = await _client
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('favorite_type', type.value)
        .eq('target_id', targetId)
        .maybeSingle();
    return response != null;
  }

  /// Sync local favorites to server (upload)
  Future<void> syncToServer({
    required String userId,
    required List<String> venueIds,
    required List<String> itemIds,
  }) async {
    // Upload venue favorites
    for (final venueId in venueIds) {
      await addFavorite(
        userId: userId,
        type: FavoriteType.venue,
        targetId: venueId,
      );
    }

    // Upload item favorites
    for (final itemId in itemIds) {
      await addFavorite(
        userId: userId,
        type: FavoriteType.item,
        targetId: itemId,
      );
    }
  }
}

// Provider
final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  return FavoritesRepository(ref.watch(supabaseClientProvider));
});

// Server favorites provider
final serverFavoriteVenueIdsProvider =
    FutureProvider.family<List<String>, String>((ref, userId) async {
  final repo = ref.watch(favoritesRepositoryProvider);
  return repo.getFavoriteVenueIds(userId);
});

final serverFavoriteItemIdsProvider =
    FutureProvider.family<List<String>, String>((ref, userId) async {
  final repo = ref.watch(favoritesRepositoryProvider);
  return repo.getFavoriteItemIds(userId);
});
