// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderImpl _$$OrderImplFromJson(Map<String, dynamic> json) => _$OrderImpl(
      id: json['id'] as String,
      venueId: json['venue_id'] as String,
      sessionId: json['session_id'] as String,
      tableNumber: json['table_number'] as String?,
      status: json['status'] as String,
      totalAmount: (json['total_amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'EUR',
      paymentMethod: json['payment_method'] as String,
      orderCode: json['order_code'] as String?,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$$OrderImplToJson(_$OrderImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'venue_id': instance.venueId,
      'session_id': instance.sessionId,
      'table_number': instance.tableNumber,
      'status': instance.status,
      'total_amount': instance.totalAmount,
      'currency': instance.currency,
      'payment_method': instance.paymentMethod,
      'order_code': instance.orderCode,
      'items': instance.items,
      'created_at': instance.createdAt.toIso8601String(),
    };

_$OrderItemImpl _$$OrderItemImplFromJson(Map<String, dynamic> json) =>
    _$OrderItemImpl(
      itemId: json['item_id'] as String,
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toInt(),
      price: (json['price'] as num).toDouble(),
    );

Map<String, dynamic> _$$OrderItemImplToJson(_$OrderItemImpl instance) =>
    <String, dynamic>{
      'item_id': instance.itemId,
      'name': instance.name,
      'quantity': instance.quantity,
      'price': instance.price,
    };
