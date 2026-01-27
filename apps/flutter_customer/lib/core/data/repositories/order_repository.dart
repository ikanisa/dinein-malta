import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order.dart';
import '../supabase/supabase_client.dart';
import 'package:uuid/uuid.dart';

// Interface
abstract class OrderRepository {
  Future<Order> createOrder({
    required String sessionId,
    required String venueId,
    required List<Map<String, dynamic>> items,
    required String paymentMethod,
    String? tableNumber,
  });
}

// Implementation - Direct table insert (no Edge Function dependency)
class SupabaseOrderRepository implements OrderRepository {
  final SupabaseClient _client;

  SupabaseOrderRepository(this._client);

  @override
  Future<Order> createOrder({
    required String sessionId,
    required String venueId,
    required List<Map<String, dynamic>> items,
    required String paymentMethod,
    String? tableNumber,
  }) async {
    try {
      // Calculate total from items
      double totalAmount = 0;
      for (final item in items) {
        final price = (item['price'] as num?)?.toDouble() ?? 0;
        final qty = (item['quantity'] as int?) ?? 1;
        totalAmount += price * qty;
      }

      final orderId = const Uuid().v4();
      final now = DateTime.now().toUtc();

      // Insert order directly into the orders table
      final orderData = {
        'id': orderId,
        'venue_id': venueId,
        'session_id': sessionId,
        'table_number': tableNumber,
        'status': 'placed', // Initial status
        'total_amount': totalAmount,
        'payment_method': paymentMethod,
        'items': items, // JSONB column for order items snapshot
        'created_at': now.toIso8601String(),
      };

      final response = await _client
          .from('orders')
          .insert(orderData)
          .select()
          .single();

      // Parse items from JSONB response
      final orderItems = <OrderItem>[];
      if (response['items'] != null) {
        final itemsList = response['items'] as List<dynamic>;
        for (final item in itemsList) {
          orderItems.add(OrderItem(
            itemId: item['item_id']?.toString() ?? '',
            name: item['name']?.toString() ?? 'Unknown',
            quantity: (item['quantity'] as num?)?.toInt() ?? 1,
            price: (item['price'] as num?)?.toDouble() ?? 0,
          ));
        }
      }

      return Order(
        id: response['id'] as String,
        venueId: response['venue_id'] as String,
        sessionId: response['session_id'] as String,
        tableNumber: response['table_number'] as String?,
        status: response['status'] as String,
        totalAmount: (response['total_amount'] as num).toDouble(),
        paymentMethod: response['payment_method'] as String,
        items: orderItems,
        createdAt: DateTime.parse(response['created_at'] as String),
      );
    } catch (e) {
      throw Exception('Failed to create order: $e');
    }
  }
}

// Provider
final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return SupabaseOrderRepository(ref.watch(supabaseClientProvider));
});
