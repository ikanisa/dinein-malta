import 'package:flutter/material.dart';
import '../../core/design/tokens/clay_design.dart';

/// Privacy Policy and Terms of Service screen
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        backgroundColor: ClayColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: ClayColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Privacy & Terms',
          style: ClayTypography.h3,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(ClaySpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              title: 'Privacy Policy',
              content: '''
Last updated: January 2026

DineIn ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

**Information We Collect**

• **Device Information**: We may collect device type, operating system, and unique device identifiers for analytics and error reporting.

• **Usage Data**: We collect information about how you interact with the app, including venues visited, orders placed, and features used.

• **Order Information**: When you place an order, we collect the items ordered, venue information, and table number.

• **Location Data**: We do NOT collect precise location data. Country is inferred from the venue you visit.

**How We Use Your Information**

• To provide and maintain our service
• To process your orders
• To improve our app experience
• To send important notifications about your orders
• For analytics and error reporting (with your consent)

**Data Storage**

• Order history is stored locally on your device
• Favorite venues are stored locally on your device
• No account or personal information is required to use the app

**Third-Party Services**

We use the following third-party services:
• Sentry for crash reporting (opt-out available)
• Supabase for order processing

**Your Rights**

You have the right to:
• Delete your local data at any time through app settings
• Opt out of analytics and crash reporting
• Request information about data we hold

**Contact Us**

For privacy concerns, please contact: privacy@dinein.app
''',
            ),
            const SizedBox(height: ClaySpacing.xl),
            _buildSection(
              title: 'Terms of Service',
              content: '''
By using DineIn, you agree to these terms.

**Use of Service**

DineIn is a dine-in ordering platform that connects customers with restaurants. We facilitate the ordering process but are not responsible for food preparation, quality, or delivery.

**Orders**

• All orders are final once submitted
• Payment is handled directly with the venue (cash or external payment links)
• We do not process payments within the app

**User Conduct**

You agree not to:
• Place fraudulent orders
• Abuse or harass venue staff
• Use the service for any illegal purpose
• Attempt to reverse engineer the app

**Disclaimers**

• The app is provided "as is" without warranties
• We are not liable for venue-related issues
• Prices and availability are determined by venues

**Changes to Terms**

We may update these terms at any time. Continued use constitutes acceptance of updated terms.

**Governing Law**

These terms are governed by the laws of the Republic of Rwanda and/or Malta, depending on venue location.
''',
            ),
            const SizedBox(height: ClaySpacing.xl),
            Center(
              child: Text(
                'Version 1.0.0',
                style: ClayTypography.small,
              ),
            ),
            const SizedBox(height: ClaySpacing.lg),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required String content}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: ClaySpacing.md,
            vertical: ClaySpacing.sm,
          ),
          decoration: BoxDecoration(
            color: ClayColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(ClayRadius.sm),
          ),
          child: Text(
            title,
            style: ClayTypography.h3.copyWith(color: ClayColors.primary),
          ),
        ),
        const SizedBox(height: ClaySpacing.md),
        Container(
          padding: const EdgeInsets.all(ClaySpacing.md),
          decoration: BoxDecoration(
            color: ClayColors.surface,
            borderRadius: BorderRadius.circular(ClayRadius.md),
            boxShadow: ClayShadows.subtle,
          ),
          child: Text(
            content.trim(),
            style: ClayTypography.body.copyWith(height: 1.6),
          ),
        ),
      ],
    );
  }
}
