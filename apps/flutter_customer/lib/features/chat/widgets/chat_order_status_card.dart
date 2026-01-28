import 'package:flutter/material.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/data/models/order.dart';
import '../../../core/utils/currency.dart';

/// Compact order status card for displaying in chat
/// Shows order status, items summary, and total
class ChatOrderStatusCard extends StatelessWidget {
  final Order order;
  final VoidCallback? onTap;

  const ChatOrderStatusCard({
    super.key,
    required this.order,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(order.status);
    final statusIcon = _getStatusIcon(order.status);
    final currencyCode = order.currency;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: ClayColors.surface,
        borderRadius: BorderRadius.circular(ClayRadius.md),
        boxShadow: ClayShadows.subtle,
        border: Border.all(
          color: statusColor.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(ClayRadius.md),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(ClayRadius.md),
          child: Padding(
            padding: const EdgeInsets.all(ClaySpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Status header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        statusIcon,
                        color: statusColor,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: ClaySpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _getStatusLabel(order.status),
                            style: ClayTypography.bodyMedium.copyWith(
                              color: statusColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'Order #${order.id.substring(0, 8).toUpperCase()}',
                            style: ClayTypography.small.copyWith(
                              color: ClayColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Total
                    Text(
                      CurrencyUtils.format(order.totalAmount, currencyCode),
                      style: ClayTypography.price,
                    ),
                  ],
                ),

                const SizedBox(height: ClaySpacing.sm),

                // Items summary
                Text(
                  _getItemsSummary(),
                  style: ClayTypography.small.copyWith(
                    color: ClayColors.textSecondary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                // Progress indicator for active orders
                if (_isActiveStatus(order.status)) ...[
                  const SizedBox(height: ClaySpacing.sm),
                  _OrderProgressIndicator(status: order.status),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getItemsSummary() {
    if (order.items.isEmpty) return 'No items';
    
    final itemCount = order.items.length;
    final firstItem = order.items.first;
    final itemName = firstItem.name;
    
    if (itemCount == 1) {
      final qty = firstItem.quantity;
      return '$qty × $itemName';
    }
    
    return '$itemName and ${itemCount - 1} more item${itemCount > 2 ? 's' : ''}';
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'placed':
        return ClayColors.info;
      case 'received':
        return ClayColors.warning;
      case 'served':
        return ClayColors.success;
      case 'cancelled':
        return ClayColors.error;
      default:
        return ClayColors.textSecondary;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'placed':
        return Icons.receipt_long_rounded;
      case 'received':
        return Icons.restaurant_rounded;
      case 'served':
        return Icons.check_circle_rounded;
      case 'cancelled':
        return Icons.cancel_rounded;
      default:
        return Icons.help_outline_rounded;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'placed':
        return 'Order Placed';
      case 'received':
        return 'Being Prepared';
      case 'served':
        return 'Served';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  bool _isActiveStatus(String status) {
    return status.toLowerCase() == 'placed' || status.toLowerCase() == 'received';
  }
}

/// Visual progress indicator for order status
class _OrderProgressIndicator extends StatelessWidget {
  final String status;

  const _OrderProgressIndicator({required this.status});

  @override
  Widget build(BuildContext context) {
    final progress = _getProgress();
    
    return Row(
      children: [
        _ProgressDot(isActive: progress >= 1, isCompleted: progress > 1),
        _ProgressLine(isActive: progress >= 2),
        _ProgressDot(isActive: progress >= 2, isCompleted: progress > 2),
        _ProgressLine(isActive: progress >= 3),
        _ProgressDot(isActive: progress >= 3, isCompleted: false),
      ],
    );
  }

  int _getProgress() {
    switch (status.toLowerCase()) {
      case 'placed':
        return 1;
      case 'received':
        return 2;
      case 'served':
        return 3;
      default:
        return 0;
    }
  }
}

class _ProgressDot extends StatelessWidget {
  final bool isActive;
  final bool isCompleted;

  const _ProgressDot({required this.isActive, required this.isCompleted});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? ClayColors.primary : ClayColors.textMuted,
      ),
      child: isCompleted
          ? const Icon(Icons.check, color: Colors.white, size: 8)
          : null,
    );
  }
}

class _ProgressLine extends StatelessWidget {
  final bool isActive;

  const _ProgressLine({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 2,
        color: isActive ? ClayColors.primary : ClayColors.textMuted,
      ),
    );
  }
}
