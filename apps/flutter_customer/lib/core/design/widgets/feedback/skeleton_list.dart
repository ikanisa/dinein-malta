import 'package:flutter/material.dart';
import '../../tokens/radii.dart';
import '../../tokens/spacing.dart';

class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 6,
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: Spacing.md12),
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              color:
                  Theme.of(context).colorScheme.surface.withValues(alpha: 0.3),
              borderRadius: Radii.r12,
            ),
          ),
        );
      },
    );
  }
}
