import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order.dart';
import '../models/order_status.dart';
import '../supabase/supabase_client.dart';
import '../../services/auth_service.dart';
import '../../error/retry_helper.dart';
import '../../utils/logger.dart';

// Interface
abstract class OrderRepository {
  Future<Order> createOrder({
    required String venueId,
    required List<Map<String, dynamic>> items,
    required String paymentMethod,
    String? tableNumber,
  });

  Future<OrderStatus> getOrderStatus({
    required String orderId,
    required String orderCode,
  });

  /// Streams a single order's status updates in realtime
  Stream<OrderStatus?> streamOrderStatus(String orderId);

  /// Streams order history for the authenticated user
  Stream<List<Order>> streamOrderHistory();
}

// Implementation - Edge Function order_create (no direct table insert)
class SupabaseOrderRepository implements OrderRepository {
  final SupabaseClient _client;

  SupabaseOrderRepository(this._client);

  /// Get the current authenticated user's ID
  String? get _currentUserId => _client.auth.currentUser?.id;

  @override
  Future<Order> createOrder({
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
        final menuItemId =
            item['menu_item_id'] ?? item['id'] ?? item['item_id'];
        if (menuItemId == null) {
          throw Exception('Invalid item payload');
        }
        return {
          'menu_item_id': menuItemId,
          'qty': item['qty'] ?? item['quantity'] ?? 1,
          if (item['modifiers_json'] != null)
            'modifiers_json': item['modifiers_json'],
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

      final payload = _normalizePayload(response.data);
      if (payload['success'] != true || payload['order'] == null) {
        throw Exception(payload['error'] ?? 'Failed to create order');
      }

      final orderData = Map<String, dynamic>.from(payload['order'] as Map);
      final itemsList = orderData['items'] as List<dynamic>? ?? [];

      final orderItems = itemsList.map((item) {
        final map = Map<String, dynamic>.from(item as Map);
        return OrderItem(
          itemId: map['menu_item_id']?.toString() ??
              map['item_id']?.toString() ??
              map['id']?.toString() ??
              '',
          name: map['name_snapshot']?.toString() ??
              map['name']?.toString() ??
              'Unknown',
          quantity: (map['qty'] as num?)?.toInt() ??
              (map['quantity'] as num?)?.toInt() ??
              1,
          price: (map['price_snapshot'] as num?)?.toDouble() ??
              (map['price'] as num?)?.toDouble() ??
              0,
        );
      }).toList();

      final createdAtRaw = orderData['created_at'];
      final createdAt = createdAtRaw is String
          ? DateTime.parse(createdAtRaw)
          : DateTime.now().toUtc();

      return Order(
        id: orderData['id'] as String,
        venueId: orderData['venue_id'] as String,
        sessionId: _currentUserId ?? '',
        tableNumber: tableNumber,
        status: orderData['status']?.toString() ?? 'received',
        totalAmount: (orderData['total_amount'] as num?)?.toDouble() ?? 0,
        currency: orderData['currency']?.toString() ?? 'EUR',
        paymentMethod: paymentMethod,
        orderCode: orderData['order_code']?.toString(),
        items: orderItems,
        createdAt: createdAt,
      );
    } catch (e, stackTrace) {
      Logger.error('Failed to create order for venue: $venueId', e, scope: 'OrderRepository', stackTrace: stackTrace);
      throw ApiException(500, 'Unable to place order. Please try again.');
    }
  }

  @override
  Future<OrderStatus> getOrderStatus({
    required String orderId,
    required String orderCode,
  }) async {
    try {
      if (orderCode.trim().isEmpty) {
        throw ValidationException('Order code is required');
      }
      final response = await _client.functions.invoke(
        'order_status',
        body: {
          'order_id': orderId,
          'order_code': orderCode,
        },
      );

      final payload = _normalizePayload(response.data);
      if (payload['success'] != true || payload['order'] == null) {
        final errorMsg = payload['error']?.toString() ?? 'Failed to fetch order';
        throw ApiException(400, errorMsg);
      }

      final orderData = Map<String, dynamic>.from(payload['order'] as Map);
      return OrderStatus.fromJson(orderData);
    } catch (e, stackTrace) {
      if (e is ApiException || e is ValidationException) rethrow;
      Logger.error('Failed to fetch order status: $orderId', e, scope: 'OrderRepository', stackTrace: stackTrace);
      throw ApiException(500, 'Unable to check order status. Please try again.');
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

  @override
  Stream<OrderStatus?> streamOrderStatus(String orderId) {
    return _client
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('id', orderId)
        .map((rows) {
          if (rows.isEmpty) return null;
          final row = rows.first;
          return OrderStatus.fromJson(row);
        });
  }

  @override
  Stream<List<Order>> streamOrderHistory() {
    final userId = _currentUserId;
    if (userId == null) {
      // Return empty stream if not authenticated
      return Stream.value([]);
    }

    return _client
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('client_auth_user_id', userId)
        .order('created_at', ascending: false)
        .map((rows) {
          return rows.map((row) {
            final itemsList = row['items'] as List<dynamic>? ?? [];
            final orderItems = itemsList.map((item) {
              final map = Map<String, dynamic>.from(item as Map);
              return OrderItem(
                itemId: map['menu_item_id']?.toString() ??
                    map['item_id']?.toString() ??
                    map['id']?.toString() ??
                    '',
                name: map['name_snapshot']?.toString() ??
                    map['name']?.toString() ??
                    'Unknown',
                quantity: (map['qty'] as num?)?.toInt() ??
                    (map['quantity'] as num?)?.toInt() ??
                    1,
                price: (map['price_snapshot'] as num?)?.toDouble() ??
                    (map['price'] as num?)?.toDouble() ??
                    0,
              );
            }).toList();

            final createdAtRaw = row['created_at'];
            final createdAt = createdAtRaw is String
                ? DateTime.parse(createdAtRaw)
                : DateTime.now().toUtc();

            return Order(
              id: row['id'] as String,
              venueId: row['venue_id'] as String,
              sessionId: row['client_auth_user_id']?.toString() ?? '',
              tableNumber: row['table_number']?.toString(),
              status: row['status']?.toString() ?? 'placed',
              totalAmount: (row['total_amount'] as num?)?.toDouble() ?? 0,
              currency: row['currency']?.toString() ?? 'EUR',
              paymentMethod: row['payment_method']?.toString() ?? 'Cash',
              orderCode: row['order_code']?.toString(),
              items: orderItems,
              createdAt: createdAt,
            );
          }).toList();
        });
  }
}

// Provider
final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return SupabaseOrderRepository(ref.watch(supabaseClientProvider));
});

// Order history stream provider - uses authenticated user
final orderHistoryProvider = StreamProvider<List<Order>>((ref) {
  final repo = ref.watch(orderRepositoryProvider);
  return repo.streamOrderHistory();
});

// Single order status stream provider - for realtime order tracking
final orderStatusStreamProvider = StreamProvider.family<OrderStatus?, String>((ref, orderId) {
  final repo = ref.watch(orderRepositoryProvider);
  return repo.streamOrderStatus(orderId);
});
