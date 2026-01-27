import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';
import '../../core/utils/haptics.dart';

/// Help & Support screen with FAQ accordion and contact options
class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  static const List<_FaqItem> _faqs = [
    _FaqItem(
      question: 'How do I place an order?',
      answer:
          'Simply scan the QR code at your table, browse the menu, add items to your cart, and tap "Place Order". Your order will be sent directly to the kitchen!',
    ),
    _FaqItem(
      question: 'How do I pay for my order?',
      answer:
          'Payment is handled at your table. Depending on the venue, you can pay with cash, mobile money (MoMo), or card. The payment method will be shown at checkout.',
    ),
    _FaqItem(
      question: 'Can I modify my order after placing it?',
      answer:
          'Once an order is placed, it goes directly to the kitchen. If you need to make changes, please call a waiter using the bell icon on your order confirmation screen.',
    ),
    _FaqItem(
      question: 'How do I call a waiter?',
      answer:
          'Tap the bell icon (🔔) on your order confirmation screen or venue menu. This will notify the staff that you need assistance.',
    ),
    _FaqItem(
      question: 'Why can\'t I see my previous orders?',
      answer:
          'Order history is stored on your device. If you cleared your app data or switched devices, previous orders may not appear.',
    ),
    _FaqItem(
      question: 'Is my payment information stored?',
      answer:
          'No, DineIn does not store any payment information. All payments are processed securely through external providers.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        backgroundColor: ClayColors.background,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ClayColors.surface,
              borderRadius: BorderRadius.circular(ClayRadius.sm),
              boxShadow: ClayShadows.subtle,
            ),
            child: const Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
              color: ClayColors.textPrimary,
            ),
          ),
          onPressed: () => context.pop(),
        ),
        title: Text('Help & Support', style: ClayTypography.h3),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(ClaySpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            ClayCard(
              child: Row(
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
                      Icons.support_agent_rounded,
                      color: ClayColors.primary,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: ClaySpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Need help?', style: ClayTypography.h3),
                        const SizedBox(height: 4),
                        Text(
                          'Find answers to common questions or reach out to us.',
                          style: ClayTypography.small,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: ClaySpacing.lg),

            // FAQ section
            Text('Frequently Asked Questions', style: ClayTypography.h3),
            const SizedBox(height: ClaySpacing.sm),
            ClayCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: _faqs.asMap().entries.map((entry) {
                  final isLast = entry.key == _faqs.length - 1;
                  return _FaqTile(item: entry.value, showDivider: !isLast);
                }).toList(),
              ),
            ),
            const SizedBox(height: ClaySpacing.lg),

            // Contact section
            Text('Contact Us', style: ClayTypography.h3),
            const SizedBox(height: ClaySpacing.sm),
            ClayCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _ContactTile(
                    icon: Icons.email_rounded,
                    iconColor: ClayColors.primary,
                    title: 'Email Support',
                    subtitle: 'support@dinein.app',
                    onTap: () => _launchEmail('support@dinein.app'),
                  ),
                  const Divider(height: 1),
                  _ContactTile(
                    icon: Icons.chat_bubble_rounded,
                    iconColor: ClayColors.accent,
                    title: 'Live Chat',
                    subtitle: 'Chat with our team',
                    onTap: () {
                      // TODO: Implement live chat
                      Haptics.lightImpact();
                    },
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
                  _ContactTile(
                    icon: Icons.description_rounded,
                    iconColor: ClayColors.textSecondary,
                    title: 'Terms of Service',
                    subtitle: 'Read our terms',
                    onTap: () {
                      // TODO: Navigate to terms
                      Haptics.lightImpact();
                    },
                  ),
                  const Divider(height: 1),
                  _ContactTile(
                    icon: Icons.shield_rounded,
                    iconColor: ClayColors.textSecondary,
                    title: 'Privacy Policy',
                    subtitle: 'How we protect your data',
                    onTap: () {
                      // TODO: Navigate to privacy
                      Haptics.lightImpact();
                    },
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

  Future<void> _launchEmail(String email) async {
    Haptics.lightImpact();
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}

class _FaqItem {
  final String question;
  final String answer;

  const _FaqItem({required this.question, required this.answer});
}

class _FaqTile extends StatefulWidget {
  final _FaqItem item;
  final bool showDivider;

  const _FaqTile({required this.item, required this.showDivider});

  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: () {
            Haptics.lightImpact();
            setState(() => _isExpanded = !_isExpanded);
          },
          child: Padding(
            padding: const EdgeInsets.all(ClaySpacing.md),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    widget.item.question,
                    style: ClayTypography.bodyMedium,
                  ),
                ),
                const SizedBox(width: ClaySpacing.sm),
                AnimatedRotation(
                  turns: _isExpanded ? 0.5 : 0,
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: ClayColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ),
        AnimatedCrossFade(
          firstChild: const SizedBox(width: double.infinity),
          secondChild: Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(
              ClaySpacing.md,
              0,
              ClaySpacing.md,
              ClaySpacing.md,
            ),
            child: Text(
              widget.item.answer,
              style: ClayTypography.small.copyWith(
                color: ClayColors.textSecondary,
                height: 1.5,
              ),
            ),
          ),
          crossFadeState:
              _isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
          duration: const Duration(milliseconds: 200),
        ),
        if (widget.showDivider) const Divider(height: 1),
      ],
    );
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ContactTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
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
                  Text(subtitle, style: ClayTypography.small),
                ],
              ),
            ),
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
