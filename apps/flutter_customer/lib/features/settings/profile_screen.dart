import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/local/local_cache_service.dart';
import '../../core/data/repositories/profile_repository.dart';
import '../../core/services/auth_service.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';
import '../../core/utils/haptics.dart';

/// Profile screen for user identity management
/// Currently anonymous-first with local storage
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _displayNameController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isLoading = false;
  bool _hasChanges = false;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    
    final cacheService = ref.read(localCacheServiceProvider);
    final userId = await cacheService.getAnonymousUserId();
    final displayName = cacheService.getDisplayName();
    final phone = cacheService.getPhoneNumber();
    
    if (mounted) {
      setState(() {
        _userId = userId;
        _displayNameController.text = displayName ?? '';
        _phoneController.text = phone ?? '';
        _isLoading = false;
      });
    }
  }

  void _onFieldChanged() {
    if (!_hasChanges) {
      setState(() => _hasChanges = true);
    }
  }

  Future<void> _saveProfile() async {
    Haptics.lightImpact();
    setState(() => _isLoading = true);
    
    final cacheService = ref.read(localCacheServiceProvider);
    
    final displayName = _displayNameController.text.trim();
    final phone = _phoneController.text.trim();
    
    await cacheService.setDisplayName(displayName.isNotEmpty ? displayName : null);
    await cacheService.setPhoneNumber(phone.isNotEmpty ? phone : null);
    
    if (mounted) {
      setState(() {
        _isLoading = false;
        _hasChanges = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile saved'),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _copyUserId() async {
    if (_userId == null) return;
    
    Haptics.lightImpact();
    await Clipboard.setData(ClipboardData(text: _userId!));
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('User ID copied to clipboard'),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _clearAllData() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: ClayColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ClayRadius.lg),
        ),
        title: const Text('Clear All Data?'),
        content: const Text(
          'This will remove your profile, favorites, and order history from this device. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              'Cancel',
              style: TextStyle(color: ClayColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              'Clear Data',
              style: TextStyle(color: ClayColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      Haptics.heavyImpact();
      final cacheService = ref.read(localCacheServiceProvider);
      await cacheService.clearAll();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All data cleared'),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 2),
          ),
        );
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        backgroundColor: ClayColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => context.pop(),
        ),
        title: Text('Profile', style: ClayTypography.h2),
        centerTitle: true,
        actions: [
          if (_hasChanges)
            TextButton(
              onPressed: _isLoading ? null : _saveProfile,
              child: Text(
                'Save',
                style: ClayTypography.bodyMedium.copyWith(
                  color: ClayColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: _isLoading && _userId == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(ClaySpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar section
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                ClayColors.primary,
                                ClayColors.primaryDark,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            shape: BoxShape.circle,
                            boxShadow: ClayShadows.card,
                          ),
                          child: const Icon(
                            Icons.person_rounded,
                            color: Colors.white,
                            size: 48,
                          ),
                        ),
                        const SizedBox(height: ClaySpacing.md),
                        Text(
                          _displayNameController.text.isNotEmpty
                              ? _displayNameController.text
                              : 'Guest User',
                          style: ClayTypography.h2,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Anonymous account',
                          style: ClayTypography.caption,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: ClaySpacing.xl),

                  // Profile details
                  Text('Your Details', style: ClayTypography.h3),
                  const SizedBox(height: ClaySpacing.sm),
                  ClayCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Display Name',
                          style: ClayTypography.small.copyWith(
                            color: ClayColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: ClaySpacing.xs),
                        ClayTextField(
                          controller: _displayNameController,
                          hintText: 'Enter your name (optional)',
                          onChanged: (_) => _onFieldChanged(),
                        ),
                        const SizedBox(height: ClaySpacing.md),
                        Text(
                          'Phone Number',
                          style: ClayTypography.small.copyWith(
                            color: ClayColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: ClaySpacing.xs),
                        ClayTextField(
                          controller: _phoneController,
                          hintText: 'Enter your phone (optional)',
                          keyboardType: TextInputType.phone,
                          onChanged: (_) => _onFieldChanged(),
                        ),
                        const SizedBox(height: ClaySpacing.sm),
                        Text(
                          'Your phone number helps venues contact you about your order.',
                          style: ClayTypography.caption,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: ClaySpacing.lg),

                  // User ID section
                  Text('Device Identity', style: ClayTypography.h3),
                  const SizedBox(height: ClaySpacing.sm),
                  ClayCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Anonymous User ID',
                                    style: ClayTypography.small.copyWith(
                                      color: ClayColors.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _userId ?? 'Loading...',
                                    style: ClayTypography.caption.copyWith(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy_rounded),
                              onPressed: _copyUserId,
                              tooltip: 'Copy ID',
                              color: ClayColors.primary,
                            ),
                          ],
                        ),
                        const SizedBox(height: ClaySpacing.sm),
                        Text(
                          'This ID is unique to your device and is used to associate your orders.',
                          style: ClayTypography.caption,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: ClaySpacing.lg),

                  // Coming soon: Sign in
                  Text('Account', style: ClayTypography.h3),
                  const SizedBox(height: ClaySpacing.sm),
                  ClayCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      children: [
                        _ProfileTile(
                          icon: Icons.login_rounded,
                          iconColor: ClayColors.primary,
                          title: 'Sign In',
                          subtitle: 'Coming soon - sync across devices',
                          enabled: false,
                        ),
                        const Divider(height: 1),
                        _ProfileTile(
                          icon: Icons.delete_outline_rounded,
                          iconColor: ClayColors.error,
                          title: 'Clear All Data',
                          subtitle: 'Remove profile, favorites & history',
                          onTap: _clearAllData,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100), // Bottom padding
                ],
              ),
            ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool enabled;

  const _ProfileTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enabled ? onTap : null,
      child: Opacity(
        opacity: enabled ? 1.0 : 0.5,
        child: Padding(
          padding: const EdgeInsets.all(ClaySpacing.md),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
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
                    Text(subtitle, style: ClayTypography.caption),
                  ],
                ),
              ),
              if (enabled && onTap != null)
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: ClayColors.textMuted,
                  size: 16,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
