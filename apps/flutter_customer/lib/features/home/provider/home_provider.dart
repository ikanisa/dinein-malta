import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/data/models/venue.dart';
import '../../../core/data/models/promo.dart';
import '../../../core/data/repositories/venue_repository.dart';
import '../../../core/data/repositories/promo_repository.dart';
import '../../../core/data/repositories/menu_repository.dart';

// State
class HomeState {
  final List<Venue> venues;
  final List<Promo> promos;
  final String activeCountry; // 'RW' or 'MT'
  final bool isLoading;
  final String? error;

  const HomeState({
    this.venues = const [],
    this.promos = const [],
    this.activeCountry = 'RW', // Default
    this.isLoading = false,
    this.error,
  });

  HomeState copyWith({
    List<Venue>? venues,
    List<Promo>? promos,
    String? activeCountry,
    bool? isLoading,
    String? error,
  }) {
    return HomeState(
      venues: venues ?? this.venues,
      promos: promos ?? this.promos,
      activeCountry: activeCountry ?? this.activeCountry,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Notifier
class HomeNotifier extends Notifier<HomeState> {
  late final VenueRepository _venueRepository;
  late final PromoRepository _promoRepository;
  late final MenuRepository _menuRepository;

  StreamSubscription? _venuesSubscription;

  @override
  HomeState build() {
    _venueRepository = ref.watch(venueRepositoryProvider);
    _promoRepository = ref.watch(promoRepositoryProvider);
    _menuRepository = ref.watch(menuRepositoryProvider);
    
    ref.onDispose(() {
      _venuesSubscription?.cancel();
    });
    
    // Trigger initial load
    Future.microtask(() => refresh());
    
    return const HomeState();
  }

  Future<void> refresh() async {
    state = state.copyWith(isLoading: true, error: null);

    // Switch to Stream for SWR (Cache -> Network)
    _venuesSubscription?.cancel();
    _venuesSubscription = _venueRepository
        .streamActiveVenues(country: state.activeCountry)
        .listen((venues) {
      state = state.copyWith(venues: venues, isLoading: false);
      _prefetchTopVenue(venues);
    }, onError: (e) {
      // If we have data, maybe just show snackbar? For now set error state if empty.
      if (state.venues.isEmpty) {
        state = state.copyWith(error: e.toString(), isLoading: false);
      }
    });

    try {
      final promos =
          await _promoRepository.listActivePromos(country: state.activeCountry);
      state = state.copyWith(promos: promos);
    } catch (e) {
      // Promos optional
    }
  }

  void _prefetchTopVenue(List<Venue> venues) {
    if (venues.isEmpty) return;
    final topVenue = venues.first;
    // Low priority prefetch
    Future.microtask(() async {
      try {
        // Just trigger fetch to warm cache
        await _menuRepository.getActiveMenu(topVenue.id);
      } catch (_) {}
    });
  }

  void switchCountry(String country) {
    if (state.activeCountry == country) return;
    state = state.copyWith(activeCountry: country, venues: [], promos: []);
    refresh();
  }

  Future<void> performSearch(String query) async {
    if (query.isEmpty) {
      refresh();
      return;
    }

    // Search is still Future-based for now
    _venuesSubscription?.cancel();
    state = state.copyWith(isLoading: true, error: null);
    try {
      final venues = await _venueRepository.searchVenues(
        country: state.activeCountry,
        query: query,
      );
      state = state.copyWith(venues: venues, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

// Provider
final homeProvider = NotifierProvider<HomeNotifier, HomeState>(HomeNotifier.new);
