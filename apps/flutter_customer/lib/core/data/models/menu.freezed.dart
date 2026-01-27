// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'menu.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Menu _$MenuFromJson(Map<String, dynamic> json) {
  return _Menu.fromJson(json);
}

/// @nodoc
mixin _$Menu {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'venue_id')
  String get venueId => throw _privateConstructorUsedError;
  List<Category> get categories => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $MenuCopyWith<Menu> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MenuCopyWith<$Res> {
  factory $MenuCopyWith(Menu value, $Res Function(Menu) then) =
      _$MenuCopyWithImpl<$Res, Menu>;
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'venue_id') String venueId,
      List<Category> categories});
}

/// @nodoc
class _$MenuCopyWithImpl<$Res, $Val extends Menu>
    implements $MenuCopyWith<$Res> {
  _$MenuCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? venueId = null,
    Object? categories = null,
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
      categories: null == categories
          ? _value.categories
          : categories // ignore: cast_nullable_to_non_nullable
              as List<Category>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$MenuImplCopyWith<$Res> implements $MenuCopyWith<$Res> {
  factory _$$MenuImplCopyWith(
          _$MenuImpl value, $Res Function(_$MenuImpl) then) =
      __$$MenuImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'venue_id') String venueId,
      List<Category> categories});
}

/// @nodoc
class __$$MenuImplCopyWithImpl<$Res>
    extends _$MenuCopyWithImpl<$Res, _$MenuImpl>
    implements _$$MenuImplCopyWith<$Res> {
  __$$MenuImplCopyWithImpl(_$MenuImpl _value, $Res Function(_$MenuImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? venueId = null,
    Object? categories = null,
  }) {
    return _then(_$MenuImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      venueId: null == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String,
      categories: null == categories
          ? _value._categories
          : categories // ignore: cast_nullable_to_non_nullable
              as List<Category>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MenuImpl implements _Menu {
  const _$MenuImpl(
      {required this.id,
      @JsonKey(name: 'venue_id') required this.venueId,
      final List<Category> categories = const []})
      : _categories = categories;

  factory _$MenuImpl.fromJson(Map<String, dynamic> json) =>
      _$$MenuImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'venue_id')
  final String venueId;
  final List<Category> _categories;
  @override
  @JsonKey()
  List<Category> get categories {
    if (_categories is EqualUnmodifiableListView) return _categories;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_categories);
  }

  @override
  String toString() {
    return 'Menu(id: $id, venueId: $venueId, categories: $categories)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MenuImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.venueId, venueId) || other.venueId == venueId) &&
            const DeepCollectionEquality()
                .equals(other._categories, _categories));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, venueId,
      const DeepCollectionEquality().hash(_categories));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$MenuImplCopyWith<_$MenuImpl> get copyWith =>
      __$$MenuImplCopyWithImpl<_$MenuImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MenuImplToJson(
      this,
    );
  }
}

abstract class _Menu implements Menu {
  const factory _Menu(
      {required final String id,
      @JsonKey(name: 'venue_id') required final String venueId,
      final List<Category> categories}) = _$MenuImpl;

  factory _Menu.fromJson(Map<String, dynamic> json) = _$MenuImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'venue_id')
  String get venueId;
  @override
  List<Category> get categories;
  @override
  @JsonKey(ignore: true)
  _$$MenuImplCopyWith<_$MenuImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Category _$CategoryFromJson(Map<String, dynamic> json) {
  return _Category.fromJson(json);
}

/// @nodoc
mixin _$Category {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  int get sortOrder => throw _privateConstructorUsedError;
  List<MenuItem> get items => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $CategoryCopyWith<Category> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CategoryCopyWith<$Res> {
  factory $CategoryCopyWith(Category value, $Res Function(Category) then) =
      _$CategoryCopyWithImpl<$Res, Category>;
  @useResult
  $Res call({String id, String name, int sortOrder, List<MenuItem> items});
}

/// @nodoc
class _$CategoryCopyWithImpl<$Res, $Val extends Category>
    implements $CategoryCopyWith<$Res> {
  _$CategoryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? sortOrder = null,
    Object? items = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      sortOrder: null == sortOrder
          ? _value.sortOrder
          : sortOrder // ignore: cast_nullable_to_non_nullable
              as int,
      items: null == items
          ? _value.items
          : items // ignore: cast_nullable_to_non_nullable
              as List<MenuItem>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CategoryImplCopyWith<$Res>
    implements $CategoryCopyWith<$Res> {
  factory _$$CategoryImplCopyWith(
          _$CategoryImpl value, $Res Function(_$CategoryImpl) then) =
      __$$CategoryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String name, int sortOrder, List<MenuItem> items});
}

/// @nodoc
class __$$CategoryImplCopyWithImpl<$Res>
    extends _$CategoryCopyWithImpl<$Res, _$CategoryImpl>
    implements _$$CategoryImplCopyWith<$Res> {
  __$$CategoryImplCopyWithImpl(
      _$CategoryImpl _value, $Res Function(_$CategoryImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? sortOrder = null,
    Object? items = null,
  }) {
    return _then(_$CategoryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      sortOrder: null == sortOrder
          ? _value.sortOrder
          : sortOrder // ignore: cast_nullable_to_non_nullable
              as int,
      items: null == items
          ? _value._items
          : items // ignore: cast_nullable_to_non_nullable
              as List<MenuItem>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CategoryImpl implements _Category {
  const _$CategoryImpl(
      {required this.id,
      required this.name,
      this.sortOrder = 0,
      final List<MenuItem> items = const []})
      : _items = items;

  factory _$CategoryImpl.fromJson(Map<String, dynamic> json) =>
      _$$CategoryImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey()
  final int sortOrder;
  final List<MenuItem> _items;
  @override
  @JsonKey()
  List<MenuItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $name, sortOrder: $sortOrder, items: $items)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CategoryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.sortOrder, sortOrder) ||
                other.sortOrder == sortOrder) &&
            const DeepCollectionEquality().equals(other._items, _items));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, sortOrder,
      const DeepCollectionEquality().hash(_items));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$CategoryImplCopyWith<_$CategoryImpl> get copyWith =>
      __$$CategoryImplCopyWithImpl<_$CategoryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CategoryImplToJson(
      this,
    );
  }
}

abstract class _Category implements Category {
  const factory _Category(
      {required final String id,
      required final String name,
      final int sortOrder,
      final List<MenuItem> items}) = _$CategoryImpl;

  factory _Category.fromJson(Map<String, dynamic> json) =
      _$CategoryImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  int get sortOrder;
  @override
  List<MenuItem> get items;
  @override
  @JsonKey(ignore: true)
  _$$CategoryImplCopyWith<_$CategoryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MenuItem _$MenuItemFromJson(Map<String, dynamic> json) {
  return _MenuItem.fromJson(json);
}

/// @nodoc
mixin _$MenuItem {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;
  @JsonKey(name: 'image_url')
  String? get imageUrl => throw _privateConstructorUsedError;
  List<String> get tags =>
      throw _privateConstructorUsedError; // e.g., 'spicy', 'vegan'
  @JsonKey(name: 'is_available')
  bool get isAvailable => throw _privateConstructorUsedError;
  List<ItemModifier> get modifiers => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $MenuItemCopyWith<MenuItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MenuItemCopyWith<$Res> {
  factory $MenuItemCopyWith(MenuItem value, $Res Function(MenuItem) then) =
      _$MenuItemCopyWithImpl<$Res, MenuItem>;
  @useResult
  $Res call(
      {String id,
      String name,
      String? description,
      double price,
      @JsonKey(name: 'image_url') String? imageUrl,
      List<String> tags,
      @JsonKey(name: 'is_available') bool isAvailable,
      List<ItemModifier> modifiers});
}

/// @nodoc
class _$MenuItemCopyWithImpl<$Res, $Val extends MenuItem>
    implements $MenuItemCopyWith<$Res> {
  _$MenuItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = freezed,
    Object? price = null,
    Object? imageUrl = freezed,
    Object? tags = null,
    Object? isAvailable = null,
    Object? modifiers = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: null == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      isAvailable: null == isAvailable
          ? _value.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool,
      modifiers: null == modifiers
          ? _value.modifiers
          : modifiers // ignore: cast_nullable_to_non_nullable
              as List<ItemModifier>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$MenuItemImplCopyWith<$Res>
    implements $MenuItemCopyWith<$Res> {
  factory _$$MenuItemImplCopyWith(
          _$MenuItemImpl value, $Res Function(_$MenuItemImpl) then) =
      __$$MenuItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String? description,
      double price,
      @JsonKey(name: 'image_url') String? imageUrl,
      List<String> tags,
      @JsonKey(name: 'is_available') bool isAvailable,
      List<ItemModifier> modifiers});
}

/// @nodoc
class __$$MenuItemImplCopyWithImpl<$Res>
    extends _$MenuItemCopyWithImpl<$Res, _$MenuItemImpl>
    implements _$$MenuItemImplCopyWith<$Res> {
  __$$MenuItemImplCopyWithImpl(
      _$MenuItemImpl _value, $Res Function(_$MenuItemImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = freezed,
    Object? price = null,
    Object? imageUrl = freezed,
    Object? tags = null,
    Object? isAvailable = null,
    Object? modifiers = null,
  }) {
    return _then(_$MenuItemImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: null == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      isAvailable: null == isAvailable
          ? _value.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool,
      modifiers: null == modifiers
          ? _value._modifiers
          : modifiers // ignore: cast_nullable_to_non_nullable
              as List<ItemModifier>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MenuItemImpl implements _MenuItem {
  const _$MenuItemImpl(
      {required this.id,
      required this.name,
      this.description,
      required this.price,
      @JsonKey(name: 'image_url') this.imageUrl,
      final List<String> tags = const [],
      @JsonKey(name: 'is_available') this.isAvailable = true,
      final List<ItemModifier> modifiers = const []})
      : _tags = tags,
        _modifiers = modifiers;

  factory _$MenuItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$MenuItemImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? description;
  @override
  final double price;
  @override
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

// e.g., 'spicy', 'vegan'
  @override
  @JsonKey(name: 'is_available')
  final bool isAvailable;
  final List<ItemModifier> _modifiers;
  @override
  @JsonKey()
  List<ItemModifier> get modifiers {
    if (_modifiers is EqualUnmodifiableListView) return _modifiers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_modifiers);
  }

  @override
  String toString() {
    return 'MenuItem(id: $id, name: $name, description: $description, price: $price, imageUrl: $imageUrl, tags: $tags, isAvailable: $isAvailable, modifiers: $modifiers)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MenuItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.isAvailable, isAvailable) ||
                other.isAvailable == isAvailable) &&
            const DeepCollectionEquality()
                .equals(other._modifiers, _modifiers));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      price,
      imageUrl,
      const DeepCollectionEquality().hash(_tags),
      isAvailable,
      const DeepCollectionEquality().hash(_modifiers));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$MenuItemImplCopyWith<_$MenuItemImpl> get copyWith =>
      __$$MenuItemImplCopyWithImpl<_$MenuItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MenuItemImplToJson(
      this,
    );
  }
}

abstract class _MenuItem implements MenuItem {
  const factory _MenuItem(
      {required final String id,
      required final String name,
      final String? description,
      required final double price,
      @JsonKey(name: 'image_url') final String? imageUrl,
      final List<String> tags,
      @JsonKey(name: 'is_available') final bool isAvailable,
      final List<ItemModifier> modifiers}) = _$MenuItemImpl;

  factory _MenuItem.fromJson(Map<String, dynamic> json) =
      _$MenuItemImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String? get description;
  @override
  double get price;
  @override
  @JsonKey(name: 'image_url')
  String? get imageUrl;
  @override
  List<String> get tags;
  @override // e.g., 'spicy', 'vegan'
  @JsonKey(name: 'is_available')
  bool get isAvailable;
  @override
  List<ItemModifier> get modifiers;
  @override
  @JsonKey(ignore: true)
  _$$MenuItemImplCopyWith<_$MenuItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ItemModifier _$ItemModifierFromJson(Map<String, dynamic> json) {
  return _ItemModifier.fromJson(json);
}

/// @nodoc
mixin _$ItemModifier {
  String get id => throw _privateConstructorUsedError;
  String get name =>
      throw _privateConstructorUsedError; // e.g., "Size", "Extras", "Remove ingredients"
  bool get required =>
      throw _privateConstructorUsedError; // Must select at least one?
  @JsonKey(name: 'allow_multiple')
  bool get allowMultiple =>
      throw _privateConstructorUsedError; // Can select multiple?
  @JsonKey(name: 'max_selections')
  int get maxSelections => throw _privateConstructorUsedError;
  List<ModifierOption> get options => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ItemModifierCopyWith<ItemModifier> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ItemModifierCopyWith<$Res> {
  factory $ItemModifierCopyWith(
          ItemModifier value, $Res Function(ItemModifier) then) =
      _$ItemModifierCopyWithImpl<$Res, ItemModifier>;
  @useResult
  $Res call(
      {String id,
      String name,
      bool required,
      @JsonKey(name: 'allow_multiple') bool allowMultiple,
      @JsonKey(name: 'max_selections') int maxSelections,
      List<ModifierOption> options});
}

/// @nodoc
class _$ItemModifierCopyWithImpl<$Res, $Val extends ItemModifier>
    implements $ItemModifierCopyWith<$Res> {
  _$ItemModifierCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? required = null,
    Object? allowMultiple = null,
    Object? maxSelections = null,
    Object? options = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      required: null == required
          ? _value.required
          : required // ignore: cast_nullable_to_non_nullable
              as bool,
      allowMultiple: null == allowMultiple
          ? _value.allowMultiple
          : allowMultiple // ignore: cast_nullable_to_non_nullable
              as bool,
      maxSelections: null == maxSelections
          ? _value.maxSelections
          : maxSelections // ignore: cast_nullable_to_non_nullable
              as int,
      options: null == options
          ? _value.options
          : options // ignore: cast_nullable_to_non_nullable
              as List<ModifierOption>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ItemModifierImplCopyWith<$Res>
    implements $ItemModifierCopyWith<$Res> {
  factory _$$ItemModifierImplCopyWith(
          _$ItemModifierImpl value, $Res Function(_$ItemModifierImpl) then) =
      __$$ItemModifierImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      bool required,
      @JsonKey(name: 'allow_multiple') bool allowMultiple,
      @JsonKey(name: 'max_selections') int maxSelections,
      List<ModifierOption> options});
}

/// @nodoc
class __$$ItemModifierImplCopyWithImpl<$Res>
    extends _$ItemModifierCopyWithImpl<$Res, _$ItemModifierImpl>
    implements _$$ItemModifierImplCopyWith<$Res> {
  __$$ItemModifierImplCopyWithImpl(
      _$ItemModifierImpl _value, $Res Function(_$ItemModifierImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? required = null,
    Object? allowMultiple = null,
    Object? maxSelections = null,
    Object? options = null,
  }) {
    return _then(_$ItemModifierImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      required: null == required
          ? _value.required
          : required // ignore: cast_nullable_to_non_nullable
              as bool,
      allowMultiple: null == allowMultiple
          ? _value.allowMultiple
          : allowMultiple // ignore: cast_nullable_to_non_nullable
              as bool,
      maxSelections: null == maxSelections
          ? _value.maxSelections
          : maxSelections // ignore: cast_nullable_to_non_nullable
              as int,
      options: null == options
          ? _value._options
          : options // ignore: cast_nullable_to_non_nullable
              as List<ModifierOption>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ItemModifierImpl implements _ItemModifier {
  const _$ItemModifierImpl(
      {required this.id,
      required this.name,
      this.required = false,
      @JsonKey(name: 'allow_multiple') this.allowMultiple = false,
      @JsonKey(name: 'max_selections') this.maxSelections = 1,
      final List<ModifierOption> options = const []})
      : _options = options;

  factory _$ItemModifierImpl.fromJson(Map<String, dynamic> json) =>
      _$$ItemModifierImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
// e.g., "Size", "Extras", "Remove ingredients"
  @override
  @JsonKey()
  final bool required;
// Must select at least one?
  @override
  @JsonKey(name: 'allow_multiple')
  final bool allowMultiple;
// Can select multiple?
  @override
  @JsonKey(name: 'max_selections')
  final int maxSelections;
  final List<ModifierOption> _options;
  @override
  @JsonKey()
  List<ModifierOption> get options {
    if (_options is EqualUnmodifiableListView) return _options;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_options);
  }

  @override
  String toString() {
    return 'ItemModifier(id: $id, name: $name, required: $required, allowMultiple: $allowMultiple, maxSelections: $maxSelections, options: $options)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ItemModifierImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.required, required) ||
                other.required == required) &&
            (identical(other.allowMultiple, allowMultiple) ||
                other.allowMultiple == allowMultiple) &&
            (identical(other.maxSelections, maxSelections) ||
                other.maxSelections == maxSelections) &&
            const DeepCollectionEquality().equals(other._options, _options));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      required,
      allowMultiple,
      maxSelections,
      const DeepCollectionEquality().hash(_options));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ItemModifierImplCopyWith<_$ItemModifierImpl> get copyWith =>
      __$$ItemModifierImplCopyWithImpl<_$ItemModifierImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ItemModifierImplToJson(
      this,
    );
  }
}

abstract class _ItemModifier implements ItemModifier {
  const factory _ItemModifier(
      {required final String id,
      required final String name,
      final bool required,
      @JsonKey(name: 'allow_multiple') final bool allowMultiple,
      @JsonKey(name: 'max_selections') final int maxSelections,
      final List<ModifierOption> options}) = _$ItemModifierImpl;

  factory _ItemModifier.fromJson(Map<String, dynamic> json) =
      _$ItemModifierImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override // e.g., "Size", "Extras", "Remove ingredients"
  bool get required;
  @override // Must select at least one?
  @JsonKey(name: 'allow_multiple')
  bool get allowMultiple;
  @override // Can select multiple?
  @JsonKey(name: 'max_selections')
  int get maxSelections;
  @override
  List<ModifierOption> get options;
  @override
  @JsonKey(ignore: true)
  _$$ItemModifierImplCopyWith<_$ItemModifierImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ModifierOption _$ModifierOptionFromJson(Map<String, dynamic> json) {
  return _ModifierOption.fromJson(json);
}

/// @nodoc
mixin _$ModifierOption {
  String get id => throw _privateConstructorUsedError;
  String get name =>
      throw _privateConstructorUsedError; // e.g., "Small", "Large", "Extra cheese"
  @JsonKey(name: 'price_adjustment')
  double get priceAdjustment => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_available')
  bool get isAvailable => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ModifierOptionCopyWith<ModifierOption> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ModifierOptionCopyWith<$Res> {
  factory $ModifierOptionCopyWith(
          ModifierOption value, $Res Function(ModifierOption) then) =
      _$ModifierOptionCopyWithImpl<$Res, ModifierOption>;
  @useResult
  $Res call(
      {String id,
      String name,
      @JsonKey(name: 'price_adjustment') double priceAdjustment,
      @JsonKey(name: 'is_available') bool isAvailable});
}

/// @nodoc
class _$ModifierOptionCopyWithImpl<$Res, $Val extends ModifierOption>
    implements $ModifierOptionCopyWith<$Res> {
  _$ModifierOptionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? priceAdjustment = null,
    Object? isAvailable = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      priceAdjustment: null == priceAdjustment
          ? _value.priceAdjustment
          : priceAdjustment // ignore: cast_nullable_to_non_nullable
              as double,
      isAvailable: null == isAvailable
          ? _value.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ModifierOptionImplCopyWith<$Res>
    implements $ModifierOptionCopyWith<$Res> {
  factory _$$ModifierOptionImplCopyWith(_$ModifierOptionImpl value,
          $Res Function(_$ModifierOptionImpl) then) =
      __$$ModifierOptionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      @JsonKey(name: 'price_adjustment') double priceAdjustment,
      @JsonKey(name: 'is_available') bool isAvailable});
}

/// @nodoc
class __$$ModifierOptionImplCopyWithImpl<$Res>
    extends _$ModifierOptionCopyWithImpl<$Res, _$ModifierOptionImpl>
    implements _$$ModifierOptionImplCopyWith<$Res> {
  __$$ModifierOptionImplCopyWithImpl(
      _$ModifierOptionImpl _value, $Res Function(_$ModifierOptionImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? priceAdjustment = null,
    Object? isAvailable = null,
  }) {
    return _then(_$ModifierOptionImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      priceAdjustment: null == priceAdjustment
          ? _value.priceAdjustment
          : priceAdjustment // ignore: cast_nullable_to_non_nullable
              as double,
      isAvailable: null == isAvailable
          ? _value.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ModifierOptionImpl implements _ModifierOption {
  const _$ModifierOptionImpl(
      {required this.id,
      required this.name,
      @JsonKey(name: 'price_adjustment') this.priceAdjustment = 0.0,
      @JsonKey(name: 'is_available') this.isAvailable = true});

  factory _$ModifierOptionImpl.fromJson(Map<String, dynamic> json) =>
      _$$ModifierOptionImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
// e.g., "Small", "Large", "Extra cheese"
  @override
  @JsonKey(name: 'price_adjustment')
  final double priceAdjustment;
  @override
  @JsonKey(name: 'is_available')
  final bool isAvailable;

  @override
  String toString() {
    return 'ModifierOption(id: $id, name: $name, priceAdjustment: $priceAdjustment, isAvailable: $isAvailable)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ModifierOptionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.priceAdjustment, priceAdjustment) ||
                other.priceAdjustment == priceAdjustment) &&
            (identical(other.isAvailable, isAvailable) ||
                other.isAvailable == isAvailable));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, name, priceAdjustment, isAvailable);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ModifierOptionImplCopyWith<_$ModifierOptionImpl> get copyWith =>
      __$$ModifierOptionImplCopyWithImpl<_$ModifierOptionImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ModifierOptionImplToJson(
      this,
    );
  }
}

abstract class _ModifierOption implements ModifierOption {
  const factory _ModifierOption(
          {required final String id,
          required final String name,
          @JsonKey(name: 'price_adjustment') final double priceAdjustment,
          @JsonKey(name: 'is_available') final bool isAvailable}) =
      _$ModifierOptionImpl;

  factory _ModifierOption.fromJson(Map<String, dynamic> json) =
      _$ModifierOptionImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override // e.g., "Small", "Large", "Extra cheese"
  @JsonKey(name: 'price_adjustment')
  double get priceAdjustment;
  @override
  @JsonKey(name: 'is_available')
  bool get isAvailable;
  @override
  @JsonKey(ignore: true)
  _$$ModifierOptionImplCopyWith<_$ModifierOptionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
