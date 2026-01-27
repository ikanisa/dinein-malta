import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../cart/models/cart_item.dart';
import '../../cart/provider/cart_provider.dart';
import '../../../core/data/repositories/order_repository.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../../core/data/local/local_cache_service.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/design/widgets/clay_components.dart';
import '../../../core/utils/haptics.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _paymentMethod = 'cash';
  final TextEditingController _tableController = TextEditingController();
  bool _isLoading = false;

  Future<void> _launchPayment() async {
    if (_paymentMethod == 'momo_ussd') {
      final Uri launchUri = Uri(scheme: 'tel', path: '*182*8*1*123456#');
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      }
    } else if (_paymentMethod == 'revolut_link') {
      final Uri launchUri = Uri.parse('https://revolut.me/r/dinein_example');
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri, mode: LaunchMode.externalApplication);
      }
    }
  }

  Future<void> _placeOrder() async {
    final cart = ref.read(cartProvider);
    if (cart.items.isEmpty) return;

    setState(() => _isLoading = true);
    Haptics.mediumImpact();

    try {
      final sessionId = const Uuid().v4();
      final itemsPayload = cart.items.map((i) => {
        'item_id': i.menuItem.id,
        'name': i.menuItem.name,
        'quantity': i.quantity,
        'price': i.menuItem.price,
      }).toList();

      final order = await ref.read(orderRepositoryProvider).createOrder(
        sessionId: sessionId,
        venueId: cart.venueId!,
        items: itemsPayload,
        paymentMethod: _paymentMethod,
        tableNumber: _tableController.text.isNotEmpty ? _tableController.text : null,
      );

      ref.read(cartProvider.notifier).clear();
      await ref.read(localCacheServiceProvider).saveOrder(order.toJson());

      if (mounted) {
        Haptics.success();
        context.go('/order/${order.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Couldn\'t place order. Please try again.'),
            backgroundColor: ClayColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);

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
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Checkout', style: ClayTypography.h2),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(ClaySpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order summary card
            ClayCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.receipt_long_rounded, color: ClayColors.primary),
                      const SizedBox(width: 8),
                      Text('Order Summary', style: ClayTypography.h3),
                    ],
                  ),
                  const SizedBox(height: ClaySpacing.md),
                  
                  // Items
                  ...cart.items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: ClayColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(ClayRadius.sm),
                          ),
                          child: Text(
                            '${item.quantity}x',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: ClayColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            item.menuItem.name,
                            style: ClayTypography.body,
                          ),
                        ),
                        Text(
                          '€${(item.menuItem.price * item.quantity).toStringAsFixed(2)}',
                          style: ClayTypography.bodyMedium,
                        ),
                      ],
                    ),
                  )),
                  
                  const Divider(height: 24),
                  
                  // Total
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total', style: ClayTypography.h3),
                      Text(
                        '€${cart.total.toStringAsFixed(2)}',
                        style: ClayTypography.h2.copyWith(color: ClayColors.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: ClaySpacing.lg),

            // Table number
            Text('Table Number', style: ClayTypography.h3),
            const SizedBox(height: ClaySpacing.sm),
            ClayTextField(
              hintText: 'Enter your table number (optional)',
              controller: _tableController,
              keyboardType: TextInputType.number,
              prefixIcon: Icons.table_restaurant_rounded,
            ),
            const SizedBox(height: ClaySpacing.lg),

            // Payment method
            Text('Payment Method', style: ClayTypography.h3),
            const SizedBox(height: ClaySpacing.sm),
            
            _ClayPaymentOption(
              icon: Icons.payments_outlined,
              label: 'Cash',
              subtitle: 'Pay at the counter',
              value: 'cash',
              groupValue: _paymentMethod,
              color: ClayColors.secondary,
              onChanged: (v) => setState(() => _paymentMethod = v),
            ),
            const SizedBox(height: ClaySpacing.sm),
            _ClayPaymentOption(
              icon: Icons.phone_android_rounded,
              label: 'MoMo',
              subtitle: 'MTN Mobile Money (Rwanda)',
              value: 'momo_ussd',
              groupValue: _paymentMethod,
              color: const Color(0xFFFFCB05),
              onChanged: (v) => setState(() => _paymentMethod = v),
            ),
            const SizedBox(height: ClaySpacing.sm),
            _ClayPaymentOption(
              icon: Icons.credit_card_rounded,
              label: 'Revolut',
              subtitle: 'Pay via Revolut link (Malta)',
              value: 'revolut_link',
              groupValue: _paymentMethod,
              color: Colors.black,
              onChanged: (v) => setState(() => _paymentMethod = v),
            ),

            if (_paymentMethod != 'cash') ...[
              const SizedBox(height: ClaySpacing.md),
              ClayButtonSecondary(
                label: 'Open ${_paymentMethod == 'momo_ussd' ? 'USSD' : 'Revolut'}',
                icon: Icons.open_in_new_rounded,
                onPressed: _launchPayment,
              ),
              const SizedBox(height: 8),
              Text(
                'You can pay now or after placing your order.',
                style: ClayTypography.small,
                textAlign: TextAlign.center,
              ),
            ],
            
            const SizedBox(height: 120), // Space for bottom button
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(ClaySpacing.md),
        decoration: BoxDecoration(
          color: ClayColors.surface,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(ClayRadius.xl),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: ClayButton(
            label: 'Place Order',
            icon: Icons.check_circle_outline_rounded,
            isLoading: _isLoading,
            onPressed: _placeOrder,
          ),
        ),
      ),
    );
  }
}

class _ClayPaymentOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final String value;
  final String groupValue;
  final Color color;
  final Function(String) onChanged;

  const _ClayPaymentOption({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.groupValue,
    required this.color,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    
    return GestureDetector(
      onTap: () => onChanged(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(ClaySpacing.md),
        decoration: BoxDecoration(
          color: ClayColors.surface,
          borderRadius: BorderRadius.circular(ClayRadius.lg),
          border: Border.all(
            color: isSelected ? ClayColors.primary : Colors.transparent,
            width: 2,
          ),
          boxShadow: isSelected ? ClayShadows.card : ClayShadows.subtle,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(ClayRadius.sm),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: ClaySpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: ClayTypography.bodyMedium),
                  Text(subtitle, style: ClayTypography.small),
                ],
              ),
            ),
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? ClayColors.primary : ClayColors.textMuted,
                  width: 2,
                ),
                color: isSelected ? ClayColors.primary : Colors.transparent,
              ),
              child: isSelected
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
