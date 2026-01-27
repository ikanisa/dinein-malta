import 'package:flutter/material.dart';

class ErrorMapper {
  static String getErrorMessage(Object error) {
    final message = error.toString();

    if (message.contains('SocketException') ||
        message.contains('ClientException')) {
      return 'No internet connection. Please check your network.';
    }

    if (message.contains('429')) {
      return 'You are doing that too fast. Please wait a moment.';
    }

    if (message.contains('401') || message.contains('403')) {
      return 'Access denied.';
    }

    if (message.contains('venue not found')) {
      return 'This venue is currently unavailable.';
    }

    return 'Something went wrong. Please try again.';
  }

  static IconData getErrorIcon(Object error) {
    final message = error.toString();
    if (message.contains('SocketException')) return Icons.wifi_off_rounded;
    if (message.contains('429')) return Icons.hourglass_empty_rounded;
    return Icons.error_outline_rounded;
  }
}
