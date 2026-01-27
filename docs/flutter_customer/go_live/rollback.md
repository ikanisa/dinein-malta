# Rollback Procedures

When an **S1 Critical Incident** occurs, use these procedures to mitigate impact.

---

## 1. App Store / Play Store (Binary Rollback)
*Stores do not support "reverting" a binary. You must release a new version with a higher distinct build number.*

1.  **Stop Phased Release** (if active):
    *   **Play Console**: Pause the rollout track.
    *   **App Store Connect**: Pause Phased Release.
2.  **Checkout Previous Stable Tag**:
    *   `git checkout tags/v1.0.0` (Assuming v1.0.1 is bad).
3.  **Bump Version Code**:
    *   `pubspec.yaml`: `version: 1.0.0+43` -> `1.0.0+45` (Skip the bad build number).
4.  **Build & Sign**:
    *   Generate new AAB/IPA using the *old* logic but *new* build number.
5.  **Expedited Review (iOS)**:
    *   Submit with note: "Critical Bug Fix - Reverting version due to crash on launch." request expedited review.

## 2. Backend / Edge Function Rollback
*Backend changes can be reverted instantly.*

1.  **Identify Last Stable Deployment**:
    *   Check CLI logs or CI/CD history.
2.  **Redeploy Previous Function**:
    *   `supabase functions deploy create_customer_order --project-ref <prod-ref> --no-verify-jwt` (using the old code).
3.  **Verify**:
    *   Run **[Production Checks](./production_checks.md)** immediately.

## 3. Feature Flag Kill Switch
*If the issue is isolated to a new feature controlled by a flag.*

1.  **Access Config**:
    *   Open Supabase Table `app_config` (or config provider).
2.  **Disable Flag**:
    *   Set `enable_new_feature_x = false`.
3.  **Restart App**:
    *   Advise users (if possible) or wait for poll interval.
