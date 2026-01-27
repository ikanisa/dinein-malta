import 'package:freezed_annotation/freezed_annotation.dart';

part 'order.freezed.dart';
part 'order.g.dart';

@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    @JsonKey(name: 'venue_id') required String venueId,
    @JsonKey(name: 'session_id') required String sessionId,
    @JsonKey(name: 'table_number') String? tableNumber,
    required String status, // 'placed', 'received', 'served', 'cancelled'
    @JsonKey(name: 'total_amount') required double totalAmount,
    @JsonKey(name: 'currency') @Default('EUR') String currency,
    @JsonKey(name: 'payment_method') required String paymentMethod,
    @JsonKey(name: 'order_code') String? orderCode,
    @Default([]) List<OrderItem> items,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}

@freezed
class OrderItem with _$OrderItem {
  const factory OrderItem({
    @JsonKey(name: 'item_id') required String itemId,
    required String name, // Snapshot name in case it changes
    required int quantity,
    required double price, // Snapshot price
  }) = _OrderItem;

  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
}
