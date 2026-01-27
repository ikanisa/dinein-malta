import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../core/data/models/menu.dart';

part 'cart_item.freezed.dart';
part 'cart_item.g.dart';

@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    required MenuItem menuItem,
    @Default(1) int quantity,
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);
}

extension CartItemTotal on CartItem {
  double get total => menuItem.price * quantity;
}
