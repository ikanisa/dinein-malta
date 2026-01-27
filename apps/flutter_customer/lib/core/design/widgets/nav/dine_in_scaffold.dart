import 'package:flutter/material.dart';
import '../../tokens/gradients.dart';

class DineInScaffold extends StatelessWidget {
  final Widget? body;
  final Widget? bottomNavigationBar;
  final PreferredSizeWidget? appBar;
  final bool extendBody;
  final bool extendBodyBehindAppBar;

  const DineInScaffold({
    super.key,
    this.body,
    this.bottomNavigationBar,
    this.appBar,
    this.extendBody = false,
    this.extendBodyBehindAppBar = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      extendBody: extendBody,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      appBar: appBar,
      body: Container(
        decoration: BoxDecoration(
          gradient: isDark
              ? DineInGradients.candlelightScaffold
              : DineInGradients.brightBistroScaffold,
        ),
        child: SafeArea(
          // Allow override? Maybe. For now safety first.
          bottom: !extendBody,
          child: body ?? const SizedBox.shrink(),
        ),
      ),
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}
