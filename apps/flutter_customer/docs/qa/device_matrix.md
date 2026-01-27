# QA Device & Network Matrix

To ensure the "Native-like" performance and wide accessibility of DineIn, tests must be run across this matrix.

## Device Tiers

| Tier | OS | Memory | Target Models (Examples) | Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Low/Mid Android** | Android 10-12 | 3GB - 4GB | Galaxy A12, Tecno Spark, Redmi Note 9 | Scroll performance, startup time, ANRs. |
| **High Android** | Android 13+ | 8GB+ | Pixel 7/8, Galaxy S23 | Animation smoothness, refresh rates (120Hz). |
| **Legacy iPhone** | iOS 16 | 4GB | iPhone 11, iPhone SE (2nd Gen) | Safe area constraints, notch behavior. |
| **Modern iPhone** | iOS 17+ | 6GB+ | iPhone 14/15 Pro Max | Dynamic Island, max resolution assets. |

## Network Profiles

| Profile | Specs | Purpose |
| :--- | :--- | :--- |
| **WiFi Good** | Stable Fiber/Broadband | Baseline functional testing. Messages should be instant. |
| **4G Average** | Standard Mobile Data | Realistic venue usage. Images should load progressively. |
| **Poor/Flaky** | 3G / High Latency / Packet Loss | Robustness. App should not crash. Spinners should show. |
| **Offline** | Airplane Mode | Cache validation. "Offline" banner must appear. |
