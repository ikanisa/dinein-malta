import 'package:flutter/material.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/data/models/menu.dart';

/// Claymorphism menu item tile
class ClayMenuItemTile extends StatelessWidget {
  final MenuItem item;
  final VoidCallback onAdd;

  const ClayMenuItemTile({
    super.key,
    required this.item,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    // Generate a pastel color based on item name
    final hue = (item.name.hashCode % 360).abs().toDouble();
    final itemColor = HSLColor.fromAHSL(1.0, hue, 0.25, 0.88).toColor();

    return Container(
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(ClayRadius.lg),
        boxShadow: ClayShadows.card,
      ),
      child: Row(
        children: [
          // Item image placeholder
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: itemColor,
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(ClayRadius.lg),
              ),
            ),
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
                  if (item.description != null && item.description!.isNotEmpty) ...[
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
                    '€${item.price.toStringAsFixed(2)}',
                    style: ClayTypography.price,
                  ),
                ],
              ),
            ),
          ),

          // Add button
          Padding(
            padding: const EdgeInsets.only(right: ClaySpacing.md),
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
        ],
      ),
    );
  }
}
