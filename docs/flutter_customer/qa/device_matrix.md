# QA Device & Test Matrix

To ensure the "DineIn" experience meets the premium/native-feel bar, we test across a matrix of devices and network conditions.

## Device Tiers

### Tier 1: Flagships (Primary Target)
*   **Devices**: iPhone 14/15 Pro, Samsung S23/S24, Pixel 7/8.
*   **Expectation**: 60fps animations, haptics perfect, < 1s interactions.
*   **OS**: iOS 16+, Android 13+.

### Tier 2: Mid-Range (Mass Market RW/MT)
*   **Devices**: iPhone 11/12, Samsung A-Series (A54), Redmi Note 12.
*   **Expectation**: Smooth scrolling, functional haptics (if hardware supports).
*   **OS**: iOS 15+, Android 10+.

### Tier 3: Budget / Older (Minimum Spec)
*   **Devices**: iPhone 8/SE, Tecno/Infinix (popular in RW), Generic Android Go.
*   **Expectation**: Functional. Loading states might be seen. No crashes.
*   **OS**: Android 8+.

## Network Profiles

| Profile | Conditions | Test Focus |
| :--- | :--- | :--- |
| **WiFi** | Stable, High Bandwidth | Image loading, Menu sync. |
| **4G** | Stable, Medium Latency | Order placement, Image optimization. |
| **3G** | Unstable, High Latency | Timeout handling, Spinners. |
| **Offline** | Disconnected | Cached Menu viewing, "Offline" toast on actions. |

## Accessibility & Settings

*   **Dark Mode**: Verify correct color inversion (no dark-on-dark text).
*   **Text Scaling**: Verify layout at 150% text size.
*   **Reduced Motion**: Verify animations are simplified/disabled.
