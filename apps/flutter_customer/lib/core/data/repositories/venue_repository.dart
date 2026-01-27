
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/supabase_client.dart';
import '../models/venue.dart';
import '../local/local_cache_service.dart';

// Interface
abstract class VenueRepository {
  Future<Venue?> getVenueBySlug(String slug);
  Stream<Venue?> streamVenueBySlug(String slug);
  Future<List<Venue>> listActiveVenues({String? country});
  Stream<List<Venue>> streamActiveVenues({String? country});
  Future<List<Venue>> searchVenues({required String country, required String query});
}

// Implementation
class SupabaseVenueRepository implements VenueRepository {
  final SupabaseClient _client;
  final LocalCacheService _cache;

  SupabaseVenueRepository(this._client, this._cache);

  @override
  Future<Venue?> getVenueBySlug(String slug) async {
     // Legacy future call - prefer stream
    try {
      final response = await _client
          .from('vendors')
          .select()
          .eq('slug', slug)
          .maybeSingle(); 
      if (response == null) return null;
      _cache.cacheVenue(slug, response);
      return Venue.fromJson(response);
    } catch (e) {
      // Fallback to cache if network fails?
      final cached = _cache.getVenue(slug, allowStale: true);
      if (cached != null) return Venue.fromJson(cached);
      throw Exception('Failed to fetch venue: $e');
    }
  }

  @override
  Stream<Venue?> streamVenueBySlug(String slug) async* {
    // 1. Emit Cached
    final cached = _cache.getVenue(slug, allowStale: true);
    if (cached != null) {
      yield Venue.fromJson(cached);
    }

    // 2. Fetch Network
    try {
      final response = await _client
          .from('vendors')
          .select()
          .eq('slug', slug)
          .maybeSingle();

      if (response != null) {
        await _cache.cacheVenue(slug, response);
        yield Venue.fromJson(response);
      } else if (cached == null) {
        yield null; // Not found anywhere
      }
    } catch (e) {
      // If we haven't emitted cache, throw
      if (cached == null) throw e;
      // Else swallow error and stay on cache (maybe log it)
    }
  }

  @override
  Future<List<Venue>> listActiveVenues({String? country}) async {
    // Legacy Future
    return await _fetchVenues(country);
  }

  @override
  Stream<List<Venue>> streamActiveVenues({String? country}) async* {
    // 1. Emit Cached (using a special list key pattern?)
    // Cache policy says key: venues_list_{country}
    // We need to implement list caching in LocalCacheService or here manually
    // For now let's assume valid key.
    // Actually LocalCacheService doesn't have list helper yet. 
    // Let's use generic getData.
    final cacheKey = 'venues_list_${country ?? 'all'}';
    final cachedList = _cache.getData(cacheKey, ignoreExpiration: true);
    if (cachedList != null && cachedList['list'] is List) {
       yield (cachedList['list'] as List)
          .map((e) => Venue.fromJson(e))
          .toList();
    }

    try {
      final fresh = await _fetchVenues(country);
      
      // Cache it
      await _cache.cacheData(cacheKey, {
        'list': fresh.map((v) => v.toJson()).toList()
      }, ttl: const Duration(hours: 1));
      
      yield fresh;
    } catch (e) {
      if (cachedList == null) rethrow;
    }
  }

  Future<List<Venue>> _fetchVenues(String? country) async {
      // Table is 'vendors' in the actual Supabase schema
      var query = _client.from('vendors').select().eq('status', 'active');
      if (country != null) query = query.eq('country', country);
      final response = await query;
      return (response as List)
          .map((e) => Venue.fromJson(e as Map<String, dynamic>))
          .toList();
  }

  Future<List<Venue>> searchVenues({required String country, required String query}) async {
    // Search is usually network-only or strictly filtered cache. 
    // Network-only is fine for now.
    try {
      final response = await _client
          .from('vendors')
          .select()
          .eq('country', country)
          .eq('status', 'active')
          .ilike('name', '%$query%');
      
      return (response as List)
          .map((e) => Venue.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }
}

// Provider
final venueRepositoryProvider = Provider<VenueRepository>((ref) {
  return SupabaseVenueRepository(
    ref.watch(supabaseClientProvider),
    ref.watch(localCacheServiceProvider),
  );
});
