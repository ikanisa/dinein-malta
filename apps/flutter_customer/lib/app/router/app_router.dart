import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'routes.dart';
import '../shell/app_shell.dart';
import '../../features/home/home_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/venue/venue_menu_screen.dart';
import '../../features/venue/venue_info_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/order/screens/checkout_screen.dart';
import '../../features/order/screens/order_confirmation_screen.dart';
import '../../features/order/screens/orders_history_screen.dart';
import '../../features/venue/bell_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/settings/help_screen.dart';
import '../../features/settings/favorites_screen.dart';
import '../../features/settings/privacy_policy_screen.dart';
import '../../features/settings/profile_screen.dart';
import '../../features/chat/chat_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final rootNavigatorKey = GlobalKey<NavigatorState>();
  final homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'home');
  final settingsNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'settings');

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: Routes.splash,
    redirect: (context, state) {
      final uri = state.uri;
      final path = state.matchedLocation;
      
      // Handle deep links: dinein://v/slug
      if (uri.scheme == 'dinein' && uri.host == 'v') {
        final slug = uri.pathSegments.isNotEmpty ? uri.pathSegments.first : '';
        if (slug.isNotEmpty) {
          final query = uri.query;
          final target = '/v/$slug${query.isNotEmpty ? '?$query' : ''}';
          if (path != target) {
            return target;
          }
        }
      }
      
      // If landing on /v/:slug directly, skip splash
      if (path.startsWith('/v/') && state.extra == null) {
        return null; // Allow direct venue access
      }
      
      return null;
    },
    routes: [
      // Splash Screen (initial)
      GoRoute(
        path: Routes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      
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
                      final tableParam = state.uri.queryParameters['t'];
                      return VenueMenuScreen(
                          slug: slug, tableNumber: tableParam);
                    },
                    routes: [
                      GoRoute(
                        path: Routes.venueInfo,
                        parentNavigatorKey: rootNavigatorKey,
                        builder: (context, state) {
                          final slug = state.pathParameters[Routes.venueSlugParam]!;
                          return VenueInfoScreen(slug: slug);
                        },
                      ),
                    ],
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
                    pageBuilder: (context, state) => CustomTransitionPage(
                      key: state.pageKey,
                      child: const OrdersHistoryScreen(),
                      transitionsBuilder: _slideRightTransition,
                    ),
                  ),
                  GoRoute(
                    path: Routes.help,
                    pageBuilder: (context, state) => CustomTransitionPage(
                      key: state.pageKey,
                      child: const HelpScreen(),
                      transitionsBuilder: _slideRightTransition,
                    ),
                  ),
                  GoRoute(
                    path: Routes.favorites,
                    pageBuilder: (context, state) => CustomTransitionPage(
                      key: state.pageKey,
                      child: const FavoritesScreen(),
                      transitionsBuilder: _slideRightTransition,
                    ),
                  ),
                  GoRoute(
                    path: Routes.privacy,
                    pageBuilder: (context, state) => CustomTransitionPage(
                      key: state.pageKey,
                      child: const PrivacyPolicyScreen(),
                      transitionsBuilder: _slideRightTransition,
                    ),
                  ),
                  GoRoute(
                    path: Routes.profile,
                    pageBuilder: (context, state) => CustomTransitionPage(
                      key: state.pageKey,
                      child: const ProfileScreen(),
                      transitionsBuilder: _slideRightTransition,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      // Fullscreen Routes (Root) - with slide-up transitions
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: Routes.cart,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const CartScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 1),
                end: Offset.zero,
              ).animate(CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutCubic,
              )),
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: Routes.checkout,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const CheckoutScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 1),
                end: Offset.zero,
              ).animate(CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutCubic,
              )),
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '${Routes.order}/:id',
        pageBuilder: (context, state) {
          final id = state.pathParameters['id']!;
          final orderCode = state.uri.queryParameters['code'];
          return CustomTransitionPage(
            key: state.pageKey,
            child: OrderConfirmationScreen(orderId: id, orderCode: orderCode),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(
                opacity: animation,
                child: child,
              );
            },
          );
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '${Routes.bell}/:venueId',
        pageBuilder: (context, state) {
          final venueId = state.pathParameters['venueId']!;
          return CustomTransitionPage(
            key: state.pageKey,
            child: BellScreen(venueId: venueId),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 1),
                  end: Offset.zero,
                ).animate(CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeOutCubic,
                )),
                child: child,
              );
            },
          );
        },
      ),
      GoRoute(
        parentNavigatorKey: rootNavigatorKey,
        path: '${Routes.chat}/:venueId',
        pageBuilder: (context, state) {
          final venueId = state.pathParameters['venueId']!;
          final venueName = state.uri.queryParameters['name'];
          final tableNo = state.uri.queryParameters['t'];
          return CustomTransitionPage(
            key: state.pageKey,
            child: ChatScreen(
              venueId: venueId,
              venueName: venueName,
              tableNo: tableNo,
            ),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 1),
                  end: Offset.zero,
                ).animate(CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeOutCubic,
                )),
                child: child,
              );
            },
          );
        },
      ),
    ],
  );
});

/// Slide-right transition for settings sub-routes
Widget _slideRightTransition(
  BuildContext context,
  Animation<double> animation,
  Animation<double> secondaryAnimation,
  Widget child,
) {
  return SlideTransition(
    position: Tween<Offset>(
      begin: const Offset(1, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
    )),
    child: child,
  );
}
