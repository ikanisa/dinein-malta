import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/data/models/menu.dart';
import '../../../core/utils/currency.dart';
import 'item_detail_modal.dart';

/// Claymorphism menu item tile
class ClayMenuItemTile extends ConsumerWidget {
  final MenuItem item;
  final VoidCallback onAdd;
  final String currencyCode;
  final String venueId;

  const ClayMenuItemTile({
    super.key,
    required this.item,
    required this.onAdd,
    required this.currencyCode,
    required this.venueId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Generate a pastel color based on item name
    final hue = (item.name.hashCode % 360).abs().toDouble();
    final itemColor = HSLColor.fromAHSL(1.0, hue, 0.25, 0.88).toColor();

    return GestureDetector(
      onTap: () => showItemDetailModal(
        context,
        item: item,
        venueId: venueId,
        currencyCode: currencyCode,
        ref: ref,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: ClayColors.surface,
          borderRadius: BorderRadius.circular(ClayRadius.lg),
          boxShadow: ClayShadows.card,
        ),
        child: Row(
          children: [
            // Item image or placeholder
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: itemColor,
                borderRadius: const BorderRadius.horizontal(
                  left: Radius.circular(ClayRadius.lg),
                ),
              ),
              clipBehavior: Clip.antiAlias,
              child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                  ? Image.network(
                      item.imageUrl!,
                      fit: BoxFit.cover,
                      width: 100,
                      height: 100,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Center(
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white.withValues(alpha: 0.7),
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return _ImagePlaceholder(color: itemColor);
                      },
                    )
                  : _ImagePlaceholder(color: itemColor),
            ),

            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(ClaySpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: ClayTypography.bodyMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (item.description != null &&
                        item.description!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        item.description!,
                        style: ClayTypography.small,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Text(
                      CurrencyUtils.format(item.price, currencyCode),
                      style: ClayTypography.price,
                    ),
                  ],
                ),
              ),
            ),

            // Add button (quick add without opening modal)
            Padding(
              padding: const EdgeInsets.only(right: ClaySpacing.md),
              child: Semantics(
                button: true,
                label: 'Add ${item.name} to cart',
                child: Tooltip(
                  message: 'Add to cart',
                  child: GestureDetector(
                    onTap: onAdd,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [ClayColors.primary, ClayColors.primaryDark],
                        ),
                        borderRadius: BorderRadius.circular(ClayRadius.sm),
                        boxShadow: ClayShadows.subtle,
                      ),
                      child: const Icon(
                        Icons.add_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Placeholder widget for menu items without images
class _ImagePlaceholder extends StatelessWidget {
  final Color color;

  const _ImagePlaceholder({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: color,
      child: Stack(
        children: [
          // Decorative circle
          Positioned(
            right: -15,
            bottom: -15,
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.2),
              ),
            ),
          ),
          // Icon
          Center(
            child: Icon(
              Icons.restaurant_rounded,
              color: Colors.white.withValues(alpha: 0.7),
              size: 32,
            ),
          ),
        ],
      ),
    );
  }
}
