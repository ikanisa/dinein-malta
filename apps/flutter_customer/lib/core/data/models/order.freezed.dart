// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Order _$OrderFromJson(Map<String, dynamic> json) {
  return _Order.fromJson(json);
}

/// @nodoc
mixin _$Order {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'venue_id')
  String get venueId => throw _privateConstructorUsedError;
  @JsonKey(name: 'session_id')
  String get sessionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'table_number')
  String? get tableNumber => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // 'placed', 'received', 'served', 'cancelled'
  @JsonKey(name: 'total_amount')
  double get totalAmount => throw _privateConstructorUsedError;
  @JsonKey(name: 'currency')
  String get currency => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_method')
  String get paymentMethod => throw _privateConstructorUsedError;
  @JsonKey(name: 'order_code')
  String? get orderCode => throw _privateConstructorUsedError;
  List<OrderItem> get items => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime get createdAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $OrderCopyWith<Order> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderCopyWith<$Res> {
  factory $OrderCopyWith(Order value, $Res Function(Order) then) =
      _$OrderCopyWithImpl<$Res, Order>;
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'venue_id') String venueId,
      @JsonKey(name: 'session_id') String sessionId,
      @JsonKey(name: 'table_number') String? tableNumber,
      String status,
      @JsonKey(name: 'total_amount') double totalAmount,
      @JsonKey(name: 'currency') String currency,
      @JsonKey(name: 'payment_method') String paymentMethod,
      @JsonKey(name: 'order_code') String? orderCode,
      List<OrderItem> items,
      @JsonKey(name: 'created_at') DateTime createdAt});
}

/// @nodoc
class _$OrderCopyWithImpl<$Res, $Val extends Order>
    implements $OrderCopyWith<$Res> {
  _$OrderCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? venueId = null,
    Object? sessionId = null,
    Object? tableNumber = freezed,
    Object? status = null,
    Object? totalAmount = null,
    Object? currency = null,
    Object? paymentMethod = null,
    Object? orderCode = freezed,
    Object? items = null,
    Object? createdAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      venueId: null == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String,
      sessionId: null == sessionId
          ? _value.sessionId
          : sessionId // ignore: cast_nullable_to_non_nullable
              as String,
      tableNumber: freezed == tableNumber
          ? _value.tableNumber
          : tableNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      totalAmount: null == totalAmount
          ? _value.totalAmount
          : totalAmount // ignore: cast_nullable_to_non_nullable
              as double,
      currency: null == currency
          ? _value.currency
          : currency // ignore: cast_nullable_to_non_nullable
              as String,
      paymentMethod: null == paymentMethod
          ? _value.paymentMethod
          : paymentMethod // ignore: cast_nullable_to_non_nullable
              as String,
      orderCode: freezed == orderCode
          ? _value.orderCode
          : orderCode // ignore: cast_nullable_to_non_nullable
              as String?,
      items: null == items
          ? _value.items
          : items // ignore: cast_nullable_to_non_nullable
              as List<OrderItem>,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$OrderImplCopyWith<$Res> implements $OrderCopyWith<$Res> {
  factory _$$OrderImplCopyWith(
          _$OrderImpl value, $Res Function(_$OrderImpl) then) =
      __$$OrderImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'venue_id') String venueId,
      @JsonKey(name: 'session_id') String sessionId,
      @JsonKey(name: 'table_number') String? tableNumber,
      String status,
      @JsonKey(name: 'total_amount') double totalAmount,
      @JsonKey(name: 'currency') String currency,
      @JsonKey(name: 'payment_method') String paymentMethod,
      @JsonKey(name: 'order_code') String? orderCode,
      List<OrderItem> items,
      @JsonKey(name: 'created_at') DateTime createdAt});
}

/// @nodoc
class __$$OrderImplCopyWithImpl<$Res>
    extends _$OrderCopyWithImpl<$Res, _$OrderImpl>
    implements _$$OrderImplCopyWith<$Res> {
  __$$OrderImplCopyWithImpl(
      _$OrderImpl _value, $Res Function(_$OrderImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? venueId = null,
    Object? sessionId = null,
    Object? tableNumber = freezed,
    Object? status = null,
    Object? totalAmount = null,
    Object? currency = null,
    Object? paymentMethod = null,
    Object? orderCode = freezed,
    Object? items = null,
    Object? createdAt = null,
  }) {
    return _then(_$OrderImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      venueId: null == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String,
      sessionId: null == sessionId
          ? _value.sessionId
          : sessionId // ignore: cast_nullable_to_non_nullable
              as String,
      tableNumber: freezed == tableNumber
          ? _value.tableNumber
          : tableNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      totalAmount: null == totalAmount
          ? _value.totalAmount
          : totalAmount // ignore: cast_nullable_to_non_nullable
              as double,
      currency: null == currency
          ? _value.currency
          : currency // ignore: cast_nullable_to_non_nullable
              as String,
      paymentMethod: null == paymentMethod
          ? _value.paymentMethod
          : paymentMethod // ignore: cast_nullable_to_non_nullable
              as String,
      orderCode: freezed == orderCode
          ? _value.orderCode
          : orderCode // ignore: cast_nullable_to_non_nullable
              as String?,
      items: null == items
          ? _value._items
          : items // ignore: cast_nullable_to_non_nullable
              as List<OrderItem>,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderImpl implements _Order {
  const _$OrderImpl(
      {required this.id,
      @JsonKey(name: 'venue_id') required this.venueId,
      @JsonKey(name: 'session_id') required this.sessionId,
      @JsonKey(name: 'table_number') this.tableNumber,
      required this.status,
      @JsonKey(name: 'total_amount') required this.totalAmount,
      @JsonKey(name: 'currency') this.currency = 'EUR',
      @JsonKey(name: 'payment_method') required this.paymentMethod,
      @JsonKey(name: 'order_code') this.orderCode,
      final List<OrderItem> items = const [],
      @JsonKey(name: 'created_at') required this.createdAt})
      : _items = items;

  factory _$OrderImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'venue_id')
  final String venueId;
  @override
  @JsonKey(name: 'session_id')
  final String sessionId;
  @override
  @JsonKey(name: 'table_number')
  final String? tableNumber;
  @override
  final String status;
// 'placed', 'received', 'served', 'cancelled'
  @override
  @JsonKey(name: 'total_amount')
  final double totalAmount;
  @override
  @JsonKey(name: 'currency')
  final String currency;
  @override
  @JsonKey(name: 'payment_method')
  final String paymentMethod;
  @override
  @JsonKey(name: 'order_code')
  final String? orderCode;
  final List<OrderItem> _items;
  @override
  @JsonKey()
  List<OrderItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  @override
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  @override
  String toString() {
    return 'Order(id: $id, venueId: $venueId, sessionId: $sessionId, tableNumber: $tableNumber, status: $status, totalAmount: $totalAmount, currency: $currency, paymentMethod: $paymentMethod, orderCode: $orderCode, items: $items, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.venueId, venueId) || other.venueId == venueId) &&
            (identical(other.sessionId, sessionId) ||
                other.sessionId == sessionId) &&
            (identical(other.tableNumber, tableNumber) ||
                other.tableNumber == tableNumber) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount) &&
            (identical(other.currency, currency) ||
                other.currency == currency) &&
            (identical(other.paymentMethod, paymentMethod) ||
                other.paymentMethod == paymentMethod) &&
            (identical(other.orderCode, orderCode) ||
                other.orderCode == orderCode) &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      venueId,
      sessionId,
      tableNumber,
      status,
      totalAmount,
      currency,
      paymentMethod,
      orderCode,
      const DeepCollectionEquality().hash(_items),
      createdAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderImplCopyWith<_$OrderImpl> get copyWith =>
      __$$OrderImplCopyWithImpl<_$OrderImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderImplToJson(
      this,
    );
  }
}

abstract class _Order implements Order {
  const factory _Order(
          {required final String id,
          @JsonKey(name: 'venue_id') required final String venueId,
          @JsonKey(name: 'session_id') required final String sessionId,
          @JsonKey(name: 'table_number') final String? tableNumber,
          required final String status,
          @JsonKey(name: 'total_amount') required final double totalAmount,
          @JsonKey(name: 'currency') final String currency,
          @JsonKey(name: 'payment_method') required final String paymentMethod,
          @JsonKey(name: 'order_code') final String? orderCode,
          final List<OrderItem> items,
          @JsonKey(name: 'created_at') required final DateTime createdAt}) =
      _$OrderImpl;

  factory _Order.fromJson(Map<String, dynamic> json) = _$OrderImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'venue_id')
  String get venueId;
  @override
  @JsonKey(name: 'session_id')
  String get sessionId;
  @override
  @JsonKey(name: 'table_number')
  String? get tableNumber;
  @override
  String get status;
  @override // 'placed', 'received', 'served', 'cancelled'
  @JsonKey(name: 'total_amount')
  double get totalAmount;
  @override
  @JsonKey(name: 'currency')
  String get currency;
  @override
  @JsonKey(name: 'payment_method')
  String get paymentMethod;
  @override
  @JsonKey(name: 'order_code')
  String? get orderCode;
  @override
  List<OrderItem> get items;
  @override
  @JsonKey(name: 'created_at')
  DateTime get createdAt;
  @override
  @JsonKey(ignore: true)
  _$$OrderImplCopyWith<_$OrderImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) {
  return _OrderItem.fromJson(json);
}

/// @nodoc
mixin _$OrderItem {
  @JsonKey(name: 'item_id')
  String get itemId => throw _privateConstructorUsedError;
  String get name =>
      throw _privateConstructorUsedError; // Snapshot name in case it changes
  int get quantity => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $OrderItemCopyWith<OrderItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderItemCopyWith<$Res> {
  factory $OrderItemCopyWith(OrderItem value, $Res Function(OrderItem) then) =
      _$OrderItemCopyWithImpl<$Res, OrderItem>;
  @useResult
  $Res call(
      {@JsonKey(name: 'item_id') String itemId,
      String name,
      int quantity,
      double price});
}

/// @nodoc
class _$OrderItemCopyWithImpl<$Res, $Val extends OrderItem>
    implements $OrderItemCopyWith<$Res> {
  _$OrderItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? itemId = null,
    Object? name = null,
    Object? quantity = null,
    Object? price = null,
  }) {
    return _then(_value.copyWith(
      itemId: null == itemId
          ? _value.itemId
          : itemId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$OrderItemImplCopyWith<$Res>
    implements $OrderItemCopyWith<$Res> {
  factory _$$OrderItemImplCopyWith(
          _$OrderItemImpl value, $Res Function(_$OrderItemImpl) then) =
      __$$OrderItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'item_id') String itemId,
      String name,
      int quantity,
      double price});
}

/// @nodoc
class __$$OrderItemImplCopyWithImpl<$Res>
    extends _$OrderItemCopyWithImpl<$Res, _$OrderItemImpl>
    implements _$$OrderItemImplCopyWith<$Res> {
  __$$OrderItemImplCopyWithImpl(
      _$OrderItemImpl _value, $Res Function(_$OrderItemImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? itemId = null,
    Object? name = null,
    Object? quantity = null,
    Object? price = null,
  }) {
    return _then(_$OrderItemImpl(
      itemId: null == itemId
          ? _value.itemId
          : itemId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _value.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderItemImpl implements _OrderItem {
  const _$OrderItemImpl(
      {@JsonKey(name: 'item_id') required this.itemId,
      required this.name,
      required this.quantity,
      required this.price});

  factory _$OrderItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderItemImplFromJson(json);

  @override
  @JsonKey(name: 'item_id')
  final String itemId;
  @override
  final String name;
// Snapshot name in case it changes
  @override
  final int quantity;
  @override
  final double price;

  @override
  String toString() {
    return 'OrderItem(itemId: $itemId, name: $name, quantity: $quantity, price: $price)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderItemImpl &&
            (identical(other.itemId, itemId) || other.itemId == itemId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.price, price) || other.price == price));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, itemId, name, quantity, price);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderItemImplCopyWith<_$OrderItemImpl> get copyWith =>
      __$$OrderItemImplCopyWithImpl<_$OrderItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderItemImplToJson(
      this,
    );
  }
}

abstract class _OrderItem implements OrderItem {
  const factory _OrderItem(
      {@JsonKey(name: 'item_id') required final String itemId,
      required final String name,
      required final int quantity,
      required final double price}) = _$OrderItemImpl;

  factory _OrderItem.fromJson(Map<String, dynamic> json) =
      _$OrderItemImpl.fromJson;

  @override
  @JsonKey(name: 'item_id')
  String get itemId;
  @override
  String get name;
  @override // Snapshot name in case it changes
  int get quantity;
  @override
  double get price;
  @override
  @JsonKey(ignore: true)
  _$$OrderItemImplCopyWith<_$OrderItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
