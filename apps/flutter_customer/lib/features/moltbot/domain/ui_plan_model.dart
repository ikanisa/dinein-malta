/// UIPlan v1 - Dart Models
///
/// Deterministic UI contract for Moltbot UI Orchestrator.
/// Matches TypeScript types from @dinein/core.

import 'package:freezed_annotation/freezed_annotation.dart';

part 'ui_plan_model.freezed.dart';
part 'ui_plan_model.g.dart';

// =============================================================================
// ENUMS
// =============================================================================

enum ScreenName {
  home,
  search,
  venue,
  menu,
  item,
  checkout,
  orders,
  @JsonValue('chat_waiter')
  chatWaiter,
  profile,
}

enum LayoutType {
  scroll,
  tabs,
  sheet,
  modal,
}

enum SectionType {
  hero,
  chips,
  carousel,
  grid,
  list,
  banner,
  metrics,
  divider,
  cta,
}

enum ItemKind {
  venue,
  @JsonValue('menu_item')
  menuItem,
  offer,
  category,
  info,
  action,
}

enum ActorType {
  guest,
  staff,
  admin,
}

enum ActionIntent {
  openHome,
  openSearch,
  openVenue,
  openMenu,
  openItem,
  applyFilter,
  clearFilters,
  startVisit,
  addToCart,
  updateCartItem,
  removeFromCart,
  openCheckout,
  confirmOrder,
  openChatWaiter,
  sendWaiterMessage,
  callStaff,
  requestBill,
  openOrders,
  trackOrder,
  openExternalUrl,
}

enum EmphasisLevel { low, medium, high }

enum DensityType { compact, regular }

// =============================================================================
// MODELS
// =============================================================================

@freezed
class UIPlan with _$UIPlan {
  const factory UIPlan({
    required String version,
    required String planId,
    required String generatedAt,
    required UIPlanTenant tenant,
    required UIPlanSession session,
    required UIPlanScreen screen,
    required List<UIPlanSection> sections,
    required UIPlanActions actions,
    required UIPlanCache cache,
    UIPlanDebug? debug,
  }) = _UIPlan;

  factory UIPlan.fromJson(Map<String, dynamic> json) => _$UIPlanFromJson(json);
}

@freezed
class UIPlanTenant with _$UIPlanTenant {
  const factory UIPlanTenant({
    required String tenantId,
    String? venueId,
  }) = _UIPlanTenant;

  factory UIPlanTenant.fromJson(Map<String, dynamic> json) =>
      _$UIPlanTenantFromJson(json);
}

@freezed
class UIPlanSession with _$UIPlanSession {
  const factory UIPlanSession({
    required String sessionKey,
    required UIPlanActor actor,
  }) = _UIPlanSession;

  factory UIPlanSession.fromJson(Map<String, dynamic> json) =>
      _$UIPlanSessionFromJson(json);
}

@freezed
class UIPlanActor with _$UIPlanActor {
  const factory UIPlanActor({
    required ActorType actorType,
    required String actorId,
    String? locale,
    String? currency,
  }) = _UIPlanActor;

  factory UIPlanActor.fromJson(Map<String, dynamic> json) =>
      _$UIPlanActorFromJson(json);
}

@freezed
class UIPlanScreen with _$UIPlanScreen {
  const factory UIPlanScreen({
    required ScreenName name,
    required String title,
    required LayoutType layout,
    List<UIPlanBreadcrumb>? breadcrumbs,
  }) = _UIPlanScreen;

  factory UIPlanScreen.fromJson(Map<String, dynamic> json) =>
      _$UIPlanScreenFromJson(json);
}

@freezed
class UIPlanBreadcrumb with _$UIPlanBreadcrumb {
  const factory UIPlanBreadcrumb({
    required String label,
    String? actionRef,
  }) = _UIPlanBreadcrumb;

  factory UIPlanBreadcrumb.fromJson(Map<String, dynamic> json) =>
      _$UIPlanBreadcrumbFromJson(json);
}

@freezed
class UIPlanSection with _$UIPlanSection {
  const factory UIPlanSection({
    required String id,
    required SectionType type,
    String? title,
    String? subtitle,
    SectionStyle? style,
    required List<SectionItem> items,
  }) = _UIPlanSection;

  factory UIPlanSection.fromJson(Map<String, dynamic> json) =>
      _$UIPlanSectionFromJson(json);
}

@freezed
class SectionStyle with _$SectionStyle {
  const factory SectionStyle({
    EmphasisLevel? emphasis,
    DensityType? density,
    String? themeToken,
  }) = _SectionStyle;

  factory SectionStyle.fromJson(Map<String, dynamic> json) =>
      _$SectionStyleFromJson(json);
}

@freezed
class SectionItem with _$SectionItem {
  const factory SectionItem({
    required ItemKind kind,
    required String id,
    required String primaryText,
    String? secondaryText,
    SectionItemMeta? meta,
    SectionItemMedia? media,
    String? actionRef,
  }) = _SectionItem;

  factory SectionItem.fromJson(Map<String, dynamic> json) =>
      _$SectionItemFromJson(json);
}

@freezed
class SectionItemMeta with _$SectionItemMeta {
  const factory SectionItemMeta({
    String? badge,
    String? priceText,
    String? ratingText,
    String? distanceText,
    String? availabilityText,
  }) = _SectionItemMeta;

  factory SectionItemMeta.fromJson(Map<String, dynamic> json) =>
      _$SectionItemMetaFromJson(json);
}

@freezed
class SectionItemMedia with _$SectionItemMedia {
  const factory SectionItemMedia({
    String? imageUrl,
    String? aspect,
  }) = _SectionItemMedia;

  factory SectionItemMedia.fromJson(Map<String, dynamic> json) =>
      _$SectionItemMediaFromJson(json);
}

@freezed
class UIPlanActions with _$UIPlanActions {
  const factory UIPlanActions({
    required Map<String, UIPlanAction> byId,
  }) = _UIPlanActions;

  factory UIPlanActions.fromJson(Map<String, dynamic> json) =>
      _$UIPlanActionsFromJson(json);
}

@freezed
class UIPlanAction with _$UIPlanAction {
  const factory UIPlanAction({
    required ActionIntent intent,
    Map<String, dynamic>? params,
    bool? requiresConfirmation,
    String? confirmationText,
  }) = _UIPlanAction;

  factory UIPlanAction.fromJson(Map<String, dynamic> json) =>
      _$UIPlanActionFromJson(json);
}

@freezed
class UIPlanCache with _$UIPlanCache {
  const factory UIPlanCache({
    required int ttlSeconds,
    List<String>? varyBy,
  }) = _UIPlanCache;

  factory UIPlanCache.fromJson(Map<String, dynamic> json) =>
      _$UIPlanCacheFromJson(json);
}

@freezed
class UIPlanDebug with _$UIPlanDebug {
  const factory UIPlanDebug({
    String? explanation,
    List<UIPlanDebugToolCall>? sourceToolCalls,
  }) = _UIPlanDebug;

  factory UIPlanDebug.fromJson(Map<String, dynamic> json) =>
      _$UIPlanDebugFromJson(json);
}

@freezed
class UIPlanDebugToolCall with _$UIPlanDebugToolCall {
  const factory UIPlanDebugToolCall({
    required String tool,
    required String correlationId,
  }) = _UIPlanDebugToolCall;

  factory UIPlanDebugToolCall.fromJson(Map<String, dynamic> json) =>
      _$UIPlanDebugToolCallFromJson(json);
}
