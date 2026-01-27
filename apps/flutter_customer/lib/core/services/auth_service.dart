import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/supabase/supabase_client.dart';

/// Service for managing Supabase Anonymous Authentication.
/// Customers use anonymous auth only - no email/password sign-in.
class AuthService {
  final SupabaseClient _client;

  AuthService(this._client);

  /// Current authenticated user, or null if not signed in.
  User? get currentUser => _client.auth.currentUser;

  /// Current user ID, or null if not signed in.
  String? get currentUserId => currentUser?.id;

  /// Whether user is currently authenticated (anonymous or otherwise).
  bool get isAuthenticated => currentUser != null;

  /// Stream of auth state changes.
  Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;

  /// Ensures an anonymous session exists.
  /// If already signed in, returns existing user.
  /// If not, creates a new anonymous session.
  Future<User> ensureAnonymousSession() async {
    // Check if already authenticated
    final existingUser = currentUser;
    if (existingUser != null) {
      return existingUser;
    }

    // Create new anonymous session
    final response = await _client.auth.signInAnonymously();
    final user = response.user;
    if (user == null) {
      throw Exception('Failed to create anonymous session');
    }
    return user;
  }

  /// Signs out the current user.
  /// This will clear the anonymous session - user will get new identity on next launch.
  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}

// Provider for AuthService
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(supabaseClientProvider));
});

// Provider for current user ID (reactive)
final currentUserIdProvider = StreamProvider<String?>((ref) {
  final authService = ref.watch(authServiceProvider);
  
  // Emit initial state
  return authService.onAuthStateChange.map((state) {
    return state.session?.user.id;
  });
});

// Provider for ensuring anonymous session is established
final ensureAuthProvider = FutureProvider<User>((ref) async {
  final authService = ref.watch(authServiceProvider);
  return authService.ensureAnonymousSession();
});
