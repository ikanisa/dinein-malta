import 'package:flutter/material.dart';
import '../../domain/ui_plan_model.dart';

/// Hero section widget
class HeroSectionWidget extends StatelessWidget {
  const HeroSectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    final isHighEmphasis = section.style?.emphasis == EmphasisLevel.high;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: isHighEmphasis
          ? BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.primaryContainer,
                  Theme.of(context).colorScheme.surface,
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            )
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (section.title != null)
            Text(
              section.title!,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
              textAlign: TextAlign.center,
            ),
          if (section.subtitle != null) ...[
            const SizedBox(height: 8),
            Text(
              section.subtitle!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
              textAlign: TextAlign.center,
            ),
          ],
          ...section.items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Text(
                item.primaryText,
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Chips section widget
class ChipsSectionWidget extends StatelessWidget {
  const ChipsSectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (section.title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                section.title!,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: section.items.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    label: Text(item.primaryText),
                    onPressed: item.actionRef != null
                        ? () => onAction(item.actionRef!)
                        : null,
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

/// Carousel section widget
class CarouselSectionWidget extends StatelessWidget {
  const CarouselSectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              section.title!,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: section.items.length,
            itemBuilder: (context, index) {
              final item = section.items[index];
              return _CardWidget(
                item: item,
                onTap: item.actionRef != null
                    ? () => onAction(item.actionRef!)
                    : null,
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Grid section widget
class GridSectionWidget extends StatelessWidget {
  const GridSectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (section.title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                section.title!,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.85,
            ),
            itemCount: section.items.length,
            itemBuilder: (context, index) {
              final item = section.items[index];
              return _CardWidget(
                item: item,
                onTap: item.actionRef != null
                    ? () => onAction(item.actionRef!)
                    : null,
              );
            },
          ),
        ],
      ),
    );
  }
}

/// List section widget
class ListSectionWidget extends StatelessWidget {
  const ListSectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              section.title!,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ...section.items.map((item) => ListTile(
              title: Text(item.primaryText),
              subtitle:
                  item.secondaryText != null ? Text(item.secondaryText!) : null,
              trailing: item.meta?.priceText != null
                  ? Text(
                      item.meta!.priceText!,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    )
                  : null,
              leading: item.meta?.badge != null
                  ? Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.meta!.badge!,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    )
                  : null,
              onTap: item.actionRef != null
                  ? () => onAction(item.actionRef!)
                  : null,
            )),
      ],
    );
  }
}

/// Banner section widget
class BannerSectionWidget extends StatelessWidget {
  const BannerSectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    if (section.items.isEmpty) return const SizedBox.shrink();

    final item = section.items.first;
    return GestureDetector(
      onTap:
          item.actionRef != null ? () => onAction(item.actionRef!) : null,
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Theme.of(context).colorScheme.primary,
              Theme.of(context).colorScheme.secondary,
            ],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.primaryText,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
            if (item.secondaryText != null) ...[
              const SizedBox(height: 4),
              Text(
                item.secondaryText!,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 14,
                ),
              ),
            ],
            if (item.meta?.badge != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  item.meta!.badge!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Metrics section widget
class MetricsSectionWidget extends StatelessWidget {
  const MetricsSectionWidget({
    super.key,
    required this.section,
  });

  final UIPlanSection section;

  @override
  Widget build(BuildContext context) {
    final isHighEmphasis = section.style?.emphasis == EmphasisLevel.high;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: section.items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final isLast = index == section.items.length - 1;

          return Container(
            padding: EdgeInsets.symmetric(
              vertical: isLast && isHighEmphasis ? 12 : 8,
            ),
            decoration: isLast && isHighEmphasis
                ? BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Colors.grey[300]!),
                    ),
                  )
                : null,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  item.primaryText,
                  style: TextStyle(
                    color: isLast && isHighEmphasis ? null : Colors.grey[600],
                    fontWeight:
                        isLast && isHighEmphasis ? FontWeight.w600 : null,
                  ),
                ),
                Row(
                  children: [
                    Text(
                      item.meta?.priceText ?? item.secondaryText ?? '',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: isLast && isHighEmphasis ? 18 : null,
                      ),
                    ),
                    if (item.meta?.badge != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color:
                              Theme.of(context).colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          item.meta!.badge!,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// CTA section widget
class CTASectionWidget extends StatelessWidget {
  const CTASectionWidget({
    super.key,
    required this.section,
    required this.onAction,
  });

  final UIPlanSection section;
  final void Function(String) onAction;

  @override
  Widget build(BuildContext context) {
    if (section.items.isEmpty) return const SizedBox.shrink();

    final item = section.items.first;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: SizedBox(
        width: double.infinity,
        child: FilledButton(
          onPressed: item.actionRef != null
              ? () => onAction(item.actionRef!)
              : null,
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: Text(
            item.primaryText,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

/// Reusable card widget
class _CardWidget extends StatelessWidget {
  const _CardWidget({
    required this.item,
    this.onTap,
  });

  final SectionItem item;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(right: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 160,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (item.media?.imageUrl != null)
                Image.network(
                  item.media!.imageUrl!,
                  height: 80,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 80,
                    color: Colors.grey[200],
                    child: const Icon(Icons.image, color: Colors.grey),
                  ),
                )
              else
                Container(
                  height: 80,
                  color: Colors.grey[200],
                  child: const Center(
                    child: Icon(Icons.restaurant, color: Colors.grey),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.primaryText,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (item.secondaryText != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        item.secondaryText!,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    if (item.meta != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (item.meta!.badge != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Theme.of(context)
                                    .colorScheme
                                    .primaryContainer,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                item.meta!.badge!,
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w600,
                                  color:
                                      Theme.of(context).colorScheme.primary,
                                ),
                              ),
                            ),
                          if (item.meta!.priceText != null) ...[
                            const Spacer(),
                            Text(
                              item.meta!.priceText!,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                          if (item.meta!.ratingText != null)
                            Text(
                              item.meta!.ratingText!,
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.grey[600],
                              ),
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
