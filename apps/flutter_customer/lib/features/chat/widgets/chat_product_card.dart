import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/data/models/menu.dart';
import '../../../core/utils/currency.dart';
import '../../cart/provider/cart_provider.dart';

/// Compact product card for displaying menu items in chat
/// Designed for AI recommendations and inline cart actions
class ChatProductCard extends ConsumerWidget {
  final MenuItem item;
  final String venueId;
  final String currencyCode;
  final VoidCallback? onTap;

  const ChatProductCard({
    super.key,
    required this.item,
    required this.venueId,
    required this.currencyCode,
    this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hue = (item.name.hashCode % 360).abs().toDouble();
    final itemColor = HSLColor.fromAHSL(1.0, hue, 0.25, 0.88).toColor();

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(ClayRadius.md),
        boxShadow: ClayShadows.subtle,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(ClayRadius.md),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(ClayRadius.md),
          child: Padding(
            padding: const EdgeInsets.all(ClaySpacing.sm),
            child: Row(
              children: [
                // Item image or placeholder
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: itemColor,
                    borderRadius: BorderRadius.circular(ClayRadius.sm),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                      ? Image.network(
                          item.imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _ImagePlaceholder(color: itemColor),
                        )
                      : _ImagePlaceholder(color: itemColor),
                ),

                const SizedBox(width: ClaySpacing.sm),

                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        item.name,
                        style: ClayTypography.bodyMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (item.description != null && item.description!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          item.description!,
                          style: ClayTypography.small.copyWith(
                            color: ClayColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 4),
                      Text(
                        CurrencyUtils.format(item.price, currencyCode),
                        style: ClayTypography.price.copyWith(fontSize: 14),
                      ),
                    ],
                  ),
                ),

                // Add to cart button
                GestureDetector(
                  onTap: () {
                    ref.read(cartProvider.notifier).addItem(
                      item,
                      venueId,
                      currencyCode: currencyCode,
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${item.name} added to cart'),
                        duration: const Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                        action: SnackBarAction(
                          label: 'View Cart',
                          onPressed: () {
                            Navigator.of(context).pushNamed('/cart');
                          },
                        ),
                      ),
                    );
                  },
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
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Small placeholder for menu items without images
class _ImagePlaceholder extends StatelessWidget {
  final Color color;

  const _ImagePlaceholder({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: color,
      child: Center(
        child: Icon(
          Icons.restaurant_rounded,
          color: Colors.white.withValues(alpha: 0.7),
          size: 24,
        ),
      ),
    );
  }
}

/// Horizontal scrollable list of product cards for AI recommendations
class ChatProductCardList extends StatelessWidget {
  final List<MenuItem> items;
  final String venueId;
  final String currencyCode;

  const ChatProductCardList({
    super.key,
    required this.items,
    required this.venueId,
    required this.currencyCode,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          return SizedBox(
            width: 240,
            child: ChatProductCard(
              item: items[index],
              venueId: venueId,
              currencyCode: currencyCode,
            ),
          );
        },
      ),
    );
  }
}
