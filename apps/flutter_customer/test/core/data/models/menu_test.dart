import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_customer/core/data/models/menu.dart';

void main() {
  group('MenuItem Model', () {
    test('creates MenuItem with required fields', () {
      final item = MenuItem(
        id: 'item-123',
        name: 'Margherita Pizza',
        price: 12.99,
      );

      expect(item.id, 'item-123');
      expect(item.name, 'Margherita Pizza');
      expect(item.price, 12.99);
      expect(item.isAvailable, true); // Default
    });

    test('creates MenuItem with all optional fields', () {
      final item = MenuItem(
        id: 'item-456',
        name: 'Veggie Burger',
        price: 14.50,
        description: 'Delicious plant-based burger',
        imageUrl: 'https://example.com/burger.jpg',
        tags: ['vegetarian', 'popular'],
        allergens: ['gluten', 'soy'],
        dietaryInfo: ['vegetarian', 'dairy-free'],
        isAvailable: true,
        isPopular: true,
        isRecommended: false,
      );

      expect(item.description, 'Delicious plant-based burger');
      expect(item.imageUrl, 'https://example.com/burger.jpg');
      expect(item.tags, ['vegetarian', 'popular']);
      expect(item.allergens, ['gluten', 'soy']);
      expect(item.dietaryInfo, ['vegetarian', 'dairy-free']);
      expect(item.isPopular, true);
      expect(item.isRecommended, false);
    });

    test('handles unavailable items', () {
      final item = MenuItem(
        id: 'item-789',
        name: 'Seasonal Salad',
        price: 9.99,
        isAvailable: false,
      );

      expect(item.isAvailable, false);
    });

    test('defaults lists to empty', () {
      final item = MenuItem(
        id: 'item-999',
        name: 'Simple Dish',
        price: 8.00,
      );

      expect(item.tags, isEmpty);
      expect(item.allergens, isEmpty);
      expect(item.dietaryInfo, isEmpty);
      expect(item.modifiers, isEmpty);
    });

    test('defaults isPopular and isRecommended to false', () {
      final item = MenuItem(
        id: 'item-888',
        name: 'Regular Item',
        price: 7.50,
      );

      expect(item.isPopular, false);
      expect(item.isRecommended, false);
    });
  });

  group('Menu Model', () {
    test('creates Menu with categories', () {
      final categories = [
        Category(
          id: 'cat-1',
          name: 'Appetizers',
          sortOrder: 1,
          items: [
            MenuItem(id: 'item-1', name: 'Spring Rolls', price: 8.00),
          ],
        ),
        Category(
          id: 'cat-2',
          name: 'Mains',
          sortOrder: 2,
          items: [
            MenuItem(id: 'item-2', name: 'Pasta', price: 15.00),
          ],
        ),
      ];

      final menu = Menu(
        id: 'menu-123',
        venueId: 'venue-456',
        categories: categories,
      );

      expect(menu.id, 'menu-123');
      expect(menu.venueId, 'venue-456');
      expect(menu.categories.length, 2);
      expect(menu.categories[0].name, 'Appetizers');
      expect(menu.categories[0].items.length, 1);
    });

    test('creates empty Menu', () {
      final menu = Menu(
        id: 'menu-empty',
        venueId: 'venue-789',
      );

      expect(menu.categories, isEmpty);
    });
  });

  group('Category Model', () {
    test('creates Category correctly', () {
      final category = Category(
        id: 'cat-1',
        name: 'Appetizers',
        sortOrder: 1,
      );

      expect(category.id, 'cat-1');
      expect(category.name, 'Appetizers');
      expect(category.sortOrder, 1);
      expect(category.items, isEmpty); // Default
    });

    test('creates Category with items', () {
      final items = [
        MenuItem(id: 'i1', name: 'Soup', price: 6.00),
        MenuItem(id: 'i2', name: 'Salad', price: 7.50),
      ];

      final category = Category(
        id: 'cat-2',
        name: 'Starters',
        sortOrder: 0,
        items: items,
      );

      expect(category.items.length, 2);
    });
  });

  group('ItemModifier Model', () {
    test('creates ItemModifier with options', () {
      final options = [
        ModifierOption(id: 'opt-1', name: 'Small', priceAdjustment: -2.00),
        ModifierOption(id: 'opt-2', name: 'Large', priceAdjustment: 3.00),
      ];

      final modifier = ItemModifier(
        id: 'mod-1',
        name: 'Size',
        required: true,
        allowMultiple: false,
        maxSelections: 1,
        options: options,
      );

      expect(modifier.id, 'mod-1');
      expect(modifier.name, 'Size');
      expect(modifier.required, true);
      expect(modifier.allowMultiple, false);
      expect(modifier.maxSelections, 1);
      expect(modifier.options.length, 2);
    });
  });

  group('ModifierOption Model', () {
    test('creates ModifierOption correctly', () {
      final option = ModifierOption(
        id: 'opt-1',
        name: 'Extra Cheese',
        priceAdjustment: 1.50,
        isAvailable: true,
      );

      expect(option.id, 'opt-1');
      expect(option.name, 'Extra Cheese');
      expect(option.priceAdjustment, 1.50);
      expect(option.isAvailable, true);
    });

    test('defaults priceAdjustment to 0', () {
      final option = ModifierOption(
        id: 'opt-2',
        name: 'No Onions',
      );

      expect(option.priceAdjustment, 0.0);
    });
  });
}
