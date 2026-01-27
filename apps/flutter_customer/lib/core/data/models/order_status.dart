class OrderStatus {
  final String id;
  final String status;
  final DateTime createdAt;
  final double totalAmount;
  final String currency;
  final String? orderCode;

  const OrderStatus({
    required this.id,
    required this.status,
    required this.createdAt,
    required this.totalAmount,
    required this.currency,
    this.orderCode,
  });

  factory OrderStatus.fromJson(Map<String, dynamic> json) {
    final createdAtRaw = json['created_at'];
    final createdAt = createdAtRaw is String
        ? DateTime.parse(createdAtRaw)
        : DateTime.now().toUtc();

    return OrderStatus(
      id: json['id'] as String,
      status: json['status']?.toString() ?? 'received',
      createdAt: createdAt,
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0,
      currency: json['currency']?.toString() ?? 'EUR',
      orderCode: json['order_code']?.toString(),
    );
  }
}
