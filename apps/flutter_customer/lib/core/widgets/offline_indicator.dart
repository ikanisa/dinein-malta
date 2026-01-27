import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/connectivity_provider.dart';

class OfflineIndicator extends ConsumerWidget {
  const OfflineIndicator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOffline = ref.watch(isOfflineProvider);
    
    // We can animate the height or opacity
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: isOffline
          ? Container(
              width: double.infinity,
              color: Colors.red[900], // Dark red
              padding: const EdgeInsets.symmetric(vertical: 4),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.cloud_off, size: 14, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'Offline Mode',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            )
          : const SizedBox.shrink(),
    );
  }
}
