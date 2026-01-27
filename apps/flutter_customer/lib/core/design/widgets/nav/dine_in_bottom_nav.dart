import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../tokens/clay_design.dart';

/// Claymorphism bottom navigation bar for shell navigation
class DineInBottomNav extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const DineInBottomNav({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(
          ClaySpacing.md, 0, ClaySpacing.md, ClaySpacing.md),
      padding: const EdgeInsets.symmetric(
          horizontal: ClaySpacing.md, vertical: ClaySpacing.sm),
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(ClayRadius.xl),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(
              icon: Icons.home_rounded,
              label: 'Home',
              isActive: navigationShell.currentIndex == 0,
              onTap: () => navigationShell.goBranch(0),
            ),
            _NavItem(
              icon: Icons.settings_rounded,
              label: 'Settings',
              isActive: navigationShell.currentIndex == 1,
              onTap: () => navigationShell.goBranch(1),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: EdgeInsets.symmetric(
          horizontal: isActive ? 20 : 16,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: isActive ? ClayColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(ClayRadius.pill),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive ? Colors.white : ClayColors.textSecondary,
              size: 24,
            ),
            if (isActive) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
