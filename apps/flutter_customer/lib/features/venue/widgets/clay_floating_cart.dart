import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../cart/provider/cart_provider.dart';
import '../../../core/utils/haptics.dart';
import '../../../core/utils/currency.dart';

/// Claymorphism floating cart pill
class ClayFloatingCart extends ConsumerWidget {
  const ClayFloatingCart({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);

    if (cart.items.isEmpty) {
      return const SizedBox.shrink();
    }

    final itemCount = cart.items.fold<int>(0, (sum, item) => sum + item.quantity);
    final totalFormatted = CurrencyUtils.format(cart.total, cart.currencyCode);

    return Semantics(
      button: true,
      label: 'View cart with $itemCount items, total $totalFormatted',
      child: GestureDetector(
        onTap: () {
          Haptics.mediumImpact();
          context.push('/cart');
        },
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: ClaySpacing.lg),
          padding: const EdgeInsets.symmetric(
            horizontal: ClaySpacing.lg,
            vertical: ClaySpacing.md,
          ),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [ClayColors.primary, ClayColors.primaryDark],
            ),
            borderRadius: BorderRadius.circular(ClayRadius.pill),
            boxShadow: [
              BoxShadow(
                color: ClayColors.primary.withValues(alpha: 0.4),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(ClayRadius.pill),
                ),
                child: Text(
                  '$itemCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'View Cart',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                totalFormatted,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
              const SizedBox(width: 8),
              const Icon(
                Icons.arrow_forward_rounded,
                color: Colors.white,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
