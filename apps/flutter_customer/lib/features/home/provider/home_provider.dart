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
class HomeNotifier extends StateNotifier<HomeState> {
  final VenueRepository _venueRepository;
  final PromoRepository _promoRepository;
  final MenuRepository _menuRepository; // Added for prefetch
  
  StreamSubscription? _venuesSubscription;

  HomeNotifier({
    required VenueRepository venueRepository,
    required PromoRepository promoRepository,
    required MenuRepository menuRepository,
  })  : _venueRepository = venueRepository,
        _promoRepository = promoRepository,
        _menuRepository = menuRepository,
        super(const HomeState()) {
    refresh();
  }
  
  @override
  void dispose() {
    _venuesSubscription?.cancel();
    super.dispose();
  }

  Future<void> refresh() async {
    state = state.copyWith(isLoading: true, error: null);
    
    // Switch to Stream for SWR (Cache -> Network)
    _venuesSubscription?.cancel();
    _venuesSubscription = _venueRepository.streamActiveVenues(country: state.activeCountry)
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
      final promos = await _promoRepository.listActivePromos(country: state.activeCountry);
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
final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  return HomeNotifier(
    venueRepository: ref.watch(venueRepositoryProvider),
    promoRepository: ref.watch(promoRepositoryProvider),
    menuRepository: ref.watch(menuRepositoryProvider),
  );
});
