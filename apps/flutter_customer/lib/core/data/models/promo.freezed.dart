// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'promo.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Promo _$PromoFromJson(Map<String, dynamic> json) {
  return _Promo.fromJson(json);
}

/// @nodoc
mixin _$Promo {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  @JsonKey(name: 'body')
  String? get description => throw _privateConstructorUsedError;
  @JsonKey(name: 'venue_id')
  String? get venueId =>
      throw _privateConstructorUsedError; // Optional: if null, it's a platform promo
  @JsonKey(name: 'image_url')
  String? get imageUrl => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_active')
  bool get isActive => throw _privateConstructorUsedError;
  @JsonKey(name: 'country')
  String? get country => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $PromoCopyWith<Promo> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PromoCopyWith<$Res> {
  factory $PromoCopyWith(Promo value, $Res Function(Promo) then) =
      _$PromoCopyWithImpl<$Res, Promo>;
  @useResult
  $Res call(
      {String id,
      String title,
      @JsonKey(name: 'body') String? description,
      @JsonKey(name: 'venue_id') String? venueId,
      @JsonKey(name: 'image_url') String? imageUrl,
      List<String> tags,
      @JsonKey(name: 'is_active') bool isActive,
      @JsonKey(name: 'country') String? country});
}

/// @nodoc
class _$PromoCopyWithImpl<$Res, $Val extends Promo>
    implements $PromoCopyWith<$Res> {
  _$PromoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = freezed,
    Object? venueId = freezed,
    Object? imageUrl = freezed,
    Object? tags = null,
    Object? isActive = null,
    Object? country = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      venueId: freezed == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: null == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      isActive: null == isActive
          ? _value.isActive
          : isActive // ignore: cast_nullable_to_non_nullable
              as bool,
      country: freezed == country
          ? _value.country
          : country // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PromoImplCopyWith<$Res> implements $PromoCopyWith<$Res> {
  factory _$$PromoImplCopyWith(
          _$PromoImpl value, $Res Function(_$PromoImpl) then) =
      __$$PromoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String title,
      @JsonKey(name: 'body') String? description,
      @JsonKey(name: 'venue_id') String? venueId,
      @JsonKey(name: 'image_url') String? imageUrl,
      List<String> tags,
      @JsonKey(name: 'is_active') bool isActive,
      @JsonKey(name: 'country') String? country});
}

/// @nodoc
class __$$PromoImplCopyWithImpl<$Res>
    extends _$PromoCopyWithImpl<$Res, _$PromoImpl>
    implements _$$PromoImplCopyWith<$Res> {
  __$$PromoImplCopyWithImpl(
      _$PromoImpl _value, $Res Function(_$PromoImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = freezed,
    Object? venueId = freezed,
    Object? imageUrl = freezed,
    Object? tags = null,
    Object? isActive = null,
    Object? country = freezed,
  }) {
    return _then(_$PromoImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      venueId: freezed == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: null == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      isActive: null == isActive
          ? _value.isActive
          : isActive // ignore: cast_nullable_to_non_nullable
              as bool,
      country: freezed == country
          ? _value.country
          : country // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PromoImpl implements _Promo {
  const _$PromoImpl(
      {required this.id,
      required this.title,
      @JsonKey(name: 'body') this.description,
      @JsonKey(name: 'venue_id') this.venueId,
      @JsonKey(name: 'image_url') this.imageUrl,
      final List<String> tags = const [],
      @JsonKey(name: 'is_active') this.isActive = true,
      @JsonKey(name: 'country') this.country})
      : _tags = tags;

  factory _$PromoImpl.fromJson(Map<String, dynamic> json) =>
      _$$PromoImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  @JsonKey(name: 'body')
  final String? description;
  @override
  @JsonKey(name: 'venue_id')
  final String? venueId;
// Optional: if null, it's a platform promo
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

  @override
  @JsonKey(name: 'is_active')
  final bool isActive;
  @override
  @JsonKey(name: 'country')
  final String? country;

  @override
  String toString() {
    return 'Promo(id: $id, title: $title, description: $description, venueId: $venueId, imageUrl: $imageUrl, tags: $tags, isActive: $isActive, country: $country)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PromoImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.venueId, venueId) || other.venueId == venueId) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.country, country) || other.country == country));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, title, description, venueId,
      imageUrl, const DeepCollectionEquality().hash(_tags), isActive, country);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PromoImplCopyWith<_$PromoImpl> get copyWith =>
      __$$PromoImplCopyWithImpl<_$PromoImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PromoImplToJson(
      this,
    );
  }
}

abstract class _Promo implements Promo {
  const factory _Promo(
      {required final String id,
      required final String title,
      @JsonKey(name: 'body') final String? description,
      @JsonKey(name: 'venue_id') final String? venueId,
      @JsonKey(name: 'image_url') final String? imageUrl,
      final List<String> tags,
      @JsonKey(name: 'is_active') final bool isActive,
      @JsonKey(name: 'country') final String? country}) = _$PromoImpl;

  factory _Promo.fromJson(Map<String, dynamic> json) = _$PromoImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  @JsonKey(name: 'body')
  String? get description;
  @override
  @JsonKey(name: 'venue_id')
  String? get venueId;
  @override // Optional: if null, it's a platform promo
  @JsonKey(name: 'image_url')
  String? get imageUrl;
  @override
  List<String> get tags;
  @override
  @JsonKey(name: 'is_active')
  bool get isActive;
  @override
  @JsonKey(name: 'country')
  String? get country;
  @override
  @JsonKey(ignore: true)
  _$$PromoImplCopyWith<_$PromoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
