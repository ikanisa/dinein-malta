import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/design/tokens/clay_design.dart';
import '../../../core/utils/haptics.dart';

/// Floating action button for AI waiter chat
class ClayAIButton extends StatelessWidget {
  final String venueId;
  final String? venueName;
  final String? tableNo;

  const ClayAIButton({
    super.key,
    required this.venueId,
    this.venueName,
    this.tableNo,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Haptics.mediumImpact();
        final queryParams = <String, String>{};
        if (venueName != null) queryParams['name'] = venueName!;
        if (tableNo != null) queryParams['t'] = tableNo!;
        
        final query = queryParams.isNotEmpty 
            ? '?${queryParams.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&')}'
            : '';
        
        context.push('/chat/$venueId$query');
      },
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              ClayColors.primary,
              ClayColors.primary.withBlue(255),
            ],
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: ClayColors.primary.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // AI icon
            const Icon(
              Icons.smart_toy_rounded,
              color: Colors.white,
              size: 28,
            ),
            // Sparkle indicator
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: Colors.amber,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
