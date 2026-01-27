// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'promo.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PromoImpl _$$PromoImplFromJson(Map<String, dynamic> json) => _$PromoImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['body'] as String?,
      venueId: json['venue_id'] as String?,
      imageUrl: json['image_url'] as String?,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      isActive: json['is_active'] as bool? ?? true,
      country: json['country'] as String?,
    );

Map<String, dynamic> _$$PromoImplToJson(_$PromoImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'body': instance.description,
      'venue_id': instance.venueId,
      'image_url': instance.imageUrl,
      'tags': instance.tags,
      'is_active': instance.isActive,
      'country': instance.country,
    };
