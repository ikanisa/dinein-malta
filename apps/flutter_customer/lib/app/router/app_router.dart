import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'routes.dart';
import '../shell/app_shell.dart';
import '../../features/home/home_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/venue/venue_menu_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/order/screens/checkout_screen.dart';
import '../../features/order/screens/order_confirmation_screen.dart';
import '../../features/order/screens/orders_history_screen.dart';
import '../../features/venue/bell_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final rootNavigatorKey = GlobalKey<NavigatorState>();
  final homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'home');
  final settingsNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'settings');

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: Routes.home,
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          // Home Branch
          StatefulShellBranch(
            navigatorKey: homeNavigatorKey,
            routes: [
              GoRoute(
                path: Routes.home,
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: HomeScreen(),
                ),
                routes: [
                  GoRoute(
                    path: 'v/:${Routes.venueSlugParam}',
                    parentNavigatorKey: rootNavigatorKey,
                    builder: (context, state) {
                      final slug = state.pathParameters[Routes.venueSlugParam]!;
                      return VenueMenuScreen(slug: slug);
                    },
                  ),
                ],
              ),
            ],
          ),

          // Settings Branch
          StatefulShellBranch(
            navigatorKey: settingsNavigatorKey,
            routes: [
              GoRoute(
                path: Routes.settings,
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: SettingsScreen(),
                ),
                routes: [
                  GoRoute(
                    path: Routes.ordersHistory,
                    builder: (context, state) => const OrdersHistoryScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      
      // Fullscreen Routes (Root)
      GoRoute(
         parentNavigatorKey: rootNavigatorKey,
         path: Routes.cart,
         builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
         parentNavigatorKey: rootNavigatorKey,
         path: Routes.checkout,
         builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
         parentNavigatorKey: rootNavigatorKey,
         path: '${Routes.order}/:id',
         builder: (context, state) {
            final id = state.pathParameters['id']!;
            return OrderConfirmationScreen(orderId: id);
         },
      ),
      GoRoute(
         parentNavigatorKey: rootNavigatorKey,
         path: '${Routes.bell}/:venueId',
         builder: (context, state) {
            final venueId = state.pathParameters['venueId']!;
            return BellScreen(venueId: venueId);
         },
      ),
    ],
  );
});
