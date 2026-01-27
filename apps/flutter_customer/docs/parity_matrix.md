# Flutter vs PWA Parity Matrix (Audit Results)

| Journey | Screen | Components | Copy | Tap Count | States | A11y | Status | Fix Needed? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Launch** | Home | Card (Plain) | Match | N/A | [x] Skeleton<br>[x] Empty<br>[ ] Offline | [x] Targets | PASS | No |
| **2. Entry** | Venue Menu | Sticky Header | Match | 1 | [x] Skeleton<br>[x] Empty | [x] Tabs | PASS | No |
| **3. Add Item** | Item Details | Tile (Blue Text) | Match | +0 (Quick) | [x] Avail check | [x] 48dp+ | FAIL | **Yes (Blue text -> Brand)** |
| **4. Cart** | Floating Pill | Glass Pill | Match | +1 (Open) | [x] Hidden if 0 | [x] Text | PASS | No |
| **5. Checkout** | Checkout Page | Native Radio | Match | +1 (Nav) | [ ] Processing | [x] Inputs | FAIL | **Yes (Radio -> Cards)** |
| **6. Confirm** | Success | Simple Icon | Match | +1 (Place) | [x] Success | - | PASS | No |
| **7. History** | History List | Plain ListTile | Match | N/A | [x] Empty | - | FAIL | **Yes (Plain -> Cards)** |
| **8. Service** | Bell | (Missing?) | ? | ? | ? | ? | FAIL | **Yes (Locate/Impl)** |

## Top 3 Fixes Required
1. **Bell Feature**: seems missing or hidden.
2. **Checkout UI**: Native Radio buttons look cheap. Replace with Selection Cards.
3. **Item Add Button**: "ADD" text is generic blue. Needs to be branded pill or outline.
