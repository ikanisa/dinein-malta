import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../provider/home_provider.dart';
import '../../../core/design/tokens/clay_design.dart';

/// Claymorphism home header with logo and country toggle
class ClayHomeHeader extends ConsumerWidget {
  const ClayHomeHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeProvider);

    return Padding(
      padding: const EdgeInsets.all(ClaySpacing.md),
      child: Row(
        children: [
          // Logo
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  ClayColors.primary,
                  ClayColors.primaryDark,
                ],
              ),
              borderRadius: BorderRadius.circular(ClayRadius.md),
              boxShadow: ClayShadows.subtle,
            ),
            child: const Icon(
              Icons.restaurant_menu_rounded,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: ClaySpacing.sm),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'DineIn',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: ClayColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              Text(
                'Order at your table',
                style: TextStyle(
                  fontSize: 12,
                  color: ClayColors.textSecondary,
                ),
              ),
            ],
          ),
          const Spacer(),

          // Country toggle
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: ClayColors.surface,
              borderRadius: BorderRadius.circular(ClayRadius.pill),
              boxShadow: ClayShadows.subtle,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _CountryPill(
                  emoji: '🇷🇼',
                  code: 'RW',
                  isActive: homeState.activeCountry == 'RW',
                  onTap: () => ref.read(homeProvider.notifier).switchCountry('RW'),
                ),
                _CountryPill(
                  emoji: '🇲🇹',
                  code: 'MT',
                  isActive: homeState.activeCountry == 'MT',
                  onTap: () => ref.read(homeProvider.notifier).switchCountry('MT'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CountryPill extends StatelessWidget {
  final String emoji;
  final String code;
  final bool isActive;
  final VoidCallback onTap;

  const _CountryPill({
    required this.emoji,
    required this.code,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? ClayColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(ClayRadius.pill),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 16)),
            if (isActive) ...[
              const SizedBox(width: 4),
              Text(
                code,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
