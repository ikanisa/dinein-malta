import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../domain/ui_plan_model.dart';

/// Handles UIPlan action intents by routing to appropriate screens
/// or triggering state changes.
///
/// Usage:
/// ```dart
/// final handler = ActionHandler(
///   context: context,
///   visitId: currentVisitId,
///   onConfirmRequired: (action, callback) => showConfirmDialog(...),
/// );
///
/// UIPlanRenderer(
///   plan: plan,
///   onAction: handler.handleAction,
/// );
/// ```
class ActionHandler {
  ActionHandler({
    required this.context,
    this.visitId,
    this.onConfirmRequired,
    this.onAddToCart,
    this.onUpdateCartItem,
    this.onRemoveFromCart,
    this.onConfirmOrder,
    this.onCallStaff,
    this.onRequestBill,
    this.onSendWaiterMessage,
  });

  final BuildContext context;
  final String? visitId;

  /// Called when action requires confirmation.
  /// The callback should be invoked to proceed with the action.
  final void Function(
    UIPlanAction action,
    VoidCallback onConfirm,
  )? onConfirmRequired;

  // Cart callbacks
  final void Function(String itemId, int qty, Map<String, dynamic>? options)?
      onAddToCart;
  final void Function(String lineId, Map<String, dynamic> patch)?
      onUpdateCartItem;
  final void Function(String lineId)? onRemoveFromCart;

  // Order callbacks
  final void Function(String? paymentMethod, double? tip)? onConfirmOrder;

  // Service callbacks
  final void Function(String reason, String? priority)? onCallStaff;
  final void Function()? onRequestBill;
  final void Function(String message)? onSendWaiterMessage;

  void handleAction(String actionRef, UIPlanAction action) {
    final intent = action.intent;
    final params = action.params ?? {};

    // Check if confirmation is required
    if (action.requiresConfirmation == true && onConfirmRequired != null) {
      onConfirmRequired!(action, () => _executeAction(intent, params));
      return;
    }

    _executeAction(intent, params);
  }

  void _executeAction(ActionIntent intent, Map<String, dynamic> params) {
    switch (intent) {
      // Navigation intents
      case ActionIntent.openHome:
        context.go('/');
        break;

      case ActionIntent.openSearch:
        final query = params['query'] as String?;
        context.push('/search${query != null ? '?q=$query' : ''}');
        break;

      case ActionIntent.openVenue:
        final venueId = params['venueId'] as String?;
        if (venueId != null) {
          context.push('/v/$venueId');
        }
        break;

      case ActionIntent.openMenu:
        final venueId = params['venueId'] as String?;
        final categoryId = params['categoryId'] as String?;
        if (venueId != null) {
          context.push(
            '/v/$venueId/menu${categoryId != null ? '?cat=$categoryId' : ''}',
          );
        }
        break;

      case ActionIntent.openItem:
        final itemId = params['itemId'] as String?;
        if (itemId != null) {
          context.push('/item/$itemId');
        }
        break;

      case ActionIntent.openCheckout:
        context.push('/checkout');
        break;

      case ActionIntent.openOrders:
        context.push('/orders');
        break;

      case ActionIntent.openChatWaiter:
        context.push('/chat');
        break;

      case ActionIntent.trackOrder:
        final orderId = params['orderId'] as String?;
        if (orderId != null) {
          context.push('/orders/$orderId');
        }
        break;

      // Filter intents (emit events for parent to handle)
      case ActionIntent.applyFilter:
        debugPrint('Filter applied: ${params['filters']}');
        break;

      case ActionIntent.clearFilters:
        debugPrint('Filters cleared');
        break;

      // Cart intents
      case ActionIntent.addToCart:
        final itemId = params['itemId'] as String?;
        final qty = params['qty'] as int?;
        if (itemId != null && qty != null && onAddToCart != null) {
          onAddToCart!(itemId, qty, {
            'addons': params['addons'],
            'notes': params['notes'],
          });
        }
        break;

      case ActionIntent.updateCartItem:
        final lineId = params['lineId'] as String?;
        final patch = params['patch'] as Map<String, dynamic>?;
        if (lineId != null && patch != null && onUpdateCartItem != null) {
          onUpdateCartItem!(lineId, patch);
        }
        break;

      case ActionIntent.removeFromCart:
        final lineId = params['lineId'] as String?;
        if (lineId != null && onRemoveFromCart != null) {
          onRemoveFromCart!(lineId);
        }
        break;

      // Visit/order intents
      case ActionIntent.startVisit:
        final venueId = params['venueId'] as String?;
        if (venueId != null) {
          context.push('/v/$venueId/menu');
        }
        break;

      case ActionIntent.confirmOrder:
        final paymentMethod = params['paymentMethod'] as String?;
        final tip = params['tip'] as double?;
        onConfirmOrder?.call(paymentMethod, tip);
        break;

      // Service intents
      case ActionIntent.sendWaiterMessage:
        final message = params['message'] as String?;
        if (message != null && onSendWaiterMessage != null) {
          onSendWaiterMessage!(message);
        }
        break;

      case ActionIntent.callStaff:
        final reason = params['reason'] as String?;
        final priority = params['priority'] as String?;
        if (reason != null && onCallStaff != null) {
          onCallStaff!(reason, priority);
        }
        break;

      case ActionIntent.requestBill:
        onRequestBill?.call();
        break;

      // External URL
      case ActionIntent.openExternalUrl:
        final url = params['url'] as String?;
        if (url != null) {
          _launchUrl(url);
        }
        break;
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

/// Helper to show confirmation dialog for actions
Future<bool> showActionConfirmDialog(
  BuildContext context,
  UIPlanAction action,
) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      content: Text(
        action.confirmationText ?? 'Confirm this action?',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: const Text('Confirm'),
        ),
      ],
    ),
  );
  return result ?? false;
}
