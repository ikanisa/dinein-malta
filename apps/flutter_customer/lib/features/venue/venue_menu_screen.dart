import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/repositories/menu_repository.dart';
import '../../core/data/repositories/venue_repository.dart';
import '../cart/provider/cart_provider.dart';
import '../../core/utils/haptics.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';
import 'widgets/clay_menu_item_tile.dart';
import 'widgets/clay_floating_cart.dart';
import '../home/provider/home_provider.dart';
import '../../core/utils/currency.dart';
import '../../core/data/local/local_cache_service.dart';

class VenueMenuScreen extends ConsumerStatefulWidget {
  final String slug;
  final String? tableNumber;

  const VenueMenuScreen({super.key, required this.slug, this.tableNumber});

  @override
  ConsumerState<VenueMenuScreen> createState() => _VenueMenuScreenState();
}

class _VenueMenuScreenState extends ConsumerState<VenueMenuScreen> {
  @override
  Widget build(BuildContext context) {
    final venueAsync = ref.watch(venueBySlugProvider(widget.slug));

    return venueAsync.when(
      loading: () => Scaffold(
        backgroundColor: ClayColors.background,
        body: const Center(
          child: CircularProgressIndicator(color: ClayColors.primary),
        ),
      ),
      error: (err, stack) => Scaffold(
        backgroundColor: ClayColors.background,
        body: ClayEmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Something went wrong',
          subtitle: err.toString(),
        ),
      ),
      data: (venue) {
        if (venue == null) {
          return Scaffold(
            backgroundColor: ClayColors.background,
            body: const ClayEmptyState(
              icon: Icons.storefront_rounded,
              title: 'Venue not found',
              subtitle: 'This restaurant may have moved or closed.',
            ),
          );
        }

        // Update active country context if needed
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final currentCountry = ref.read(homeProvider).activeCountry;
          if (venue.country != currentCountry) {
            ref.read(homeProvider.notifier).switchCountry(venue.country);
          }
        });

        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref
              .read(localCacheServiceProvider)
              .cacheVenueById(venue.id, venue.toJson());
          final tableNumber = widget.tableNumber?.trim();
          if (tableNumber != null && tableNumber.isNotEmpty) {
            ref
                .read(localCacheServiceProvider)
                .cacheTableNumber(venue.id, tableNumber);
          }
        });

        final menuAsync = ref.watch(menuByVenueIdProvider(venue.id));

        return menuAsync.when(
          loading: () => Scaffold(
            backgroundColor: ClayColors.background,
            appBar: _buildAppBar(venue.name, venue.id),
            body: const _MenuSkeleton(),
          ),
          error: (err, stack) => Scaffold(
            backgroundColor: ClayColors.background,
            appBar: _buildAppBar(venue.name, venue.id),
            body: ClayEmptyState(
              icon: Icons.menu_book_rounded,
              title: 'Menu unavailable',
              subtitle: 'We couldn\'t load the menu right now.',
            ),
          ),
          data: (menu) {
            if (menu == null || menu.categories.isEmpty) {
              return Scaffold(
                backgroundColor: ClayColors.background,
                appBar: _buildAppBar(venue.name, venue.id),
                body: const ClayEmptyState(
                  icon: Icons.restaurant_menu_rounded,
                  title: 'No menu yet',
                  subtitle: 'This restaurant hasn\'t added their menu.',
                ),
              );
            }

            return DefaultTabController(
              length: menu.categories.length,
              child: Scaffold(
                backgroundColor: ClayColors.background,
                body: NestedScrollView(
                  headerSliverBuilder: (context, innerBoxIsScrolled) => [
                    // Venue header
                    SliverToBoxAdapter(
                      child: _VenueHeader(
                        name: venue.name,
                        description: venue.description,
                        venueId: venue.id,
                      ),
                    ),
                    // Category tabs
                    SliverPersistentHeader(
                      pinned: true,
                      delegate: _SliverTabBarDelegate(
                        TabBar(
                          isScrollable: true,
                          labelColor: ClayColors.primary,
                          unselectedLabelColor: ClayColors.textSecondary,
                          indicatorColor: ClayColors.primary,
                          indicatorWeight: 3,
                          indicatorPadding:
                              const EdgeInsets.symmetric(horizontal: 8),
                          labelStyle: ClayTypography.bodyMedium,
                          tabs: menu.categories
                              .map((c) => Tab(text: c.name))
                              .toList(),
                        ),
                      ),
                    ),
                  ],
                  body: TabBarView(
                    children: menu.categories.map((category) {
                      return ListView.builder(
                        padding: const EdgeInsets.fromLTRB(
                          ClaySpacing.md,
                          ClaySpacing.md,
                          ClaySpacing.md,
                          100,
                        ),
                        itemCount: category.items.length,
                        itemBuilder: (context, index) {
                          final item = category.items[index];
                          return Padding(
                            padding:
                                const EdgeInsets.only(bottom: ClaySpacing.md),
                            child: ClayMenuItemTile(
                              item: item,
                              venueId: venue.id,
                              currencyCode:
                                  CurrencyUtils.currencyCodeForCountry(
                                      venue.country),
                              onAdd: () {
                                Haptics.mediumImpact();
                                ref.read(cartProvider.notifier).addItem(
                                      item,
                                      venue.id,
                                      currencyCode:
                                          CurrencyUtils.currencyCodeForCountry(
                                              venue.country),
                                    );
                              },
                            ),
                          );
                        },
                      );
                    }).toList(),
                  ),
                ),
                floatingActionButton: const ClayFloatingCart(),
                floatingActionButtonLocation:
                    FloatingActionButtonLocation.centerFloat,
              ),
            );
          },
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar(String name, String venueId) {
    return AppBar(
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
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(name, style: ClayTypography.h3),
      actions: [
        IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ClayColors.warning.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(ClayRadius.sm),
            ),
            child: Icon(
              Icons.notifications_active_rounded,
              size: 20,
              color: ClayColors.warning,
            ),
          ),
          onPressed: () {
            Haptics.lightImpact();
            context.push('/bell/$venueId');
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }
}

class _VenueHeader extends StatelessWidget {
  final String name;
  final String? description;
  final String venueId;

  const _VenueHeader({
    required this.name,
    this.description,
    required this.venueId,
  });

  @override
  Widget build(BuildContext context) {
    // Generate pastel color based on name
    final hue = (name.hashCode % 360).abs().toDouble();
    final headerColor = HSLColor.fromAHSL(1.0, hue, 0.35, 0.8).toColor();

    return Container(
      margin: const EdgeInsets.all(ClaySpacing.md),
      padding: const EdgeInsets.all(ClaySpacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [headerColor, headerColor.withValues(alpha: 0.7)],
        ),
        borderRadius: BorderRadius.circular(ClayRadius.xl),
        boxShadow: ClayShadows.card,
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Restaurant icon
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.restaurant_rounded,
                size: 32,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: ClaySpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: ClayTypography.h2.copyWith(color: Colors.white),
                  ),
                  if (description != null && description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      description!,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 14,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _InfoChip(icon: Icons.star_rounded, label: '4.8'),
                      const SizedBox(width: 8),
                      _InfoChip(
                          icon: Icons.access_time_rounded, label: '15-25 min'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(ClayRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuSkeleton extends StatelessWidget {
  const _MenuSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(ClaySpacing.md),
      itemCount: 4,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: ClaySpacing.md),
        child: Container(
          height: 100,
          decoration: BoxDecoration(
            color: ClayColors.surface,
            borderRadius: BorderRadius.circular(ClayRadius.lg),
            boxShadow: ClayShadows.subtle,
          ),
        ),
      ),
    );
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverTabBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: ClayColors.background,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) => false;
}

// Providers
final venueBySlugProvider = StreamProvider.family((ref, String slug) {
  return ref.watch(venueRepositoryProvider).streamVenueBySlug(slug);
});

final menuByVenueIdProvider = StreamProvider.family((ref, String venueId) {
  return ref.watch(menuRepositoryProvider).streamActiveMenu(venueId);
});
