// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'venue.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$VenueImpl _$$VenueImplFromJson(Map<String, dynamic> json) => _$VenueImpl(
      id: json['id'] as String,
      slug: json['slug'] as String,
      name: json['name'] as String,
      country: json['country'] as String,
      description: json['description'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      amenities: (json['special_features'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      paymentMethods: (json['payment_methods'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      revolutLink: json['revolut_link'] as String?,
      logoUrl: json['logo_url'] as String?,
      bannerUrl: json['banner_url'] as String?,
      operatingHours: json['operating_hours'] == null
          ? null
          : OperatingHours.fromJson(
              json['operating_hours'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$VenueImplToJson(_$VenueImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'slug': instance.slug,
      'name': instance.name,
      'country': instance.country,
      'description': instance.description,
      'phone': instance.phone,
      'address': instance.address,
      'special_features': instance.amenities,
      'payment_methods': instance.paymentMethods,
      'revolut_link': instance.revolutLink,
      'logo_url': instance.logoUrl,
      'banner_url': instance.bannerUrl,
      'operating_hours': instance.operatingHours,
    };

_$OperatingHoursImpl _$$OperatingHoursImplFromJson(Map<String, dynamic> json) =>
    _$OperatingHoursImpl(
      monday: json['monday'] as String? ?? 'Closed',
      tuesday: json['tuesday'] as String? ?? 'Closed',
      wednesday: json['wednesday'] as String? ?? 'Closed',
      thursday: json['thursday'] as String? ?? 'Closed',
      friday: json['friday'] as String? ?? 'Closed',
      saturday: json['saturday'] as String? ?? 'Closed',
      sunday: json['sunday'] as String? ?? 'Closed',
    );

Map<String, dynamic> _$$OperatingHoursImplToJson(
        _$OperatingHoursImpl instance) =>
    <String, dynamic>{
      'monday': instance.monday,
      'tuesday': instance.tuesday,
      'wednesday': instance.wednesday,
      'thursday': instance.thursday,
      'friday': instance.friday,
      'saturday': instance.saturday,
      'sunday': instance.sunday,
    };
