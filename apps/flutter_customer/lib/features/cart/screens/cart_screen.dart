import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/cart_item.dart';
import '../provider/cart_provider.dart';
import '../../../core/utils/haptics.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/design/widgets/clay_components.dart';

/// Cart screen with claymorphism design
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);

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
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Your Cart', style: ClayTypography.h2),
        centerTitle: false,
        actions: [
          if (cartState.items.isNotEmpty)
            IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: ClayColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(ClayRadius.sm),
                ),
                child: const Icon(
                  Icons.delete_outline_rounded,
                  size: 20,
                  color: ClayColors.error,
                ),
              ),
              onPressed: () => notifier.clear(),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: cartState.items.isEmpty
          ? const ClayEmptyState(
              icon: Icons.shopping_cart_outlined,
              title: 'Your cart is empty',
              subtitle: 'Add delicious items from the menu!',
            )
          : Column(
              children: [
                // Cart items
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(ClaySpacing.md),
                    itemCount: cartState.items.length,
                    itemBuilder: (context, index) {
                      final item = cartState.items[index];
                      final itemTotal = item.menuItem.price * item.quantity;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: ClaySpacing.md),
                        child: ClayCard(
                          child: Row(
                            children: [
                              // Item image placeholder
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      ClayColors.primary.withValues(alpha: 0.2),
                                      ClayColors.accent.withValues(alpha: 0.2),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(ClayRadius.md),
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.restaurant_menu_rounded,
                                    color: ClayColors.primary,
                                    size: 28,
                                  ),
                                ),
                              ),
                              const SizedBox(width: ClaySpacing.md),

                              // Item details
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.menuItem.name,
                                      style: ClayTypography.bodyMedium,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '€${item.menuItem.price.toStringAsFixed(2)} each',
                                      style: ClayTypography.caption,
                                    ),
                                  ],
                                ),
                              ),

                              // Quantity & total
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '€${itemTotal.toStringAsFixed(2)}',
                                    style: ClayTypography.price,
                                  ),
                                  const SizedBox(height: 8),
                                  // Quantity controls
                                  Container(
                                    decoration: BoxDecoration(
                                      color: ClayColors.background,
                                      borderRadius: BorderRadius.circular(ClayRadius.pill),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        _QuantityButton(
                                          icon: Icons.remove,
                                          onTap: () => notifier.removeItem(item.menuItem),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 12),
                                          child: Text(
                                            '${item.quantity}',
                                            style: ClayTypography.bodyMedium,
                                          ),
                                        ),
                                        _QuantityButton(
                                          icon: Icons.add,
                                          onTap: () => notifier.addItem(item.menuItem, cartState.venueId ?? ''),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Bottom bar
                Container(
                  padding: const EdgeInsets.all(ClaySpacing.md),
                  decoration: BoxDecoration(
                    color: ClayColors.surface,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(ClayRadius.xl),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 20,
                        offset: const Offset(0, -4),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Total row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total', style: ClayTypography.h3),
                            Text(
                              '€${cartState.total.toStringAsFixed(2)}',
                              style: ClayTypography.h2.copyWith(
                                color: ClayColors.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: ClaySpacing.md),
                        
                        // Checkout button
                        ClayButton(
                          label: 'Proceed to Checkout',
                          icon: Icons.arrow_forward_rounded,
                          onPressed: () {
                            Haptics.mediumImpact();
                            context.push('/checkout');
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _QuantityButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: ClayColors.primary.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 16,
          color: ClayColors.primary,
        ),
      ),
    );
  }
}
