// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ui_plan_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UIPlanImpl _$$UIPlanImplFromJson(Map<String, dynamic> json) => _$UIPlanImpl(
      version: json['version'] as String,
      planId: json['planId'] as String,
      generatedAt: json['generatedAt'] as String,
      tenant: UIPlanTenant.fromJson(json['tenant'] as Map<String, dynamic>),
      session: UIPlanSession.fromJson(json['session'] as Map<String, dynamic>),
      screen: UIPlanScreen.fromJson(json['screen'] as Map<String, dynamic>),
      sections: (json['sections'] as List<dynamic>)
          .map((e) => UIPlanSection.fromJson(e as Map<String, dynamic>))
          .toList(),
      actions: UIPlanActions.fromJson(json['actions'] as Map<String, dynamic>),
      cache: UIPlanCache.fromJson(json['cache'] as Map<String, dynamic>),
      debug: json['debug'] == null
          ? null
          : UIPlanDebug.fromJson(json['debug'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$UIPlanImplToJson(_$UIPlanImpl instance) =>
    <String, dynamic>{
      'version': instance.version,
      'planId': instance.planId,
      'generatedAt': instance.generatedAt,
      'tenant': instance.tenant,
      'session': instance.session,
      'screen': instance.screen,
      'sections': instance.sections,
      'actions': instance.actions,
      'cache': instance.cache,
      'debug': instance.debug,
    };

_$UIPlanTenantImpl _$$UIPlanTenantImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanTenantImpl(
      tenantId: json['tenantId'] as String,
      venueId: json['venueId'] as String?,
    );

Map<String, dynamic> _$$UIPlanTenantImplToJson(_$UIPlanTenantImpl instance) =>
    <String, dynamic>{
      'tenantId': instance.tenantId,
      'venueId': instance.venueId,
    };

_$UIPlanSessionImpl _$$UIPlanSessionImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanSessionImpl(
      sessionKey: json['sessionKey'] as String,
      actor: UIPlanActor.fromJson(json['actor'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$UIPlanSessionImplToJson(_$UIPlanSessionImpl instance) =>
    <String, dynamic>{
      'sessionKey': instance.sessionKey,
      'actor': instance.actor,
    };

_$UIPlanActorImpl _$$UIPlanActorImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanActorImpl(
      actorType: $enumDecode(_$ActorTypeEnumMap, json['actorType']),
      actorId: json['actorId'] as String,
      locale: json['locale'] as String?,
      currency: json['currency'] as String?,
    );

Map<String, dynamic> _$$UIPlanActorImplToJson(_$UIPlanActorImpl instance) =>
    <String, dynamic>{
      'actorType': _$ActorTypeEnumMap[instance.actorType]!,
      'actorId': instance.actorId,
      'locale': instance.locale,
      'currency': instance.currency,
    };

const _$ActorTypeEnumMap = {
  ActorType.guest: 'guest',
  ActorType.staff: 'staff',
  ActorType.admin: 'admin',
};

_$UIPlanScreenImpl _$$UIPlanScreenImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanScreenImpl(
      name: $enumDecode(_$ScreenNameEnumMap, json['name']),
      title: json['title'] as String,
      layout: $enumDecode(_$LayoutTypeEnumMap, json['layout']),
      breadcrumbs: (json['breadcrumbs'] as List<dynamic>?)
          ?.map((e) => UIPlanBreadcrumb.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$UIPlanScreenImplToJson(_$UIPlanScreenImpl instance) =>
    <String, dynamic>{
      'name': _$ScreenNameEnumMap[instance.name]!,
      'title': instance.title,
      'layout': _$LayoutTypeEnumMap[instance.layout]!,
      'breadcrumbs': instance.breadcrumbs,
    };

const _$ScreenNameEnumMap = {
  ScreenName.home: 'home',
  ScreenName.search: 'search',
  ScreenName.venue: 'venue',
  ScreenName.menu: 'menu',
  ScreenName.item: 'item',
  ScreenName.checkout: 'checkout',
  ScreenName.orders: 'orders',
  ScreenName.chatWaiter: 'chat_waiter',
  ScreenName.profile: 'profile',
};

const _$LayoutTypeEnumMap = {
  LayoutType.scroll: 'scroll',
  LayoutType.tabs: 'tabs',
  LayoutType.sheet: 'sheet',
  LayoutType.modal: 'modal',
};

_$UIPlanBreadcrumbImpl _$$UIPlanBreadcrumbImplFromJson(
        Map<String, dynamic> json) =>
    _$UIPlanBreadcrumbImpl(
      label: json['label'] as String,
      actionRef: json['actionRef'] as String?,
    );

Map<String, dynamic> _$$UIPlanBreadcrumbImplToJson(
        _$UIPlanBreadcrumbImpl instance) =>
    <String, dynamic>{
      'label': instance.label,
      'actionRef': instance.actionRef,
    };

_$UIPlanSectionImpl _$$UIPlanSectionImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanSectionImpl(
      id: json['id'] as String,
      type: $enumDecode(_$SectionTypeEnumMap, json['type']),
      title: json['title'] as String?,
      subtitle: json['subtitle'] as String?,
      style: json['style'] == null
          ? null
          : SectionStyle.fromJson(json['style'] as Map<String, dynamic>),
      items: (json['items'] as List<dynamic>)
          .map((e) => SectionItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$UIPlanSectionImplToJson(_$UIPlanSectionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$SectionTypeEnumMap[instance.type]!,
      'title': instance.title,
      'subtitle': instance.subtitle,
      'style': instance.style,
      'items': instance.items,
    };

const _$SectionTypeEnumMap = {
  SectionType.hero: 'hero',
  SectionType.chips: 'chips',
  SectionType.carousel: 'carousel',
  SectionType.grid: 'grid',
  SectionType.list: 'list',
  SectionType.banner: 'banner',
  SectionType.metrics: 'metrics',
  SectionType.divider: 'divider',
  SectionType.cta: 'cta',
};

_$SectionStyleImpl _$$SectionStyleImplFromJson(Map<String, dynamic> json) =>
    _$SectionStyleImpl(
      emphasis: $enumDecodeNullable(_$EmphasisLevelEnumMap, json['emphasis']),
      density: $enumDecodeNullable(_$DensityTypeEnumMap, json['density']),
      themeToken: json['themeToken'] as String?,
    );

Map<String, dynamic> _$$SectionStyleImplToJson(_$SectionStyleImpl instance) =>
    <String, dynamic>{
      'emphasis': _$EmphasisLevelEnumMap[instance.emphasis],
      'density': _$DensityTypeEnumMap[instance.density],
      'themeToken': instance.themeToken,
    };

const _$EmphasisLevelEnumMap = {
  EmphasisLevel.low: 'low',
  EmphasisLevel.medium: 'medium',
  EmphasisLevel.high: 'high',
};

const _$DensityTypeEnumMap = {
  DensityType.compact: 'compact',
  DensityType.regular: 'regular',
};

_$SectionItemImpl _$$SectionItemImplFromJson(Map<String, dynamic> json) =>
    _$SectionItemImpl(
      kind: $enumDecode(_$ItemKindEnumMap, json['kind']),
      id: json['id'] as String,
      primaryText: json['primaryText'] as String,
      secondaryText: json['secondaryText'] as String?,
      meta: json['meta'] == null
          ? null
          : SectionItemMeta.fromJson(json['meta'] as Map<String, dynamic>),
      media: json['media'] == null
          ? null
          : SectionItemMedia.fromJson(json['media'] as Map<String, dynamic>),
      actionRef: json['actionRef'] as String?,
    );

Map<String, dynamic> _$$SectionItemImplToJson(_$SectionItemImpl instance) =>
    <String, dynamic>{
      'kind': _$ItemKindEnumMap[instance.kind]!,
      'id': instance.id,
      'primaryText': instance.primaryText,
      'secondaryText': instance.secondaryText,
      'meta': instance.meta,
      'media': instance.media,
      'actionRef': instance.actionRef,
    };

const _$ItemKindEnumMap = {
  ItemKind.venue: 'venue',
  ItemKind.menuItem: 'menu_item',
  ItemKind.offer: 'offer',
  ItemKind.category: 'category',
  ItemKind.info: 'info',
  ItemKind.action: 'action',
};

_$SectionItemMetaImpl _$$SectionItemMetaImplFromJson(
        Map<String, dynamic> json) =>
    _$SectionItemMetaImpl(
      badge: json['badge'] as String?,
      priceText: json['priceText'] as String?,
      ratingText: json['ratingText'] as String?,
      distanceText: json['distanceText'] as String?,
      availabilityText: json['availabilityText'] as String?,
    );

Map<String, dynamic> _$$SectionItemMetaImplToJson(
        _$SectionItemMetaImpl instance) =>
    <String, dynamic>{
      'badge': instance.badge,
      'priceText': instance.priceText,
      'ratingText': instance.ratingText,
      'distanceText': instance.distanceText,
      'availabilityText': instance.availabilityText,
    };

_$SectionItemMediaImpl _$$SectionItemMediaImplFromJson(
        Map<String, dynamic> json) =>
    _$SectionItemMediaImpl(
      imageUrl: json['imageUrl'] as String?,
      aspect: json['aspect'] as String?,
    );

Map<String, dynamic> _$$SectionItemMediaImplToJson(
        _$SectionItemMediaImpl instance) =>
    <String, dynamic>{
      'imageUrl': instance.imageUrl,
      'aspect': instance.aspect,
    };

_$UIPlanActionsImpl _$$UIPlanActionsImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanActionsImpl(
      byId: (json['byId'] as Map<String, dynamic>).map(
        (k, e) => MapEntry(k, UIPlanAction.fromJson(e as Map<String, dynamic>)),
      ),
    );

Map<String, dynamic> _$$UIPlanActionsImplToJson(_$UIPlanActionsImpl instance) =>
    <String, dynamic>{
      'byId': instance.byId,
    };

_$UIPlanActionImpl _$$UIPlanActionImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanActionImpl(
      intent: $enumDecode(_$ActionIntentEnumMap, json['intent']),
      params: json['params'] as Map<String, dynamic>?,
      requiresConfirmation: json['requiresConfirmation'] as bool?,
      confirmationText: json['confirmationText'] as String?,
    );

Map<String, dynamic> _$$UIPlanActionImplToJson(_$UIPlanActionImpl instance) =>
    <String, dynamic>{
      'intent': _$ActionIntentEnumMap[instance.intent]!,
      'params': instance.params,
      'requiresConfirmation': instance.requiresConfirmation,
      'confirmationText': instance.confirmationText,
    };

const _$ActionIntentEnumMap = {
  ActionIntent.openHome: 'openHome',
  ActionIntent.openSearch: 'openSearch',
  ActionIntent.openVenue: 'openVenue',
  ActionIntent.openMenu: 'openMenu',
  ActionIntent.openItem: 'openItem',
  ActionIntent.applyFilter: 'applyFilter',
  ActionIntent.clearFilters: 'clearFilters',
  ActionIntent.startVisit: 'startVisit',
  ActionIntent.addToCart: 'addToCart',
  ActionIntent.updateCartItem: 'updateCartItem',
  ActionIntent.removeFromCart: 'removeFromCart',
  ActionIntent.openCheckout: 'openCheckout',
  ActionIntent.confirmOrder: 'confirmOrder',
  ActionIntent.openChatWaiter: 'openChatWaiter',
  ActionIntent.sendWaiterMessage: 'sendWaiterMessage',
  ActionIntent.callStaff: 'callStaff',
  ActionIntent.requestBill: 'requestBill',
  ActionIntent.openOrders: 'openOrders',
  ActionIntent.trackOrder: 'trackOrder',
  ActionIntent.openExternalUrl: 'openExternalUrl',
};

_$UIPlanCacheImpl _$$UIPlanCacheImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanCacheImpl(
      ttlSeconds: (json['ttlSeconds'] as num).toInt(),
      varyBy:
          (json['varyBy'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );

Map<String, dynamic> _$$UIPlanCacheImplToJson(_$UIPlanCacheImpl instance) =>
    <String, dynamic>{
      'ttlSeconds': instance.ttlSeconds,
      'varyBy': instance.varyBy,
    };

_$UIPlanDebugImpl _$$UIPlanDebugImplFromJson(Map<String, dynamic> json) =>
    _$UIPlanDebugImpl(
      explanation: json['explanation'] as String?,
      sourceToolCalls: (json['sourceToolCalls'] as List<dynamic>?)
          ?.map((e) => UIPlanDebugToolCall.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$UIPlanDebugImplToJson(_$UIPlanDebugImpl instance) =>
    <String, dynamic>{
      'explanation': instance.explanation,
      'sourceToolCalls': instance.sourceToolCalls,
    };

_$UIPlanDebugToolCallImpl _$$UIPlanDebugToolCallImplFromJson(
        Map<String, dynamic> json) =>
    _$UIPlanDebugToolCallImpl(
      tool: json['tool'] as String,
      correlationId: json['correlationId'] as String,
    );

Map<String, dynamic> _$$UIPlanDebugToolCallImplToJson(
        _$UIPlanDebugToolCallImpl instance) =>
    <String, dynamic>{
      'tool': instance.tool,
      'correlationId': instance.correlationId,
    };
