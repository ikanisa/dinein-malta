import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/design/widgets/nav/dine_in_scaffold.dart';
import '../../core/design/widgets/nav/dine_in_bottom_nav.dart';
import '../../core/widgets/offline_indicator.dart';

class AppShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const AppShell({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context) {
    return DineInScaffold(
      body: Column(
        children: [
          const OfflineIndicator(),
          Expanded(child: navigationShell),
        ],
      ),
      bottomNavigationBar: DineInBottomNav(navigationShell: navigationShell),
    );
  }
}
