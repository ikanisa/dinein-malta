import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Agent type for Moltbot chat
enum AgentType {
  guest,
  barManager,
  admin,
}

extension AgentTypeExtension on AgentType {
  String get value {
    switch (this) {
      case AgentType.guest:
        return 'guest';
      case AgentType.barManager:
        return 'bar_manager';
      case AgentType.admin:
        return 'admin';
    }
  }
}

/// Message role in conversation
enum MessageRole { user, assistant, system }

/// A single chat message
class ChatMessage {
  final String id;
  final MessageRole role;
  final String content;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;
  final List<AIAction>? actions; // Parsed actionable content from AI

  ChatMessage({
    String? id,
    required this.role,
    required this.content,
    DateTime? createdAt,
    this.metadata,
    this.actions,
  })  : id = id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'role': role.name,
        'content': content,
      };
}

/// Action types that AI can trigger
enum AIActionType {
  showMenuItem,   // Display a menu item card
  addToCart,      // Add item to cart
  viewCart,       // Open cart view
  trackOrder,     // Show order status
  callWaiter,     // Trigger bell
}

/// Actionable content from AI responses
class AIAction {
  final AIActionType type;
  final String? itemId;
  final String? itemName;
  final double? price;
  final String? orderId;
  final Map<String, dynamic>? data;

  const AIAction({
    required this.type,
    this.itemId,
    this.itemName,
    this.price,
    this.orderId,
    this.data,
  });

  factory AIAction.fromJson(Map<String, dynamic> json) {
    return AIAction(
      type: AIActionType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => AIActionType.showMenuItem,
      ),
      itemId: json['item_id'] as String?,
      itemName: json['item_name'] as String?,
      price: (json['price'] as num?)?.toDouble(),
      orderId: json['order_id'] as String?,
      data: json['data'] as Map<String, dynamic>?,
    );
  }
}

/// Service for interacting with Moltbot AI assistant
class MoltbotService {
  final SupabaseClient _supabase;

  MoltbotService(this._supabase);

  /// Get Functions base URL from Supabase URL
  String get _functionsUrl {
    final supabaseUrl = const String.fromEnvironment('SUPABASE_URL');
    if (supabaseUrl.isEmpty) {
      return 'https://your-project.supabase.co/functions/v1';
    }
    return '$supabaseUrl/functions/v1';
  }

  /// Send a message and stream the response
  Stream<String> sendMessageStream({
    required List<ChatMessage> messages,
    AgentType agentType = AgentType.guest,
    String? venueId,
    String? tableNo,
    String? sessionId,
  }) async* {
    final url = Uri.parse('$_functionsUrl/agent-chat');

    final body = jsonEncode({
      'messages': messages.map((m) => m.toJson()).toList(),
      'context': {
        'agent_type': agentType.value,
        if (venueId != null) 'venue_id': venueId,
        if (tableNo != null) 'table_no': tableNo,
        if (sessionId != null) 'session_id': sessionId,
      },
      'stream': true,
    });

    final accessToken = _supabase.auth.currentSession?.accessToken;
    final anonKey = const String.fromEnvironment('SUPABASE_ANON_KEY');

    final client = HttpClient();

    try {
      final request = await client.postUrl(url);
      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Authorization', 'Bearer ${accessToken ?? anonKey}');
      request.headers.set('apikey', anonKey);
      request.write(body);

      final response = await request.close();

      if (response.statusCode != 200) {
        final errorBody = await response.transform(utf8.decoder).join();
        throw Exception('Agent chat error: ${response.statusCode} - $errorBody');
      }

      String buffer = '';
      await for (final chunk in response.transform(utf8.decoder)) {
        buffer += chunk;

        final lines = buffer.split('\n');
        buffer = lines.last;

        for (int i = 0; i < lines.length - 1; i++) {
          final line = lines[i].trim();

          if (line.startsWith('data:')) {
            final jsonStr = line.substring(5).trim();
            if (jsonStr.isEmpty) continue;

            try {
              final data = jsonDecode(jsonStr) as Map<String, dynamic>;

              if (data.containsKey('delta')) {
                final delta = data['delta'] as Map<String, dynamic>?;
                final content = delta?['content'] as List?;
                if (content != null && content.isNotEmpty) {
                  final textChunk = content[0]['text'] as String?;
                  if (textChunk != null) {
                    yield textChunk;
                  }
                }
              }
            } catch (e) {
              debugPrint('SSE parse error: $e');
            }
          }
        }
      }
    } catch (e) {
      debugPrint('MoltbotService stream error: $e');
      rethrow;
    } finally {
      client.close();
    }
  }

  /// Send a message and get complete response (non-streaming)
  Future<String> sendMessage({
    required List<ChatMessage> messages,
    AgentType agentType = AgentType.guest,
    String? venueId,
    String? tableNo,
    String? sessionId,
  }) async {
    try {
      final response = await _supabase.functions.invoke(
        'agent-chat',
        body: {
          'messages': messages.map((m) => m.toJson()).toList(),
          'context': {
            'agent_type': agentType.value,
            if (venueId != null) 'venue_id': venueId,
            if (tableNo != null) 'table_no': tableNo,
            if (sessionId != null) 'session_id': sessionId,
          },
          'stream': false,
        },
      );

      if (response.status != 200) {
        throw Exception('Agent chat error: ${response.status} - ${response.data}');
      }

      final data = response.data as Map<String, dynamic>;
      return data['content'] as String? ?? '';
    } catch (e) {
      debugPrint('MoltbotService error: $e');
      rethrow;
    }
  }

  /// Create a new chat session
  Future<String> createSession({
    AgentType agentType = AgentType.guest,
    String? venueId,
    String? tableNo,
  }) async {
    try {
      final response = await _supabase.from('agent_sessions').insert({
        'agent_type': agentType.value,
        if (venueId != null) 'venue_id': venueId,
        if (tableNo != null) 'table_no': tableNo,
        'user_id': _supabase.auth.currentUser?.id,
      }).select('id').single();

      return response['id'] as String;
    } catch (e) {
      debugPrint('Create session error: $e');
      rethrow;
    }
  }

  /// Save a message to conversation history
  Future<void> saveMessage({
    required String sessionId,
    required ChatMessage message,
  }) async {
    try {
      await _supabase.from('conversations').insert({
        'session_id': sessionId,
        'role': message.role.name,
        'content': message.content,
        'metadata': message.metadata ?? {},
      });
    } catch (e) {
      debugPrint('Save message error: $e');
    }
  }

  /// Load conversation history for a session
  Future<List<ChatMessage>> loadConversation(String sessionId) async {
    try {
      final response = await _supabase
          .from('conversations')
          .select()
          .eq('session_id', sessionId)
          .order('created_at', ascending: true);

      return (response as List).map((row) {
        return ChatMessage(
          id: row['id'],
          role: MessageRole.values.firstWhere(
            (r) => r.name == row['role'],
            orElse: () => MessageRole.user,
          ),
          content: row['content'],
          createdAt: DateTime.parse(row['created_at']),
          metadata: row['metadata'],
        );
      }).toList();
    } catch (e) {
      debugPrint('Load conversation error: $e');
      return [];
    }
  }
}

// =============================================================================
// RIVERPOD PROVIDERS
// =============================================================================

/// Provider for MoltbotService
final moltbotServiceProvider = Provider<MoltbotService>((ref) {
  return MoltbotService(Supabase.instance.client);
});

/// Chat state for a specific venue
class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String? error;
  final String? sessionId;
  final String currentResponse;
  final String? venueId;
  final String? tableNo;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
    this.sessionId,
    this.currentResponse = '',
    this.venueId,
    this.tableNo,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? error,
    String? sessionId,
    String? currentResponse,
    String? venueId,
    String? tableNo,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      sessionId: sessionId ?? this.sessionId,
      currentResponse: currentResponse ?? this.currentResponse,
      venueId: venueId ?? this.venueId,
      tableNo: tableNo ?? this.tableNo,
    );
  }
}

/// Notifier for chat state - uses Riverpod 2.0 Notifier pattern
class ChatNotifier extends Notifier<ChatState> {
  MoltbotService get _service => ref.read(moltbotServiceProvider);
  StreamSubscription<String>? _streamSubscription;

  @override
  ChatState build() {
    // Dispose stream when notifier is disposed
    ref.onDispose(() => _streamSubscription?.cancel());
    return const ChatState();
  }

  /// Initialize chat for a specific venue with welcome message
  void initForVenue({String? venueId, String? tableNo}) {
    // Reset if switching venues
    if (state.venueId != venueId && state.venueId != null) {
      state = const ChatState();
    }

    if (state.messages.isEmpty) {
      state = state.copyWith(
        venueId: venueId,
        tableNo: tableNo,
        messages: [
          ChatMessage(
            role: MessageRole.assistant,
            content: 'Hello! 👋 I\'m your AI waiter. I can help you browse the menu, answer questions about dishes, and take your order. What would you like today?',
          ),
        ],
      );
    }
  }

  /// Send a message to the AI
  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    final userMessage = ChatMessage(
      role: MessageRole.user,
      content: content,
    );

    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
      currentResponse: '',
    );

    try {
      // Create session if needed
      String? sessionId = state.sessionId;
      if (sessionId == null) {
        sessionId = await _service.createSession(
          venueId: state.venueId,
          tableNo: state.tableNo,
        );
        state = state.copyWith(sessionId: sessionId);
      }

      // Save user message to history
      await _service.saveMessage(sessionId: sessionId, message: userMessage);

      // Stream response
      String fullResponse = '';
      final stream = _service.sendMessageStream(
        messages: state.messages,
        venueId: state.venueId,
        tableNo: state.tableNo,
        sessionId: sessionId,
      );

      _streamSubscription = stream.listen(
        (chunk) {
          fullResponse += chunk;
          state = state.copyWith(currentResponse: fullResponse);
        },
        onDone: () {
          final assistantMessage = ChatMessage(
            role: MessageRole.assistant,
            content: fullResponse,
          );

          state = state.copyWith(
            messages: [...state.messages, assistantMessage],
            isLoading: false,
            currentResponse: '',
          );

          _service.saveMessage(sessionId: sessionId!, message: assistantMessage);
        },
        onError: (e) {
          state = state.copyWith(
            isLoading: false,
            error: e.toString(),
            currentResponse: '',
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Cancel current stream
  void cancelStream() {
    _streamSubscription?.cancel();
    _streamSubscription = null;
    
    if (state.currentResponse.isNotEmpty) {
      state = state.copyWith(
        messages: [
          ...state.messages,
          ChatMessage(
            role: MessageRole.assistant,
            content: state.currentResponse,
          ),
        ],
        isLoading: false,
        currentResponse: '',
      );
    } else {
      state = state.copyWith(isLoading: false);
    }
  }

  /// Clear chat history
  void clear() {
    _streamSubscription?.cancel();
    state = const ChatState();
  }

  // ==========================================================================
  // AI ACTION HANDLERS
  // ==========================================================================

  /// Execute an AI action (e.g., add to cart, view cart, track order)
  /// Returns true if action was handled successfully
  bool executeAction(AIAction action) {
    switch (action.type) {
      case AIActionType.addToCart:
        if (action.itemId != null && action.itemName != null) {
          // Send cart action message to AI for confirmation
          sendMessage('Add ${action.itemName} to my cart');
          return true;
        }
        return false;

      case AIActionType.viewCart:
        // Handled by UI - navigate to cart
        return true;

      case AIActionType.trackOrder:
        if (action.orderId != null) {
          sendMessage('What is the status of my order?');
          return true;
        }
        return false;

      case AIActionType.callWaiter:
        sendMessage('I need assistance from a waiter');
        return true;

      case AIActionType.showMenuItem:
        // Display only - no action needed
        return true;
    }
  }

  /// Quick action: Ask to see the menu
  void showMenu() {
    sendMessage('Show me the full menu');
  }

  /// Quick action: Ask about popular items
  void showPopularItems() {
    sendMessage('What are your most popular dishes?');
  }

  /// Quick action: Ask about dietary options
  void showDietaryOptions(String dietaryType) {
    sendMessage('What $dietaryType options do you have?');
  }

  /// Quick action: Summarize current cart
  void summarizeCart() {
    sendMessage('What do I have in my cart?');
  }

  /// Quick action: Ask for order status
  void checkOrderStatus() {
    sendMessage('What is the status of my order?');
  }

  /// Quick action: Ready to order
  void readyToOrder() {
    sendMessage('I am ready to place my order');
  }
}


/// Provider for chat state - single instance, venue tracked in state
final chatNotifierProvider = NotifierProvider<ChatNotifier, ChatState>(
  ChatNotifier.new,
);
