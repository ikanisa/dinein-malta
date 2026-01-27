import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/supabase_client.dart';
import '../models/menu.dart';
import '../local/local_cache_service.dart';
import '../../utils/logger.dart';

// Interface
abstract class MenuRepository {
  Future<Menu?> getActiveMenu(String venueId);
  Stream<Menu?> streamActiveMenu(String venueId);
}

// Implementation
class SupabaseMenuRepository implements MenuRepository {
  final SupabaseClient _client;
  final LocalCacheService _cache;

  SupabaseMenuRepository(this._client, this._cache);

  @override
  Future<Menu?> getActiveMenu(String venueId) async {
    try {
      final data = await _fetchMenu(venueId);
      if (data == null) return null;

      await _cache.cacheMenu(venueId, data);
      return Menu.fromJson(data);
    } catch (e, stackTrace) {
      final cached = _cache.getMenu(venueId, allowStale: true);
      if (cached != null) {
        Logger.info('Using cached menu for $venueId (network error)', scope: 'MenuRepository');
        return Menu.fromJson(cached);
      }
      Logger.error('Failed to fetch menu for venue: $venueId', e, scope: 'MenuRepository', stackTrace: stackTrace);
      rethrow;
    }
  }

  @override
  Stream<Menu?> streamActiveMenu(String venueId) async* {
    // 1. Cached
    final cached = _cache.getMenu(venueId, allowStale: true);
    if (cached != null) {
      yield Menu.fromJson(cached);
    }

    // 2. Network
    try {
      final data = await _fetchMenu(venueId);
      if (data != null) {
        await _cache.cacheMenu(venueId, data);
        yield Menu.fromJson(data);
      } else if (cached == null) {
        yield null;
      }
    } catch (e, stackTrace) {
      if (cached == null) {
        Logger.error('Failed to stream menu for venue: $venueId', e, scope: 'MenuRepository', stackTrace: stackTrace);
        rethrow; // If no cache, bubble error
      }
      // Log but continue with cached data
      Logger.info('Using cached menu for $venueId (network error)', scope: 'MenuRepository');
    }
  }

  /// Fetch menu items directly from menu_items table and group by category
  Future<Map<String, dynamic>?> _fetchMenu(String venueId) async {
    // Fetch all menu items for this venue
    final response = await _client
        .from('menu_items')
        .select()
        .eq('venue_id', venueId)
        .eq('is_available', true)
        .order('category')
        .order('name');

    if (response == null || (response as List).isEmpty) {
      return null;
    }

    // Group items by category
    final Map<String, List<Map<String, dynamic>>> grouped = {};
    for (final item in response) {
      final category = (item['category'] as String?) ?? 'Other';
      grouped.putIfAbsent(category, () => []);
      grouped[category]!.add({
        'id': item['id'],
        'name': item['name'],
        'description': item['description'],
        'price': (item['price'] as num?)?.toDouble() ?? 0.0,
        'image_url': item['image_url'] ?? item['ai_image_url'],
        'tags': _parseTags(item['tags_json']),
        'is_available': item['is_available'] ?? true,
      });
    }

    // Build categories list
    final categories = grouped.entries
        .map((entry) => {
              'id': entry.key.hashCode.toString(),
              'name': entry.key,
              'sortOrder': 0,
              'items': entry.value,
            })
        .toList();

    return {
      'id': venueId,
      'venue_id': venueId,
      'categories': categories,
    };
  }

  /// Parse tags from JSON
  List<String> _parseTags(dynamic tagsJson) {
    if (tagsJson == null) return [];
    if (tagsJson is List) {
      return tagsJson.map((e) => e.toString()).toList();
    }
    return [];
  }
}

// Provider
final menuRepositoryProvider = Provider<MenuRepository>((ref) {
  return SupabaseMenuRepository(
    ref.watch(supabaseClientProvider),
    ref.watch(localCacheServiceProvider),
  );
});
