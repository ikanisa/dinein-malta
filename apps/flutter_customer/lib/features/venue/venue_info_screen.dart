import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/models/venue.dart';
import 'venue_menu_screen.dart'; // For venueBySlugProvider
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';

/// Venue information screen showing details and features
class VenueInfoScreen extends ConsumerWidget {
  final String slug;

  const VenueInfoScreen({super.key, required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final venueAsync = ref.watch(venueBySlugProvider(slug));

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
        title: Text('About', style: ClayTypography.h3),
      ),
      body: venueAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: ClayColors.primary),
        ),
        error: (err, stack) => ClayEmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Could not load venue',
          subtitle: err.toString(),
        ),
        data: (venue) {
          if (venue == null) {
            return const ClayEmptyState(
              icon: Icons.storefront_rounded,
              title: 'Venue not found',
              subtitle: 'This restaurant may have moved or closed.',
            );
          }
          return _VenueInfoContent(venue: venue);
        },
      ),
    );
  }
}

class _VenueInfoContent extends StatelessWidget {
  final Venue venue;

  const _VenueInfoContent({required this.venue});

  @override
  Widget build(BuildContext context) {
    // Generate color from venue name
    final hue = (venue.name.hashCode % 360).abs().toDouble();
    final headerColor = HSLColor.fromAHSL(1.0, hue, 0.35, 0.8).toColor();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(ClaySpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(ClaySpacing.xl),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [headerColor, headerColor.withValues(alpha: 0.7)],
              ),
              borderRadius: BorderRadius.circular(ClayRadius.xl),
              boxShadow: ClayShadows.card,
            ),
            child: Column(
              children: [
                // Logo or placeholder
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.3),
                    shape: BoxShape.circle,
                  ),
                  child: venue.logoUrl != null && venue.logoUrl!.isNotEmpty
                      ? ClipOval(
                          child: Image.network(
                            venue.logoUrl!,
                            width: 48,
                            height: 48,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(
                              Icons.restaurant_rounded,
                              size: 48,
                              color: Colors.white,
                            ),
                          ),
                        )
                      : const Icon(
                          Icons.restaurant_rounded,
                          size: 48,
                          color: Colors.white,
                        ),
                ),
                const SizedBox(height: ClaySpacing.md),
                Text(
                  venue.name,
                  style: ClayTypography.h1.copyWith(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                if (venue.description != null &&
                    venue.description!.isNotEmpty) ...[
                  const SizedBox(height: ClaySpacing.sm),
                  Text(
                    venue.description!,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: ClaySpacing.lg),

          // Details section
          Text('Details', style: ClayTypography.h3),
          const SizedBox(height: ClaySpacing.sm),
          ClayCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _DetailTile(
                  icon: Icons.flag_rounded,
                  title: 'Country',
                  value: venue.country == 'RW' ? 'Rwanda 🇷🇼' : 'Malta 🇲🇹',
                ),
                if (venue.paymentMethods.isNotEmpty) ...[
                  const Divider(height: 1),
                  _DetailTile(
                    icon: Icons.payment_rounded,
                    title: 'Payment Methods',
                    value: _formatPaymentMethods(venue.paymentMethods),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: ClaySpacing.lg),

          // Amenities section
          if (venue.amenities.isNotEmpty) ...[
            Text('Features', style: ClayTypography.h3),
            const SizedBox(height: ClaySpacing.sm),
            ClayCard(
              child: Wrap(
                spacing: ClaySpacing.sm,
                runSpacing: ClaySpacing.sm,
                children: venue.amenities.map((amenity) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: ClaySpacing.md,
                      vertical: ClaySpacing.sm,
                    ),
                    decoration: BoxDecoration(
                      color: ClayColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(ClayRadius.md),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getAmenityIcon(amenity),
                          size: 16,
                          color: ClayColors.primary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          amenity,
                          style: ClayTypography.small.copyWith(
                            color: ClayColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: ClaySpacing.lg),
          ],

          // Operating hours placeholder
          Text('Operating Hours', style: ClayTypography.h3),
          const SizedBox(height: ClaySpacing.sm),
          ClayCard(
            child: Column(
              children: [
                _HoursRow(day: 'Monday', hours: '9:00 AM - 10:00 PM'),
                _HoursRow(day: 'Tuesday', hours: '9:00 AM - 10:00 PM'),
                _HoursRow(day: 'Wednesday', hours: '9:00 AM - 10:00 PM'),
                _HoursRow(day: 'Thursday', hours: '9:00 AM - 10:00 PM'),
                _HoursRow(day: 'Friday', hours: '9:00 AM - 11:00 PM'),
                _HoursRow(day: 'Saturday', hours: '10:00 AM - 11:00 PM'),
                _HoursRow(day: 'Sunday', hours: '10:00 AM - 9:00 PM'),
              ],
            ),
          ),
          const SizedBox(height: 100), // Bottom padding
        ],
      ),
    );
  }

  String _formatPaymentMethods(List<String> methods) {
    return methods.map((m) {
      switch (m) {
        case 'Cash':
          return 'Cash 💵';
        case 'MoMoUSSD':
          return 'Mobile Money';
        case 'RevolutLink':
          return 'Revolut';
        default:
          return m;
      }
    }).join(', ');
  }

  IconData _getAmenityIcon(String amenity) {
    final lower = amenity.toLowerCase();
    if (lower.contains('wifi')) return Icons.wifi_rounded;
    if (lower.contains('parking')) return Icons.local_parking_rounded;
    if (lower.contains('outdoor')) return Icons.outdoor_grill_rounded;
    if (lower.contains('terrace')) return Icons.deck_rounded;
    if (lower.contains('ac') || lower.contains('air')) {
      return Icons.ac_unit_rounded;
    }
    if (lower.contains('live')) return Icons.music_note_rounded;
    if (lower.contains('vegan')) return Icons.eco_rounded;
    if (lower.contains('halal')) return Icons.restaurant_rounded;
    return Icons.check_circle_rounded;
  }
}

class _DetailTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color? valueColor;

  const _DetailTile({
    required this.icon,
    required this.title,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(ClaySpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ClayColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(ClayRadius.sm),
            ),
            child: Icon(icon, color: ClayColors.primary, size: 20),
          ),
          const SizedBox(width: ClaySpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: ClayTypography.small),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: ClayTypography.bodyMedium.copyWith(
                    color: valueColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HoursRow extends StatelessWidget {
  final String day;
  final String hours;

  const _HoursRow({required this.day, required this.hours});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: ClaySpacing.md,
        vertical: ClaySpacing.sm,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(day, style: ClayTypography.body),
          Text(
            hours,
            style: ClayTypography.bodyMedium.copyWith(
              color: ClayColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
