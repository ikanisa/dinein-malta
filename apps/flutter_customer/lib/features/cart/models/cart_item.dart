import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../core/data/models/menu.dart';

part 'cart_item.freezed.dart';
part 'cart_item.g.dart';

@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    required MenuItem menuItem,
    @Default(1) int quantity,
    String? notes, // Special instructions
    @Default([]) List<String> selectedModifiers, // Display names of selected modifiers
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) =>
      _$CartItemFromJson(json);
}

extension CartItemTotal on CartItem {
  double get total => menuItem.price * quantity;

  /// Unique key for identifying cart items with different modifier combinations
  String get uniqueKey {
    final modifiersKey = selectedModifiers.join('|');
    return '${menuItem.id}:$modifiersKey:${notes ?? ''}';
  }
}
