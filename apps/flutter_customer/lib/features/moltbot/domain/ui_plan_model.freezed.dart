// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'ui_plan_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

UIPlan _$UIPlanFromJson(Map<String, dynamic> json) {
  return _UIPlan.fromJson(json);
}

/// @nodoc
mixin _$UIPlan {
  String get version => throw _privateConstructorUsedError;
  String get planId => throw _privateConstructorUsedError;
  String get generatedAt => throw _privateConstructorUsedError;
  UIPlanTenant get tenant => throw _privateConstructorUsedError;
  UIPlanSession get session => throw _privateConstructorUsedError;
  UIPlanScreen get screen => throw _privateConstructorUsedError;
  List<UIPlanSection> get sections => throw _privateConstructorUsedError;
  UIPlanActions get actions => throw _privateConstructorUsedError;
  UIPlanCache get cache => throw _privateConstructorUsedError;
  UIPlanDebug? get debug => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanCopyWith<UIPlan> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanCopyWith<$Res> {
  factory $UIPlanCopyWith(UIPlan value, $Res Function(UIPlan) then) =
      _$UIPlanCopyWithImpl<$Res, UIPlan>;
  @useResult
  $Res call(
      {String version,
      String planId,
      String generatedAt,
      UIPlanTenant tenant,
      UIPlanSession session,
      UIPlanScreen screen,
      List<UIPlanSection> sections,
      UIPlanActions actions,
      UIPlanCache cache,
      UIPlanDebug? debug});

  $UIPlanTenantCopyWith<$Res> get tenant;
  $UIPlanSessionCopyWith<$Res> get session;
  $UIPlanScreenCopyWith<$Res> get screen;
  $UIPlanActionsCopyWith<$Res> get actions;
  $UIPlanCacheCopyWith<$Res> get cache;
  $UIPlanDebugCopyWith<$Res>? get debug;
}

/// @nodoc
class _$UIPlanCopyWithImpl<$Res, $Val extends UIPlan>
    implements $UIPlanCopyWith<$Res> {
  _$UIPlanCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? version = null,
    Object? planId = null,
    Object? generatedAt = null,
    Object? tenant = null,
    Object? session = null,
    Object? screen = null,
    Object? sections = null,
    Object? actions = null,
    Object? cache = null,
    Object? debug = freezed,
  }) {
    return _then(_value.copyWith(
      version: null == version
          ? _value.version
          : version // ignore: cast_nullable_to_non_nullable
              as String,
      planId: null == planId
          ? _value.planId
          : planId // ignore: cast_nullable_to_non_nullable
              as String,
      generatedAt: null == generatedAt
          ? _value.generatedAt
          : generatedAt // ignore: cast_nullable_to_non_nullable
              as String,
      tenant: null == tenant
          ? _value.tenant
          : tenant // ignore: cast_nullable_to_non_nullable
              as UIPlanTenant,
      session: null == session
          ? _value.session
          : session // ignore: cast_nullable_to_non_nullable
              as UIPlanSession,
      screen: null == screen
          ? _value.screen
          : screen // ignore: cast_nullable_to_non_nullable
              as UIPlanScreen,
      sections: null == sections
          ? _value.sections
          : sections // ignore: cast_nullable_to_non_nullable
              as List<UIPlanSection>,
      actions: null == actions
          ? _value.actions
          : actions // ignore: cast_nullable_to_non_nullable
              as UIPlanActions,
      cache: null == cache
          ? _value.cache
          : cache // ignore: cast_nullable_to_non_nullable
              as UIPlanCache,
      debug: freezed == debug
          ? _value.debug
          : debug // ignore: cast_nullable_to_non_nullable
              as UIPlanDebug?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanTenantCopyWith<$Res> get tenant {
    return $UIPlanTenantCopyWith<$Res>(_value.tenant, (value) {
      return _then(_value.copyWith(tenant: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanSessionCopyWith<$Res> get session {
    return $UIPlanSessionCopyWith<$Res>(_value.session, (value) {
      return _then(_value.copyWith(session: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanScreenCopyWith<$Res> get screen {
    return $UIPlanScreenCopyWith<$Res>(_value.screen, (value) {
      return _then(_value.copyWith(screen: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanActionsCopyWith<$Res> get actions {
    return $UIPlanActionsCopyWith<$Res>(_value.actions, (value) {
      return _then(_value.copyWith(actions: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanCacheCopyWith<$Res> get cache {
    return $UIPlanCacheCopyWith<$Res>(_value.cache, (value) {
      return _then(_value.copyWith(cache: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanDebugCopyWith<$Res>? get debug {
    if (_value.debug == null) {
      return null;
    }

    return $UIPlanDebugCopyWith<$Res>(_value.debug!, (value) {
      return _then(_value.copyWith(debug: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$UIPlanImplCopyWith<$Res> implements $UIPlanCopyWith<$Res> {
  factory _$$UIPlanImplCopyWith(
          _$UIPlanImpl value, $Res Function(_$UIPlanImpl) then) =
      __$$UIPlanImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String version,
      String planId,
      String generatedAt,
      UIPlanTenant tenant,
      UIPlanSession session,
      UIPlanScreen screen,
      List<UIPlanSection> sections,
      UIPlanActions actions,
      UIPlanCache cache,
      UIPlanDebug? debug});

  @override
  $UIPlanTenantCopyWith<$Res> get tenant;
  @override
  $UIPlanSessionCopyWith<$Res> get session;
  @override
  $UIPlanScreenCopyWith<$Res> get screen;
  @override
  $UIPlanActionsCopyWith<$Res> get actions;
  @override
  $UIPlanCacheCopyWith<$Res> get cache;
  @override
  $UIPlanDebugCopyWith<$Res>? get debug;
}

/// @nodoc
class __$$UIPlanImplCopyWithImpl<$Res>
    extends _$UIPlanCopyWithImpl<$Res, _$UIPlanImpl>
    implements _$$UIPlanImplCopyWith<$Res> {
  __$$UIPlanImplCopyWithImpl(
      _$UIPlanImpl _value, $Res Function(_$UIPlanImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? version = null,
    Object? planId = null,
    Object? generatedAt = null,
    Object? tenant = null,
    Object? session = null,
    Object? screen = null,
    Object? sections = null,
    Object? actions = null,
    Object? cache = null,
    Object? debug = freezed,
  }) {
    return _then(_$UIPlanImpl(
      version: null == version
          ? _value.version
          : version // ignore: cast_nullable_to_non_nullable
              as String,
      planId: null == planId
          ? _value.planId
          : planId // ignore: cast_nullable_to_non_nullable
              as String,
      generatedAt: null == generatedAt
          ? _value.generatedAt
          : generatedAt // ignore: cast_nullable_to_non_nullable
              as String,
      tenant: null == tenant
          ? _value.tenant
          : tenant // ignore: cast_nullable_to_non_nullable
              as UIPlanTenant,
      session: null == session
          ? _value.session
          : session // ignore: cast_nullable_to_non_nullable
              as UIPlanSession,
      screen: null == screen
          ? _value.screen
          : screen // ignore: cast_nullable_to_non_nullable
              as UIPlanScreen,
      sections: null == sections
          ? _value._sections
          : sections // ignore: cast_nullable_to_non_nullable
              as List<UIPlanSection>,
      actions: null == actions
          ? _value.actions
          : actions // ignore: cast_nullable_to_non_nullable
              as UIPlanActions,
      cache: null == cache
          ? _value.cache
          : cache // ignore: cast_nullable_to_non_nullable
              as UIPlanCache,
      debug: freezed == debug
          ? _value.debug
          : debug // ignore: cast_nullable_to_non_nullable
              as UIPlanDebug?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanImpl implements _UIPlan {
  const _$UIPlanImpl(
      {required this.version,
      required this.planId,
      required this.generatedAt,
      required this.tenant,
      required this.session,
      required this.screen,
      required final List<UIPlanSection> sections,
      required this.actions,
      required this.cache,
      this.debug})
      : _sections = sections;

  factory _$UIPlanImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanImplFromJson(json);

  @override
  final String version;
  @override
  final String planId;
  @override
  final String generatedAt;
  @override
  final UIPlanTenant tenant;
  @override
  final UIPlanSession session;
  @override
  final UIPlanScreen screen;
  final List<UIPlanSection> _sections;
  @override
  List<UIPlanSection> get sections {
    if (_sections is EqualUnmodifiableListView) return _sections;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_sections);
  }

  @override
  final UIPlanActions actions;
  @override
  final UIPlanCache cache;
  @override
  final UIPlanDebug? debug;

  @override
  String toString() {
    return 'UIPlan(version: $version, planId: $planId, generatedAt: $generatedAt, tenant: $tenant, session: $session, screen: $screen, sections: $sections, actions: $actions, cache: $cache, debug: $debug)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanImpl &&
            (identical(other.version, version) || other.version == version) &&
            (identical(other.planId, planId) || other.planId == planId) &&
            (identical(other.generatedAt, generatedAt) ||
                other.generatedAt == generatedAt) &&
            (identical(other.tenant, tenant) || other.tenant == tenant) &&
            (identical(other.session, session) || other.session == session) &&
            (identical(other.screen, screen) || other.screen == screen) &&
            const DeepCollectionEquality().equals(other._sections, _sections) &&
            (identical(other.actions, actions) || other.actions == actions) &&
            (identical(other.cache, cache) || other.cache == cache) &&
            (identical(other.debug, debug) || other.debug == debug));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      version,
      planId,
      generatedAt,
      tenant,
      session,
      screen,
      const DeepCollectionEquality().hash(_sections),
      actions,
      cache,
      debug);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanImplCopyWith<_$UIPlanImpl> get copyWith =>
      __$$UIPlanImplCopyWithImpl<_$UIPlanImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanImplToJson(
      this,
    );
  }
}

abstract class _UIPlan implements UIPlan {
  const factory _UIPlan(
      {required final String version,
      required final String planId,
      required final String generatedAt,
      required final UIPlanTenant tenant,
      required final UIPlanSession session,
      required final UIPlanScreen screen,
      required final List<UIPlanSection> sections,
      required final UIPlanActions actions,
      required final UIPlanCache cache,
      final UIPlanDebug? debug}) = _$UIPlanImpl;

  factory _UIPlan.fromJson(Map<String, dynamic> json) = _$UIPlanImpl.fromJson;

  @override
  String get version;
  @override
  String get planId;
  @override
  String get generatedAt;
  @override
  UIPlanTenant get tenant;
  @override
  UIPlanSession get session;
  @override
  UIPlanScreen get screen;
  @override
  List<UIPlanSection> get sections;
  @override
  UIPlanActions get actions;
  @override
  UIPlanCache get cache;
  @override
  UIPlanDebug? get debug;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanImplCopyWith<_$UIPlanImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanTenant _$UIPlanTenantFromJson(Map<String, dynamic> json) {
  return _UIPlanTenant.fromJson(json);
}

/// @nodoc
mixin _$UIPlanTenant {
  String get tenantId => throw _privateConstructorUsedError;
  String? get venueId => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanTenantCopyWith<UIPlanTenant> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanTenantCopyWith<$Res> {
  factory $UIPlanTenantCopyWith(
          UIPlanTenant value, $Res Function(UIPlanTenant) then) =
      _$UIPlanTenantCopyWithImpl<$Res, UIPlanTenant>;
  @useResult
  $Res call({String tenantId, String? venueId});
}

/// @nodoc
class _$UIPlanTenantCopyWithImpl<$Res, $Val extends UIPlanTenant>
    implements $UIPlanTenantCopyWith<$Res> {
  _$UIPlanTenantCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tenantId = null,
    Object? venueId = freezed,
  }) {
    return _then(_value.copyWith(
      tenantId: null == tenantId
          ? _value.tenantId
          : tenantId // ignore: cast_nullable_to_non_nullable
              as String,
      venueId: freezed == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanTenantImplCopyWith<$Res>
    implements $UIPlanTenantCopyWith<$Res> {
  factory _$$UIPlanTenantImplCopyWith(
          _$UIPlanTenantImpl value, $Res Function(_$UIPlanTenantImpl) then) =
      __$$UIPlanTenantImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String tenantId, String? venueId});
}

/// @nodoc
class __$$UIPlanTenantImplCopyWithImpl<$Res>
    extends _$UIPlanTenantCopyWithImpl<$Res, _$UIPlanTenantImpl>
    implements _$$UIPlanTenantImplCopyWith<$Res> {
  __$$UIPlanTenantImplCopyWithImpl(
      _$UIPlanTenantImpl _value, $Res Function(_$UIPlanTenantImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tenantId = null,
    Object? venueId = freezed,
  }) {
    return _then(_$UIPlanTenantImpl(
      tenantId: null == tenantId
          ? _value.tenantId
          : tenantId // ignore: cast_nullable_to_non_nullable
              as String,
      venueId: freezed == venueId
          ? _value.venueId
          : venueId // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanTenantImpl implements _UIPlanTenant {
  const _$UIPlanTenantImpl({required this.tenantId, this.venueId});

  factory _$UIPlanTenantImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanTenantImplFromJson(json);

  @override
  final String tenantId;
  @override
  final String? venueId;

  @override
  String toString() {
    return 'UIPlanTenant(tenantId: $tenantId, venueId: $venueId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanTenantImpl &&
            (identical(other.tenantId, tenantId) ||
                other.tenantId == tenantId) &&
            (identical(other.venueId, venueId) || other.venueId == venueId));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, tenantId, venueId);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanTenantImplCopyWith<_$UIPlanTenantImpl> get copyWith =>
      __$$UIPlanTenantImplCopyWithImpl<_$UIPlanTenantImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanTenantImplToJson(
      this,
    );
  }
}

abstract class _UIPlanTenant implements UIPlanTenant {
  const factory _UIPlanTenant(
      {required final String tenantId,
      final String? venueId}) = _$UIPlanTenantImpl;

  factory _UIPlanTenant.fromJson(Map<String, dynamic> json) =
      _$UIPlanTenantImpl.fromJson;

  @override
  String get tenantId;
  @override
  String? get venueId;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanTenantImplCopyWith<_$UIPlanTenantImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanSession _$UIPlanSessionFromJson(Map<String, dynamic> json) {
  return _UIPlanSession.fromJson(json);
}

/// @nodoc
mixin _$UIPlanSession {
  String get sessionKey => throw _privateConstructorUsedError;
  UIPlanActor get actor => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanSessionCopyWith<UIPlanSession> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanSessionCopyWith<$Res> {
  factory $UIPlanSessionCopyWith(
          UIPlanSession value, $Res Function(UIPlanSession) then) =
      _$UIPlanSessionCopyWithImpl<$Res, UIPlanSession>;
  @useResult
  $Res call({String sessionKey, UIPlanActor actor});

  $UIPlanActorCopyWith<$Res> get actor;
}

/// @nodoc
class _$UIPlanSessionCopyWithImpl<$Res, $Val extends UIPlanSession>
    implements $UIPlanSessionCopyWith<$Res> {
  _$UIPlanSessionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? sessionKey = null,
    Object? actor = null,
  }) {
    return _then(_value.copyWith(
      sessionKey: null == sessionKey
          ? _value.sessionKey
          : sessionKey // ignore: cast_nullable_to_non_nullable
              as String,
      actor: null == actor
          ? _value.actor
          : actor // ignore: cast_nullable_to_non_nullable
              as UIPlanActor,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $UIPlanActorCopyWith<$Res> get actor {
    return $UIPlanActorCopyWith<$Res>(_value.actor, (value) {
      return _then(_value.copyWith(actor: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$UIPlanSessionImplCopyWith<$Res>
    implements $UIPlanSessionCopyWith<$Res> {
  factory _$$UIPlanSessionImplCopyWith(
          _$UIPlanSessionImpl value, $Res Function(_$UIPlanSessionImpl) then) =
      __$$UIPlanSessionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String sessionKey, UIPlanActor actor});

  @override
  $UIPlanActorCopyWith<$Res> get actor;
}

/// @nodoc
class __$$UIPlanSessionImplCopyWithImpl<$Res>
    extends _$UIPlanSessionCopyWithImpl<$Res, _$UIPlanSessionImpl>
    implements _$$UIPlanSessionImplCopyWith<$Res> {
  __$$UIPlanSessionImplCopyWithImpl(
      _$UIPlanSessionImpl _value, $Res Function(_$UIPlanSessionImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? sessionKey = null,
    Object? actor = null,
  }) {
    return _then(_$UIPlanSessionImpl(
      sessionKey: null == sessionKey
          ? _value.sessionKey
          : sessionKey // ignore: cast_nullable_to_non_nullable
              as String,
      actor: null == actor
          ? _value.actor
          : actor // ignore: cast_nullable_to_non_nullable
              as UIPlanActor,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanSessionImpl implements _UIPlanSession {
  const _$UIPlanSessionImpl({required this.sessionKey, required this.actor});

  factory _$UIPlanSessionImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanSessionImplFromJson(json);

  @override
  final String sessionKey;
  @override
  final UIPlanActor actor;

  @override
  String toString() {
    return 'UIPlanSession(sessionKey: $sessionKey, actor: $actor)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanSessionImpl &&
            (identical(other.sessionKey, sessionKey) ||
                other.sessionKey == sessionKey) &&
            (identical(other.actor, actor) || other.actor == actor));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, sessionKey, actor);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanSessionImplCopyWith<_$UIPlanSessionImpl> get copyWith =>
      __$$UIPlanSessionImplCopyWithImpl<_$UIPlanSessionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanSessionImplToJson(
      this,
    );
  }
}

abstract class _UIPlanSession implements UIPlanSession {
  const factory _UIPlanSession(
      {required final String sessionKey,
      required final UIPlanActor actor}) = _$UIPlanSessionImpl;

  factory _UIPlanSession.fromJson(Map<String, dynamic> json) =
      _$UIPlanSessionImpl.fromJson;

  @override
  String get sessionKey;
  @override
  UIPlanActor get actor;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanSessionImplCopyWith<_$UIPlanSessionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanActor _$UIPlanActorFromJson(Map<String, dynamic> json) {
  return _UIPlanActor.fromJson(json);
}

/// @nodoc
mixin _$UIPlanActor {
  ActorType get actorType => throw _privateConstructorUsedError;
  String get actorId => throw _privateConstructorUsedError;
  String? get locale => throw _privateConstructorUsedError;
  String? get currency => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanActorCopyWith<UIPlanActor> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanActorCopyWith<$Res> {
  factory $UIPlanActorCopyWith(
          UIPlanActor value, $Res Function(UIPlanActor) then) =
      _$UIPlanActorCopyWithImpl<$Res, UIPlanActor>;
  @useResult
  $Res call(
      {ActorType actorType, String actorId, String? locale, String? currency});
}

/// @nodoc
class _$UIPlanActorCopyWithImpl<$Res, $Val extends UIPlanActor>
    implements $UIPlanActorCopyWith<$Res> {
  _$UIPlanActorCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? actorType = null,
    Object? actorId = null,
    Object? locale = freezed,
    Object? currency = freezed,
  }) {
    return _then(_value.copyWith(
      actorType: null == actorType
          ? _value.actorType
          : actorType // ignore: cast_nullable_to_non_nullable
              as ActorType,
      actorId: null == actorId
          ? _value.actorId
          : actorId // ignore: cast_nullable_to_non_nullable
              as String,
      locale: freezed == locale
          ? _value.locale
          : locale // ignore: cast_nullable_to_non_nullable
              as String?,
      currency: freezed == currency
          ? _value.currency
          : currency // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanActorImplCopyWith<$Res>
    implements $UIPlanActorCopyWith<$Res> {
  factory _$$UIPlanActorImplCopyWith(
          _$UIPlanActorImpl value, $Res Function(_$UIPlanActorImpl) then) =
      __$$UIPlanActorImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {ActorType actorType, String actorId, String? locale, String? currency});
}

/// @nodoc
class __$$UIPlanActorImplCopyWithImpl<$Res>
    extends _$UIPlanActorCopyWithImpl<$Res, _$UIPlanActorImpl>
    implements _$$UIPlanActorImplCopyWith<$Res> {
  __$$UIPlanActorImplCopyWithImpl(
      _$UIPlanActorImpl _value, $Res Function(_$UIPlanActorImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? actorType = null,
    Object? actorId = null,
    Object? locale = freezed,
    Object? currency = freezed,
  }) {
    return _then(_$UIPlanActorImpl(
      actorType: null == actorType
          ? _value.actorType
          : actorType // ignore: cast_nullable_to_non_nullable
              as ActorType,
      actorId: null == actorId
          ? _value.actorId
          : actorId // ignore: cast_nullable_to_non_nullable
              as String,
      locale: freezed == locale
          ? _value.locale
          : locale // ignore: cast_nullable_to_non_nullable
              as String?,
      currency: freezed == currency
          ? _value.currency
          : currency // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanActorImpl implements _UIPlanActor {
  const _$UIPlanActorImpl(
      {required this.actorType,
      required this.actorId,
      this.locale,
      this.currency});

  factory _$UIPlanActorImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanActorImplFromJson(json);

  @override
  final ActorType actorType;
  @override
  final String actorId;
  @override
  final String? locale;
  @override
  final String? currency;

  @override
  String toString() {
    return 'UIPlanActor(actorType: $actorType, actorId: $actorId, locale: $locale, currency: $currency)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanActorImpl &&
            (identical(other.actorType, actorType) ||
                other.actorType == actorType) &&
            (identical(other.actorId, actorId) || other.actorId == actorId) &&
            (identical(other.locale, locale) || other.locale == locale) &&
            (identical(other.currency, currency) ||
                other.currency == currency));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, actorType, actorId, locale, currency);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanActorImplCopyWith<_$UIPlanActorImpl> get copyWith =>
      __$$UIPlanActorImplCopyWithImpl<_$UIPlanActorImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanActorImplToJson(
      this,
    );
  }
}

abstract class _UIPlanActor implements UIPlanActor {
  const factory _UIPlanActor(
      {required final ActorType actorType,
      required final String actorId,
      final String? locale,
      final String? currency}) = _$UIPlanActorImpl;

  factory _UIPlanActor.fromJson(Map<String, dynamic> json) =
      _$UIPlanActorImpl.fromJson;

  @override
  ActorType get actorType;
  @override
  String get actorId;
  @override
  String? get locale;
  @override
  String? get currency;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanActorImplCopyWith<_$UIPlanActorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanScreen _$UIPlanScreenFromJson(Map<String, dynamic> json) {
  return _UIPlanScreen.fromJson(json);
}

/// @nodoc
mixin _$UIPlanScreen {
  ScreenName get name => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  LayoutType get layout => throw _privateConstructorUsedError;
  List<UIPlanBreadcrumb>? get breadcrumbs => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanScreenCopyWith<UIPlanScreen> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanScreenCopyWith<$Res> {
  factory $UIPlanScreenCopyWith(
          UIPlanScreen value, $Res Function(UIPlanScreen) then) =
      _$UIPlanScreenCopyWithImpl<$Res, UIPlanScreen>;
  @useResult
  $Res call(
      {ScreenName name,
      String title,
      LayoutType layout,
      List<UIPlanBreadcrumb>? breadcrumbs});
}

/// @nodoc
class _$UIPlanScreenCopyWithImpl<$Res, $Val extends UIPlanScreen>
    implements $UIPlanScreenCopyWith<$Res> {
  _$UIPlanScreenCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? title = null,
    Object? layout = null,
    Object? breadcrumbs = freezed,
  }) {
    return _then(_value.copyWith(
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as ScreenName,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      layout: null == layout
          ? _value.layout
          : layout // ignore: cast_nullable_to_non_nullable
              as LayoutType,
      breadcrumbs: freezed == breadcrumbs
          ? _value.breadcrumbs
          : breadcrumbs // ignore: cast_nullable_to_non_nullable
              as List<UIPlanBreadcrumb>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanScreenImplCopyWith<$Res>
    implements $UIPlanScreenCopyWith<$Res> {
  factory _$$UIPlanScreenImplCopyWith(
          _$UIPlanScreenImpl value, $Res Function(_$UIPlanScreenImpl) then) =
      __$$UIPlanScreenImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {ScreenName name,
      String title,
      LayoutType layout,
      List<UIPlanBreadcrumb>? breadcrumbs});
}

/// @nodoc
class __$$UIPlanScreenImplCopyWithImpl<$Res>
    extends _$UIPlanScreenCopyWithImpl<$Res, _$UIPlanScreenImpl>
    implements _$$UIPlanScreenImplCopyWith<$Res> {
  __$$UIPlanScreenImplCopyWithImpl(
      _$UIPlanScreenImpl _value, $Res Function(_$UIPlanScreenImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? title = null,
    Object? layout = null,
    Object? breadcrumbs = freezed,
  }) {
    return _then(_$UIPlanScreenImpl(
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as ScreenName,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      layout: null == layout
          ? _value.layout
          : layout // ignore: cast_nullable_to_non_nullable
              as LayoutType,
      breadcrumbs: freezed == breadcrumbs
          ? _value._breadcrumbs
          : breadcrumbs // ignore: cast_nullable_to_non_nullable
              as List<UIPlanBreadcrumb>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanScreenImpl implements _UIPlanScreen {
  const _$UIPlanScreenImpl(
      {required this.name,
      required this.title,
      required this.layout,
      final List<UIPlanBreadcrumb>? breadcrumbs})
      : _breadcrumbs = breadcrumbs;

  factory _$UIPlanScreenImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanScreenImplFromJson(json);

  @override
  final ScreenName name;
  @override
  final String title;
  @override
  final LayoutType layout;
  final List<UIPlanBreadcrumb>? _breadcrumbs;
  @override
  List<UIPlanBreadcrumb>? get breadcrumbs {
    final value = _breadcrumbs;
    if (value == null) return null;
    if (_breadcrumbs is EqualUnmodifiableListView) return _breadcrumbs;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'UIPlanScreen(name: $name, title: $title, layout: $layout, breadcrumbs: $breadcrumbs)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanScreenImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.layout, layout) || other.layout == layout) &&
            const DeepCollectionEquality()
                .equals(other._breadcrumbs, _breadcrumbs));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, name, title, layout,
      const DeepCollectionEquality().hash(_breadcrumbs));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanScreenImplCopyWith<_$UIPlanScreenImpl> get copyWith =>
      __$$UIPlanScreenImplCopyWithImpl<_$UIPlanScreenImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanScreenImplToJson(
      this,
    );
  }
}

abstract class _UIPlanScreen implements UIPlanScreen {
  const factory _UIPlanScreen(
      {required final ScreenName name,
      required final String title,
      required final LayoutType layout,
      final List<UIPlanBreadcrumb>? breadcrumbs}) = _$UIPlanScreenImpl;

  factory _UIPlanScreen.fromJson(Map<String, dynamic> json) =
      _$UIPlanScreenImpl.fromJson;

  @override
  ScreenName get name;
  @override
  String get title;
  @override
  LayoutType get layout;
  @override
  List<UIPlanBreadcrumb>? get breadcrumbs;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanScreenImplCopyWith<_$UIPlanScreenImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanBreadcrumb _$UIPlanBreadcrumbFromJson(Map<String, dynamic> json) {
  return _UIPlanBreadcrumb.fromJson(json);
}

/// @nodoc
mixin _$UIPlanBreadcrumb {
  String get label => throw _privateConstructorUsedError;
  String? get actionRef => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanBreadcrumbCopyWith<UIPlanBreadcrumb> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanBreadcrumbCopyWith<$Res> {
  factory $UIPlanBreadcrumbCopyWith(
          UIPlanBreadcrumb value, $Res Function(UIPlanBreadcrumb) then) =
      _$UIPlanBreadcrumbCopyWithImpl<$Res, UIPlanBreadcrumb>;
  @useResult
  $Res call({String label, String? actionRef});
}

/// @nodoc
class _$UIPlanBreadcrumbCopyWithImpl<$Res, $Val extends UIPlanBreadcrumb>
    implements $UIPlanBreadcrumbCopyWith<$Res> {
  _$UIPlanBreadcrumbCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? label = null,
    Object? actionRef = freezed,
  }) {
    return _then(_value.copyWith(
      label: null == label
          ? _value.label
          : label // ignore: cast_nullable_to_non_nullable
              as String,
      actionRef: freezed == actionRef
          ? _value.actionRef
          : actionRef // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanBreadcrumbImplCopyWith<$Res>
    implements $UIPlanBreadcrumbCopyWith<$Res> {
  factory _$$UIPlanBreadcrumbImplCopyWith(_$UIPlanBreadcrumbImpl value,
          $Res Function(_$UIPlanBreadcrumbImpl) then) =
      __$$UIPlanBreadcrumbImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String label, String? actionRef});
}

/// @nodoc
class __$$UIPlanBreadcrumbImplCopyWithImpl<$Res>
    extends _$UIPlanBreadcrumbCopyWithImpl<$Res, _$UIPlanBreadcrumbImpl>
    implements _$$UIPlanBreadcrumbImplCopyWith<$Res> {
  __$$UIPlanBreadcrumbImplCopyWithImpl(_$UIPlanBreadcrumbImpl _value,
      $Res Function(_$UIPlanBreadcrumbImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? label = null,
    Object? actionRef = freezed,
  }) {
    return _then(_$UIPlanBreadcrumbImpl(
      label: null == label
          ? _value.label
          : label // ignore: cast_nullable_to_non_nullable
              as String,
      actionRef: freezed == actionRef
          ? _value.actionRef
          : actionRef // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanBreadcrumbImpl implements _UIPlanBreadcrumb {
  const _$UIPlanBreadcrumbImpl({required this.label, this.actionRef});

  factory _$UIPlanBreadcrumbImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanBreadcrumbImplFromJson(json);

  @override
  final String label;
  @override
  final String? actionRef;

  @override
  String toString() {
    return 'UIPlanBreadcrumb(label: $label, actionRef: $actionRef)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanBreadcrumbImpl &&
            (identical(other.label, label) || other.label == label) &&
            (identical(other.actionRef, actionRef) ||
                other.actionRef == actionRef));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, label, actionRef);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanBreadcrumbImplCopyWith<_$UIPlanBreadcrumbImpl> get copyWith =>
      __$$UIPlanBreadcrumbImplCopyWithImpl<_$UIPlanBreadcrumbImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanBreadcrumbImplToJson(
      this,
    );
  }
}

abstract class _UIPlanBreadcrumb implements UIPlanBreadcrumb {
  const factory _UIPlanBreadcrumb(
      {required final String label,
      final String? actionRef}) = _$UIPlanBreadcrumbImpl;

  factory _UIPlanBreadcrumb.fromJson(Map<String, dynamic> json) =
      _$UIPlanBreadcrumbImpl.fromJson;

  @override
  String get label;
  @override
  String? get actionRef;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanBreadcrumbImplCopyWith<_$UIPlanBreadcrumbImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanSection _$UIPlanSectionFromJson(Map<String, dynamic> json) {
  return _UIPlanSection.fromJson(json);
}

/// @nodoc
mixin _$UIPlanSection {
  String get id => throw _privateConstructorUsedError;
  SectionType get type => throw _privateConstructorUsedError;
  String? get title => throw _privateConstructorUsedError;
  String? get subtitle => throw _privateConstructorUsedError;
  SectionStyle? get style => throw _privateConstructorUsedError;
  List<SectionItem> get items => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanSectionCopyWith<UIPlanSection> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanSectionCopyWith<$Res> {
  factory $UIPlanSectionCopyWith(
          UIPlanSection value, $Res Function(UIPlanSection) then) =
      _$UIPlanSectionCopyWithImpl<$Res, UIPlanSection>;
  @useResult
  $Res call(
      {String id,
      SectionType type,
      String? title,
      String? subtitle,
      SectionStyle? style,
      List<SectionItem> items});

  $SectionStyleCopyWith<$Res>? get style;
}

/// @nodoc
class _$UIPlanSectionCopyWithImpl<$Res, $Val extends UIPlanSection>
    implements $UIPlanSectionCopyWith<$Res> {
  _$UIPlanSectionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? title = freezed,
    Object? subtitle = freezed,
    Object? style = freezed,
    Object? items = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as SectionType,
      title: freezed == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String?,
      subtitle: freezed == subtitle
          ? _value.subtitle
          : subtitle // ignore: cast_nullable_to_non_nullable
              as String?,
      style: freezed == style
          ? _value.style
          : style // ignore: cast_nullable_to_non_nullable
              as SectionStyle?,
      items: null == items
          ? _value.items
          : items // ignore: cast_nullable_to_non_nullable
              as List<SectionItem>,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $SectionStyleCopyWith<$Res>? get style {
    if (_value.style == null) {
      return null;
    }

    return $SectionStyleCopyWith<$Res>(_value.style!, (value) {
      return _then(_value.copyWith(style: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$UIPlanSectionImplCopyWith<$Res>
    implements $UIPlanSectionCopyWith<$Res> {
  factory _$$UIPlanSectionImplCopyWith(
          _$UIPlanSectionImpl value, $Res Function(_$UIPlanSectionImpl) then) =
      __$$UIPlanSectionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      SectionType type,
      String? title,
      String? subtitle,
      SectionStyle? style,
      List<SectionItem> items});

  @override
  $SectionStyleCopyWith<$Res>? get style;
}

/// @nodoc
class __$$UIPlanSectionImplCopyWithImpl<$Res>
    extends _$UIPlanSectionCopyWithImpl<$Res, _$UIPlanSectionImpl>
    implements _$$UIPlanSectionImplCopyWith<$Res> {
  __$$UIPlanSectionImplCopyWithImpl(
      _$UIPlanSectionImpl _value, $Res Function(_$UIPlanSectionImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? title = freezed,
    Object? subtitle = freezed,
    Object? style = freezed,
    Object? items = null,
  }) {
    return _then(_$UIPlanSectionImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as SectionType,
      title: freezed == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String?,
      subtitle: freezed == subtitle
          ? _value.subtitle
          : subtitle // ignore: cast_nullable_to_non_nullable
              as String?,
      style: freezed == style
          ? _value.style
          : style // ignore: cast_nullable_to_non_nullable
              as SectionStyle?,
      items: null == items
          ? _value._items
          : items // ignore: cast_nullable_to_non_nullable
              as List<SectionItem>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanSectionImpl implements _UIPlanSection {
  const _$UIPlanSectionImpl(
      {required this.id,
      required this.type,
      this.title,
      this.subtitle,
      this.style,
      required final List<SectionItem> items})
      : _items = items;

  factory _$UIPlanSectionImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanSectionImplFromJson(json);

  @override
  final String id;
  @override
  final SectionType type;
  @override
  final String? title;
  @override
  final String? subtitle;
  @override
  final SectionStyle? style;
  final List<SectionItem> _items;
  @override
  List<SectionItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  @override
  String toString() {
    return 'UIPlanSection(id: $id, type: $type, title: $title, subtitle: $subtitle, style: $style, items: $items)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanSectionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.subtitle, subtitle) ||
                other.subtitle == subtitle) &&
            (identical(other.style, style) || other.style == style) &&
            const DeepCollectionEquality().equals(other._items, _items));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, type, title, subtitle, style,
      const DeepCollectionEquality().hash(_items));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanSectionImplCopyWith<_$UIPlanSectionImpl> get copyWith =>
      __$$UIPlanSectionImplCopyWithImpl<_$UIPlanSectionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanSectionImplToJson(
      this,
    );
  }
}

abstract class _UIPlanSection implements UIPlanSection {
  const factory _UIPlanSection(
      {required final String id,
      required final SectionType type,
      final String? title,
      final String? subtitle,
      final SectionStyle? style,
      required final List<SectionItem> items}) = _$UIPlanSectionImpl;

  factory _UIPlanSection.fromJson(Map<String, dynamic> json) =
      _$UIPlanSectionImpl.fromJson;

  @override
  String get id;
  @override
  SectionType get type;
  @override
  String? get title;
  @override
  String? get subtitle;
  @override
  SectionStyle? get style;
  @override
  List<SectionItem> get items;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanSectionImplCopyWith<_$UIPlanSectionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SectionStyle _$SectionStyleFromJson(Map<String, dynamic> json) {
  return _SectionStyle.fromJson(json);
}

/// @nodoc
mixin _$SectionStyle {
  EmphasisLevel? get emphasis => throw _privateConstructorUsedError;
  DensityType? get density => throw _privateConstructorUsedError;
  String? get themeToken => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SectionStyleCopyWith<SectionStyle> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SectionStyleCopyWith<$Res> {
  factory $SectionStyleCopyWith(
          SectionStyle value, $Res Function(SectionStyle) then) =
      _$SectionStyleCopyWithImpl<$Res, SectionStyle>;
  @useResult
  $Res call(
      {EmphasisLevel? emphasis, DensityType? density, String? themeToken});
}

/// @nodoc
class _$SectionStyleCopyWithImpl<$Res, $Val extends SectionStyle>
    implements $SectionStyleCopyWith<$Res> {
  _$SectionStyleCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? emphasis = freezed,
    Object? density = freezed,
    Object? themeToken = freezed,
  }) {
    return _then(_value.copyWith(
      emphasis: freezed == emphasis
          ? _value.emphasis
          : emphasis // ignore: cast_nullable_to_non_nullable
              as EmphasisLevel?,
      density: freezed == density
          ? _value.density
          : density // ignore: cast_nullable_to_non_nullable
              as DensityType?,
      themeToken: freezed == themeToken
          ? _value.themeToken
          : themeToken // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SectionStyleImplCopyWith<$Res>
    implements $SectionStyleCopyWith<$Res> {
  factory _$$SectionStyleImplCopyWith(
          _$SectionStyleImpl value, $Res Function(_$SectionStyleImpl) then) =
      __$$SectionStyleImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {EmphasisLevel? emphasis, DensityType? density, String? themeToken});
}

/// @nodoc
class __$$SectionStyleImplCopyWithImpl<$Res>
    extends _$SectionStyleCopyWithImpl<$Res, _$SectionStyleImpl>
    implements _$$SectionStyleImplCopyWith<$Res> {
  __$$SectionStyleImplCopyWithImpl(
      _$SectionStyleImpl _value, $Res Function(_$SectionStyleImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? emphasis = freezed,
    Object? density = freezed,
    Object? themeToken = freezed,
  }) {
    return _then(_$SectionStyleImpl(
      emphasis: freezed == emphasis
          ? _value.emphasis
          : emphasis // ignore: cast_nullable_to_non_nullable
              as EmphasisLevel?,
      density: freezed == density
          ? _value.density
          : density // ignore: cast_nullable_to_non_nullable
              as DensityType?,
      themeToken: freezed == themeToken
          ? _value.themeToken
          : themeToken // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SectionStyleImpl implements _SectionStyle {
  const _$SectionStyleImpl({this.emphasis, this.density, this.themeToken});

  factory _$SectionStyleImpl.fromJson(Map<String, dynamic> json) =>
      _$$SectionStyleImplFromJson(json);

  @override
  final EmphasisLevel? emphasis;
  @override
  final DensityType? density;
  @override
  final String? themeToken;

  @override
  String toString() {
    return 'SectionStyle(emphasis: $emphasis, density: $density, themeToken: $themeToken)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SectionStyleImpl &&
            (identical(other.emphasis, emphasis) ||
                other.emphasis == emphasis) &&
            (identical(other.density, density) || other.density == density) &&
            (identical(other.themeToken, themeToken) ||
                other.themeToken == themeToken));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, emphasis, density, themeToken);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SectionStyleImplCopyWith<_$SectionStyleImpl> get copyWith =>
      __$$SectionStyleImplCopyWithImpl<_$SectionStyleImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SectionStyleImplToJson(
      this,
    );
  }
}

abstract class _SectionStyle implements SectionStyle {
  const factory _SectionStyle(
      {final EmphasisLevel? emphasis,
      final DensityType? density,
      final String? themeToken}) = _$SectionStyleImpl;

  factory _SectionStyle.fromJson(Map<String, dynamic> json) =
      _$SectionStyleImpl.fromJson;

  @override
  EmphasisLevel? get emphasis;
  @override
  DensityType? get density;
  @override
  String? get themeToken;
  @override
  @JsonKey(ignore: true)
  _$$SectionStyleImplCopyWith<_$SectionStyleImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SectionItem _$SectionItemFromJson(Map<String, dynamic> json) {
  return _SectionItem.fromJson(json);
}

/// @nodoc
mixin _$SectionItem {
  ItemKind get kind => throw _privateConstructorUsedError;
  String get id => throw _privateConstructorUsedError;
  String get primaryText => throw _privateConstructorUsedError;
  String? get secondaryText => throw _privateConstructorUsedError;
  SectionItemMeta? get meta => throw _privateConstructorUsedError;
  SectionItemMedia? get media => throw _privateConstructorUsedError;
  String? get actionRef => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SectionItemCopyWith<SectionItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SectionItemCopyWith<$Res> {
  factory $SectionItemCopyWith(
          SectionItem value, $Res Function(SectionItem) then) =
      _$SectionItemCopyWithImpl<$Res, SectionItem>;
  @useResult
  $Res call(
      {ItemKind kind,
      String id,
      String primaryText,
      String? secondaryText,
      SectionItemMeta? meta,
      SectionItemMedia? media,
      String? actionRef});

  $SectionItemMetaCopyWith<$Res>? get meta;
  $SectionItemMediaCopyWith<$Res>? get media;
}

/// @nodoc
class _$SectionItemCopyWithImpl<$Res, $Val extends SectionItem>
    implements $SectionItemCopyWith<$Res> {
  _$SectionItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kind = null,
    Object? id = null,
    Object? primaryText = null,
    Object? secondaryText = freezed,
    Object? meta = freezed,
    Object? media = freezed,
    Object? actionRef = freezed,
  }) {
    return _then(_value.copyWith(
      kind: null == kind
          ? _value.kind
          : kind // ignore: cast_nullable_to_non_nullable
              as ItemKind,
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      primaryText: null == primaryText
          ? _value.primaryText
          : primaryText // ignore: cast_nullable_to_non_nullable
              as String,
      secondaryText: freezed == secondaryText
          ? _value.secondaryText
          : secondaryText // ignore: cast_nullable_to_non_nullable
              as String?,
      meta: freezed == meta
          ? _value.meta
          : meta // ignore: cast_nullable_to_non_nullable
              as SectionItemMeta?,
      media: freezed == media
          ? _value.media
          : media // ignore: cast_nullable_to_non_nullable
              as SectionItemMedia?,
      actionRef: freezed == actionRef
          ? _value.actionRef
          : actionRef // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $SectionItemMetaCopyWith<$Res>? get meta {
    if (_value.meta == null) {
      return null;
    }

    return $SectionItemMetaCopyWith<$Res>(_value.meta!, (value) {
      return _then(_value.copyWith(meta: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $SectionItemMediaCopyWith<$Res>? get media {
    if (_value.media == null) {
      return null;
    }

    return $SectionItemMediaCopyWith<$Res>(_value.media!, (value) {
      return _then(_value.copyWith(media: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$SectionItemImplCopyWith<$Res>
    implements $SectionItemCopyWith<$Res> {
  factory _$$SectionItemImplCopyWith(
          _$SectionItemImpl value, $Res Function(_$SectionItemImpl) then) =
      __$$SectionItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {ItemKind kind,
      String id,
      String primaryText,
      String? secondaryText,
      SectionItemMeta? meta,
      SectionItemMedia? media,
      String? actionRef});

  @override
  $SectionItemMetaCopyWith<$Res>? get meta;
  @override
  $SectionItemMediaCopyWith<$Res>? get media;
}

/// @nodoc
class __$$SectionItemImplCopyWithImpl<$Res>
    extends _$SectionItemCopyWithImpl<$Res, _$SectionItemImpl>
    implements _$$SectionItemImplCopyWith<$Res> {
  __$$SectionItemImplCopyWithImpl(
      _$SectionItemImpl _value, $Res Function(_$SectionItemImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kind = null,
    Object? id = null,
    Object? primaryText = null,
    Object? secondaryText = freezed,
    Object? meta = freezed,
    Object? media = freezed,
    Object? actionRef = freezed,
  }) {
    return _then(_$SectionItemImpl(
      kind: null == kind
          ? _value.kind
          : kind // ignore: cast_nullable_to_non_nullable
              as ItemKind,
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      primaryText: null == primaryText
          ? _value.primaryText
          : primaryText // ignore: cast_nullable_to_non_nullable
              as String,
      secondaryText: freezed == secondaryText
          ? _value.secondaryText
          : secondaryText // ignore: cast_nullable_to_non_nullable
              as String?,
      meta: freezed == meta
          ? _value.meta
          : meta // ignore: cast_nullable_to_non_nullable
              as SectionItemMeta?,
      media: freezed == media
          ? _value.media
          : media // ignore: cast_nullable_to_non_nullable
              as SectionItemMedia?,
      actionRef: freezed == actionRef
          ? _value.actionRef
          : actionRef // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SectionItemImpl implements _SectionItem {
  const _$SectionItemImpl(
      {required this.kind,
      required this.id,
      required this.primaryText,
      this.secondaryText,
      this.meta,
      this.media,
      this.actionRef});

  factory _$SectionItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$SectionItemImplFromJson(json);

  @override
  final ItemKind kind;
  @override
  final String id;
  @override
  final String primaryText;
  @override
  final String? secondaryText;
  @override
  final SectionItemMeta? meta;
  @override
  final SectionItemMedia? media;
  @override
  final String? actionRef;

  @override
  String toString() {
    return 'SectionItem(kind: $kind, id: $id, primaryText: $primaryText, secondaryText: $secondaryText, meta: $meta, media: $media, actionRef: $actionRef)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SectionItemImpl &&
            (identical(other.kind, kind) || other.kind == kind) &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.primaryText, primaryText) ||
                other.primaryText == primaryText) &&
            (identical(other.secondaryText, secondaryText) ||
                other.secondaryText == secondaryText) &&
            (identical(other.meta, meta) || other.meta == meta) &&
            (identical(other.media, media) || other.media == media) &&
            (identical(other.actionRef, actionRef) ||
                other.actionRef == actionRef));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, kind, id, primaryText,
      secondaryText, meta, media, actionRef);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SectionItemImplCopyWith<_$SectionItemImpl> get copyWith =>
      __$$SectionItemImplCopyWithImpl<_$SectionItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SectionItemImplToJson(
      this,
    );
  }
}

abstract class _SectionItem implements SectionItem {
  const factory _SectionItem(
      {required final ItemKind kind,
      required final String id,
      required final String primaryText,
      final String? secondaryText,
      final SectionItemMeta? meta,
      final SectionItemMedia? media,
      final String? actionRef}) = _$SectionItemImpl;

  factory _SectionItem.fromJson(Map<String, dynamic> json) =
      _$SectionItemImpl.fromJson;

  @override
  ItemKind get kind;
  @override
  String get id;
  @override
  String get primaryText;
  @override
  String? get secondaryText;
  @override
  SectionItemMeta? get meta;
  @override
  SectionItemMedia? get media;
  @override
  String? get actionRef;
  @override
  @JsonKey(ignore: true)
  _$$SectionItemImplCopyWith<_$SectionItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SectionItemMeta _$SectionItemMetaFromJson(Map<String, dynamic> json) {
  return _SectionItemMeta.fromJson(json);
}

/// @nodoc
mixin _$SectionItemMeta {
  String? get badge => throw _privateConstructorUsedError;
  String? get priceText => throw _privateConstructorUsedError;
  String? get ratingText => throw _privateConstructorUsedError;
  String? get distanceText => throw _privateConstructorUsedError;
  String? get availabilityText => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SectionItemMetaCopyWith<SectionItemMeta> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SectionItemMetaCopyWith<$Res> {
  factory $SectionItemMetaCopyWith(
          SectionItemMeta value, $Res Function(SectionItemMeta) then) =
      _$SectionItemMetaCopyWithImpl<$Res, SectionItemMeta>;
  @useResult
  $Res call(
      {String? badge,
      String? priceText,
      String? ratingText,
      String? distanceText,
      String? availabilityText});
}

/// @nodoc
class _$SectionItemMetaCopyWithImpl<$Res, $Val extends SectionItemMeta>
    implements $SectionItemMetaCopyWith<$Res> {
  _$SectionItemMetaCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? badge = freezed,
    Object? priceText = freezed,
    Object? ratingText = freezed,
    Object? distanceText = freezed,
    Object? availabilityText = freezed,
  }) {
    return _then(_value.copyWith(
      badge: freezed == badge
          ? _value.badge
          : badge // ignore: cast_nullable_to_non_nullable
              as String?,
      priceText: freezed == priceText
          ? _value.priceText
          : priceText // ignore: cast_nullable_to_non_nullable
              as String?,
      ratingText: freezed == ratingText
          ? _value.ratingText
          : ratingText // ignore: cast_nullable_to_non_nullable
              as String?,
      distanceText: freezed == distanceText
          ? _value.distanceText
          : distanceText // ignore: cast_nullable_to_non_nullable
              as String?,
      availabilityText: freezed == availabilityText
          ? _value.availabilityText
          : availabilityText // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SectionItemMetaImplCopyWith<$Res>
    implements $SectionItemMetaCopyWith<$Res> {
  factory _$$SectionItemMetaImplCopyWith(_$SectionItemMetaImpl value,
          $Res Function(_$SectionItemMetaImpl) then) =
      __$$SectionItemMetaImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? badge,
      String? priceText,
      String? ratingText,
      String? distanceText,
      String? availabilityText});
}

/// @nodoc
class __$$SectionItemMetaImplCopyWithImpl<$Res>
    extends _$SectionItemMetaCopyWithImpl<$Res, _$SectionItemMetaImpl>
    implements _$$SectionItemMetaImplCopyWith<$Res> {
  __$$SectionItemMetaImplCopyWithImpl(
      _$SectionItemMetaImpl _value, $Res Function(_$SectionItemMetaImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? badge = freezed,
    Object? priceText = freezed,
    Object? ratingText = freezed,
    Object? distanceText = freezed,
    Object? availabilityText = freezed,
  }) {
    return _then(_$SectionItemMetaImpl(
      badge: freezed == badge
          ? _value.badge
          : badge // ignore: cast_nullable_to_non_nullable
              as String?,
      priceText: freezed == priceText
          ? _value.priceText
          : priceText // ignore: cast_nullable_to_non_nullable
              as String?,
      ratingText: freezed == ratingText
          ? _value.ratingText
          : ratingText // ignore: cast_nullable_to_non_nullable
              as String?,
      distanceText: freezed == distanceText
          ? _value.distanceText
          : distanceText // ignore: cast_nullable_to_non_nullable
              as String?,
      availabilityText: freezed == availabilityText
          ? _value.availabilityText
          : availabilityText // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SectionItemMetaImpl implements _SectionItemMeta {
  const _$SectionItemMetaImpl(
      {this.badge,
      this.priceText,
      this.ratingText,
      this.distanceText,
      this.availabilityText});

  factory _$SectionItemMetaImpl.fromJson(Map<String, dynamic> json) =>
      _$$SectionItemMetaImplFromJson(json);

  @override
  final String? badge;
  @override
  final String? priceText;
  @override
  final String? ratingText;
  @override
  final String? distanceText;
  @override
  final String? availabilityText;

  @override
  String toString() {
    return 'SectionItemMeta(badge: $badge, priceText: $priceText, ratingText: $ratingText, distanceText: $distanceText, availabilityText: $availabilityText)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SectionItemMetaImpl &&
            (identical(other.badge, badge) || other.badge == badge) &&
            (identical(other.priceText, priceText) ||
                other.priceText == priceText) &&
            (identical(other.ratingText, ratingText) ||
                other.ratingText == ratingText) &&
            (identical(other.distanceText, distanceText) ||
                other.distanceText == distanceText) &&
            (identical(other.availabilityText, availabilityText) ||
                other.availabilityText == availabilityText));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, badge, priceText, ratingText,
      distanceText, availabilityText);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SectionItemMetaImplCopyWith<_$SectionItemMetaImpl> get copyWith =>
      __$$SectionItemMetaImplCopyWithImpl<_$SectionItemMetaImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SectionItemMetaImplToJson(
      this,
    );
  }
}

abstract class _SectionItemMeta implements SectionItemMeta {
  const factory _SectionItemMeta(
      {final String? badge,
      final String? priceText,
      final String? ratingText,
      final String? distanceText,
      final String? availabilityText}) = _$SectionItemMetaImpl;

  factory _SectionItemMeta.fromJson(Map<String, dynamic> json) =
      _$SectionItemMetaImpl.fromJson;

  @override
  String? get badge;
  @override
  String? get priceText;
  @override
  String? get ratingText;
  @override
  String? get distanceText;
  @override
  String? get availabilityText;
  @override
  @JsonKey(ignore: true)
  _$$SectionItemMetaImplCopyWith<_$SectionItemMetaImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SectionItemMedia _$SectionItemMediaFromJson(Map<String, dynamic> json) {
  return _SectionItemMedia.fromJson(json);
}

/// @nodoc
mixin _$SectionItemMedia {
  String? get imageUrl => throw _privateConstructorUsedError;
  String? get aspect => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SectionItemMediaCopyWith<SectionItemMedia> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SectionItemMediaCopyWith<$Res> {
  factory $SectionItemMediaCopyWith(
          SectionItemMedia value, $Res Function(SectionItemMedia) then) =
      _$SectionItemMediaCopyWithImpl<$Res, SectionItemMedia>;
  @useResult
  $Res call({String? imageUrl, String? aspect});
}

/// @nodoc
class _$SectionItemMediaCopyWithImpl<$Res, $Val extends SectionItemMedia>
    implements $SectionItemMediaCopyWith<$Res> {
  _$SectionItemMediaCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? imageUrl = freezed,
    Object? aspect = freezed,
  }) {
    return _then(_value.copyWith(
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      aspect: freezed == aspect
          ? _value.aspect
          : aspect // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SectionItemMediaImplCopyWith<$Res>
    implements $SectionItemMediaCopyWith<$Res> {
  factory _$$SectionItemMediaImplCopyWith(_$SectionItemMediaImpl value,
          $Res Function(_$SectionItemMediaImpl) then) =
      __$$SectionItemMediaImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? imageUrl, String? aspect});
}

/// @nodoc
class __$$SectionItemMediaImplCopyWithImpl<$Res>
    extends _$SectionItemMediaCopyWithImpl<$Res, _$SectionItemMediaImpl>
    implements _$$SectionItemMediaImplCopyWith<$Res> {
  __$$SectionItemMediaImplCopyWithImpl(_$SectionItemMediaImpl _value,
      $Res Function(_$SectionItemMediaImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? imageUrl = freezed,
    Object? aspect = freezed,
  }) {
    return _then(_$SectionItemMediaImpl(
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      aspect: freezed == aspect
          ? _value.aspect
          : aspect // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SectionItemMediaImpl implements _SectionItemMedia {
  const _$SectionItemMediaImpl({this.imageUrl, this.aspect});

  factory _$SectionItemMediaImpl.fromJson(Map<String, dynamic> json) =>
      _$$SectionItemMediaImplFromJson(json);

  @override
  final String? imageUrl;
  @override
  final String? aspect;

  @override
  String toString() {
    return 'SectionItemMedia(imageUrl: $imageUrl, aspect: $aspect)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SectionItemMediaImpl &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.aspect, aspect) || other.aspect == aspect));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, imageUrl, aspect);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SectionItemMediaImplCopyWith<_$SectionItemMediaImpl> get copyWith =>
      __$$SectionItemMediaImplCopyWithImpl<_$SectionItemMediaImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SectionItemMediaImplToJson(
      this,
    );
  }
}

abstract class _SectionItemMedia implements SectionItemMedia {
  const factory _SectionItemMedia(
      {final String? imageUrl, final String? aspect}) = _$SectionItemMediaImpl;

  factory _SectionItemMedia.fromJson(Map<String, dynamic> json) =
      _$SectionItemMediaImpl.fromJson;

  @override
  String? get imageUrl;
  @override
  String? get aspect;
  @override
  @JsonKey(ignore: true)
  _$$SectionItemMediaImplCopyWith<_$SectionItemMediaImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanActions _$UIPlanActionsFromJson(Map<String, dynamic> json) {
  return _UIPlanActions.fromJson(json);
}

/// @nodoc
mixin _$UIPlanActions {
  Map<String, UIPlanAction> get byId => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanActionsCopyWith<UIPlanActions> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanActionsCopyWith<$Res> {
  factory $UIPlanActionsCopyWith(
          UIPlanActions value, $Res Function(UIPlanActions) then) =
      _$UIPlanActionsCopyWithImpl<$Res, UIPlanActions>;
  @useResult
  $Res call({Map<String, UIPlanAction> byId});
}

/// @nodoc
class _$UIPlanActionsCopyWithImpl<$Res, $Val extends UIPlanActions>
    implements $UIPlanActionsCopyWith<$Res> {
  _$UIPlanActionsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? byId = null,
  }) {
    return _then(_value.copyWith(
      byId: null == byId
          ? _value.byId
          : byId // ignore: cast_nullable_to_non_nullable
              as Map<String, UIPlanAction>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanActionsImplCopyWith<$Res>
    implements $UIPlanActionsCopyWith<$Res> {
  factory _$$UIPlanActionsImplCopyWith(
          _$UIPlanActionsImpl value, $Res Function(_$UIPlanActionsImpl) then) =
      __$$UIPlanActionsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({Map<String, UIPlanAction> byId});
}

/// @nodoc
class __$$UIPlanActionsImplCopyWithImpl<$Res>
    extends _$UIPlanActionsCopyWithImpl<$Res, _$UIPlanActionsImpl>
    implements _$$UIPlanActionsImplCopyWith<$Res> {
  __$$UIPlanActionsImplCopyWithImpl(
      _$UIPlanActionsImpl _value, $Res Function(_$UIPlanActionsImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? byId = null,
  }) {
    return _then(_$UIPlanActionsImpl(
      byId: null == byId
          ? _value._byId
          : byId // ignore: cast_nullable_to_non_nullable
              as Map<String, UIPlanAction>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanActionsImpl implements _UIPlanActions {
  const _$UIPlanActionsImpl({required final Map<String, UIPlanAction> byId})
      : _byId = byId;

  factory _$UIPlanActionsImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanActionsImplFromJson(json);

  final Map<String, UIPlanAction> _byId;
  @override
  Map<String, UIPlanAction> get byId {
    if (_byId is EqualUnmodifiableMapView) return _byId;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_byId);
  }

  @override
  String toString() {
    return 'UIPlanActions(byId: $byId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanActionsImpl &&
            const DeepCollectionEquality().equals(other._byId, _byId));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_byId));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanActionsImplCopyWith<_$UIPlanActionsImpl> get copyWith =>
      __$$UIPlanActionsImplCopyWithImpl<_$UIPlanActionsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanActionsImplToJson(
      this,
    );
  }
}

abstract class _UIPlanActions implements UIPlanActions {
  const factory _UIPlanActions(
      {required final Map<String, UIPlanAction> byId}) = _$UIPlanActionsImpl;

  factory _UIPlanActions.fromJson(Map<String, dynamic> json) =
      _$UIPlanActionsImpl.fromJson;

  @override
  Map<String, UIPlanAction> get byId;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanActionsImplCopyWith<_$UIPlanActionsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanAction _$UIPlanActionFromJson(Map<String, dynamic> json) {
  return _UIPlanAction.fromJson(json);
}

/// @nodoc
mixin _$UIPlanAction {
  ActionIntent get intent => throw _privateConstructorUsedError;
  Map<String, dynamic>? get params => throw _privateConstructorUsedError;
  bool? get requiresConfirmation => throw _privateConstructorUsedError;
  String? get confirmationText => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanActionCopyWith<UIPlanAction> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanActionCopyWith<$Res> {
  factory $UIPlanActionCopyWith(
          UIPlanAction value, $Res Function(UIPlanAction) then) =
      _$UIPlanActionCopyWithImpl<$Res, UIPlanAction>;
  @useResult
  $Res call(
      {ActionIntent intent,
      Map<String, dynamic>? params,
      bool? requiresConfirmation,
      String? confirmationText});
}

/// @nodoc
class _$UIPlanActionCopyWithImpl<$Res, $Val extends UIPlanAction>
    implements $UIPlanActionCopyWith<$Res> {
  _$UIPlanActionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? intent = null,
    Object? params = freezed,
    Object? requiresConfirmation = freezed,
    Object? confirmationText = freezed,
  }) {
    return _then(_value.copyWith(
      intent: null == intent
          ? _value.intent
          : intent // ignore: cast_nullable_to_non_nullable
              as ActionIntent,
      params: freezed == params
          ? _value.params
          : params // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      requiresConfirmation: freezed == requiresConfirmation
          ? _value.requiresConfirmation
          : requiresConfirmation // ignore: cast_nullable_to_non_nullable
              as bool?,
      confirmationText: freezed == confirmationText
          ? _value.confirmationText
          : confirmationText // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanActionImplCopyWith<$Res>
    implements $UIPlanActionCopyWith<$Res> {
  factory _$$UIPlanActionImplCopyWith(
          _$UIPlanActionImpl value, $Res Function(_$UIPlanActionImpl) then) =
      __$$UIPlanActionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {ActionIntent intent,
      Map<String, dynamic>? params,
      bool? requiresConfirmation,
      String? confirmationText});
}

/// @nodoc
class __$$UIPlanActionImplCopyWithImpl<$Res>
    extends _$UIPlanActionCopyWithImpl<$Res, _$UIPlanActionImpl>
    implements _$$UIPlanActionImplCopyWith<$Res> {
  __$$UIPlanActionImplCopyWithImpl(
      _$UIPlanActionImpl _value, $Res Function(_$UIPlanActionImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? intent = null,
    Object? params = freezed,
    Object? requiresConfirmation = freezed,
    Object? confirmationText = freezed,
  }) {
    return _then(_$UIPlanActionImpl(
      intent: null == intent
          ? _value.intent
          : intent // ignore: cast_nullable_to_non_nullable
              as ActionIntent,
      params: freezed == params
          ? _value._params
          : params // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      requiresConfirmation: freezed == requiresConfirmation
          ? _value.requiresConfirmation
          : requiresConfirmation // ignore: cast_nullable_to_non_nullable
              as bool?,
      confirmationText: freezed == confirmationText
          ? _value.confirmationText
          : confirmationText // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanActionImpl implements _UIPlanAction {
  const _$UIPlanActionImpl(
      {required this.intent,
      final Map<String, dynamic>? params,
      this.requiresConfirmation,
      this.confirmationText})
      : _params = params;

  factory _$UIPlanActionImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanActionImplFromJson(json);

  @override
  final ActionIntent intent;
  final Map<String, dynamic>? _params;
  @override
  Map<String, dynamic>? get params {
    final value = _params;
    if (value == null) return null;
    if (_params is EqualUnmodifiableMapView) return _params;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final bool? requiresConfirmation;
  @override
  final String? confirmationText;

  @override
  String toString() {
    return 'UIPlanAction(intent: $intent, params: $params, requiresConfirmation: $requiresConfirmation, confirmationText: $confirmationText)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanActionImpl &&
            (identical(other.intent, intent) || other.intent == intent) &&
            const DeepCollectionEquality().equals(other._params, _params) &&
            (identical(other.requiresConfirmation, requiresConfirmation) ||
                other.requiresConfirmation == requiresConfirmation) &&
            (identical(other.confirmationText, confirmationText) ||
                other.confirmationText == confirmationText));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      intent,
      const DeepCollectionEquality().hash(_params),
      requiresConfirmation,
      confirmationText);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanActionImplCopyWith<_$UIPlanActionImpl> get copyWith =>
      __$$UIPlanActionImplCopyWithImpl<_$UIPlanActionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanActionImplToJson(
      this,
    );
  }
}

abstract class _UIPlanAction implements UIPlanAction {
  const factory _UIPlanAction(
      {required final ActionIntent intent,
      final Map<String, dynamic>? params,
      final bool? requiresConfirmation,
      final String? confirmationText}) = _$UIPlanActionImpl;

  factory _UIPlanAction.fromJson(Map<String, dynamic> json) =
      _$UIPlanActionImpl.fromJson;

  @override
  ActionIntent get intent;
  @override
  Map<String, dynamic>? get params;
  @override
  bool? get requiresConfirmation;
  @override
  String? get confirmationText;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanActionImplCopyWith<_$UIPlanActionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanCache _$UIPlanCacheFromJson(Map<String, dynamic> json) {
  return _UIPlanCache.fromJson(json);
}

/// @nodoc
mixin _$UIPlanCache {
  int get ttlSeconds => throw _privateConstructorUsedError;
  List<String>? get varyBy => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanCacheCopyWith<UIPlanCache> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanCacheCopyWith<$Res> {
  factory $UIPlanCacheCopyWith(
          UIPlanCache value, $Res Function(UIPlanCache) then) =
      _$UIPlanCacheCopyWithImpl<$Res, UIPlanCache>;
  @useResult
  $Res call({int ttlSeconds, List<String>? varyBy});
}

/// @nodoc
class _$UIPlanCacheCopyWithImpl<$Res, $Val extends UIPlanCache>
    implements $UIPlanCacheCopyWith<$Res> {
  _$UIPlanCacheCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? ttlSeconds = null,
    Object? varyBy = freezed,
  }) {
    return _then(_value.copyWith(
      ttlSeconds: null == ttlSeconds
          ? _value.ttlSeconds
          : ttlSeconds // ignore: cast_nullable_to_non_nullable
              as int,
      varyBy: freezed == varyBy
          ? _value.varyBy
          : varyBy // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanCacheImplCopyWith<$Res>
    implements $UIPlanCacheCopyWith<$Res> {
  factory _$$UIPlanCacheImplCopyWith(
          _$UIPlanCacheImpl value, $Res Function(_$UIPlanCacheImpl) then) =
      __$$UIPlanCacheImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int ttlSeconds, List<String>? varyBy});
}

/// @nodoc
class __$$UIPlanCacheImplCopyWithImpl<$Res>
    extends _$UIPlanCacheCopyWithImpl<$Res, _$UIPlanCacheImpl>
    implements _$$UIPlanCacheImplCopyWith<$Res> {
  __$$UIPlanCacheImplCopyWithImpl(
      _$UIPlanCacheImpl _value, $Res Function(_$UIPlanCacheImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? ttlSeconds = null,
    Object? varyBy = freezed,
  }) {
    return _then(_$UIPlanCacheImpl(
      ttlSeconds: null == ttlSeconds
          ? _value.ttlSeconds
          : ttlSeconds // ignore: cast_nullable_to_non_nullable
              as int,
      varyBy: freezed == varyBy
          ? _value._varyBy
          : varyBy // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanCacheImpl implements _UIPlanCache {
  const _$UIPlanCacheImpl(
      {required this.ttlSeconds, final List<String>? varyBy})
      : _varyBy = varyBy;

  factory _$UIPlanCacheImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanCacheImplFromJson(json);

  @override
  final int ttlSeconds;
  final List<String>? _varyBy;
  @override
  List<String>? get varyBy {
    final value = _varyBy;
    if (value == null) return null;
    if (_varyBy is EqualUnmodifiableListView) return _varyBy;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'UIPlanCache(ttlSeconds: $ttlSeconds, varyBy: $varyBy)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanCacheImpl &&
            (identical(other.ttlSeconds, ttlSeconds) ||
                other.ttlSeconds == ttlSeconds) &&
            const DeepCollectionEquality().equals(other._varyBy, _varyBy));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, ttlSeconds, const DeepCollectionEquality().hash(_varyBy));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanCacheImplCopyWith<_$UIPlanCacheImpl> get copyWith =>
      __$$UIPlanCacheImplCopyWithImpl<_$UIPlanCacheImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanCacheImplToJson(
      this,
    );
  }
}

abstract class _UIPlanCache implements UIPlanCache {
  const factory _UIPlanCache(
      {required final int ttlSeconds,
      final List<String>? varyBy}) = _$UIPlanCacheImpl;

  factory _UIPlanCache.fromJson(Map<String, dynamic> json) =
      _$UIPlanCacheImpl.fromJson;

  @override
  int get ttlSeconds;
  @override
  List<String>? get varyBy;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanCacheImplCopyWith<_$UIPlanCacheImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanDebug _$UIPlanDebugFromJson(Map<String, dynamic> json) {
  return _UIPlanDebug.fromJson(json);
}

/// @nodoc
mixin _$UIPlanDebug {
  String? get explanation => throw _privateConstructorUsedError;
  List<UIPlanDebugToolCall>? get sourceToolCalls =>
      throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanDebugCopyWith<UIPlanDebug> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanDebugCopyWith<$Res> {
  factory $UIPlanDebugCopyWith(
          UIPlanDebug value, $Res Function(UIPlanDebug) then) =
      _$UIPlanDebugCopyWithImpl<$Res, UIPlanDebug>;
  @useResult
  $Res call({String? explanation, List<UIPlanDebugToolCall>? sourceToolCalls});
}

/// @nodoc
class _$UIPlanDebugCopyWithImpl<$Res, $Val extends UIPlanDebug>
    implements $UIPlanDebugCopyWith<$Res> {
  _$UIPlanDebugCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? explanation = freezed,
    Object? sourceToolCalls = freezed,
  }) {
    return _then(_value.copyWith(
      explanation: freezed == explanation
          ? _value.explanation
          : explanation // ignore: cast_nullable_to_non_nullable
              as String?,
      sourceToolCalls: freezed == sourceToolCalls
          ? _value.sourceToolCalls
          : sourceToolCalls // ignore: cast_nullable_to_non_nullable
              as List<UIPlanDebugToolCall>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanDebugImplCopyWith<$Res>
    implements $UIPlanDebugCopyWith<$Res> {
  factory _$$UIPlanDebugImplCopyWith(
          _$UIPlanDebugImpl value, $Res Function(_$UIPlanDebugImpl) then) =
      __$$UIPlanDebugImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? explanation, List<UIPlanDebugToolCall>? sourceToolCalls});
}

/// @nodoc
class __$$UIPlanDebugImplCopyWithImpl<$Res>
    extends _$UIPlanDebugCopyWithImpl<$Res, _$UIPlanDebugImpl>
    implements _$$UIPlanDebugImplCopyWith<$Res> {
  __$$UIPlanDebugImplCopyWithImpl(
      _$UIPlanDebugImpl _value, $Res Function(_$UIPlanDebugImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? explanation = freezed,
    Object? sourceToolCalls = freezed,
  }) {
    return _then(_$UIPlanDebugImpl(
      explanation: freezed == explanation
          ? _value.explanation
          : explanation // ignore: cast_nullable_to_non_nullable
              as String?,
      sourceToolCalls: freezed == sourceToolCalls
          ? _value._sourceToolCalls
          : sourceToolCalls // ignore: cast_nullable_to_non_nullable
              as List<UIPlanDebugToolCall>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanDebugImpl implements _UIPlanDebug {
  const _$UIPlanDebugImpl(
      {this.explanation, final List<UIPlanDebugToolCall>? sourceToolCalls})
      : _sourceToolCalls = sourceToolCalls;

  factory _$UIPlanDebugImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanDebugImplFromJson(json);

  @override
  final String? explanation;
  final List<UIPlanDebugToolCall>? _sourceToolCalls;
  @override
  List<UIPlanDebugToolCall>? get sourceToolCalls {
    final value = _sourceToolCalls;
    if (value == null) return null;
    if (_sourceToolCalls is EqualUnmodifiableListView) return _sourceToolCalls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'UIPlanDebug(explanation: $explanation, sourceToolCalls: $sourceToolCalls)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanDebugImpl &&
            (identical(other.explanation, explanation) ||
                other.explanation == explanation) &&
            const DeepCollectionEquality()
                .equals(other._sourceToolCalls, _sourceToolCalls));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, explanation,
      const DeepCollectionEquality().hash(_sourceToolCalls));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanDebugImplCopyWith<_$UIPlanDebugImpl> get copyWith =>
      __$$UIPlanDebugImplCopyWithImpl<_$UIPlanDebugImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanDebugImplToJson(
      this,
    );
  }
}

abstract class _UIPlanDebug implements UIPlanDebug {
  const factory _UIPlanDebug(
      {final String? explanation,
      final List<UIPlanDebugToolCall>? sourceToolCalls}) = _$UIPlanDebugImpl;

  factory _UIPlanDebug.fromJson(Map<String, dynamic> json) =
      _$UIPlanDebugImpl.fromJson;

  @override
  String? get explanation;
  @override
  List<UIPlanDebugToolCall>? get sourceToolCalls;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanDebugImplCopyWith<_$UIPlanDebugImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UIPlanDebugToolCall _$UIPlanDebugToolCallFromJson(Map<String, dynamic> json) {
  return _UIPlanDebugToolCall.fromJson(json);
}

/// @nodoc
mixin _$UIPlanDebugToolCall {
  String get tool => throw _privateConstructorUsedError;
  String get correlationId => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UIPlanDebugToolCallCopyWith<UIPlanDebugToolCall> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UIPlanDebugToolCallCopyWith<$Res> {
  factory $UIPlanDebugToolCallCopyWith(
          UIPlanDebugToolCall value, $Res Function(UIPlanDebugToolCall) then) =
      _$UIPlanDebugToolCallCopyWithImpl<$Res, UIPlanDebugToolCall>;
  @useResult
  $Res call({String tool, String correlationId});
}

/// @nodoc
class _$UIPlanDebugToolCallCopyWithImpl<$Res, $Val extends UIPlanDebugToolCall>
    implements $UIPlanDebugToolCallCopyWith<$Res> {
  _$UIPlanDebugToolCallCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tool = null,
    Object? correlationId = null,
  }) {
    return _then(_value.copyWith(
      tool: null == tool
          ? _value.tool
          : tool // ignore: cast_nullable_to_non_nullable
              as String,
      correlationId: null == correlationId
          ? _value.correlationId
          : correlationId // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UIPlanDebugToolCallImplCopyWith<$Res>
    implements $UIPlanDebugToolCallCopyWith<$Res> {
  factory _$$UIPlanDebugToolCallImplCopyWith(_$UIPlanDebugToolCallImpl value,
          $Res Function(_$UIPlanDebugToolCallImpl) then) =
      __$$UIPlanDebugToolCallImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String tool, String correlationId});
}

/// @nodoc
class __$$UIPlanDebugToolCallImplCopyWithImpl<$Res>
    extends _$UIPlanDebugToolCallCopyWithImpl<$Res, _$UIPlanDebugToolCallImpl>
    implements _$$UIPlanDebugToolCallImplCopyWith<$Res> {
  __$$UIPlanDebugToolCallImplCopyWithImpl(_$UIPlanDebugToolCallImpl _value,
      $Res Function(_$UIPlanDebugToolCallImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tool = null,
    Object? correlationId = null,
  }) {
    return _then(_$UIPlanDebugToolCallImpl(
      tool: null == tool
          ? _value.tool
          : tool // ignore: cast_nullable_to_non_nullable
              as String,
      correlationId: null == correlationId
          ? _value.correlationId
          : correlationId // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UIPlanDebugToolCallImpl implements _UIPlanDebugToolCall {
  const _$UIPlanDebugToolCallImpl(
      {required this.tool, required this.correlationId});

  factory _$UIPlanDebugToolCallImpl.fromJson(Map<String, dynamic> json) =>
      _$$UIPlanDebugToolCallImplFromJson(json);

  @override
  final String tool;
  @override
  final String correlationId;

  @override
  String toString() {
    return 'UIPlanDebugToolCall(tool: $tool, correlationId: $correlationId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UIPlanDebugToolCallImpl &&
            (identical(other.tool, tool) || other.tool == tool) &&
            (identical(other.correlationId, correlationId) ||
                other.correlationId == correlationId));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, tool, correlationId);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UIPlanDebugToolCallImplCopyWith<_$UIPlanDebugToolCallImpl> get copyWith =>
      __$$UIPlanDebugToolCallImplCopyWithImpl<_$UIPlanDebugToolCallImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UIPlanDebugToolCallImplToJson(
      this,
    );
  }
}

abstract class _UIPlanDebugToolCall implements UIPlanDebugToolCall {
  const factory _UIPlanDebugToolCall(
      {required final String tool,
      required final String correlationId}) = _$UIPlanDebugToolCallImpl;

  factory _UIPlanDebugToolCall.fromJson(Map<String, dynamic> json) =
      _$UIPlanDebugToolCallImpl.fromJson;

  @override
  String get tool;
  @override
  String get correlationId;
  @override
  @JsonKey(ignore: true)
  _$$UIPlanDebugToolCallImplCopyWith<_$UIPlanDebugToolCallImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
