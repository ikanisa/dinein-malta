import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order.dart';
import '../models/order_status.dart';
import '../supabase/supabase_client.dart';

// Interface
abstract class OrderRepository {
  Future<Order> createOrder({
    required String sessionId,
    required String venueId,
    required List<Map<String, dynamic>> items,
    required String paymentMethod,
    String? tableNumber,
  });

  Future<OrderStatus> getOrderStatus({
    required String orderId,
    required String orderCode,
  });
}

// Implementation - Edge Function order_create (no direct table insert)
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
      if (items.isEmpty) {
        throw Exception('No items in order');
      }
      if (tableNumber == null || tableNumber.trim().isEmpty) {
        throw Exception('Table number is required');
      }

      final sanitizedItems = items.map((item) {
        final menuItemId = item['menu_item_id'] ?? item['id'] ?? item['item_id'];
        if (menuItemId == null) {
          throw Exception('Invalid item payload');
        }
        return {
          'menu_item_id': menuItemId,
          'qty': item['qty'] ?? item['quantity'] ?? 1,
          if (item['modifiers_json'] != null) 'modifiers_json': item['modifiers_json'],
        };
      }).toList();

      final response = await _client.functions.invoke(
        'order_create',
        body: {
          'venue_id': venueId,
          'table_public_code': tableNumber,
          'items': sanitizedItems,
        },
      );

      if (response.error != null) {
        throw Exception(response.error!.message);
      }

      final payload = _normalizePayload(response.data);
      if (payload['success'] != true || payload['order'] == null) {
        throw Exception(payload['error'] ?? 'Failed to create order');
      }

      final orderData = Map<String, dynamic>.from(payload['order'] as Map);
      final itemsList = orderData['items'] as List<dynamic>? ?? [];

      final orderItems = itemsList.map((item) {
        final map = Map<String, dynamic>.from(item as Map);
        return OrderItem(
          itemId: map['menu_item_id']?.toString() ?? map['item_id']?.toString() ?? map['id']?.toString() ?? '',
          name: map['name_snapshot']?.toString() ?? map['name']?.toString() ?? 'Unknown',
          quantity: (map['qty'] as num?)?.toInt() ?? (map['quantity'] as num?)?.toInt() ?? 1,
          price: (map['price_snapshot'] as num?)?.toDouble() ?? (map['price'] as num?)?.toDouble() ?? 0,
        );
      }).toList();

      final createdAtRaw = orderData['created_at'];
      final createdAt = createdAtRaw is String
          ? DateTime.parse(createdAtRaw)
          : DateTime.now().toUtc();

      return Order(
        id: orderData['id'] as String,
        venueId: orderData['venue_id'] as String,
        sessionId: sessionId,
        tableNumber: tableNumber,
        status: orderData['status']?.toString() ?? 'received',
        totalAmount: (orderData['total_amount'] as num?)?.toDouble() ?? 0,
        currency: orderData['currency']?.toString() ?? 'EUR',
        paymentMethod: paymentMethod,
        orderCode: orderData['order_code']?.toString(),
        items: orderItems,
        createdAt: createdAt,
      );
    } catch (e) {
      throw Exception('Failed to create order: $e');
    }
  }

  @override
  Future<OrderStatus> getOrderStatus({
    required String orderId,
    required String orderCode,
  }) async {
    try {
      if (orderCode.trim().isEmpty) {
        throw Exception('Order code is required');
      }
      final response = await _client.functions.invoke(
        'order_status',
        body: {
          'order_id': orderId,
          'order_code': orderCode,
        },
      );

      if (response.error != null) {
        throw Exception(response.error!.message);
      }

      final payload = _normalizePayload(response.data);
      if (payload['success'] != true || payload['order'] == null) {
        throw Exception(payload['error'] ?? 'Failed to fetch order');
      }

      final orderData = Map<String, dynamic>.from(payload['order'] as Map);
      return OrderStatus.fromJson(orderData);
    } catch (e) {
      throw Exception('Failed to fetch order: $e');
    }
  }

  Map<String, dynamic> _normalizePayload(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    if (data is String) {
      return jsonDecode(data) as Map<String, dynamic>;
    }
    throw Exception('Unexpected response format');
  }
}

// Provider
final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return SupabaseOrderRepository(ref.watch(supabaseClientProvider));
});
