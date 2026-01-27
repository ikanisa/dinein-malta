import 'package:freezed_annotation/freezed_annotation.dart';

part 'promo.freezed.dart';
part 'promo.g.dart';

@freezed
class Promo with _$Promo {
  const factory Promo({
    required String id,
    required String title,
    String? description,
    @JsonKey(name: 'venue_id') String? venueId, // Optional: if null, it's a platform promo
    @JsonKey(name: 'image_url') String? imageUrl,
    @Default([]) List<String> tags,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'country') String? country, // 'RW' or 'MT'
  }) = _Promo;

  factory Promo.fromJson(Map<String, dynamic> json) => _$PromoFromJson(json);
}
