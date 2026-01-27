import 'package:flutter/material.dart';
import '../tokens/spacing.dart';
import '../theme/app_theme.dart';
import '../widgets/surfaces/glass_container.dart';
import '../widgets/nav/dine_in_scaffold.dart';
import '../widgets/buttons/primary_button.dart';

class DesignGalleryScreen extends StatefulWidget {
  const DesignGalleryScreen({super.key});

  @override
  State<DesignGalleryScreen> createState() => _DesignGalleryScreenState();
}

class _DesignGalleryScreenState extends State<DesignGalleryScreen> {
  bool _isDark = true;

  @override
  Widget build(BuildContext context) {
    // We wrap in a Theme manually here for the gallery toggle to work 
    // without a top-level provider in this isolated test
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _isDark ? AppTheme.dark : AppTheme.light,
      home: Builder(
        builder: (context) {
          final theme = Theme.of(context);
          return DineInScaffold(
            appBar: AppBar(
              title: const Text('Design Gallery'),
              actions: [
                IconButton(
                  icon: Icon(_isDark ? Icons.light_mode : Icons.dark_mode),
                  onPressed: () => setState(() => _isDark = !_isDark),
                ),
              ],
            ),
            body: ListView(
              padding: const EdgeInsets.all(Spacing.lg16),
              children: [
                _sectionHeader(context, "Typography"),
                Text("Display Large", style: theme.textTheme.displayLarge),
                Text("Display Medium", style: theme.textTheme.displayMedium),
                Text("Display Small", style: theme.textTheme.displaySmall),
                const SizedBox(height: Spacing.md12),
                Text("Body Large", style: theme.textTheme.bodyLarge),
                Text("Body Medium", style: theme.textTheme.bodyMedium),
                Text("Body Small", style: theme.textTheme.bodySmall),
                
                _sectionHeader(context, "Buttons"),
                PrimaryButton(label: "Primary Action", onPressed: () {}),
                const SizedBox(height: Spacing.sm8),
                PrimaryButton(label: "Loading...", isLoading: true, onPressed: () {}),
                const SizedBox(height: Spacing.sm8),
                PrimaryButton(label: "With Icon", icon: Icons.shopping_cart, onPressed: () {}),
                
                _sectionHeader(context, "Surfaces"),
                GlassContainer(
                  padding: const EdgeInsets.all(Spacing.lg16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Glass Container", style: theme.textTheme.titleMedium),
                      const SizedBox(height: Spacing.sm8),
                      Text(
                        "This container uses the glassmorphism token stack with blur and overlay.",
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Spacing.md12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(Spacing.lg16),
                    child: const Text("Standard Surface Card (Material 3)"),
                  ),
                ),
              ],
            ),
          );
        }
      ),
    );
  }
  
  Widget _sectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Spacing.lg16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 1.5,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Divider(),
        ],
      ),
    );
  }
}
