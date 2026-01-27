import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Service for managing favorite venues and items locally using Hive
class FavoritesService {
  static const String _boxName = 'dinein_favorites';
  static const String _venuesKey = 'favorite_venues';
  static const String _itemsKey = 'favorite_items';

  late Box<String> _box;

  // Singleton instance
  static FavoritesService? _instance;
  static FavoritesService get instance {
    if (_instance == null) {
      throw StateError(
          'FavoritesService not initialized. Call FavoritesService.ensureInitialized() first.');
    }
    return _instance!;
  }

  FavoritesService._();

  /// Initialize the service
  static Future<void> ensureInitialized() async {
    if (_instance != null) return;

    final service = FavoritesService._();
    service._box = await Hive.openBox<String>(_boxName);
    _instance = service;
  }

  // ─────────────────────────────────────────────────────────────
  // Venue Favorites
  // ─────────────────────────────────────────────────────────────

  /// Get all favorite venue IDs
  List<String> getFavoriteVenueIds() {
    final raw = _box.get(_venuesKey);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list.cast<String>();
    } catch (e) {
      return [];
    }
  }

  /// Check if a venue is a favorite
  bool isVenueFavorite(String venueId) {
    return getFavoriteVenueIds().contains(venueId);
  }

  /// Add a venue to favorites
  Future<void> addFavoriteVenue(String venueId) async {
    final current = getFavoriteVenueIds();
    if (!current.contains(venueId)) {
      current.insert(0, venueId);
      await _box.put(_venuesKey, jsonEncode(current));
    }
  }

  /// Remove a venue from favorites
  Future<void> removeFavoriteVenue(String venueId) async {
    final current = getFavoriteVenueIds();
    if (current.remove(venueId)) {
      await _box.put(_venuesKey, jsonEncode(current));
    }
  }

  /// Toggle a venue's favorite status
  Future<bool> toggleFavoriteVenue(String venueId) async {
    if (isVenueFavorite(venueId)) {
      await removeFavoriteVenue(venueId);
      return false;
    } else {
      await addFavoriteVenue(venueId);
      return true;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Item Favorites
  // ─────────────────────────────────────────────────────────────

  /// Get all favorite item IDs
  List<String> getFavoriteItemIds() {
    final raw = _box.get(_itemsKey);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list.cast<String>();
    } catch (e) {
      return [];
    }
  }

  /// Check if an item is a favorite
  bool isItemFavorite(String itemId) {
    return getFavoriteItemIds().contains(itemId);
  }

  /// Add an item to favorites
  Future<void> addFavoriteItem(String itemId) async {
    final current = getFavoriteItemIds();
    if (!current.contains(itemId)) {
      current.insert(0, itemId);
      await _box.put(_itemsKey, jsonEncode(current));
    }
  }

  /// Remove an item from favorites
  Future<void> removeFavoriteItem(String itemId) async {
    final current = getFavoriteItemIds();
    if (current.remove(itemId)) {
      await _box.put(_itemsKey, jsonEncode(current));
    }
  }

  /// Toggle an item's favorite status
  Future<bool> toggleFavoriteItem(String itemId) async {
    if (isItemFavorite(itemId)) {
      await removeFavoriteItem(itemId);
      return false;
    } else {
      await addFavoriteItem(itemId);
      return true;
    }
  }

  /// Clear all favorites
  Future<void> clearAll() async {
    await _box.delete(_venuesKey);
    await _box.delete(_itemsKey);
  }
}

// Provider - returns the pre-initialized singleton instance
final favoritesServiceProvider = Provider<FavoritesService>((ref) {
  return FavoritesService.instance;
});

// Reactive providers for UI updates
final favoriteVenueIdsProvider = StateProvider<List<String>>((ref) {
  return ref.read(favoritesServiceProvider).getFavoriteVenueIds();
});

final favoriteItemIdsProvider = StateProvider<List<String>>((ref) {
  return ref.read(favoritesServiceProvider).getFavoriteItemIds();
});
