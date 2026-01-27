import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/data/local/local_cache_service.dart';
import '../../../core/data/models/order.dart';
import '../../../core/data/repositories/order_repository.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/design/widgets/clay_components.dart';
import '../../../core/utils/currency.dart';

class OrdersHistoryScreen extends ConsumerWidget {
  const OrdersHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
        title: Text('My Orders', style: ClayTypography.h2),
        centerTitle: false,
      ),
      body: const _OrdersHistoryBody(),
    );
  }
}


class _OrdersHistoryBody extends ConsumerWidget {
  const _OrdersHistoryBody();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(orderHistoryProvider);

    return ordersAsync.when(
      loading: () => const _OrdersSkeleton(),
      error: (err, _) => _buildErrorWithLocalFallback(context, ref, err),
      data: (orders) {
        if (orders.isEmpty) {
          return RefreshIndicator(
            color: ClayColors.primary,
            onRefresh: () async {
              ref.invalidate(orderHistoryProvider);
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: SizedBox(
                height: MediaQuery.of(context).size.height * 0.7,
                child: const ClayEmptyState(
                  icon: Icons.receipt_long_rounded,
                  title: 'No past orders',
                  subtitle: 'Your order history will appear here',
                ),
              ),
            ),
          );
        }

        return RefreshIndicator(
          color: ClayColors.primary,
          onRefresh: () async {
            ref.invalidate(orderHistoryProvider);
          },
          child: _OrdersList(orders: orders),
        );
      },
    );
  }

  Widget _buildErrorWithLocalFallback(
    BuildContext context,
    WidgetRef ref,
    Object error,
  ) {
    return FutureBuilder<List<dynamic>>(
      future: ref.read(localCacheServiceProvider).getOrdersRaw(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: ClayEmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Couldn\'t load orders',
              subtitle: 'Check your connection and try again',
            ),
          );
        }

        // Show local orders with offline banner
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: ClaySpacing.md,
                vertical: ClaySpacing.sm,
              ),
              color: ClayColors.warning.withValues(alpha: 0.1),
              child: Row(
                children: [
                  Icon(Icons.cloud_off_rounded,
                      size: 16, color: ClayColors.warning),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Showing offline data',
                      style: ClayTypography.small
                          .copyWith(color: ClayColors.warning),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _OrdersList(
                orders: snapshot.data!
                    .map((json) => Order.fromJson(json as Map<String, dynamic>))
                    .toList(),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _OrdersList extends StatelessWidget {
  final List<Order> orders;

  const _OrdersList({required this.orders});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(ClaySpacing.md),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: ClaySpacing.md),
          child: _OrderHistoryCard(order: orders[index]),
        );
      },
    );
  }
}

class _OrdersSkeleton extends StatelessWidget {
  const _OrdersSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(ClaySpacing.md),
      itemCount: 4,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: ClaySpacing.md),
          child: ClayCard(
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.md),
                      ),
                    ),
                    const SizedBox(width: ClaySpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 14,
                            width: 100,
                            decoration: BoxDecoration(
                              color: ClayColors.background,
                              borderRadius:
                                  BorderRadius.circular(ClayRadius.sm),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            height: 12,
                            width: 70,
                            decoration: BoxDecoration(
                              color: ClayColors.background,
                              borderRadius:
                                  BorderRadius.circular(ClayRadius.sm),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      height: 16,
                      width: 50,
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.sm),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: ClaySpacing.md),
                const Divider(height: 1),
                const SizedBox(height: ClaySpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      height: 12,
                      width: 60,
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.sm),
                      ),
                    ),
                    Container(
                      height: 20,
                      width: 70,
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.pill),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _OrderHistoryCard extends StatelessWidget {
  final Order order;

  const _OrderHistoryCard({required this.order});

  @override
  Widget build(BuildContext context) {
    // Generate a simple date string
    final date = order.createdAt.toLocal();
    final timeStr =
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    final dateStr = '${date.day}/${date.month}';

    Color statusColor;
    switch (order.status.toLowerCase()) {
      case 'received':
      case 'placed':
        statusColor = ClayColors.secondary;
        break;
      case 'served':
        statusColor = ClayColors.primary;
        break;
      case 'cancelled':
        statusColor = ClayColors.error;
        break;
      default:
        statusColor = ClayColors.textMuted;
    }

    return GestureDetector(
      onTap: () {
        final orderCode = order.orderCode;
        final query = (orderCode != null && orderCode.isNotEmpty)
            ? '?code=$orderCode'
            : '';
        context.push('/order/${order.id}$query');
      },
      child: ClayCard(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: ClayColors.background,
                        borderRadius: BorderRadius.circular(ClayRadius.md),
                      ),
                      child: const Icon(
                        Icons.restaurant_rounded,
                        color: ClayColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: ClaySpacing.md),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.orderCode ?? 'Table Order',
                          style: ClayTypography.bodyMedium,
                        ),
                        Text(
                          '$dateStr • $timeStr',
                          style: ClayTypography.caption,
                        ),
                      ],
                    ),
                  ],
                ),
                Text(
                  CurrencyUtils.format(order.totalAmount, order.currency),
                  style: ClayTypography.price,
                ),
              ],
            ),
            const SizedBox(height: ClaySpacing.md),
            const Divider(height: 1),
            const SizedBox(height: ClaySpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${order.items.length} items',
                  style: ClayTypography.caption,
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(ClayRadius.pill),
                  ),
                  child: Text(
                    order.status.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
