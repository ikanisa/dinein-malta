import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../cart/models/cart_item.dart';
import '../../../core/data/models/menu.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/design/widgets/clay_components.dart';
import '../../../core/utils/currency.dart';
import '../../../core/utils/haptics.dart';
import '../../cart/provider/cart_provider.dart';



/// Shows the item detail modal as a bottom sheet
Future<void> showItemDetailModal(
  BuildContext context, {
  required MenuItem item,
  required String venueId,
  required String currencyCode,
  required WidgetRef ref,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => ItemDetailModal(
      item: item,
      venueId: venueId,
      currencyCode: currencyCode,
      ref: ref,
    ),
  );
}

/// Full-screen item detail modal with modifiers, qty, and special instructions
class ItemDetailModal extends StatefulWidget {
  final MenuItem item;
  final String venueId;
  final String currencyCode;
  final WidgetRef ref;

  const ItemDetailModal({
    super.key,
    required this.item,
    required this.venueId,
    required this.currencyCode,
    required this.ref,
  });

  @override
  State<ItemDetailModal> createState() => _ItemDetailModalState();
}

class _ItemDetailModalState extends State<ItemDetailModal> {
  int _quantity = 1;
  final TextEditingController _notesController = TextEditingController();
  final Map<String, Set<String>> _selectedModifiers = {};

  @override
  void initState() {
    super.initState();
    // Initialize modifier selections
    for (final modifier in widget.item.modifiers) {
      _selectedModifiers[modifier.id] = {};
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  double get _totalPrice {
    double base = widget.item.price;
    // Add modifier price adjustments
    for (final modifier in widget.item.modifiers) {
      final selected = _selectedModifiers[modifier.id] ?? {};
      for (final option in modifier.options) {
        if (selected.contains(option.id)) {
          base += option.priceAdjustment;
        }
      }
    }
    return base * _quantity;
  }

  bool get _canAdd {
    // Check required modifiers
    for (final modifier in widget.item.modifiers) {
      if (modifier.required) {
        final selected = _selectedModifiers[modifier.id] ?? {};
        if (selected.isEmpty) {
          return false;
        }
      }
    }
    return widget.item.isAvailable;
  }

  void _toggleModifier(ItemModifier modifier, ModifierOption option) {
    setState(() {
      final selected = _selectedModifiers[modifier.id] ?? {};
      if (selected.contains(option.id)) {
        selected.remove(option.id);
      } else {
        if (modifier.allowMultiple) {
          if (selected.length < modifier.maxSelections) {
            selected.add(option.id);
          }
        } else {
          // Single selection - replace
          selected.clear();
          selected.add(option.id);
        }
      }
      _selectedModifiers[modifier.id] = selected;
    });
    Haptics.success();
  }

  void _addToCart() {
    if (!_canAdd) return;

    Haptics.mediumImpact();

    // Build selected modifiers string for display
    final modifierNames = <String>[];
    for (final modifier in widget.item.modifiers) {
      final selected = _selectedModifiers[modifier.id] ?? {};
      for (final option in modifier.options) {
        if (selected.contains(option.id)) {
          modifierNames.add(option.name);
        }
      }
    }

    final notes = _notesController.text.trim();
    final cartItem = CartItem(
      menuItem: widget.item,
      quantity: _quantity,
      notes: notes.isNotEmpty ? notes : null,
      selectedModifiers: modifierNames,
    );

    widget.ref.read(cartProvider.notifier).addCartItem(
      cartItem,
      widget.venueId,
      currencyCode: widget.currencyCode,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.item.name} added to cart'),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    Navigator.of(context).pop();
  }

  Widget _buildPlaceholderImage(Color color) {
    return Stack(
      children: [
        // Decorative circles
        Positioned(
          right: -30,
          bottom: -30,
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
          left: -20,
          top: -20,
          child: Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.15),
            ),
          ),
        ),
        // Center icon
        Center(
          child: Icon(
            Icons.restaurant_rounded,
            color: Colors.white.withValues(alpha: 0.7),
            size: 64,
          ),
        ),
      ],
    );
  }

  IconData _getDietaryIcon(String info) {
    final lower = info.toLowerCase();
    if (lower.contains('vegan')) return Icons.eco_rounded;
    if (lower.contains('vegetarian')) return Icons.grass_rounded;
    if (lower.contains('gluten')) return Icons.grain_rounded;
    if (lower.contains('halal')) return Icons.mosque_rounded;
    if (lower.contains('kosher')) return Icons.synagogue_rounded;
    if (lower.contains('organic')) return Icons.spa_rounded;
    if (lower.contains('dairy')) return Icons.no_drinks_rounded;
    return Icons.check_circle_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final hue = (widget.item.name.hashCode % 360).abs().toDouble();
    final itemColor = HSLColor.fromAHSL(1.0, hue, 0.25, 0.88).toColor();

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: ClayColors.surface,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(ClayRadius.xl),
            ),
          ),
          child: Column(
            children: [
              // Drag handle
              Container(
                margin: const EdgeInsets.only(top: ClaySpacing.md),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: ClayColors.textSecondary.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Scrollable content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(ClaySpacing.lg),
                  children: [
                    // Hero image section
                    Container(
                      height: 200,
                      decoration: BoxDecoration(
                        color: itemColor,
                        borderRadius: BorderRadius.circular(ClayRadius.lg),
                      ),
                      child: Stack(
                        children: [
                          // Real image or decorative placeholder
                          if (widget.item.imageUrl != null &&
                              widget.item.imageUrl!.isNotEmpty)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(ClayRadius.lg),
                              child: Image.network(
                                widget.item.imageUrl!,
                                width: double.infinity,
                                height: 200,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stack) =>
                                    _buildPlaceholderImage(itemColor),
                                loadingBuilder: (context, child, progress) {
                                  if (progress == null) return child;
                                  return Container(
                                    color: itemColor,
                                    child: Center(
                                      child: CircularProgressIndicator(
                                        color: Colors.white.withValues(alpha: 0.7),
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            )
                          else
                            _buildPlaceholderImage(itemColor),
                          // Popular / Recommended badges
                          if (widget.item.isPopular || widget.item.isRecommended)
                            Positioned(
                              top: ClaySpacing.sm,
                              right: ClaySpacing.sm,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: widget.item.isPopular
                                      ? ClayColors.warning
                                      : ClayColors.primary,
                                  borderRadius: BorderRadius.circular(ClayRadius.pill),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      widget.item.isPopular
                                          ? Icons.local_fire_department_rounded
                                          : Icons.star_rounded,
                                      color: Colors.white,
                                      size: 14,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      widget.item.isPopular ? 'Popular' : 'Recommended',
                                      style: ClayTypography.small.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          // Tags (dietary, spicy, etc.)
                          if (widget.item.tags.isNotEmpty)
                            Positioned(
                              top: ClaySpacing.md,
                              left: ClaySpacing.md,
                              child: Wrap(
                                spacing: 6,
                                children: widget.item.tags.map((tag) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.9),
                                      borderRadius: BorderRadius.circular(ClayRadius.pill),
                                    ),
                                    child: Text(
                                      tag,
                                      style: ClayTypography.small.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          // Unavailable overlay
                          if (!widget.item.isAvailable)
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(ClayRadius.lg),
                              ),
                              child: Center(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: ClayColors.error,
                                    borderRadius: BorderRadius.circular(ClayRadius.md),
                                  ),
                                  child: Text(
                                    'Currently Unavailable',
                                    style: ClayTypography.bodyMedium.copyWith(
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    const SizedBox(height: ClaySpacing.lg),

                    // Name and price
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            widget.item.name,
                            style: ClayTypography.h2,
                          ),
                        ),
                        Text(
                          CurrencyUtils.format(widget.item.price, widget.currencyCode),
                          style: ClayTypography.price.copyWith(fontSize: 22),
                        ),
                      ],
                    ),

                    // Description
                    if (widget.item.description != null &&
                        widget.item.description!.isNotEmpty) ...[
                      const SizedBox(height: ClaySpacing.sm),
                      Text(
                        widget.item.description!,
                        style: ClayTypography.body.copyWith(
                          color: ClayColors.textSecondary,
                        ),
                      ),
                    ],

                    // Allergen warnings
                    if (widget.item.allergens.isNotEmpty) ...[
                      const SizedBox(height: ClaySpacing.md),
                      Container(
                        padding: const EdgeInsets.all(ClaySpacing.md),
                        decoration: BoxDecoration(
                          color: ClayColors.warning.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(ClayRadius.md),
                          border: Border.all(
                            color: ClayColors.warning.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.warning_amber_rounded,
                              color: ClayColors.warning,
                              size: 20,
                            ),
                            const SizedBox(width: ClaySpacing.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Contains allergens',
                                    style: ClayTypography.small.copyWith(
                                      color: ClayColors.warning,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    widget.item.allergens.join(', '),
                                    style: ClayTypography.body.copyWith(
                                      color: ClayColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Dietary info
                    if (widget.item.dietaryInfo.isNotEmpty) ...[
                      const SizedBox(height: ClaySpacing.md),
                      Wrap(
                        spacing: ClaySpacing.sm,
                        runSpacing: ClaySpacing.sm,
                        children: widget.item.dietaryInfo.map((info) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: ClayColors.success.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(ClayRadius.pill),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  _getDietaryIcon(info),
                                  size: 14,
                                  color: ClayColors.success,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  info,
                                  style: ClayTypography.small.copyWith(
                                    color: ClayColors.success,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ],

                    // Modifiers
                    if (widget.item.modifiers.isNotEmpty) ...[
                      const SizedBox(height: ClaySpacing.xl),
                      ...widget.item.modifiers.map((modifier) {
                        return _ModifierSection(
                          modifier: modifier,
                          selectedOptions: _selectedModifiers[modifier.id] ?? {},
                          currencyCode: widget.currencyCode,
                          onToggle: (option) => _toggleModifier(modifier, option),
                        );
                      }),
                    ],

                    // Special instructions
                    const SizedBox(height: ClaySpacing.xl),
                    Text(
                      'Special Instructions',
                      style: ClayTypography.bodyMedium,
                    ),
                    const SizedBox(height: ClaySpacing.sm),
                    ClayTextField(
                      controller: _notesController,
                      hintText: 'E.g., No onions, extra spicy...',
                      maxLines: 3,
                    ),
                    Text(
                      'Optional - let us know about allergies or preferences',
                      style: ClayTypography.caption,
                    ),

                    // Bottom padding for fixed footer
                    const SizedBox(height: 100),
                  ],
                ),
              ),

              // Fixed footer with qty and add button
              Container(
                padding: const EdgeInsets.all(ClaySpacing.md),
                decoration: BoxDecoration(
                  color: ClayColors.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: Row(
                    children: [
                      // Quantity controls
                      Container(
                        decoration: BoxDecoration(
                          color: ClayColors.background,
                          borderRadius: BorderRadius.circular(ClayRadius.md),
                          boxShadow: ClayShadows.subtle,
                        ),
                        child: Row(
                          children: [
                            _QtyButton(
                              icon: Icons.remove,
                              onTap: _quantity > 1
                                  ? () => setState(() => _quantity--)
                                  : null,
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: ClaySpacing.md,
                              ),
                              child: Text(
                                '$_quantity',
                                style: ClayTypography.h3,
                              ),
                            ),
                            _QtyButton(
                              icon: Icons.add,
                              onTap: () => setState(() => _quantity++),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: ClaySpacing.md),

                      // Add to cart button
                      Expanded(
                        child: ClayButton(
                          label:
                              'Add to Cart • ${CurrencyUtils.format(_totalPrice, widget.currencyCode)}',
                          onPressed: _canAdd ? _addToCart : null,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _QtyButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isEnabled = onTap != null;
    return GestureDetector(
      onTap: () {
        if (onTap != null) {
          Haptics.lightImpact();
          onTap!();
        }
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        child: Icon(
          icon,
          size: 20,
          color: isEnabled ? ClayColors.primary : ClayColors.textSecondary,
        ),
      ),
    );
  }
}

class _ModifierSection extends StatelessWidget {
  final ItemModifier modifier;
  final Set<String> selectedOptions;
  final String currencyCode;
  final void Function(ModifierOption) onToggle;

  const _ModifierSection({
    required this.modifier,
    required this.selectedOptions,
    required this.currencyCode,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final subtitle = modifier.required
        ? 'Required'
        : modifier.allowMultiple
            ? 'Select up to ${modifier.maxSelections}'
            : 'Optional';

    return Padding(
      padding: const EdgeInsets.only(bottom: ClaySpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  modifier.name,
                  style: ClayTypography.bodyMedium,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: modifier.required
                      ? ClayColors.error.withValues(alpha: 0.1)
                      : ClayColors.textSecondary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(ClayRadius.pill),
                ),
                child: Text(
                  subtitle,
                  style: ClayTypography.small.copyWith(
                    color: modifier.required
                        ? ClayColors.error
                        : ClayColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: ClaySpacing.sm),
          Wrap(
            spacing: ClaySpacing.sm,
            runSpacing: ClaySpacing.sm,
            children: modifier.options.map((option) {
              final isSelected = selectedOptions.contains(option.id);
              final priceText = option.priceAdjustment > 0
                  ? ' +${CurrencyUtils.format(option.priceAdjustment, currencyCode)}'
                  : option.priceAdjustment < 0
                      ? ' ${CurrencyUtils.format(option.priceAdjustment, currencyCode)}'
                      : '';

              return GestureDetector(
                onTap: option.isAvailable ? () => onToggle(option) : null,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? ClayColors.primary
                        : ClayColors.background,
                    borderRadius: BorderRadius.circular(ClayRadius.md),
                    border: Border.all(
                      color: isSelected
                          ? ClayColors.primary
                          : ClayColors.textSecondary.withValues(alpha: 0.2),
                      width: 1.5,
                    ),
                  ),
                  child: Text(
                    '${option.name}$priceText',
                    style: ClayTypography.body.copyWith(
                      color: isSelected ? Colors.white : ClayColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
