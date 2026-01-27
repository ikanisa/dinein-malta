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
    );

Map<String, dynamic> _$$VenueImplToJson(_$VenueImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'slug': instance.slug,
      'name': instance.name,
      'country': instance.country,
      'description': instance.description,
      'special_features': instance.amenities,
      'payment_methods': instance.paymentMethods,
      'revolut_link': instance.revolutLink,
      'logo_url': instance.logoUrl,
      'banner_url': instance.bannerUrl,
    };
