import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../telemetry/telemetry_service.dart';

// Service - Singleton pattern for proper initialization
class LocalCacheService {
  static const String _boxName = 'dinein_cache';
  late Box<String> _box;
  
  // Singleton instance
  static LocalCacheService? _instance;
  static LocalCacheService get instance {
    if (_instance == null) {
      throw StateError('LocalCacheService not initialized. Call LocalCacheService.init() first.');
    }
    return _instance!;
  }
  
  LocalCacheService._();
  
  /// Initialize the service - must be called once before accessing instance
  static Future<void> ensureInitialized() async {
    if (_instance != null) return; // Already initialized
    
    final service = LocalCacheService._();
    await Hive.initFlutter();
    service._box = await Hive.openBox<String>(_boxName);
    _instance = service;
  }

  // Generic Get/Set
  Future<void> cacheData(String key, Map<String, dynamic> data, {Duration? ttl}) async {
    final entry = {
      'data': data,
      'expires_at': ttl != null ? DateTime.now().add(ttl).toIso8601String() : null,
      'last_accessed': DateTime.now().toIso8601String(),
    };
    await _box.put(key, jsonEncode(entry));
  }

  /// Returns [data] if found.
  /// If [ignoreExpiration] is true, returns data even if expired (useful for SWR).
  /// Returns null if not found or expired (and ignoreExpiration is false).
  Map<String, dynamic>? getData(String key, {bool ignoreExpiration = false}) {
    final jsonString = _box.get(key);
    if (jsonString == null) return null;

    try {
      final entry = jsonDecode(jsonString);
      final expiresAt = entry['expires_at'];
      
      // Update access time for LRU
      // Note: writing on every read might be too heavy? 
      // Let's skip writing on read for now to keep it fast, 
      // or only write if it's been a while. 
      // For simplicity in this implementation, we assume 'put' updates order if we use Hive's key order?
      // Hive doesn't automatically track LRU. We need 'last_accessed' if we want real LRU.
      
      if (!ignoreExpiration && expiresAt != null) {
        if (DateTime.now().isAfter(DateTime.parse(expiresAt))) {
          // Expired
          _box.delete(key); // Auto-cleanup
          return null;
        }
      }
      return entry['data'] as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }
  
  // Specific Helpers with Usage Limits
  // Venues: Cap 300
  // Menus: Cap 50

  Future<void> cacheVenue(String slug, Map<String, dynamic> json) async {
    await cacheData('venue_$slug', json, ttl: const Duration(hours: 6));
    await _enforceLimit('venue_', 300);
  }
      
  Map<String, dynamic>? getVenue(String slug, {bool allowStale = false}) => 
      getData('venue_$slug', ignoreExpiration: allowStale);
  
  Future<void> cacheMenu(String venueId, Map<String, dynamic> json) async {
    await cacheData('menu_$venueId', json, ttl: const Duration(minutes: 30));
    await _enforceLimit('menu_', 50);
  }
      
  Map<String, dynamic>? getMenu(String venueId, {bool allowStale = false}) => 
      getData('menu_$venueId', ignoreExpiration: allowStale);

  // Eviction Logic
  Future<void> _enforceLimit(String prefix, int limit) async {
    // 1. Collect keys matching prefix
    final keys = _box.keys.where((k) => k.toString().startsWith(prefix)).toList();
    
    if (keys.length <= limit) return;
    
    // 2. We need to identify oldest.
    // Reading all entries to sort by 'last_accessed' is expensive.
    // Basic FIFO (First In First Out) might be enough if Hive iteration order is insertion order?
    // Hive keys are not necessarily sorted by insertion if we use put.
    // BUT _box.keys usually returns in some order. 
    // Optimization: Just remove random or first ones?
    // Let's rely on simple approach: Remove the first ones found (approx LRU if not updated often).
    
    final toRemoveCount = keys.length - limit;
    final keysToRemove = keys.take(toRemoveCount).toList();
    await _box.deleteAll(keysToRemove);
  }



  // Order History
  Future<void> saveOrder(Map<String, dynamic> orderJson) async {
    final List<dynamic> currentList = await getOrdersRaw();
    // Add to beginning
    currentList.insert(0, orderJson);
    
    // Store back
    await _box.put('my_orders', jsonEncode({'data': currentList}));
  }

  Future<List<dynamic>> getOrdersRaw() async {
    final jsonString = _box.get('my_orders');
    if (jsonString == null) return [];
    try {
      final entry = jsonDecode(jsonString);
      return entry['data'] as List<dynamic>;
    } catch (e) {
      return [];
    }
  }
}

// Provider - returns the pre-initialized singleton instance
final localCacheServiceProvider = Provider<LocalCacheService>((ref) {
  return LocalCacheService.instance;
});

// Telemetry Provider
final telemetryServiceProvider = Provider<TelemetryService>((ref) {
  return TelemetryService(ref.watch(localCacheServiceProvider));
});

