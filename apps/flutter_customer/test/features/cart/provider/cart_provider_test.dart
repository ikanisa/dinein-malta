import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_customer/features/cart/provider/cart_provider.dart';
import 'package:flutter_customer/core/data/models/menu.dart';
// We need concrete MenuItem instance.
// Assuming we can instantiate MenuItem.

void main() {
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() {
    container.dispose();
  });

  // Helper to create dummy item
  MenuItem createItem(String id, String name, double price) {
    return MenuItem(
      id: id,
      name: name,
      price: price,
      isAvailable: true,
    );
  }

  test('addItem adds item to cart', () {
    final notifier = container.read(cartProvider.notifier);
    final item = createItem('1', 'Burger', 10.0);

    notifier.addItem(item, 'venue1');

    final state = container.read(cartProvider);
    expect(state.items.length, 1);
    expect(state.items.first.quantity, 1);
    expect(state.total, 10.0);
    expect(state.venueId, 'venue1');
  });

  test('addItem increments quantity if exists', () {
    final notifier = container.read(cartProvider.notifier);
    final item = createItem('1', 'Burger', 10.0);

    notifier.addItem(item, 'venue1');
    notifier.addItem(item, 'venue1');

    final state = container.read(cartProvider);
    expect(state.items.length, 1);
    expect(state.items.first.quantity, 2);
    expect(state.total, 20.0);
  });

  test('addItem clears cart if venue changes', () {
    final notifier = container.read(cartProvider.notifier);
    final item1 = createItem('1', 'Burger', 10.0);
    final item2 = createItem('2', 'Pasta', 12.0);

    notifier.addItem(item1, 'venue1');
    notifier.addItem(item2, 'venue2'); // Different venue

    final state = container.read(cartProvider);
    expect(state.venueId, 'venue2');
    expect(state.items.length, 1);
    expect(state.items.first.menuItem.id, '2'); // Only Pasta remains
  });

  test('removeItem decrements quantity or removes', () {
    final notifier = container.read(cartProvider.notifier);
    final item = createItem('1', 'Burger', 10.0);

    notifier.addItem(item, 'venue1');
    notifier.addItem(item, 'venue1'); // Qty 2

    notifier.removeItem(item);
    var state = container.read(cartProvider);
    expect(state.items.first.quantity, 1);

    notifier.removeItem(item);
    state = container.read(cartProvider);
    expect(state.items.isEmpty, true);
    expect(state.venueId, null); // Optional check
  });
}
