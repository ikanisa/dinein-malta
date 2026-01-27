import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Uber Eats-inspired clean header with DineIn branding and country toggle
class HomeAppBar extends StatelessWidget {
  final String activeCountry;
  final Function(String) onCountryChanged;

  const HomeAppBar({
    super.key,
    required this.activeCountry,
    required this.onCountryChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Ensure status bar is dark for light background
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark);

    return SliverToBoxAdapter(
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              // Brand name with accent
              const _BrandLogo(),

              const Spacer(),

              // Country toggle
              _CountryToggle(
                activeCountry: activeCountry,
                onCountryChanged: onCountryChanged,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// DineIn brand logo with styled text
class _BrandLogo extends StatelessWidget {
  const _BrandLogo();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Icon/logo mark
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFF1F1F1F),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Center(
            child: Icon(
              Icons.restaurant_menu_rounded,
              color: Color(0xFFE8A037), // Gold accent
              size: 20,
            ),
          ),
        ),
        const SizedBox(width: 10),
        // Text
        const Text(
          'DineIn',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: Color(0xFF1F1F1F),
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}

/// Country toggle pills
class _CountryToggle extends StatelessWidget {
  final String activeCountry;
  final Function(String) onCountryChanged;

  const _CountryToggle({
    required this.activeCountry,
    required this.onCountryChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F0F0),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _CountryPill(
            country: 'RW',
            label: '🇷🇼',
            isActive: activeCountry == 'RW',
            onTap: () => onCountryChanged('RW'),
          ),
          const SizedBox(width: 2),
          _CountryPill(
            country: 'MT',
            label: '🇲🇹',
            isActive: activeCountry == 'MT',
            onTap: () => onCountryChanged('MT'),
          ),
        ],
      ),
    );
  }
}

/// Individual country pill
class _CountryPill extends StatelessWidget {
  final String country;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _CountryPill({
    required this.country,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(width: 4),
            Text(
              country,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                color: isActive
                    ? const Color(0xFF1F1F1F)
                    : const Color(0xFF1F1F1F).withValues(alpha: 0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
