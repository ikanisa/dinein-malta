import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/data/local/local_cache_service.dart';
import '../../../core/data/models/order.dart';
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
        title: Text('My Orders', style: ClayTypography.h2),
        centerTitle: false,
      ),
      body: FutureBuilder<List<dynamic>>(
        future: ref.read(localCacheServiceProvider).getOrdersRaw(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: ClayColors.primary),
            );
          }
          
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: ClayEmptyState(
                icon: Icons.receipt_long_rounded,
                title: 'No past orders',
                subtitle: 'Your order history will appear here',
              ),
            );
          }

          final orders = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(ClaySpacing.md),
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final json = orders[index] as Map<String, dynamic>;
              // Attempt parsing for safety
              try {
                final order = Order.fromJson(json);
                return Padding(
                  padding: const EdgeInsets.only(bottom: ClaySpacing.md),
                  child: _OrderHistoryCard(order: order),
                );
              } catch (e) {
                return const SizedBox.shrink();
              }
            },
          );
        },
      ),
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
    final timeStr = '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    final dateStr = '${date.day}/${date.month}';

    Color statusColor;
    switch (order.status.toLowerCase()) {
      case 'received':
      case 'placed':
        statusColor = ClayColors.secondary;
        break;
      case 'cancelled':
        statusColor = ClayColors.error;
        break;
      default:
        statusColor = ClayColors.primary;
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
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
