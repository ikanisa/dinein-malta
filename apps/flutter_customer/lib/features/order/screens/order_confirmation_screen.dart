import 'dart:async';

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
  Timer? _poller;
  OrderStatus? _status;
  String? _orderCode;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _orderCode = widget.orderCode;
    _init();
  }

  Future<void> _init() async {
    await _loadCachedOrder();
    if (_orderCode == null || _orderCode!.isEmpty) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }
    await _fetchStatus();
    _poller =
        Timer.periodic(const Duration(seconds: 15), (_) => _fetchStatus());
  }

  Future<void> _loadCachedOrder() async {
    final cached =
        await ref.read(localCacheServiceProvider).getOrderById(widget.orderId);
    if (!mounted || cached == null) return;
    try {
      final order = Order.fromJson(cached);
      setState(() => _orderCode = order.orderCode);
    } catch (_) {
      // Ignore cache parse failures; status fetch is source of truth.
    }
  }

  Future<void> _fetchStatus() async {
    if (_orderCode == null || _orderCode!.isEmpty) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }
    try {
      final status = await ref.read(orderRepositoryProvider).getOrderStatus(
            orderId: widget.orderId,
            orderCode: _orderCode!,
          );
      if (!mounted) return;
      setState(() {
        _status = status;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _poller?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final statusText = _status?.status.toUpperCase() ?? 'PLACED';
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
                    if (_status != null) ...[
                      const SizedBox(height: ClaySpacing.md),
                      _buildRow(
                        'Total',
                        CurrencyUtils.format(
                            _status!.totalAmount, _status!.currency),
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
                            : _isLoading
                                ? 'Checking for updates...'
                                : 'Keep this screen open to track status updates',
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
