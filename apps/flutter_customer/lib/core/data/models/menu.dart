import 'package:freezed_annotation/freezed_annotation.dart';

part 'menu.freezed.dart';
part 'menu.g.dart';

@freezed
class Menu with _$Menu {
  const factory Menu({
    required String id,
    @JsonKey(name: 'venue_id') required String venueId,
    @Default([]) List<Category> categories,
  }) = _Menu;

  factory Menu.fromJson(Map<String, dynamic> json) => _$MenuFromJson(json);
}

@freezed
class Category with _$Category {
  const factory Category({
    required String id,
    required String name,
    @Default(0) int sortOrder,
    @Default([]) List<MenuItem> items,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) =>
      _$CategoryFromJson(json);
}

@freezed
class MenuItem with _$MenuItem {
  const factory MenuItem({
    required String id,
    required String name,
    String? description,
    required double price,
    @JsonKey(name: 'image_url') String? imageUrl,
    @Default([]) List<String> tags, // e.g., 'spicy', 'vegan'
    @Default([]) List<String> allergens, // e.g., 'gluten', 'nuts', 'dairy'
    @Default([]) @JsonKey(name: 'dietary_info') List<String> dietaryInfo, // e.g., 'vegan', 'vegetarian', 'gluten-free'
    @Default(true) @JsonKey(name: 'is_available') bool isAvailable,
    @Default(false) @JsonKey(name: 'is_popular') bool isPopular,
    @Default(false) @JsonKey(name: 'is_recommended') bool isRecommended,
    @Default([]) List<ItemModifier> modifiers,
  }) = _MenuItem;

  factory MenuItem.fromJson(Map<String, dynamic> json) =>
      _$MenuItemFromJson(json);
}

/// A modifier group for a menu item (e.g., "Size", "Add-ons", "Remove")
@freezed
class ItemModifier with _$ItemModifier {
  const factory ItemModifier({
    required String id,
    required String name, // e.g., "Size", "Extras", "Remove ingredients"
    @Default(false) bool required, // Must select at least one?
    @Default(false) @JsonKey(name: 'allow_multiple') bool allowMultiple, // Can select multiple?
    @Default(1) @JsonKey(name: 'max_selections') int maxSelections,
    @Default([]) List<ModifierOption> options,
  }) = _ItemModifier;

  factory ItemModifier.fromJson(Map<String, dynamic> json) =>
      _$ItemModifierFromJson(json);
}

/// A single option within a modifier group
@freezed
class ModifierOption with _$ModifierOption {
  const factory ModifierOption({
    required String id,
    required String name, // e.g., "Small", "Large", "Extra cheese"
    @Default(0.0) @JsonKey(name: 'price_adjustment') double priceAdjustment,
    @Default(true) @JsonKey(name: 'is_available') bool isAvailable,
  }) = _ModifierOption;

  factory ModifierOption.fromJson(Map<String, dynamic> json) =>
      _$ModifierOptionFromJson(json);
}
