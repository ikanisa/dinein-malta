import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';

/// Settings screen with claymorphism design
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _version = '';
  String _buildNumber = '';

  @override
  void initState() {
    super.initState();
    _loadAppInfo();
  }

  Future<void> _loadAppInfo() async {
    final info = await PackageInfo.fromPlatform();
    if (mounted) {
      setState(() {
        _version = info.version;
        _buildNumber = info.buildNumber;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(ClaySpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const SizedBox(height: ClaySpacing.md),
              Text('Settings', style: ClayTypography.h1),
              const SizedBox(height: 4),
              Text(
                'Manage your preferences',
                style: ClayTypography.caption,
              ),
              const SizedBox(height: ClaySpacing.xl),

              // Profile section
              ClayCard(
                padding: const EdgeInsets.all(ClaySpacing.lg),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            ClayColors.primary,
                            ClayColors.primaryDark,
                          ],
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person_rounded,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: ClaySpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Guest User', style: ClayTypography.h3),
                          const SizedBox(height: 4),
                          Text(
                            'Sign in for a better experience',
                            style: ClayTypography.caption,
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      color: ClayColors.textMuted,
                      size: 18,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: ClaySpacing.lg),

              // Orders section
              Text('Orders', style: ClayTypography.h3),
              const SizedBox(height: ClaySpacing.sm),
              ClayCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: Icons.receipt_long_rounded,
                      iconColor: ClayColors.primary,
                      title: 'Order History',
                      subtitle: 'View your past orders',
                      onTap: () => context.push('/orders-history'),
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.favorite_rounded,
                      iconColor: ClayColors.error,
                      title: 'Favorites',
                      subtitle: 'Your saved restaurants',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: ClaySpacing.lg),

              // Preferences section
              Text('Preferences', style: ClayTypography.h3),
              const SizedBox(height: ClaySpacing.sm),
              ClayCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: Icons.notifications_rounded,
                      iconColor: ClayColors.warning,
                      title: 'Notifications',
                      subtitle: 'Order updates & promotions',
                      trailing: Switch(
                        value: true,
                        onChanged: (v) {},
                        activeColor: ClayColors.primary,
                      ),
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.language_rounded,
                      iconColor: ClayColors.secondary,
                      title: 'Language',
                      subtitle: 'English',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: ClaySpacing.lg),

              // Support section
              Text('Support', style: ClayTypography.h3),
              const SizedBox(height: ClaySpacing.sm),
              ClayCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: Icons.help_outline_rounded,
                      iconColor: ClayColors.info,
                      title: 'Help & FAQ',
                      subtitle: 'Get answers to common questions',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.chat_bubble_outline_rounded,
                      iconColor: ClayColors.accent,
                      title: 'Contact Us',
                      subtitle: 'We\'re here to help',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: ClaySpacing.lg),

              // Legal section
              Text('Legal', style: ClayTypography.h3),
              const SizedBox(height: ClaySpacing.sm),
              ClayCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: Icons.description_outlined,
                      iconColor: ClayColors.textSecondary,
                      title: 'Terms of Service',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.shield_outlined,
                      iconColor: ClayColors.textSecondary,
                      title: 'Privacy Policy',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              const SizedBox(height: ClaySpacing.xl),

              // App info
              Center(
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            ClayColors.primary.withValues(alpha: 0.2),
                            ClayColors.accent.withValues(alpha: 0.2),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(ClayRadius.md),
                      ),
                      child: Icon(
                        Icons.restaurant_menu_rounded,
                        color: ClayColors.primary,
                        size: 32,
                      ),
                    ),
                    const SizedBox(height: ClaySpacing.sm),
                    Text('DineIn', style: ClayTypography.bodyMedium),
                    const SizedBox(height: 4),
                    Text(
                      'Version $_version ($_buildNumber)',
                      style: ClayTypography.small,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 100), // Bottom nav space
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(ClaySpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(ClayRadius.sm),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: ClaySpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: ClayTypography.bodyMedium),
                  if (subtitle != null)
                    Text(subtitle!, style: ClayTypography.small),
                ],
              ),
            ),
            trailing ??
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: ClayColors.textMuted,
                  size: 16,
                ),
          ],
        ),
      ),
    );
  }
}
