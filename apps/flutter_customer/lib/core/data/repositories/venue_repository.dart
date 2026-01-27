import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/supabase_client.dart';
import '../models/venue.dart';
import '../local/local_cache_service.dart';
import '../../error/retry_helper.dart';
import '../../utils/logger.dart';

// Interface
abstract class VenueRepository {
  Future<Venue?> getVenueBySlug(String slug);
  Stream<Venue?> streamVenueBySlug(String slug);
  Future<List<Venue>> listActiveVenues({String? country});
  Stream<List<Venue>> streamActiveVenues({String? country});
  Future<List<Venue>> searchVenues(
      {required String country, required String query});
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
      final response =
          await _client.from('venues').select().eq('slug', slug).maybeSingle();
      if (response == null) return null;
      _cache.cacheVenue(slug, response);
      final venueId = response['id']?.toString();
      if (venueId != null && venueId.isNotEmpty) {
        _cache.cacheVenueById(venueId, response);
      }
      return Venue.fromJson(response);
    } catch (e, stackTrace) {
      // Fallback to cache if network fails
      final cached = _cache.getVenue(slug, allowStale: true);
      if (cached != null) return Venue.fromJson(cached);
      Logger.error('Failed to fetch venue by slug: $slug', e, scope: 'VenueRepository', stackTrace: stackTrace);
      throw NetworkException('Unable to load venue. Please check your connection.');
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
      final response =
          await _client.from('venues').select().eq('slug', slug).maybeSingle();

      if (response != null) {
        await _cache.cacheVenue(slug, response);
        final venueId = response['id']?.toString();
        if (venueId != null && venueId.isNotEmpty) {
          await _cache.cacheVenueById(venueId, response);
        }
        yield Venue.fromJson(response);
      } else if (cached == null) {
        yield null; // Not found anywhere
      }
    } catch (e, stackTrace) {
      // If we haven't emitted cache, throw
      if (cached == null) {
        Logger.error('Failed to stream venue by slug: $slug', e, scope: 'VenueRepository', stackTrace: stackTrace);
        rethrow;
      }
      // Swallow error and stay on cache, but log it
      Logger.info('Using cached venue for $slug (network error)', scope: 'VenueRepository');
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
      yield (cachedList['list'] as List).map((e) => Venue.fromJson(e)).toList();
    }

    try {
      final fresh = await _fetchVenues(country);

      // Cache it
      await _cache.cacheData(
          cacheKey, {'list': fresh.map((v) => v.toJson()).toList()},
          ttl: const Duration(hours: 1));

      yield fresh;
    } catch (e, stackTrace) {
      if (cachedList == null) {
        Logger.error('Failed to stream active venues', e, scope: 'VenueRepository', stackTrace: stackTrace);
        rethrow;
      }
      // Log but continue with cached data
      Logger.info('Using cached venue list (network error)', scope: 'VenueRepository');
    }
  }

  Future<List<Venue>> _fetchVenues(String? country) async {
    // Table is 'venues' in the Supabase schema
    var query = _client.from('venues').select().eq('status', 'active');
    if (country != null) query = query.eq('country', country);
    final response = await query;
    return (response as List)
        .map((e) => Venue.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Venue>> searchVenues(
      {required String country, required String query}) async {
    // Search is usually network-only or strictly filtered cache.
    // Network-only is fine for now.
    try {
      final response = await _client
          .from('venues')
          .select()
          .eq('country', country)
          .eq('status', 'active')
          .ilike('name', '%$query%');

      return (response as List)
          .map((e) => Venue.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e, stackTrace) {
      Logger.error('Search venues failed for query: $query', e, scope: 'VenueRepository', stackTrace: stackTrace);
      return []; // Return empty on error for search
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
