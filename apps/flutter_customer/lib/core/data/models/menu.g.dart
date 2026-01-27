// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'menu.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MenuImpl _$$MenuImplFromJson(Map<String, dynamic> json) => _$MenuImpl(
      id: json['id'] as String,
      venueId: json['venue_id'] as String,
      categories: (json['categories'] as List<dynamic>?)
              ?.map((e) => Category.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$MenuImplToJson(_$MenuImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'venue_id': instance.venueId,
      'categories': instance.categories,
    };

_$CategoryImpl _$$CategoryImplFromJson(Map<String, dynamic> json) =>
    _$CategoryImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => MenuItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$CategoryImplToJson(_$CategoryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'sortOrder': instance.sortOrder,
      'items': instance.items,
    };

_$MenuItemImpl _$$MenuItemImplFromJson(Map<String, dynamic> json) =>
    _$MenuItemImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['image_url'] as String?,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      isAvailable: json['is_available'] as bool? ?? true,
      modifiers: (json['modifiers'] as List<dynamic>?)
              ?.map((e) => ItemModifier.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$MenuItemImplToJson(_$MenuItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'price': instance.price,
      'image_url': instance.imageUrl,
      'tags': instance.tags,
      'is_available': instance.isAvailable,
      'modifiers': instance.modifiers,
    };

_$ItemModifierImpl _$$ItemModifierImplFromJson(Map<String, dynamic> json) =>
    _$ItemModifierImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      required: json['required'] as bool? ?? false,
      allowMultiple: json['allow_multiple'] as bool? ?? false,
      maxSelections: (json['max_selections'] as num?)?.toInt() ?? 1,
      options: (json['options'] as List<dynamic>?)
              ?.map((e) => ModifierOption.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$ItemModifierImplToJson(_$ItemModifierImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'required': instance.required,
      'allow_multiple': instance.allowMultiple,
      'max_selections': instance.maxSelections,
      'options': instance.options,
    };

_$ModifierOptionImpl _$$ModifierOptionImplFromJson(Map<String, dynamic> json) =>
    _$ModifierOptionImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      priceAdjustment: (json['price_adjustment'] as num?)?.toDouble() ?? 0.0,
      isAvailable: json['is_available'] as bool? ?? true,
    );

Map<String, dynamic> _$$ModifierOptionImplToJson(
        _$ModifierOptionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'price_adjustment': instance.priceAdjustment,
      'is_available': instance.isAvailable,
    };
