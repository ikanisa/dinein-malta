import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/routes.dart';
import '../../../core/data/local/local_cache_service.dart';
import '../../../core/data/models/order.dart';
import '../../../core/data/models/order_status.dart';
import '../../../core/data/repositories/order_repository.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/design/widgets/clay_components.dart';
import '../../../core/utils/currency.dart';

/// Screen shown after successful order placement
class OrderConfirmationScreen extends ConsumerStatefulWidget {
  final String orderId;
  final String? orderCode;

  const OrderConfirmationScreen({
    super.key,
    required this.orderId,
    this.orderCode,
  });

  @override
  ConsumerState<OrderConfirmationScreen> createState() =>
      _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState
    extends ConsumerState<OrderConfirmationScreen> {
  String? _orderCode;
  String? _previousStatus;

  @override
  void initState() {
    super.initState();
    _orderCode = widget.orderCode;
    _loadCachedOrder();
  }

  Future<void> _loadCachedOrder() async {
    final cached =
        await ref.read(localCacheServiceProvider).getOrderById(widget.orderId);
    if (!mounted || cached == null) return;
    try {
      final order = Order.fromJson(cached);
      setState(() => _orderCode = order.orderCode);
    } catch (_) {
      // Ignore cache parse failures; realtime stream is source of truth.
    }
  }

  void _onStatusChanged(String newStatus) {
    if (_previousStatus != null && _previousStatus != newStatus) {
      // Show snackbar notification for status change
      final message = _getStatusMessage(newStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: ClayColors.success,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
    _previousStatus = newStatus;
  }

  String _getStatusMessage(String status) {
    switch (status.toLowerCase()) {
      case 'received':
        return '👨‍🍳 Your order has been received by the kitchen!';
      case 'served':
        return '🍽️ Your order has been served. Enjoy!';
      case 'cancelled':
        return '❌ Your order has been cancelled.';
      default:
        return 'Order status updated: $status';
    }
  }

  @override
  Widget build(BuildContext context) {
    // Subscribe to realtime order status
    final orderStatusAsync = ref.watch(orderStatusStreamProvider(widget.orderId));
    
    return orderStatusAsync.when(
      loading: () => _buildContent(null, isLoading: true),
      error: (_, __) => _buildContent(null, isLoading: false),
      data: (status) {
        if (status != null) {
          // Trigger status change notification
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _onStatusChanged(status.status);
          });
        }
        return _buildContent(status, isLoading: false);
      },
    );
  }

  Widget _buildContent(OrderStatus? status, {required bool isLoading}) {
    final statusText = status?.status.toUpperCase() ?? 'PLACED';
    final fallbackId = widget.orderId.length > 8
        ? widget.orderId.substring(0, 8)
        : widget.orderId;
    final orderLabel = _status?.orderCode ?? _orderCode ?? fallbackId;

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
                'Order Placed! 🎉',
                style: ClayTypography.h2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: ClaySpacing.sm),
              Text(
                'We sent your order to the kitchen and will update you shortly.',
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
                    _buildRow('Order', '#$orderLabel'),
                    const SizedBox(height: ClaySpacing.md),
                    _buildRow('Status', statusText, isStatus: true),
                    if (status != null) ...[
                      const SizedBox(height: ClaySpacing.md),
                      _buildRow(
                        'Total',
                        CurrencyUtils.format(
                            status.totalAmount, status.currency),
                      ),
                    ],
                    const SizedBox(height: ClaySpacing.md),
                    const Divider(height: 1),
                    const SizedBox(height: ClaySpacing.md),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        _orderCode == null
                            ? 'Order tracking unavailable for this order'
                            : isLoading
                                ? 'Checking for updates...'
                                : '🔴 Live - updates appear automatically',
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
                  context.go('${Routes.settings}/${Routes.ordersHistory}');
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
