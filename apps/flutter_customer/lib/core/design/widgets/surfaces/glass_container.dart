import 'dart:ui';
import 'package:flutter/material.dart';
import '../../tokens/glass.dart';
import '../../tokens/radii.dart';
import '../../tokens/colors.dart';

class GlassContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final VoidCallback? onPressed;
  final bool border;

  const GlassContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.borderRadius,
    this.onPressed,
    this.border = true,
  });

  @override
  Widget build(BuildContext context) {
    final br = borderRadius ?? Radii.r12;

    Widget content = ClipRRect(
      borderRadius: br,
      child: BackdropFilter(
        filter: ImageFilter.blur(
          sigmaX: GlassEffects.blurLight,
          sigmaY: GlassEffects.blurLight,
        ),
        child: Container(
          width: width,
          height: height,
          padding: padding,
          decoration: BoxDecoration(
            color: DineInColors.candlelight.surfaceGlass, // Use appropriate theme color later
            borderRadius: br,
            border: border
                ? Border.all(
                    color: Colors.white.withValues(alpha: GlassEffects.borderOpacity),
                    width: 1,
                  )
                : null,
          ),
          child: child,
        ),
      ),
    );

    if (margin != null) {
      content = Padding(padding: margin!, child: content);
    }

    if (onPressed != null) {
      return GestureDetector(
        onTap: onPressed,
        child: content,
      );
    }

    return content;
  }
}
