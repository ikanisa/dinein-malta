import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/data/models/menu.dart';
import '../models/cart_item.dart';

// State
class CartState {
  final List<CartItem> items;
  final String? venueId; // Cart is scoped to one venue
  final String currencyCode;

  const CartState({
    this.items = const [],
    this.venueId,
    this.currencyCode = 'EUR',
  });

  double get total => items.fold(0, (sum, item) => sum + item.total);
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  CartState copyWith({
    List<CartItem>? items,
    String? venueId,
    String? currencyCode,
  }) {
    return CartState(
      items: items ?? this.items,
      venueId: venueId ?? this.venueId,
      currencyCode: currencyCode ?? this.currencyCode,
    );
  }
}

// Notifier
class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  void addItem(MenuItem item, String venueId, {String? currencyCode}) {
    // If adding from a different venue, clear cart first
    if (state.venueId != null && state.venueId != venueId) {
      clear();
    }

    final existingIndex = state.items.indexWhere((i) => i.menuItem.id == item.id);
    List<CartItem> newItems;

    if (existingIndex != -1) {
      // Increment quantity
      final existingItem = state.items[existingIndex];
      newItems = List.from(state.items);
      newItems[existingIndex] = existingItem.copyWith(quantity: existingItem.quantity + 1);
    } else {
      // Add new item
      newItems = [...state.items, CartItem(menuItem: item)];
    }

    state = state.copyWith(
      items: newItems,
      venueId: venueId,
      currencyCode: currencyCode ?? state.currencyCode,
    );
  }

  void removeItem(MenuItem item) {
    final existingIndex = state.items.indexWhere((i) => i.menuItem.id == item.id);
    if (existingIndex == -1) return;

    final existingItem = state.items[existingIndex];
    List<CartItem> newItems = List.from(state.items);

    if (existingItem.quantity > 1) {
      newItems[existingIndex] = existingItem.copyWith(quantity: existingItem.quantity - 1);
      state = state.copyWith(items: newItems);
    } else {
      newItems.removeAt(existingIndex);
      // If empty, clear venue scope too
      state = CartState(
        items: newItems, 
        venueId: newItems.isEmpty ? null : state.venueId,
        currencyCode: newItems.isEmpty ? 'EUR' : state.currencyCode,
      );
    }
  }

  void clear() {
    state = const CartState();
  }
}

// Provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
