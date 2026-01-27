// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'venue.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Venue _$VenueFromJson(Map<String, dynamic> json) {
  return _Venue.fromJson(json);
}

/// @nodoc
mixin _$Venue {
  String get id => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get country => throw _privateConstructorUsedError; // 'RW' or 'MT'
  String? get description => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;
  @JsonKey(name: 'special_features')
  List<String> get amenities => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_methods')
  List<String> get paymentMethods => throw _privateConstructorUsedError;
  @JsonKey(name: 'revolut_link')
  String? get revolutLink => throw _privateConstructorUsedError;
  @JsonKey(name: 'logo_url')
  String? get logoUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'banner_url')
  String? get bannerUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'operating_hours')
  OperatingHours? get operatingHours => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $VenueCopyWith<Venue> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VenueCopyWith<$Res> {
  factory $VenueCopyWith(Venue value, $Res Function(Venue) then) =
      _$VenueCopyWithImpl<$Res, Venue>;
  @useResult
  $Res call(
      {String id,
      String slug,
      String name,
      String country,
      String? description,
      String? phone,
      String? address,
      @JsonKey(name: 'special_features') List<String> amenities,
      @JsonKey(name: 'payment_methods') List<String> paymentMethods,
      @JsonKey(name: 'revolut_link') String? revolutLink,
      @JsonKey(name: 'logo_url') String? logoUrl,
      @JsonKey(name: 'banner_url') String? bannerUrl,
      @JsonKey(name: 'operating_hours') OperatingHours? operatingHours});

  $OperatingHoursCopyWith<$Res>? get operatingHours;
}

/// @nodoc
class _$VenueCopyWithImpl<$Res, $Val extends Venue>
    implements $VenueCopyWith<$Res> {
  _$VenueCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? slug = null,
    Object? name = null,
    Object? country = null,
    Object? description = freezed,
    Object? phone = freezed,
    Object? address = freezed,
    Object? amenities = null,
    Object? paymentMethods = null,
    Object? revolutLink = freezed,
    Object? logoUrl = freezed,
    Object? bannerUrl = freezed,
    Object? operatingHours = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      slug: null == slug
          ? _value.slug
          : slug // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      country: null == country
          ? _value.country
          : country // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      address: freezed == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String?,
      amenities: null == amenities
          ? _value.amenities
          : amenities // ignore: cast_nullable_to_non_nullable
              as List<String>,
      paymentMethods: null == paymentMethods
          ? _value.paymentMethods
          : paymentMethods // ignore: cast_nullable_to_non_nullable
              as List<String>,
      revolutLink: freezed == revolutLink
          ? _value.revolutLink
          : revolutLink // ignore: cast_nullable_to_non_nullable
              as String?,
      logoUrl: freezed == logoUrl
          ? _value.logoUrl
          : logoUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      bannerUrl: freezed == bannerUrl
          ? _value.bannerUrl
          : bannerUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      operatingHours: freezed == operatingHours
          ? _value.operatingHours
          : operatingHours // ignore: cast_nullable_to_non_nullable
              as OperatingHours?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $OperatingHoursCopyWith<$Res>? get operatingHours {
    if (_value.operatingHours == null) {
      return null;
    }

    return $OperatingHoursCopyWith<$Res>(_value.operatingHours!, (value) {
      return _then(_value.copyWith(operatingHours: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$VenueImplCopyWith<$Res> implements $VenueCopyWith<$Res> {
  factory _$$VenueImplCopyWith(
          _$VenueImpl value, $Res Function(_$VenueImpl) then) =
      __$$VenueImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String slug,
      String name,
      String country,
      String? description,
      String? phone,
      String? address,
      @JsonKey(name: 'special_features') List<String> amenities,
      @JsonKey(name: 'payment_methods') List<String> paymentMethods,
      @JsonKey(name: 'revolut_link') String? revolutLink,
      @JsonKey(name: 'logo_url') String? logoUrl,
      @JsonKey(name: 'banner_url') String? bannerUrl,
      @JsonKey(name: 'operating_hours') OperatingHours? operatingHours});

  @override
  $OperatingHoursCopyWith<$Res>? get operatingHours;
}

/// @nodoc
class __$$VenueImplCopyWithImpl<$Res>
    extends _$VenueCopyWithImpl<$Res, _$VenueImpl>
    implements _$$VenueImplCopyWith<$Res> {
  __$$VenueImplCopyWithImpl(
      _$VenueImpl _value, $Res Function(_$VenueImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? slug = null,
    Object? name = null,
    Object? country = null,
    Object? description = freezed,
    Object? phone = freezed,
    Object? address = freezed,
    Object? amenities = null,
    Object? paymentMethods = null,
    Object? revolutLink = freezed,
    Object? logoUrl = freezed,
    Object? bannerUrl = freezed,
    Object? operatingHours = freezed,
  }) {
    return _then(_$VenueImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      slug: null == slug
          ? _value.slug
          : slug // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      country: null == country
          ? _value.country
          : country // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      address: freezed == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String?,
      amenities: null == amenities
          ? _value._amenities
          : amenities // ignore: cast_nullable_to_non_nullable
              as List<String>,
      paymentMethods: null == paymentMethods
          ? _value._paymentMethods
          : paymentMethods // ignore: cast_nullable_to_non_nullable
              as List<String>,
      revolutLink: freezed == revolutLink
          ? _value.revolutLink
          : revolutLink // ignore: cast_nullable_to_non_nullable
              as String?,
      logoUrl: freezed == logoUrl
          ? _value.logoUrl
          : logoUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      bannerUrl: freezed == bannerUrl
          ? _value.bannerUrl
          : bannerUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      operatingHours: freezed == operatingHours
          ? _value.operatingHours
          : operatingHours // ignore: cast_nullable_to_non_nullable
              as OperatingHours?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$VenueImpl implements _Venue {
  const _$VenueImpl(
      {required this.id,
      required this.slug,
      required this.name,
      required this.country,
      this.description,
      this.phone,
      this.address,
      @JsonKey(name: 'special_features')
      final List<String> amenities = const [],
      @JsonKey(name: 'payment_methods')
      final List<String> paymentMethods = const [],
      @JsonKey(name: 'revolut_link') this.revolutLink,
      @JsonKey(name: 'logo_url') this.logoUrl,
      @JsonKey(name: 'banner_url') this.bannerUrl,
      @JsonKey(name: 'operating_hours') this.operatingHours})
      : _amenities = amenities,
        _paymentMethods = paymentMethods;

  factory _$VenueImpl.fromJson(Map<String, dynamic> json) =>
      _$$VenueImplFromJson(json);

  @override
  final String id;
  @override
  final String slug;
  @override
  final String name;
  @override
  final String country;
// 'RW' or 'MT'
  @override
  final String? description;
  @override
  final String? phone;
  @override
  final String? address;
  final List<String> _amenities;
  @override
  @JsonKey(name: 'special_features')
  List<String> get amenities {
    if (_amenities is EqualUnmodifiableListView) return _amenities;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_amenities);
  }

  final List<String> _paymentMethods;
  @override
  @JsonKey(name: 'payment_methods')
  List<String> get paymentMethods {
    if (_paymentMethods is EqualUnmodifiableListView) return _paymentMethods;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_paymentMethods);
  }

  @override
  @JsonKey(name: 'revolut_link')
  final String? revolutLink;
  @override
  @JsonKey(name: 'logo_url')
  final String? logoUrl;
  @override
  @JsonKey(name: 'banner_url')
  final String? bannerUrl;
  @override
  @JsonKey(name: 'operating_hours')
  final OperatingHours? operatingHours;

  @override
  String toString() {
    return 'Venue(id: $id, slug: $slug, name: $name, country: $country, description: $description, phone: $phone, address: $address, amenities: $amenities, paymentMethods: $paymentMethods, revolutLink: $revolutLink, logoUrl: $logoUrl, bannerUrl: $bannerUrl, operatingHours: $operatingHours)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VenueImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.address, address) || other.address == address) &&
            const DeepCollectionEquality()
                .equals(other._amenities, _amenities) &&
            const DeepCollectionEquality()
                .equals(other._paymentMethods, _paymentMethods) &&
            (identical(other.revolutLink, revolutLink) ||
                other.revolutLink == revolutLink) &&
            (identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl) &&
            (identical(other.bannerUrl, bannerUrl) ||
                other.bannerUrl == bannerUrl) &&
            (identical(other.operatingHours, operatingHours) ||
                other.operatingHours == operatingHours));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      slug,
      name,
      country,
      description,
      phone,
      address,
      const DeepCollectionEquality().hash(_amenities),
      const DeepCollectionEquality().hash(_paymentMethods),
      revolutLink,
      logoUrl,
      bannerUrl,
      operatingHours);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$VenueImplCopyWith<_$VenueImpl> get copyWith =>
      __$$VenueImplCopyWithImpl<_$VenueImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VenueImplToJson(
      this,
    );
  }
}

abstract class _Venue implements Venue {
  const factory _Venue(
      {required final String id,
      required final String slug,
      required final String name,
      required final String country,
      final String? description,
      final String? phone,
      final String? address,
      @JsonKey(name: 'special_features') final List<String> amenities,
      @JsonKey(name: 'payment_methods') final List<String> paymentMethods,
      @JsonKey(name: 'revolut_link') final String? revolutLink,
      @JsonKey(name: 'logo_url') final String? logoUrl,
      @JsonKey(name: 'banner_url') final String? bannerUrl,
      @JsonKey(name: 'operating_hours')
      final OperatingHours? operatingHours}) = _$VenueImpl;

  factory _Venue.fromJson(Map<String, dynamic> json) = _$VenueImpl.fromJson;

  @override
  String get id;
  @override
  String get slug;
  @override
  String get name;
  @override
  String get country;
  @override // 'RW' or 'MT'
  String? get description;
  @override
  String? get phone;
  @override
  String? get address;
  @override
  @JsonKey(name: 'special_features')
  List<String> get amenities;
  @override
  @JsonKey(name: 'payment_methods')
  List<String> get paymentMethods;
  @override
  @JsonKey(name: 'revolut_link')
  String? get revolutLink;
  @override
  @JsonKey(name: 'logo_url')
  String? get logoUrl;
  @override
  @JsonKey(name: 'banner_url')
  String? get bannerUrl;
  @override
  @JsonKey(name: 'operating_hours')
  OperatingHours? get operatingHours;
  @override
  @JsonKey(ignore: true)
  _$$VenueImplCopyWith<_$VenueImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

OperatingHours _$OperatingHoursFromJson(Map<String, dynamic> json) {
  return _OperatingHours.fromJson(json);
}

/// @nodoc
mixin _$OperatingHours {
  String get monday => throw _privateConstructorUsedError;
  String get tuesday => throw _privateConstructorUsedError;
  String get wednesday => throw _privateConstructorUsedError;
  String get thursday => throw _privateConstructorUsedError;
  String get friday => throw _privateConstructorUsedError;
  String get saturday => throw _privateConstructorUsedError;
  String get sunday => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $OperatingHoursCopyWith<OperatingHours> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OperatingHoursCopyWith<$Res> {
  factory $OperatingHoursCopyWith(
          OperatingHours value, $Res Function(OperatingHours) then) =
      _$OperatingHoursCopyWithImpl<$Res, OperatingHours>;
  @useResult
  $Res call(
      {String monday,
      String tuesday,
      String wednesday,
      String thursday,
      String friday,
      String saturday,
      String sunday});
}

/// @nodoc
class _$OperatingHoursCopyWithImpl<$Res, $Val extends OperatingHours>
    implements $OperatingHoursCopyWith<$Res> {
  _$OperatingHoursCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? monday = null,
    Object? tuesday = null,
    Object? wednesday = null,
    Object? thursday = null,
    Object? friday = null,
    Object? saturday = null,
    Object? sunday = null,
  }) {
    return _then(_value.copyWith(
      monday: null == monday
          ? _value.monday
          : monday // ignore: cast_nullable_to_non_nullable
              as String,
      tuesday: null == tuesday
          ? _value.tuesday
          : tuesday // ignore: cast_nullable_to_non_nullable
              as String,
      wednesday: null == wednesday
          ? _value.wednesday
          : wednesday // ignore: cast_nullable_to_non_nullable
              as String,
      thursday: null == thursday
          ? _value.thursday
          : thursday // ignore: cast_nullable_to_non_nullable
              as String,
      friday: null == friday
          ? _value.friday
          : friday // ignore: cast_nullable_to_non_nullable
              as String,
      saturday: null == saturday
          ? _value.saturday
          : saturday // ignore: cast_nullable_to_non_nullable
              as String,
      sunday: null == sunday
          ? _value.sunday
          : sunday // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$OperatingHoursImplCopyWith<$Res>
    implements $OperatingHoursCopyWith<$Res> {
  factory _$$OperatingHoursImplCopyWith(_$OperatingHoursImpl value,
          $Res Function(_$OperatingHoursImpl) then) =
      __$$OperatingHoursImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String monday,
      String tuesday,
      String wednesday,
      String thursday,
      String friday,
      String saturday,
      String sunday});
}

/// @nodoc
class __$$OperatingHoursImplCopyWithImpl<$Res>
    extends _$OperatingHoursCopyWithImpl<$Res, _$OperatingHoursImpl>
    implements _$$OperatingHoursImplCopyWith<$Res> {
  __$$OperatingHoursImplCopyWithImpl(
      _$OperatingHoursImpl _value, $Res Function(_$OperatingHoursImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? monday = null,
    Object? tuesday = null,
    Object? wednesday = null,
    Object? thursday = null,
    Object? friday = null,
    Object? saturday = null,
    Object? sunday = null,
  }) {
    return _then(_$OperatingHoursImpl(
      monday: null == monday
          ? _value.monday
          : monday // ignore: cast_nullable_to_non_nullable
              as String,
      tuesday: null == tuesday
          ? _value.tuesday
          : tuesday // ignore: cast_nullable_to_non_nullable
              as String,
      wednesday: null == wednesday
          ? _value.wednesday
          : wednesday // ignore: cast_nullable_to_non_nullable
              as String,
      thursday: null == thursday
          ? _value.thursday
          : thursday // ignore: cast_nullable_to_non_nullable
              as String,
      friday: null == friday
          ? _value.friday
          : friday // ignore: cast_nullable_to_non_nullable
              as String,
      saturday: null == saturday
          ? _value.saturday
          : saturday // ignore: cast_nullable_to_non_nullable
              as String,
      sunday: null == sunday
          ? _value.sunday
          : sunday // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$OperatingHoursImpl implements _OperatingHours {
  const _$OperatingHoursImpl(
      {this.monday = 'Closed',
      this.tuesday = 'Closed',
      this.wednesday = 'Closed',
      this.thursday = 'Closed',
      this.friday = 'Closed',
      this.saturday = 'Closed',
      this.sunday = 'Closed'});

  factory _$OperatingHoursImpl.fromJson(Map<String, dynamic> json) =>
      _$$OperatingHoursImplFromJson(json);

  @override
  @JsonKey()
  final String monday;
  @override
  @JsonKey()
  final String tuesday;
  @override
  @JsonKey()
  final String wednesday;
  @override
  @JsonKey()
  final String thursday;
  @override
  @JsonKey()
  final String friday;
  @override
  @JsonKey()
  final String saturday;
  @override
  @JsonKey()
  final String sunday;

  @override
  String toString() {
    return 'OperatingHours(monday: $monday, tuesday: $tuesday, wednesday: $wednesday, thursday: $thursday, friday: $friday, saturday: $saturday, sunday: $sunday)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OperatingHoursImpl &&
            (identical(other.monday, monday) || other.monday == monday) &&
            (identical(other.tuesday, tuesday) || other.tuesday == tuesday) &&
            (identical(other.wednesday, wednesday) ||
                other.wednesday == wednesday) &&
            (identical(other.thursday, thursday) ||
                other.thursday == thursday) &&
            (identical(other.friday, friday) || other.friday == friday) &&
            (identical(other.saturday, saturday) ||
                other.saturday == saturday) &&
            (identical(other.sunday, sunday) || other.sunday == sunday));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, monday, tuesday, wednesday,
      thursday, friday, saturday, sunday);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$OperatingHoursImplCopyWith<_$OperatingHoursImpl> get copyWith =>
      __$$OperatingHoursImplCopyWithImpl<_$OperatingHoursImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OperatingHoursImplToJson(
      this,
    );
  }
}

abstract class _OperatingHours implements OperatingHours {
  const factory _OperatingHours(
      {final String monday,
      final String tuesday,
      final String wednesday,
      final String thursday,
      final String friday,
      final String saturday,
      final String sunday}) = _$OperatingHoursImpl;

  factory _OperatingHours.fromJson(Map<String, dynamic> json) =
      _$OperatingHoursImpl.fromJson;

  @override
  String get monday;
  @override
  String get tuesday;
  @override
  String get wednesday;
  @override
  String get thursday;
  @override
  String get friday;
  @override
  String get saturday;
  @override
  String get sunday;
  @override
  @JsonKey(ignore: true)
  _$$OperatingHoursImplCopyWith<_$OperatingHoursImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
