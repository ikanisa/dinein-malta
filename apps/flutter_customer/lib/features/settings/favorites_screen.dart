import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/router/routes.dart';
import '../../core/data/local/favorites_service.dart';
import '../../core/data/local/local_cache_service.dart';
import '../../core/data/models/venue.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';
import '../../core/utils/haptics.dart';

/// Favorites screen showing saved venues
class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  List<String> _favoriteVenueIds = [];
  final Map<String, Venue?> _venues = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final favService = ref.read(favoritesServiceProvider);
    final venueIds = favService.getFavoriteVenueIds();

    setState(() {
      _favoriteVenueIds = venueIds;
      _isLoading = false;
    });

    // Load venue details from local cache
    final cacheService = ref.read(localCacheServiceProvider);
    for (final venueId in venueIds) {
      final json = cacheService.getVenueById(venueId, allowStale: true);
      if (json != null) {
        try {
          _venues[venueId] = Venue.fromJson(json);
          if (mounted) setState(() {});
        } catch (_) {}
      }
    }
  }

  Future<void> _removeFavorite(String venueId) async {
    Haptics.lightImpact();
    final favService = ref.read(favoritesServiceProvider);
    await favService.removeFavoriteVenue(venueId);
    setState(() {
      _favoriteVenueIds.remove(venueId);
      _venues.remove(venueId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        backgroundColor: ClayColors.background,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ClayColors.surface,
              borderRadius: BorderRadius.circular(ClayRadius.sm),
              boxShadow: ClayShadows.subtle,
            ),
            child: const Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
              color: ClayColors.textPrimary,
            ),
          ),
          onPressed: () => context.pop(),
        ),
        title: Text('Favorites', style: ClayTypography.h2),
        centerTitle: false,
      ),
      body: _isLoading
          ? const _FavoritesSkeleton()
          : _favoriteVenueIds.isEmpty
              ? const Center(
                  child: ClayEmptyState(
                    icon: Icons.favorite_border_rounded,
                    title: 'No favorites yet',
                    subtitle: 'Tap the heart on a venue to save it here',
                  ),
                )
              : RefreshIndicator(
                  color: ClayColors.primary,
                  onRefresh: _loadFavorites,
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(ClaySpacing.md),
                    itemCount: _favoriteVenueIds.length,
                    itemBuilder: (context, index) {
                      final venueId = _favoriteVenueIds[index];
                      final venue = _venues[venueId];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: ClaySpacing.md),
                        child: _FavoriteVenueCard(
                          venueId: venueId,
                          venue: venue,
                          onRemove: () => _removeFavorite(venueId),
                          onTap: () {
                            if (venue != null) {
                              context.push('/v/${venue.slug}');
                            }
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class _FavoriteVenueCard extends StatelessWidget {
  final String venueId;
  final Venue? venue;
  final VoidCallback onRemove;
  final VoidCallback onTap;

  const _FavoriteVenueCard({
    required this.venueId,
    required this.venue,
    required this.onRemove,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClayCard(
        child: Row(
          children: [
            // Venue icon/placeholder
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    ClayColors.primary.withValues(alpha: 0.2),
                    ClayColors.accent.withValues(alpha: 0.2),
                  ],
                ),
                borderRadius: BorderRadius.circular(ClayRadius.md),
              ),
              child: Icon(
                Icons.restaurant_rounded,
                color: ClayColors.primary,
                size: 24,
              ),
            ),
            const SizedBox(width: ClaySpacing.md),
            // Venue info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    venue?.name ?? 'Loading...',
                    style: ClayTypography.bodyMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  if (venue?.description != null)
                    Text(
                      venue!.description!,
                      style: ClayTypography.small,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            const SizedBox(width: ClaySpacing.sm),
            // Remove button
            GestureDetector(
              onTap: onRemove,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: ClayColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(ClayRadius.sm),
                ),
                child: Icon(
                  Icons.favorite_rounded,
                  color: ClayColors.error,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FavoritesSkeleton extends StatelessWidget {
  const _FavoritesSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(ClaySpacing.md),
      itemCount: 3,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: ClaySpacing.md),
          child: ClayCard(
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: ClayColors.background,
                    borderRadius: BorderRadius.circular(ClayRadius.md),
                  ),
                ),
                const SizedBox(width: ClaySpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 14,
                        width: 120,
                        decoration: BoxDecoration(
                          color: ClayColors.background,
                          borderRadius: BorderRadius.circular(ClayRadius.sm),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 12,
                        width: 180,
                        decoration: BoxDecoration(
                          color: ClayColors.background,
                          borderRadius: BorderRadius.circular(ClayRadius.sm),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
