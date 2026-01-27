import 'package:flutter/material.dart';
import '../tokens/clay_design.dart';

/// Claymorphism Card - soft 3D effect with rounded corners
class ClayCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final VoidCallback? onTap;

  const ClayCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius = ClayRadius.lg,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: ClayShadows.card,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(borderRadius),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(ClaySpacing.md),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Claymorphism Primary Button
class ClayButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final bool fullWidth;

  const ClayButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.fullWidth = true,
  });

  @override
  State<ClayButton> createState() => _ClayButtonState();
}

class _ClayButtonState extends State<ClayButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.isLoading ? null : widget.onPressed,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: widget.fullWidth ? double.infinity : null,
        padding: EdgeInsets.symmetric(
          horizontal: ClaySpacing.lg,
          vertical: _isPressed ? 14 : 16,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              ClayColors.primary,
              ClayColors.primaryDark,
            ],
          ),
          borderRadius: BorderRadius.circular(ClayRadius.xl),
          boxShadow: _isPressed ? ClayShadows.buttonPressed : ClayShadows.button,
        ),
        child: widget.isLoading
            ? const Center(
                child: SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation(Colors.white),
                  ),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
                children: [
                  if (widget.icon != null) ...[
                    Icon(widget.icon, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    widget.label,
                    style: ClayTypography.button.copyWith(color: Colors.white),
                  ),
                ],
              ),
      ),
    );
  }
}

/// Claymorphism Secondary Button (outlined)
class ClayButtonSecondary extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool fullWidth;

  const ClayButtonSecondary({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.fullWidth = true,
  });

  @override
  State<ClayButtonSecondary> createState() => _ClayButtonSecondaryState();
}

class _ClayButtonSecondaryState extends State<ClayButtonSecondary> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onPressed,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: widget.fullWidth ? double.infinity : null,
        padding: EdgeInsets.symmetric(
          horizontal: ClaySpacing.lg,
          vertical: _isPressed ? 14 : 16,
        ),
        decoration: BoxDecoration(
          color: ClayColors.surface,
          borderRadius: BorderRadius.circular(ClayRadius.xl),
          border: Border.all(
            color: ClayColors.primary.withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: _isPressed ? ClayShadows.buttonPressed : ClayShadows.subtle,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
          children: [
            if (widget.icon != null) ...[
              Icon(widget.icon, color: ClayColors.primary, size: 20),
              const SizedBox(width: 8),
            ],
            Text(
              widget.label,
              style: ClayTypography.button.copyWith(color: ClayColors.primary),
            ),
          ],
        ),
      ),
    );
  }
}

/// Claymorphism Text Field
class ClayTextField extends StatelessWidget {
  final String? label;
  final String? hintText;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final IconData? prefixIcon;
  final bool obscureText;
  final bool autofocus;

  const ClayTextField({
    super.key,
    this.label,
    this.hintText,
    this.controller,
    this.keyboardType,
    this.prefixIcon,
    this.obscureText = false,
    this.autofocus = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: ClayTypography.caption),
          const SizedBox(height: 8),
        ],
        Container(
          decoration: BoxDecoration(
            color: ClayColors.surface,
            borderRadius: BorderRadius.circular(ClayRadius.md),
            boxShadow: ClayShadows.subtle,
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            obscureText: obscureText,
            autofocus: autofocus,
            style: ClayTypography.body,
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: ClayTypography.caption,
              prefixIcon: prefixIcon != null
                  ? Icon(prefixIcon, color: ClayColors.textSecondary)
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(ClayRadius.md),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Colors.transparent,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: ClaySpacing.md,
                vertical: ClaySpacing.md,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Claymorphism Chip/Badge
class ClayChip extends StatelessWidget {
  final String label;
  final Color? color;
  final IconData? icon;

  const ClayChip({
    super.key,
    required this.label,
    this.color,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final chipColor = color ?? ClayColors.secondary;
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: ClaySpacing.sm + 4,
        vertical: ClaySpacing.xs + 2,
      ),
      decoration: BoxDecoration(
        color: chipColor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(ClayRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: chipColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: chipColor,
            ),
          ),
        ],
      ),
    );
  }
}

/// Empty state widget with friendly illustration placeholder
class ClayEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  const ClayEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(ClaySpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: ClayColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 48,
                color: ClayColors.primary,
              ),
            ),
            const SizedBox(height: ClaySpacing.lg),
            Text(
              title,
              style: ClayTypography.h3,
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: ClaySpacing.sm),
              Text(
                subtitle!,
                style: ClayTypography.caption,
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: ClaySpacing.lg),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
