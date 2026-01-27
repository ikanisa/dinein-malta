import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';
import 'provider/home_provider.dart';
import 'widgets/clay_venue_card.dart';
import 'widgets/clay_home_header.dart';

/// Home screen with claymorphism design
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      ref.read(homeProvider.notifier).performSearch(value.trim());
    });
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);

    return Scaffold(
      backgroundColor: ClayColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: ClayColors.primary,
          onRefresh: () async {
            ref.invalidate(venuesProvider);
            await ref.read(homeProvider.notifier).refresh();
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // Header with logo and country toggle
              const SliverToBoxAdapter(
                child: ClayHomeHeader(),
              ),

              // Search bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: ClaySpacing.md),
                  child: ClaySearchBar(
                    hint: 'Search restaurants...',
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                  ),
                ),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: ClaySpacing.lg),
              ),

              // Section title
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: ClaySpacing.md),
                  child: Text(
                    '🍽️ Restaurants Near You',
                    style: ClayTypography.h2,
                  ),
                ),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: ClaySpacing.md),
              ),

              // Venues list
              if (homeState.isLoading && homeState.venues.isEmpty)
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: ClaySpacing.md),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => const Padding(
                        padding: EdgeInsets.only(bottom: ClaySpacing.md),
                        child: ClayVenueCardSkeleton(),
                      ),
                      childCount: 3,
                    ),
                  ),
                )
              else if (homeState.error != null && homeState.venues.isEmpty)
                SliverFillRemaining(
                  child: ClayEmptyState(
                    icon: Icons.error_outline_rounded,
                    title: 'Something went wrong',
                    subtitle: 'Please try again later',
                    action: ClayButtonSecondary(
                      label: 'Retry',
                      fullWidth: false,
                      onPressed: () => ref.read(homeProvider.notifier).refresh(),
                    ),
                  ),
                )
              else if (homeState.venues.isEmpty)
                const SliverFillRemaining(
                  child: ClayEmptyState(
                    icon: Icons.restaurant_menu_rounded,
                    title: 'No restaurants yet',
                    subtitle: 'Check back soon for delicious options!',
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: ClaySpacing.md),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final venue = homeState.venues[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: ClaySpacing.md),
                          child: ClayVenueCard(venue: venue),
                        );
                      },
                      childCount: homeState.venues.length,
                    ),
                  ),
                ),

              // Bottom padding for nav bar
              const SliverToBoxAdapter(
                child: SizedBox(height: 100),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Claymorphism search bar
class ClaySearchBar extends StatelessWidget {
  final String hint;
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const ClaySearchBar({
    super.key,
    required this.hint,
    required this.controller,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: ClaySpacing.md,
        vertical: ClaySpacing.sm,
      ),
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(ClayRadius.xl),
        boxShadow: ClayShadows.card,
      ),
      child: Row(
        children: [
          const Icon(
            Icons.search_rounded,
            color: ClayColors.textSecondary,
            size: 24,
          ),
          const SizedBox(width: ClaySpacing.sm),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              textInputAction: TextInputAction.search,
              style: ClayTypography.body,
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: ClayTypography.caption,
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ClayColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(ClayRadius.sm),
            ),
            child: const Icon(
              Icons.tune_rounded,
              color: ClayColors.primary,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}
