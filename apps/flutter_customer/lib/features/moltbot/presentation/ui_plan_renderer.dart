import 'package:flutter/material.dart';
import '../domain/ui_plan_model.dart';
import 'widgets/section_widgets.dart';

/// Universal UIPlan renderer for Flutter.
///
/// Maps sections to widgets based on type.
/// Handles actions via callback.
class UIPlanRenderer extends StatelessWidget {
  const UIPlanRenderer({
    super.key,
    required this.plan,
    required this.onAction,
    this.onError,
  });

  final UIPlan plan;
  final void Function(String actionRef, UIPlanAction action) onAction;
  final void Function(String error)? onError;

  @override
  Widget build(BuildContext context) {
    if (plan.sections.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'No content available',
            style: TextStyle(color: Colors.grey),
          ),
        ),
      );
    }

    return CustomScrollView(
      slivers: [
        // Screen header
        if (plan.screen.title.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    plan.screen.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  if (plan.screen.breadcrumbs != null &&
                      plan.screen.breadcrumbs!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: _buildBreadcrumbs(context),
                    ),
                ],
              ),
            ),
          ),

        // Sections
        ...plan.sections.map((section) => _buildSection(context, section)),

        // Bottom padding
        const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
      ],
    );
  }

  Widget _buildBreadcrumbs(BuildContext context) {
    final crumbs = plan.screen.breadcrumbs!;
    return Row(
      children: [
        for (int i = 0; i < crumbs.length; i++) ...[
          if (crumbs[i].actionRef != null)
            GestureDetector(
              onTap: () => _handleAction(crumbs[i].actionRef!),
              child: Text(
                crumbs[i].label,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.primary,
                  fontSize: 14,
                ),
              ),
            )
          else
            Text(
              crumbs[i].label,
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 14,
              ),
            ),
          if (i < crumbs.length - 1)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Text(' / ', style: TextStyle(color: Colors.grey)),
            ),
        ],
      ],
    );
  }

  Widget _buildSection(BuildContext context, UIPlanSection section) {
    switch (section.type) {
      case SectionType.hero:
        return SliverToBoxAdapter(
          child: HeroSectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.chips:
        return SliverToBoxAdapter(
          child: ChipsSectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.carousel:
        return SliverToBoxAdapter(
          child: CarouselSectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.grid:
        return SliverToBoxAdapter(
          child: GridSectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.list:
        return SliverToBoxAdapter(
          child: ListSectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.banner:
        return SliverToBoxAdapter(
          child: BannerSectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.metrics:
        return SliverToBoxAdapter(
          child: MetricsSectionWidget(
            section: section,
          ),
        );

      case SectionType.cta:
        return SliverToBoxAdapter(
          child: CTASectionWidget(
            section: section,
            onAction: _handleAction,
          ),
        );

      case SectionType.divider:
        return const SliverToBoxAdapter(
          child: Divider(height: 32),
        );
    }
  }

  void _handleAction(String actionRef) {
    final action = plan.actions.byId[actionRef];
    if (action == null) {
      debugPrint('Unknown actionRef: $actionRef');
      return;
    }
    onAction(actionRef, action);
  }
}
