import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_customer/core/data/models/venue.dart';
import 'package:flutter_customer/core/data/models/promo.dart';
import 'package:flutter_customer/core/data/models/menu.dart';
import 'package:flutter_customer/core/data/repositories/venue_repository.dart';
import 'package:flutter_customer/core/data/repositories/promo_repository.dart';
import 'package:flutter_customer/core/data/repositories/menu_repository.dart';
import 'package:flutter_customer/features/home/provider/home_provider.dart';

class FakeVenueRepository implements VenueRepository {
  FakeVenueRepository({required this.venues, required this.searchResults});

  final List<Venue> venues;
  final List<Venue> searchResults;

  @override
  Future<Venue?> getVenueBySlug(String slug) async => null;

  @override
  Stream<Venue?> streamVenueBySlug(String slug) => const Stream.empty();

  @override
  Future<List<Venue>> listActiveVenues({String? country}) async => venues;

  @override
  Stream<List<Venue>> streamActiveVenues({String? country}) =>
      Stream.value(venues);

  @override
  Future<List<Venue>> searchVenues(
      {required String country, required String query}) async {
    return searchResults;
  }
}

class FakePromoRepository implements PromoRepository {
  FakePromoRepository(this.promos);

  final List<Promo> promos;

  @override
  Future<List<Promo>> listActivePromos({String? country}) async => promos;
}

class FakeMenuRepository implements MenuRepository {
  @override
  Future<Menu?> getActiveMenu(String venueId) async => null;

  @override
  Stream<Menu?> streamActiveMenu(String venueId) => const Stream.empty();
}

void main() {
  test('refresh loads venues and promos', () async {
    final venues = [
      Venue(id: 'v1', slug: 'alpha', name: 'Alpha', country: 'RW'),
      Venue(id: 'v2', slug: 'beta', name: 'Beta', country: 'RW'),
    ];
    final promos = [
      Promo(id: 'p1', title: 'Promo', country: 'RW'),
    ];

    final container = ProviderContainer(
      overrides: [
        venueRepositoryProvider.overrideWithValue(
          FakeVenueRepository(venues: venues, searchResults: const []),
        ),
        promoRepositoryProvider.overrideWithValue(
          FakePromoRepository(promos),
        ),
        menuRepositoryProvider.overrideWithValue(
          FakeMenuRepository(),
        ),
      ],
    );
    addTearDown(container.dispose);

    // Manually trigger refresh and wait for stream to emit
    final notifier = container.read(homeProvider.notifier);
    await notifier.refresh();
    await Future<void>.delayed(const Duration(milliseconds: 50));

    final state = container.read(homeProvider);
    expect(state.venues, venues);
    expect(state.promos, promos);
    expect(state.isLoading, false);
  });

  test('performSearch replaces venue list', () async {
    final venues = [
      Venue(id: 'v1', slug: 'alpha', name: 'Alpha', country: 'RW'),
    ];
    final searchResults = [
      Venue(id: 'v2', slug: 'burger', name: 'Burger Bar', country: 'RW'),
    ];

    final container = ProviderContainer(
      overrides: [
        venueRepositoryProvider.overrideWithValue(
          FakeVenueRepository(venues: venues, searchResults: searchResults),
        ),
        promoRepositoryProvider.overrideWithValue(
          FakePromoRepository(const []),
        ),
        menuRepositoryProvider.overrideWithValue(
          FakeMenuRepository(),
        ),
      ],
    );
    addTearDown(container.dispose);

    // Wait for initial load
    await Future<void>.delayed(Duration.zero);
    await Future<void>.delayed(Duration.zero);

    // Perform search
    final notifier = container.read(homeProvider.notifier);
    await notifier.performSearch('burg');

    final state = container.read(homeProvider);
    expect(state.venues, searchResults);
    expect(state.isLoading, false);
  });
}
