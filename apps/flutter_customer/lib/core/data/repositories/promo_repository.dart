import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/promo.dart';
import '../supabase/supabase_client.dart';

// Interface
abstract class PromoRepository {
  Future<List<Promo>> listActivePromos({String? country});
}

// Implementation
class SupabasePromoRepository implements PromoRepository {
  final SupabaseClient _client;

  SupabasePromoRepository(this._client);

  @override
  Future<List<Promo>> listActivePromos({String? country}) async {
    try {
      var query = _client
          .from('promotions')
          .select('*, venues!inner(country)')
          .eq('is_active', true);

      if (country != null) {
        query = query.eq('venues.country', country);
      }

      final response = await query;

      return (response as List)
          .map((e) => Promo.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Return empty list on error for now to not block UI
      return [];
    }
  }
}

// Provider
final promoRepositoryProvider = Provider<PromoRepository>((ref) {
  return SupabasePromoRepository(ref.watch(supabaseClientProvider));
});
