import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/local/local_cache_service.dart';
import '../../core/data/repositories/bell_repository.dart';
import '../../core/design/tokens/clay_design.dart';
import '../../core/design/widgets/clay_components.dart';
import '../../core/utils/haptics.dart';

class BellScreen extends ConsumerStatefulWidget {
  final String venueId;

  const BellScreen({super.key, required this.venueId});

  @override
  ConsumerState<BellScreen> createState() => _BellScreenState();
}

class _BellScreenState extends ConsumerState<BellScreen> {
  final TextEditingController _tableController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _prefillTableNumber();
  }

  @override
  void dispose() {
    _tableController.dispose();
    super.dispose();
  }

  void _prefillTableNumber() {
    final cached =
        ref.read(localCacheServiceProvider).getTableNumber(widget.venueId);
    if (cached != null && cached.isNotEmpty) {
      _tableController.text = cached;
    }
  }

  Future<void> _ringBell() async {
    final tableNumber = _tableController.text.trim();
    if (tableNumber.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please enter table number', style: TextStyle(color: Colors.white)),
          backgroundColor: ClayColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    Haptics.mediumImpact();
    
    try {
      final sessionId = await ref.read(localCacheServiceProvider).getOrCreateSessionId();
      
      await ref.read(bellRepositoryProvider).ringBell(
        sessionId: sessionId,
        venueId: widget.venueId,
        tableNumber: tableNumber,
      );

      await ref
          .read(localCacheServiceProvider)
          .cacheTableNumber(widget.venueId, tableNumber);

      if (mounted) {
        // Success feedback
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Waiter notified!', style: TextStyle(color: Colors.white)),
            backgroundColor: ClayColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e', style: TextStyle(color: Colors.white)),
            backgroundColor: ClayColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        backgroundColor: ClayColors.background,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ClayColors.surface,
              borderRadius: BorderRadius.circular(ClayRadius.sm),
              boxShadow: ClayShadows.subtle,
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: ClayColors.textPrimary),
          ),
          onPressed: () => context.pop(),
        ),
        title: Text('Call Waiter', style: ClayTypography.h3),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(ClaySpacing.lg),
        child: Column(
          children: [
            const SizedBox(height: ClaySpacing.xl),
            
            // Main Card
            ClayCard(
              child: Padding(
                padding: const EdgeInsets.all(ClaySpacing.md),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: ClayColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.notifications_active_rounded,
                        size: 48,
                        color: ClayColors.primary,
                      ),
                    ),
                    const SizedBox(height: ClaySpacing.lg),
                    
                    Text(
                      'Need assistance?',
                      style: ClayTypography.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: ClaySpacing.sm),
                    Text(
                      'Enter your table number to alert the staff.',
                      style: ClayTypography.body.copyWith(color: ClayColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: ClaySpacing.xl),
                    
                    ClayTextField(
                      controller: _tableController,
                      hintText: 'Table Number (e.g. 12)',
                      keyboardType: TextInputType.number,
                      autofocus: true,
                    ),
                    
                    const SizedBox(height: ClaySpacing.xl),
                    
                    ClayButton(
                      label: 'Ring Bell',
                      icon: Icons.notifications_on_outlined,
                      isLoading: _isLoading,
                      onPressed: _ringBell,
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: ClaySpacing.xl),
            
            Text(
              'Waiters are usually quick!',
              style: ClayTypography.caption,
            ),
          ],
        ),
      ),
    );
  }
}
