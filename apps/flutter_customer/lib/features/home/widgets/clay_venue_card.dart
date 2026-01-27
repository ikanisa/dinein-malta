import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/routes.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/data/models/venue.dart';

/// Claymorphism venue card with friendly styling
class ClayVenueCard extends StatelessWidget {
  final Venue venue;

  const ClayVenueCard({super.key, required this.venue});

  @override
  Widget build(BuildContext context) {
    // Generate a pastel color based on venue name
    final hue = (venue.name.hashCode % 360).abs().toDouble();
    final cardColor = HSLColor.fromAHSL(1.0, hue, 0.3, 0.85).toColor();

    return GestureDetector(
      onTap: () => context.push(Routes.venuePath(venue.slug)),
      child: Container(
        decoration: BoxDecoration(
          color: ClayColors.surface,
          borderRadius: BorderRadius.circular(ClayRadius.xl),
          boxShadow: ClayShadows.card,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image placeholder with soft gradient
            Container(
              height: 140,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(ClayRadius.xl),
                ),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    cardColor,
                    cardColor.withValues(alpha: 0.6),
                  ],
                ),
              ),
              child: Stack(
                children: [
                  // Decorative circles for 3D effect
                  Positioned(
                    right: -20,
                    top: -20,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 20,
                    bottom: 20,
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.15),
                      ),
                    ),
                  ),
                  // Restaurant icon
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.restaurant_rounded,
                        size: 36,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  // Rating badge
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(ClayRadius.pill),
                        boxShadow: ClayShadows.subtle,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            size: 16,
                            color: Color(0xFFFFB800),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '4.${(venue.name.length % 5) + 5}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: ClayColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(ClaySpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Venue name
                  Text(
                    venue.name,
                    style: ClayTypography.h3,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Location
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_rounded,
                        size: 16,
                        color: ClayColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          venue.description?.isNotEmpty == true
                              ? venue.description!
                              : 'Delicious food awaits',
                          style: ClayTypography.caption,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: ClaySpacing.sm),

                  // Tags
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _VenueTag(
                        icon: Icons.access_time_rounded,
                        label: '15-25 min',
                        color: ClayColors.secondary,
                      ),
                      _VenueTag(
                        icon: Icons.restaurant_menu_rounded,
                        label: 'Dine-in',
                        color: ClayColors.accent,
                      ),
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

class _VenueTag extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _VenueTag({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(ClayRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

/// Skeleton loading state for venue card
class ClayVenueCardSkeleton extends StatelessWidget {
  const ClayVenueCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(ClayRadius.xl),
        boxShadow: ClayShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image skeleton
          Container(
            height: 140,
            decoration: BoxDecoration(
              color: ClayColors.background,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(ClayRadius.xl),
              ),
            ),
          ),
          // Content skeleton
          Padding(
            padding: const EdgeInsets.all(ClaySpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 20,
                  width: 150,
                  decoration: BoxDecoration(
                    color: ClayColors.background,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  height: 14,
                  width: 200,
                  decoration: BoxDecoration(
                    color: ClayColors.background,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      height: 26,
                      width: 80,
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.pill),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      height: 26,
                      width: 60,
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.pill),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
