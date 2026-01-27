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
    String? phone,
    String? address,
    @Default([]) @JsonKey(name: 'special_features') List<String> amenities,
    @Default([]) @JsonKey(name: 'payment_methods') List<String> paymentMethods,
    @JsonKey(name: 'revolut_link') String? revolutLink,
    @JsonKey(name: 'logo_url') String? logoUrl,
    @JsonKey(name: 'banner_url') String? bannerUrl,
    @JsonKey(name: 'operating_hours') OperatingHours? operatingHours,
  }) = _Venue;

  factory Venue.fromJson(Map<String, dynamic> json) => _$VenueFromJson(json);
}

/// Structured operating hours for a venue
@freezed
class OperatingHours with _$OperatingHours {
  const factory OperatingHours({
    @Default('Closed') String monday,
    @Default('Closed') String tuesday,
    @Default('Closed') String wednesday,
    @Default('Closed') String thursday,
    @Default('Closed') String friday,
    @Default('Closed') String saturday,
    @Default('Closed') String sunday,
  }) = _OperatingHours;

  factory OperatingHours.fromJson(Map<String, dynamic> json) =>
      _$OperatingHoursFromJson(json);
}
