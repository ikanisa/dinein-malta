# Tap Budget Enforcement

**Rule**: A customer must be able to place an order from the menu screen in **≤ 4 taps**.

## The Budget (4 Taps)
1. **Tap 1**: Add Item (e.g., tap "Add" on a menu item or open bottom sheet + add).
   - *Note: If opening a bottom sheet is required, "Open" + "Add" counts as interaction cost, but efficiently designed, "Quick Add" is 1 tap.*
   - *Current Design*: Tap Item -> Open Sheet -> Tap Add = 2 Taps. (Leaves 2 taps for checkout).
2. **Tap 2**: Open Cart (View Order).
3. **Tap 3**: Proceed to Checkout (or "Place Order" if single step).
4. **Tap 4**: Confirm / Place Order.

## Failure Criteria (FAIL if...)
- **> 4 taps** to complete a simple order.
- Forced Login/Signup in the middle of the flow.
- Forced "Payment Method Selection" screen if a default is already set or if only one exists.
- "Upsell" modals that require a dismissal tap.

## Audit Log
| Date | Flow Tested | Tap Count | Result |
| :--- | :--- | :--- | :--- |
|      | Standard Order |           |        |
