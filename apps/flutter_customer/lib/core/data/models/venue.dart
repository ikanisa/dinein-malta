import 'package:freezed_annotation/freezed_annotation.dart';

part 'venue.freezed.dart';
part 'venue.g.dart';

@freezed
class Venue with _$Venue {
  const factory Venue({
    required String id,
    required String slug,
    required String name,
    required String country, // 'RW' or 'MT'
    String? description,
    @Default([]) @JsonKey(name: 'special_features') List<String> amenities,
    @Default([]) @JsonKey(name: 'payment_methods') List<String> paymentMethods,
    @JsonKey(name: 'revolut_link') String? revolutLink,
    @JsonKey(name: 'logo_url') String? logoUrl,
    @JsonKey(name: 'banner_url') String? bannerUrl,
  }) = _Venue;

  factory Venue.fromJson(Map<String, dynamic> json) => _$VenueFromJson(json);
}
