import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Connectivity state
enum ConnectivityState {
  online,
  offline,
  unknown,
}

/// Service to monitor network connectivity
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  
  /// Stream of connectivity changes
  Stream<ConnectivityState> get connectivityStream {
    return _connectivity.onConnectivityChanged.map(_mapConnectivity);
  }
  
  /// Get current connectivity state
  Future<ConnectivityState> getCurrentState() async {
    final results = await _connectivity.checkConnectivity();
    return _mapConnectivity(results);
  }
  
  ConnectivityState _mapConnectivity(List<ConnectivityResult> results) {
    if (results.isEmpty) return ConnectivityState.unknown;
    
    // Check if any result indicates connectivity
    for (final result in results) {
      if (result == ConnectivityResult.wifi ||
          result == ConnectivityResult.mobile ||
          result == ConnectivityResult.ethernet) {
        return ConnectivityState.online;
      }
    }
    
    if (results.contains(ConnectivityResult.none)) {
      return ConnectivityState.offline;
    }
    
    return ConnectivityState.unknown;
  }
}

/// Provider for connectivity service
final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

/// Stream provider for connectivity state
final connectivityStateProvider = StreamProvider<ConnectivityState>((ref) {
  final service = ref.watch(connectivityServiceProvider);
  return service.connectivityStream;
});

/// Current connectivity state (async)
final currentConnectivityProvider = FutureProvider<ConnectivityState>((ref) {
  final service = ref.watch(connectivityServiceProvider);
  return service.getCurrentState();
});
