import 'package:flutter/material.dart';
import '../../tokens/radii.dart';
import '../../tokens/spacing.dart';

class PillChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback? onTap;

  const PillChip({
    super.key,
    required this.label,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // We handle custom coloring because Material 3 FilterChip default needs heavy theme tweaking
    // to match our Liquid Glass look.
    
    // const palette = DineInColors.candlelight; 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final activeColor = theme.colorScheme.primary;
    final inactiveColor = isDark ? const Color(0x33FFFFFF) : const Color(0x11000000); // Glass-ish border
    final activeText = theme.colorScheme.onPrimary;
    final inactiveText = theme.colorScheme.onSurface;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: Spacing.lg16, vertical: Spacing.sm8),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.transparent,
          borderRadius: Radii.rPill,
          border: Border.all(
            color: isSelected ? activeColor : inactiveColor,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            color: isSelected ? activeText : inactiveText,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
