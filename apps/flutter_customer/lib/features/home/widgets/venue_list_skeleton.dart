import 'package:flutter/material.dart';
import 'package:skeletonizer/skeletonizer.dart';
import '../widgets/venue_list_tile.dart';
import '../../../../core/data/models/venue.dart';

class VenueListSkeleton extends StatelessWidget {
  const VenueListSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    // Create a dummy venue for skeleton structure
    final dummyVenue = Venue(
      id: '1',
      slug: 'dummy',
      name: 'Restaurant Name Placeholder',
      description: 'A brief description of the venue goes here to simulate text layout.',
      country: 'RW',
      amenities: ['Wifi', 'Parking', 'Outdoor'],
    );

    return Skeletonizer(
      enabled: true,
      child: Column(
        children: List.generate(
          5,
          (index) => VenueListTile(venue: dummyVenue),
        ),
      ),
    );
  }
}
