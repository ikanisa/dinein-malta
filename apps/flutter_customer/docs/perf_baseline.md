# Flutter Customer App - Performance Baseline

## Targets
- **Cold Start (Home Render)**: < 1.5s
- **Menu Scroll**: 60fps (no jank)
- **Venue Transition**: < 200ms (Hero animation)

## Baseline Metrics (Pre-Optimization)
*To be filled during active profiling.*

- **Avg Frame Build Time (Home)**: TBD
- **Avg Frame Build Time (Menu)**: TBD
- **Deep Link Load Time**: TBD

## Optimization Strategy
1. **Images**: `cached_network_image` with `memCacheHeight/Width` to reduce memory.
2. **Lists**: `const` item constructors + `itemExtent` where applicable.
3. **Data**: Prefetch menu for top venue in view.

## Logs
- `[PERF]` tag used for performance warnings in logs.
