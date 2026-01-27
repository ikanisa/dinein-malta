import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../supabase/supabase_client.dart';

// Interface
abstract class BellRepository {
  Future<bool> ringBell({
    required String sessionId,
    required String venueId,
    required String tableNumber,
  });
}

// Implementation
class SupabaseBellRepository implements BellRepository {
  final SupabaseClient _client;

  SupabaseBellRepository(this._client);

  @override
  Future<bool> ringBell({
    required String sessionId,
    required String venueId,
    required String tableNumber,
  }) async {
    try {
      final response = await _client.functions.invoke(
        'ring_bell',
        body: {
          'session_id': sessionId,
          'venue_id': venueId,
          'table_number': tableNumber,
        },
      );

      // Function usually returns { success: true }
      final data = response.data as Map<String, dynamic>;
      return data['success'] == true;
    } catch (e) {
      throw Exception('Failed to ring bell: $e');
    }
  }
}

// Provider
final bellRepositoryProvider = Provider<BellRepository>((ref) {
  return SupabaseBellRepository(ref.watch(supabaseClientProvider));
});
