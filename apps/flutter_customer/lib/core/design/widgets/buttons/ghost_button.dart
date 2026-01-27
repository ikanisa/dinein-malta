import 'package:flutter/material.dart';
import '../../tokens/radii.dart';
import '../../tokens/spacing.dart';

class GhostButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  const GhostButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return TextButton(
      style: TextButton.styleFrom(
        foregroundColor: theme.colorScheme.onSurface,
        shape: RoundedRectangleBorder(borderRadius: Radii.r12),
        padding: const EdgeInsets.symmetric(
            horizontal: Spacing.lg16, vertical: Spacing.md12),
      ),
      onPressed: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 20),
            const SizedBox(width: Spacing.sm8),
          ],
          Text(
            label,
            style: theme.textTheme.labelLarge,
          ),
        ],
      ),
    );
  }
}
