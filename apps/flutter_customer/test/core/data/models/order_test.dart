import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_customer/core/data/models/order.dart';
import 'package:flutter_customer/core/data/models/order_status.dart';

void main() {
  group('Order Model', () {
    test('creates Order with required fields', () {
      final order = Order(
        id: 'order-123',
        venueId: 'venue-456',
        sessionId: 'session-789',
        status: 'placed',
        totalAmount: 25.50,
        paymentMethod: 'Cash',
        createdAt: DateTime(2026, 1, 27, 10, 30),
      );

      expect(order.id, 'order-123');
      expect(order.venueId, 'venue-456');
      expect(order.sessionId, 'session-789');
      expect(order.status, 'placed');
      expect(order.totalAmount, 25.50);
      expect(order.paymentMethod, 'Cash');
      expect(order.currency, 'EUR'); // Default
      expect(order.items, isEmpty);
    });

    test('creates Order with items', () {
      final items = [
        OrderItem(
          itemId: 'item-1',
          name: 'Burger',
          quantity: 2,
          price: 10.00,
        ),
        OrderItem(
          itemId: 'item-2',
          name: 'Fries',
          quantity: 1,
          price: 5.50,
        ),
      ];

      final order = Order(
        id: 'order-123',
        venueId: 'venue-456',
        sessionId: 'session-789',
        status: 'received',
        totalAmount: 25.50,
        paymentMethod: 'MoMoUSSD',
        orderCode: 'XYZ789',
        items: items,
        createdAt: DateTime.now(),
      );

      expect(order.items.length, 2);
      expect(order.items[0].name, 'Burger');
      expect(order.items[0].quantity, 2);
      expect(order.items[1].name, 'Fries');
      expect(order.orderCode, 'XYZ789');
    });

    test('creates Order with optional table number', () {
      final order = Order(
        id: 'order-456',
        venueId: 'venue-123',
        sessionId: 'session-456',
        tableNumber: '12',
        status: 'served',
        totalAmount: 30.00,
        paymentMethod: 'RevolutLink',
        createdAt: DateTime.now(),
      );

      expect(order.tableNumber, '12');
    });
  });

  group('OrderItem Model', () {
    test('creates OrderItem correctly', () {
      final item = OrderItem(
        itemId: 'item-1',
        name: 'Pizza',
        quantity: 3,
        price: 12.99,
      );

      expect(item.itemId, 'item-1');
      expect(item.name, 'Pizza');
      expect(item.quantity, 3);
      expect(item.price, 12.99);
    });

    test('calculates line total correctly', () {
      final item = OrderItem(
        itemId: 'item-1',
        name: 'Pizza',
        quantity: 3,
        price: 10.00,
      );

      // Line total = quantity * price
      expect(item.quantity * item.price, 30.00);
    });
  });

  group('Order Status Values', () {
    // Per scope: Order statuses ONLY: Placed → Received → Served, or Cancelled
    test('valid status values are accepted', () {
      const validStatuses = ['placed', 'received', 'served', 'cancelled'];

      for (final status in validStatuses) {
        final order = Order(
          id: 'test-$status',
          venueId: 'venue-1',
          sessionId: 'session-1',
          status: status,
          totalAmount: 10.00,
          paymentMethod: 'Cash',
          createdAt: DateTime.now(),
        );
        expect(order.status, status);
      }
    });
  });

  group('OrderStatus Class', () {
    test('creates OrderStatus from JSON', () {
      final json = {
        'id': 'status-123',
        'status': 'received',
        'created_at': '2026-01-27T10:30:00Z',
        'total_amount': 50.00,
        'currency': 'EUR',
        'order_code': 'ABC123',
      };

      final status = OrderStatus.fromJson(json);

      expect(status.id, 'status-123');
      expect(status.status, 'received');
      expect(status.totalAmount, 50.00);
      expect(status.currency, 'EUR');
      expect(status.orderCode, 'ABC123');
    });

    test('handles missing optional fields in JSON', () {
      final json = {
        'id': 'status-456',
        'status': 'placed',
        'created_at': '2026-01-27T10:30:00Z',
        'total_amount': 25.00,
        'currency': 'RWF',
      };

      final status = OrderStatus.fromJson(json);

      expect(status.id, 'status-456');
      expect(status.orderCode, isNull);
    });

    test('uses defaults for missing fields', () {
      final json = {
        'id': 'status-789',
        'created_at': '2026-01-27T10:30:00Z',
      };

      final status = OrderStatus.fromJson(json);

      expect(status.status, 'received'); // Default
      expect(status.totalAmount, 0); // Default
      expect(status.currency, 'EUR'); // Default
    });
  });
}
