import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/design/widgets/clay_components.dart';

/// Screen shown after successful order placement
class OrderConfirmationScreen extends ConsumerWidget {
  final String orderId;

  const OrderConfirmationScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ClaySpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              
              // Success Icon with ripple effect
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: ClayColors.success.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: ClayColors.surface,
                      shape: BoxShape.circle,
                      boxShadow: ClayShadows.card,
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      size: 48,
                      color: ClayColors.success,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: ClaySpacing.xl),
              
              Text(
                'Order Received! 🎉',
                style: ClayTypography.h2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: ClaySpacing.sm),
              Text(
                'The kitchen has received your order and will start preparing it shortly.',
                style: ClayTypography.body.copyWith(
                  color: ClayColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: ClaySpacing.xl),
              
              // Order Details Card
              ClayCard(
                child: Column(
                  children: [
                    _buildRow('Order ID', '#${orderId.substring(0, 8)}'),
                    const SizedBox(height: ClaySpacing.md),
                    _buildRow('Status', 'RECEIVED', isStatus: true),
                    const SizedBox(height: ClaySpacing.md),
                    const Divider(height: 1),
                    const SizedBox(height: ClaySpacing.md),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        'Keep this screen open to track status updates',
                        style: ClayTypography.caption,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
              
              const Spacer(),
              
              // Actions
              ClayButton(
                label: 'Track Order',
                icon: Icons.timer_outlined,
                onPressed: () {
                  // In real app, maybe navigate to specific tracking tab or just refresh
                },
              ),
              const SizedBox(height: ClaySpacing.md),
              ClayButtonSecondary(
                label: 'Back to Menu',
                onPressed: () => context.go('/'),
              ),
              const SizedBox(height: ClaySpacing.md),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isStatus = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: ClayTypography.body.copyWith(
            color: ClayColors.textSecondary,
          ),
        ),
        if (isStatus)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: ClayColors.secondary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(ClayRadius.pill),
            ),
            child: Text(
              value,
              style: const TextStyle(
                color: ClayColors.secondary,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          )
        else
          Text(
            value,
            style: ClayTypography.body.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
      ],
    );
  }
}
