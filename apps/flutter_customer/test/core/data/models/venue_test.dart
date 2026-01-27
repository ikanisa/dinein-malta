import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_customer/core/data/models/venue.dart';

void main() {
  group('Venue Model', () {
    test('creates Venue with required fields only', () {
      final venue = Venue(
        id: 'venue-123',
        slug: 'test-venue',
        name: 'Test Venue',
        country: 'RW',
      );

      expect(venue.id, 'venue-123');
      expect(venue.slug, 'test-venue');
      expect(venue.name, 'Test Venue');
      expect(venue.country, 'RW');
    });

    test('creates Venue with all optional fields', () {
      final venue = Venue(
        id: 'venue-456',
        slug: 'fancy-restaurant',
        name: 'Fancy Restaurant',
        country: 'MT',
        description: 'A fancy place to dine',
        address: '123 Main Street',
        phone: '+356 1234 5678',
        revolutLink: 'https://revolut.me/fancy',
        logoUrl: 'https://example.com/logo.png',
        bannerUrl: 'https://example.com/banner.jpg',
        amenities: ['WiFi', 'Outdoor Seating'],
        paymentMethods: ['Cash', 'RevolutLink'],
      );

      expect(venue.description, 'A fancy place to dine');
      expect(venue.address, '123 Main Street');
      expect(venue.phone, '+356 1234 5678');
      expect(venue.revolutLink, 'https://revolut.me/fancy');
      expect(venue.logoUrl, 'https://example.com/logo.png');
      expect(venue.amenities, ['WiFi', 'Outdoor Seating']);
      expect(venue.paymentMethods, ['Cash', 'RevolutLink']);
    });

    test('handles null optional fields', () {
      final venue = Venue(
        id: 'venue-789',
        slug: 'basic-cafe',
        name: 'Basic Cafe',
        country: 'RW',
      );

      expect(venue.description, isNull);
      expect(venue.address, isNull);
      expect(venue.phone, isNull);
      expect(venue.revolutLink, isNull);
      expect(venue.amenities, isEmpty); // Default empty list
      expect(venue.paymentMethods, isEmpty); // Default empty list
    });
  });

  group('Country Validation', () {
    test('accepts valid country codes', () {
      // Per scope: Country values: RW, MT (only)
      final rwVenue = Venue(
        id: 'v1',
        slug: 'rw-venue',
        name: 'Rwanda Venue',
        country: 'RW',
      );
      final mtVenue = Venue(
        id: 'v2',
        slug: 'mt-venue',
        name: 'Malta Venue',
        country: 'MT',
      );

      expect(rwVenue.country, 'RW');
      expect(mtVenue.country, 'MT');
    });
  });

  group('OperatingHours Model', () {
    test('creates OperatingHours with day schedules', () {
      final hours = OperatingHours(
        monday: '09:00-22:00',
        tuesday: '09:00-22:00',
        wednesday: '09:00-22:00',
        thursday: '09:00-22:00',
        friday: '09:00-23:00',
        saturday: '10:00-23:00',
        sunday: 'Closed',
      );

      expect(hours.monday, '09:00-22:00');
      expect(hours.friday, '09:00-23:00');
      expect(hours.sunday, 'Closed');
    });

    test('defaults all days to Closed', () {
      final hours = OperatingHours();

      expect(hours.monday, 'Closed');
      expect(hours.tuesday, 'Closed');
      expect(hours.wednesday, 'Closed');
      expect(hours.thursday, 'Closed');
      expect(hours.friday, 'Closed');
      expect(hours.saturday, 'Closed');
      expect(hours.sunday, 'Closed');
    });
  });

  group('Payment Methods', () {
    // Per scope: Payment method values: Cash, MoMoUSSD, RevolutLink (only)
    test('validates payment method values', () {
      const validMethods = ['Cash', 'MoMoUSSD', 'RevolutLink'];

      final venue = Venue(
        id: 'v1',
        slug: 'test',
        name: 'Test',
        country: 'RW',
        paymentMethods: validMethods,
      );

      expect(venue.paymentMethods, validMethods);
    });
  });
}
