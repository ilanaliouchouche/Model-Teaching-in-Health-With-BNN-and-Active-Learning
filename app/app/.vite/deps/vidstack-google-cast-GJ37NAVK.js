import {
  getCastContext,
  getCastErrorMessage,
  getCastSession,
  getCastSessionMedia,
  hasActiveCastSession,
  listenCastContextEvent
} from "./chunk-MAGUOO2H.js";
import {
  TimeRange
} from "./chunk-QGQ7KI2J.js";
import {
  RAFLoop
} from "./chunk-U2LFAP4F.js";
import {
  ListSymbol
} from "./chunk-OPWJPTWG.js";
import {
  DOMEvent,
  createScope,
  effect,
  keysOf,
  listenEvent,
  onDispose,
  peek,
  untrack
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/providers/vidstack-google-cast.js
var _info, _buildCastTrack, buildCastTrack_fn;
var GoogleCastMediaInfoBuilder = class {
  constructor(src) {
    __privateAdd(this, _buildCastTrack);
    __privateAdd(this, _info, void 0);
    __privateSet(this, _info, new chrome.cast.media.MediaInfo(src.src, src.type));
  }
  build() {
    return __privateGet(this, _info);
  }
  setStreamType(streamType) {
    if (streamType.includes("live")) {
      __privateGet(this, _info).streamType = chrome.cast.media.StreamType.LIVE;
    } else {
      __privateGet(this, _info).streamType = chrome.cast.media.StreamType.BUFFERED;
    }
    return this;
  }
  setTracks(tracks) {
    __privateGet(this, _info).tracks = tracks.map(__privateMethod(this, _buildCastTrack, buildCastTrack_fn));
    return this;
  }
  setMetadata(title, poster) {
    __privateGet(this, _info).metadata = new chrome.cast.media.GenericMediaMetadata();
    __privateGet(this, _info).metadata.title = title;
    __privateGet(this, _info).metadata.images = [{ url: poster }];
    return this;
  }
};
_info = new WeakMap();
_buildCastTrack = new WeakSet();
buildCastTrack_fn = function(track, trackId) {
  const castTrack = new chrome.cast.media.Track(trackId, chrome.cast.media.TrackType.TEXT);
  castTrack.name = track.label;
  castTrack.trackContentId = track.src;
  castTrack.trackContentType = "text/vtt";
  castTrack.language = track.language;
  castTrack.subtype = track.kind.toUpperCase();
  return castTrack;
};
var _cast, _ctx, _onNewLocalTracks, _getLocalAudioTracks, getLocalAudioTracks_fn, _getRemoteTracks, getRemoteTracks_fn, _getRemoteActiveIds, getRemoteActiveIds_fn, _syncLocalTracks, syncLocalTracks_fn, _editTracksInfo, editTracksInfo_fn, _findLocalTrack, findLocalTrack_fn, _findRemoteTrack, findRemoteTrack_fn, _isMatch, isMatch_fn;
var GoogleCastTracksManager = class {
  constructor(cast2, ctx, onNewLocalTracks) {
    __privateAdd(this, _getLocalAudioTracks);
    __privateAdd(this, _getRemoteTracks);
    __privateAdd(this, _getRemoteActiveIds);
    __privateAdd(this, _syncLocalTracks);
    __privateAdd(this, _editTracksInfo);
    __privateAdd(this, _findLocalTrack);
    __privateAdd(this, _findRemoteTrack);
    // Note: we can't rely on id matching because they will differ between local/remote. A local
    // track id might not even exist.
    __privateAdd(this, _isMatch);
    __privateAdd(this, _cast, void 0);
    __privateAdd(this, _ctx, void 0);
    __privateAdd(this, _onNewLocalTracks, void 0);
    __privateSet(this, _cast, cast2);
    __privateSet(this, _ctx, ctx);
    __privateSet(this, _onNewLocalTracks, onNewLocalTracks);
  }
  setup() {
    const syncRemoteActiveIds = this.syncRemoteActiveIds.bind(this);
    listenEvent(__privateGet(this, _ctx).audioTracks, "change", syncRemoteActiveIds);
    listenEvent(__privateGet(this, _ctx).textTracks, "mode-change", syncRemoteActiveIds);
    effect(__privateMethod(this, _syncLocalTracks, syncLocalTracks_fn).bind(this));
  }
  getLocalTextTracks() {
    return __privateGet(this, _ctx).$state.textTracks().filter((track) => track.src && track.type === "vtt");
  }
  syncRemoteTracks(event) {
    if (!__privateGet(this, _cast).isMediaLoaded)
      return;
    const localAudioTracks = __privateMethod(this, _getLocalAudioTracks, getLocalAudioTracks_fn).call(this), localTextTracks = this.getLocalTextTracks(), remoteAudioTracks = __privateMethod(this, _getRemoteTracks, getRemoteTracks_fn).call(this, chrome.cast.media.TrackType.AUDIO), remoteTextTracks = __privateMethod(this, _getRemoteTracks, getRemoteTracks_fn).call(this, chrome.cast.media.TrackType.TEXT);
    for (const remoteAudioTrack of remoteAudioTracks) {
      const hasLocalTrack = __privateMethod(this, _findLocalTrack, findLocalTrack_fn).call(this, localAudioTracks, remoteAudioTrack);
      if (hasLocalTrack)
        continue;
      const localAudioTrack = {
        id: remoteAudioTrack.trackId.toString(),
        label: remoteAudioTrack.name,
        language: remoteAudioTrack.language,
        kind: remoteAudioTrack.subtype ?? "main",
        selected: false
      };
      __privateGet(this, _ctx).audioTracks[ListSymbol.add](localAudioTrack, event);
    }
    for (const remoteTextTrack of remoteTextTracks) {
      const hasLocalTrack = __privateMethod(this, _findLocalTrack, findLocalTrack_fn).call(this, localTextTracks, remoteTextTrack);
      if (hasLocalTrack)
        continue;
      const localTextTrack = {
        id: remoteTextTrack.trackId.toString(),
        src: remoteTextTrack.trackContentId,
        label: remoteTextTrack.name,
        language: remoteTextTrack.language,
        kind: remoteTextTrack.subtype.toLowerCase()
      };
      __privateGet(this, _ctx).textTracks.add(localTextTrack, event);
    }
  }
  syncRemoteActiveIds(event) {
    if (!__privateGet(this, _cast).isMediaLoaded)
      return;
    const activeIds = __privateMethod(this, _getRemoteActiveIds, getRemoteActiveIds_fn).call(this), editRequest = new chrome.cast.media.EditTracksInfoRequest(activeIds);
    __privateMethod(this, _editTracksInfo, editTracksInfo_fn).call(this, editRequest).catch((error) => {
      var _a;
      {
        (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.errorGroup("[vidstack] failed to edit cast tracks info").labelledLog("Edit Request", editRequest).labelledLog("Error", error).dispatch();
      }
    });
  }
};
_cast = new WeakMap();
_ctx = new WeakMap();
_onNewLocalTracks = new WeakMap();
_getLocalAudioTracks = new WeakSet();
getLocalAudioTracks_fn = function() {
  return __privateGet(this, _ctx).$state.audioTracks();
};
_getRemoteTracks = new WeakSet();
getRemoteTracks_fn = function(type) {
  var _a;
  const tracks = ((_a = __privateGet(this, _cast).mediaInfo) == null ? void 0 : _a.tracks) ?? [];
  return type ? tracks.filter((track) => track.type === type) : tracks;
};
_getRemoteActiveIds = new WeakSet();
getRemoteActiveIds_fn = function() {
  const activeIds = [], activeLocalAudioTrack = __privateMethod(this, _getLocalAudioTracks, getLocalAudioTracks_fn).call(this).find((track) => track.selected), activeLocalTextTracks = this.getLocalTextTracks().filter((track) => track.mode === "showing");
  if (activeLocalAudioTrack) {
    const remoteAudioTracks = __privateMethod(this, _getRemoteTracks, getRemoteTracks_fn).call(this, chrome.cast.media.TrackType.AUDIO), remoteAudioTrack = __privateMethod(this, _findRemoteTrack, findRemoteTrack_fn).call(this, remoteAudioTracks, activeLocalAudioTrack);
    if (remoteAudioTrack)
      activeIds.push(remoteAudioTrack.trackId);
  }
  if (activeLocalTextTracks == null ? void 0 : activeLocalTextTracks.length) {
    const remoteTextTracks = __privateMethod(this, _getRemoteTracks, getRemoteTracks_fn).call(this, chrome.cast.media.TrackType.TEXT);
    if (remoteTextTracks.length) {
      for (const localTrack of activeLocalTextTracks) {
        const remoteTextTrack = __privateMethod(this, _findRemoteTrack, findRemoteTrack_fn).call(this, remoteTextTracks, localTrack);
        if (remoteTextTrack)
          activeIds.push(remoteTextTrack.trackId);
      }
    }
  }
  return activeIds;
};
_syncLocalTracks = new WeakSet();
syncLocalTracks_fn = function() {
  const localTextTracks = this.getLocalTextTracks();
  if (!__privateGet(this, _cast).isMediaLoaded)
    return;
  const remoteTextTracks = __privateMethod(this, _getRemoteTracks, getRemoteTracks_fn).call(this, chrome.cast.media.TrackType.TEXT);
  for (const localTrack of localTextTracks) {
    const hasRemoteTrack = __privateMethod(this, _findRemoteTrack, findRemoteTrack_fn).call(this, remoteTextTracks, localTrack);
    if (!hasRemoteTrack) {
      untrack(() => {
        var _a;
        return (_a = __privateGet(this, _onNewLocalTracks)) == null ? void 0 : _a.call(this);
      });
      break;
    }
  }
};
_editTracksInfo = new WeakSet();
editTracksInfo_fn = function(request) {
  const media = getCastSessionMedia();
  return new Promise((resolve, reject) => media == null ? void 0 : media.editTracksInfo(request, resolve, reject));
};
_findLocalTrack = new WeakSet();
findLocalTrack_fn = function(localTracks, remoteTrack) {
  return localTracks.find((localTrack) => __privateMethod(this, _isMatch, isMatch_fn).call(this, localTrack, remoteTrack));
};
_findRemoteTrack = new WeakSet();
findRemoteTrack_fn = function(remoteTracks, localTrack) {
  return remoteTracks.find((remoteTrack) => __privateMethod(this, _isMatch, isMatch_fn).call(this, localTrack, remoteTrack));
};
_isMatch = new WeakSet();
isMatch_fn = function(localTrack, remoteTrack) {
  return remoteTrack.name === localTrack.label && remoteTrack.language === localTrack.language && remoteTrack.subtype.toLowerCase() === localTrack.kind.toLowerCase();
};
var _player, _ctx2, _tracks, _currentSrc, _state, _currentTime, _played, _seekableRange, _timeRAF, _playerEventHandlers, _reloadInfo, _isIdle, _attachCastContextEventListeners, attachCastContextEventListeners_fn, _attachCastPlayerEventListeners, attachCastPlayerEventListeners_fn, _reset, reset_fn, _resumeSession, resumeSession_fn, _endSession, endSession_fn, _disconnectFromReceiver, disconnectFromReceiver_fn, _onAnimationFrame, onAnimationFrame_fn, _onRemotePlayerEvent, onRemotePlayerEvent_fn, _onCastStateChange, onCastStateChange_fn, _onMediaLoadedChange, onMediaLoadedChange_fn, _onCanControlVolumeChange, onCanControlVolumeChange_fn, _onCanSeekChange, onCanSeekChange_fn, _getStreamType, getStreamType_fn, _onCurrentTimeChange, onCurrentTimeChange_fn, _onDurationChange, onDurationChange_fn, _onVolumeChange, onVolumeChange_fn, _onPausedChange, onPausedChange_fn, _onProgress, onProgress_fn, _onPlayerStateChange, onPlayerStateChange_fn, _getSeekableRange, getSeekableRange_fn, _createEvent, createEvent_fn, _buildMediaInfo, buildMediaInfo_fn, _buildLoadRequest, buildLoadRequest_fn, _reload, reload_fn, _onNewLocalTracks2, onNewLocalTracks_fn;
var GoogleCastProvider = class {
  constructor(player, ctx) {
    __privateAdd(this, _attachCastContextEventListeners);
    __privateAdd(this, _attachCastPlayerEventListeners);
    __privateAdd(this, _reset);
    __privateAdd(this, _resumeSession);
    __privateAdd(this, _endSession);
    __privateAdd(this, _disconnectFromReceiver);
    __privateAdd(this, _onAnimationFrame);
    __privateAdd(this, _onRemotePlayerEvent);
    __privateAdd(this, _onCastStateChange);
    __privateAdd(this, _onMediaLoadedChange);
    __privateAdd(this, _onCanControlVolumeChange);
    __privateAdd(this, _onCanSeekChange);
    __privateAdd(this, _getStreamType);
    __privateAdd(this, _onCurrentTimeChange);
    __privateAdd(this, _onDurationChange);
    __privateAdd(this, _onVolumeChange);
    __privateAdd(this, _onPausedChange);
    __privateAdd(this, _onProgress);
    __privateAdd(this, _onPlayerStateChange);
    __privateAdd(this, _getSeekableRange);
    __privateAdd(this, _createEvent);
    __privateAdd(this, _buildMediaInfo);
    __privateAdd(this, _buildLoadRequest);
    __privateAdd(this, _reload);
    __privateAdd(this, _onNewLocalTracks2);
    __publicField(this, "$$PROVIDER_TYPE", "GOOGLE_CAST");
    __publicField(this, "scope", createScope());
    __privateAdd(this, _player, void 0);
    __privateAdd(this, _ctx2, void 0);
    __privateAdd(this, _tracks, void 0);
    __privateAdd(this, _currentSrc, null);
    __privateAdd(this, _state, "disconnected");
    __privateAdd(this, _currentTime, 0);
    __privateAdd(this, _played, 0);
    __privateAdd(this, _seekableRange, new TimeRange(0, 0));
    __privateAdd(this, _timeRAF, new RAFLoop(__privateMethod(this, _onAnimationFrame, onAnimationFrame_fn).bind(this)));
    __privateAdd(this, _playerEventHandlers, void 0);
    __privateAdd(this, _reloadInfo, null);
    __privateAdd(this, _isIdle, false);
    __privateSet(this, _player, player);
    __privateSet(this, _ctx2, ctx);
    __privateSet(this, _tracks, new GoogleCastTracksManager(player, ctx, __privateMethod(this, _onNewLocalTracks2, onNewLocalTracks_fn).bind(this)));
  }
  get type() {
    return "google-cast";
  }
  get currentSrc() {
    return __privateGet(this, _currentSrc);
  }
  /**
   * The Google Cast remote player.
   *
   * @see {@link https://developers.google.com/cast/docs/reference/web_sender/cast.framework.RemotePlayer}
   */
  get player() {
    return __privateGet(this, _player);
  }
  /**
   * @see {@link https://developers.google.com/cast/docs/reference/web_sender/cast.framework.CastContext}
   */
  get cast() {
    return getCastContext();
  }
  /**
   * @see {@link https://developers.google.com/cast/docs/reference/web_sender/cast.framework.CastSession}
   */
  get session() {
    return getCastSession();
  }
  /**
   * @see {@link https://developers.google.com/cast/docs/reference/web_sender/chrome.cast.media.Media}
   */
  get media() {
    return getCastSessionMedia();
  }
  /**
   * Whether the current Google Cast session belongs to this provider.
   */
  get hasActiveSession() {
    return hasActiveCastSession(__privateGet(this, _currentSrc));
  }
  setup() {
    __privateMethod(this, _attachCastContextEventListeners, attachCastContextEventListeners_fn).call(this);
    __privateMethod(this, _attachCastPlayerEventListeners, attachCastPlayerEventListeners_fn).call(this);
    __privateGet(this, _tracks).setup();
    __privateGet(this, _ctx2).notify("provider-setup", this);
  }
  async play() {
    var _a;
    if (!__privateGet(this, _player).isPaused && !__privateGet(this, _isIdle))
      return;
    if (__privateGet(this, _isIdle)) {
      await __privateMethod(this, _reload, reload_fn).call(this, false, 0);
      return;
    }
    (_a = __privateGet(this, _player).controller) == null ? void 0 : _a.playOrPause();
  }
  async pause() {
    var _a;
    if (__privateGet(this, _player).isPaused)
      return;
    (_a = __privateGet(this, _player).controller) == null ? void 0 : _a.playOrPause();
  }
  getMediaStatus(request) {
    return new Promise((resolve, reject) => {
      var _a;
      (_a = this.media) == null ? void 0 : _a.getStatus(request, resolve, reject);
    });
  }
  setMuted(muted) {
    var _a;
    const hasChanged = muted && !__privateGet(this, _player).isMuted || !muted && __privateGet(this, _player).isMuted;
    if (hasChanged)
      (_a = __privateGet(this, _player).controller) == null ? void 0 : _a.muteOrUnmute();
  }
  setCurrentTime(time) {
    var _a;
    __privateGet(this, _player).currentTime = time;
    __privateGet(this, _ctx2).notify("seeking", time);
    (_a = __privateGet(this, _player).controller) == null ? void 0 : _a.seek();
  }
  setVolume(volume) {
    var _a;
    __privateGet(this, _player).volumeLevel = volume;
    (_a = __privateGet(this, _player).controller) == null ? void 0 : _a.setVolumeLevel();
  }
  async loadSource(src) {
    var _a;
    if (((_a = __privateGet(this, _reloadInfo)) == null ? void 0 : _a.src) !== src)
      __privateSet(this, _reloadInfo, null);
    if (hasActiveCastSession(src)) {
      __privateMethod(this, _resumeSession, resumeSession_fn).call(this);
      __privateSet(this, _currentSrc, src);
      return;
    }
    __privateGet(this, _ctx2).notify("load-start");
    const loadRequest = __privateMethod(this, _buildLoadRequest, buildLoadRequest_fn).call(this, src), errorCode = await this.session.loadMedia(loadRequest);
    if (errorCode) {
      __privateSet(this, _currentSrc, null);
      __privateGet(this, _ctx2).notify("error", Error(getCastErrorMessage(errorCode)));
      return;
    }
    __privateSet(this, _currentSrc, src);
  }
  destroy() {
    __privateMethod(this, _reset, reset_fn).call(this);
    __privateMethod(this, _endSession, endSession_fn).call(this);
  }
};
_player = new WeakMap();
_ctx2 = new WeakMap();
_tracks = new WeakMap();
_currentSrc = new WeakMap();
_state = new WeakMap();
_currentTime = new WeakMap();
_played = new WeakMap();
_seekableRange = new WeakMap();
_timeRAF = new WeakMap();
_playerEventHandlers = new WeakMap();
_reloadInfo = new WeakMap();
_isIdle = new WeakMap();
_attachCastContextEventListeners = new WeakSet();
attachCastContextEventListeners_fn = function() {
  listenCastContextEvent(
    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
    __privateMethod(this, _onCastStateChange, onCastStateChange_fn).bind(this)
  );
};
_attachCastPlayerEventListeners = new WeakSet();
attachCastPlayerEventListeners_fn = function() {
  const Event2 = cast.framework.RemotePlayerEventType, handlers = {
    [Event2.IS_CONNECTED_CHANGED]: __privateMethod(this, _onCastStateChange, onCastStateChange_fn),
    [Event2.IS_MEDIA_LOADED_CHANGED]: __privateMethod(this, _onMediaLoadedChange, onMediaLoadedChange_fn),
    [Event2.CAN_CONTROL_VOLUME_CHANGED]: __privateMethod(this, _onCanControlVolumeChange, onCanControlVolumeChange_fn),
    [Event2.CAN_SEEK_CHANGED]: __privateMethod(this, _onCanSeekChange, onCanSeekChange_fn),
    [Event2.DURATION_CHANGED]: __privateMethod(this, _onDurationChange, onDurationChange_fn),
    [Event2.IS_MUTED_CHANGED]: __privateMethod(this, _onVolumeChange, onVolumeChange_fn),
    [Event2.VOLUME_LEVEL_CHANGED]: __privateMethod(this, _onVolumeChange, onVolumeChange_fn),
    [Event2.IS_PAUSED_CHANGED]: __privateMethod(this, _onPausedChange, onPausedChange_fn),
    [Event2.LIVE_SEEKABLE_RANGE_CHANGED]: __privateMethod(this, _onProgress, onProgress_fn),
    [Event2.PLAYER_STATE_CHANGED]: __privateMethod(this, _onPlayerStateChange, onPlayerStateChange_fn)
  };
  __privateSet(this, _playerEventHandlers, handlers);
  const handler = __privateMethod(this, _onRemotePlayerEvent, onRemotePlayerEvent_fn).bind(this);
  for (const type of keysOf(handlers)) {
    __privateGet(this, _player).controller.addEventListener(type, handler);
  }
  onDispose(() => {
    for (const type of keysOf(handlers)) {
      __privateGet(this, _player).controller.removeEventListener(type, handler);
    }
  });
};
_reset = new WeakSet();
reset_fn = function() {
  if (!__privateGet(this, _reloadInfo)) {
    __privateSet(this, _played, 0);
    __privateSet(this, _seekableRange, new TimeRange(0, 0));
  }
  __privateGet(this, _timeRAF).stop();
  __privateSet(this, _currentTime, 0);
  __privateSet(this, _reloadInfo, null);
};
_resumeSession = new WeakSet();
resumeSession_fn = function() {
  const resumeSessionEvent = new DOMEvent("resume-session", { detail: this.session });
  __privateMethod(this, _onMediaLoadedChange, onMediaLoadedChange_fn).call(this, resumeSessionEvent);
  const { muted, volume, savedState } = __privateGet(this, _ctx2).$state, localState = savedState();
  this.setCurrentTime(Math.max(__privateGet(this, _player).currentTime, (localState == null ? void 0 : localState.currentTime) ?? 0));
  this.setMuted(muted());
  this.setVolume(volume());
  if ((localState == null ? void 0 : localState.paused) === false)
    this.play();
};
_endSession = new WeakSet();
endSession_fn = function() {
  this.cast.endCurrentSession(true);
  const { remotePlaybackLoader } = __privateGet(this, _ctx2).$state;
  remotePlaybackLoader.set(null);
};
_disconnectFromReceiver = new WeakSet();
disconnectFromReceiver_fn = function() {
  const { savedState } = __privateGet(this, _ctx2).$state;
  savedState.set({
    paused: __privateGet(this, _player).isPaused,
    currentTime: __privateGet(this, _player).currentTime
  });
  __privateMethod(this, _endSession, endSession_fn).call(this);
};
_onAnimationFrame = new WeakSet();
onAnimationFrame_fn = function() {
  __privateMethod(this, _onCurrentTimeChange, onCurrentTimeChange_fn).call(this);
};
_onRemotePlayerEvent = new WeakSet();
onRemotePlayerEvent_fn = function(event) {
  __privateGet(this, _playerEventHandlers)[event.type].call(this, event);
};
_onCastStateChange = new WeakSet();
onCastStateChange_fn = function(data) {
  const castState = this.cast.getCastState(), state = castState === cast.framework.CastState.CONNECTED ? "connected" : castState === cast.framework.CastState.CONNECTING ? "connecting" : "disconnected";
  if (__privateGet(this, _state) === state)
    return;
  const detail = { type: "google-cast", state }, trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, data);
  __privateSet(this, _state, state);
  __privateGet(this, _ctx2).notify("remote-playback-change", detail, trigger);
  if (state === "disconnected") {
    __privateMethod(this, _disconnectFromReceiver, disconnectFromReceiver_fn).call(this);
  }
};
_onMediaLoadedChange = new WeakSet();
onMediaLoadedChange_fn = function(event) {
  const hasLoaded = !!__privateGet(this, _player).isMediaLoaded;
  if (!hasLoaded)
    return;
  const src = peek(__privateGet(this, _ctx2).$state.source);
  Promise.resolve().then(() => {
    if (src !== peek(__privateGet(this, _ctx2).$state.source) || !__privateGet(this, _player).isMediaLoaded)
      return;
    __privateMethod(this, _reset, reset_fn).call(this);
    const duration = __privateGet(this, _player).duration;
    __privateSet(this, _seekableRange, new TimeRange(0, duration));
    const detail = {
      provider: this,
      duration,
      buffered: new TimeRange(0, 0),
      seekable: __privateMethod(this, _getSeekableRange, getSeekableRange_fn).call(this)
    }, trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, event);
    __privateGet(this, _ctx2).notify("loaded-metadata", void 0, trigger);
    __privateGet(this, _ctx2).notify("loaded-data", void 0, trigger);
    __privateGet(this, _ctx2).notify("can-play", detail, trigger);
    __privateMethod(this, _onCanControlVolumeChange, onCanControlVolumeChange_fn).call(this);
    __privateMethod(this, _onCanSeekChange, onCanSeekChange_fn).call(this, event);
    const { volume, muted } = __privateGet(this, _ctx2).$state;
    this.setVolume(volume());
    this.setMuted(muted());
    __privateGet(this, _timeRAF).start();
    __privateGet(this, _tracks).syncRemoteTracks(trigger);
    __privateGet(this, _tracks).syncRemoteActiveIds(trigger);
  });
};
_onCanControlVolumeChange = new WeakSet();
onCanControlVolumeChange_fn = function() {
  __privateGet(this, _ctx2).$state.canSetVolume.set(__privateGet(this, _player).canControlVolume);
};
_onCanSeekChange = new WeakSet();
onCanSeekChange_fn = function(event) {
  const trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, event);
  __privateGet(this, _ctx2).notify("stream-type-change", __privateMethod(this, _getStreamType, getStreamType_fn).call(this), trigger);
};
_getStreamType = new WeakSet();
getStreamType_fn = function() {
  var _a;
  const streamType = (_a = __privateGet(this, _player).mediaInfo) == null ? void 0 : _a.streamType;
  return streamType === chrome.cast.media.StreamType.LIVE ? __privateGet(this, _player).canSeek ? "live:dvr" : "live" : "on-demand";
};
_onCurrentTimeChange = new WeakSet();
onCurrentTimeChange_fn = function() {
  if (__privateGet(this, _reloadInfo))
    return;
  const currentTime = __privateGet(this, _player).currentTime;
  if (currentTime === __privateGet(this, _currentTime))
    return;
  __privateGet(this, _ctx2).notify("time-change", currentTime);
  if (currentTime > __privateGet(this, _played)) {
    __privateSet(this, _played, currentTime);
    __privateMethod(this, _onProgress, onProgress_fn).call(this);
  }
  if (__privateGet(this, _ctx2).$state.seeking()) {
    __privateGet(this, _ctx2).notify("seeked", currentTime);
  }
  __privateSet(this, _currentTime, currentTime);
};
_onDurationChange = new WeakSet();
onDurationChange_fn = function(event) {
  if (!__privateGet(this, _player).isMediaLoaded || __privateGet(this, _reloadInfo))
    return;
  const duration = __privateGet(this, _player).duration, trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, event);
  __privateSet(this, _seekableRange, new TimeRange(0, duration));
  __privateGet(this, _ctx2).notify("duration-change", duration, trigger);
};
_onVolumeChange = new WeakSet();
onVolumeChange_fn = function(event) {
  if (!__privateGet(this, _player).isMediaLoaded)
    return;
  const detail = {
    muted: __privateGet(this, _player).isMuted,
    volume: __privateGet(this, _player).volumeLevel
  }, trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, event);
  __privateGet(this, _ctx2).notify("volume-change", detail, trigger);
};
_onPausedChange = new WeakSet();
onPausedChange_fn = function(event) {
  const trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, event);
  if (__privateGet(this, _player).isPaused) {
    __privateGet(this, _ctx2).notify("pause", void 0, trigger);
  } else {
    __privateGet(this, _ctx2).notify("play", void 0, trigger);
  }
};
_onProgress = new WeakSet();
onProgress_fn = function(event) {
  const detail = {
    seekable: __privateMethod(this, _getSeekableRange, getSeekableRange_fn).call(this),
    buffered: new TimeRange(0, __privateGet(this, _played))
  }, trigger = event ? __privateMethod(this, _createEvent, createEvent_fn).call(this, event) : void 0;
  __privateGet(this, _ctx2).notify("progress", detail, trigger);
};
_onPlayerStateChange = new WeakSet();
onPlayerStateChange_fn = function(event) {
  const state = __privateGet(this, _player).playerState, PlayerState = chrome.cast.media.PlayerState;
  __privateSet(this, _isIdle, state === PlayerState.IDLE);
  if (state === PlayerState.PAUSED)
    return;
  const trigger = __privateMethod(this, _createEvent, createEvent_fn).call(this, event);
  switch (state) {
    case PlayerState.PLAYING:
      __privateGet(this, _ctx2).notify("playing", void 0, trigger);
      break;
    case PlayerState.BUFFERING:
      __privateGet(this, _ctx2).notify("waiting", void 0, trigger);
      break;
    case PlayerState.IDLE:
      __privateGet(this, _timeRAF).stop();
      __privateGet(this, _ctx2).notify("pause");
      __privateGet(this, _ctx2).notify("end");
      break;
  }
};
_getSeekableRange = new WeakSet();
getSeekableRange_fn = function() {
  return __privateGet(this, _player).liveSeekableRange ? new TimeRange(__privateGet(this, _player).liveSeekableRange.start, __privateGet(this, _player).liveSeekableRange.end) : __privateGet(this, _seekableRange);
};
_createEvent = new WeakSet();
createEvent_fn = function(detail) {
  return detail instanceof Event ? detail : new DOMEvent(detail.type, { detail });
};
_buildMediaInfo = new WeakSet();
buildMediaInfo_fn = function(src) {
  const { streamType, title, poster } = __privateGet(this, _ctx2).$state;
  return new GoogleCastMediaInfoBuilder(src).setMetadata(title(), poster()).setStreamType(streamType()).setTracks(__privateGet(this, _tracks).getLocalTextTracks()).build();
};
_buildLoadRequest = new WeakSet();
buildLoadRequest_fn = function(src) {
  var _a, _b;
  const mediaInfo = __privateMethod(this, _buildMediaInfo, buildMediaInfo_fn).call(this, src), request = new chrome.cast.media.LoadRequest(mediaInfo), savedState = __privateGet(this, _ctx2).$state.savedState();
  request.autoplay = (((_a = __privateGet(this, _reloadInfo)) == null ? void 0 : _a.paused) ?? (savedState == null ? void 0 : savedState.paused)) === false;
  request.currentTime = ((_b = __privateGet(this, _reloadInfo)) == null ? void 0 : _b.time) ?? (savedState == null ? void 0 : savedState.currentTime) ?? 0;
  return request;
};
_reload = new WeakSet();
reload_fn = async function(paused, time) {
  const src = peek(__privateGet(this, _ctx2).$state.source);
  __privateSet(this, _reloadInfo, { src, paused, time });
  await this.loadSource(src);
};
_onNewLocalTracks2 = new WeakSet();
onNewLocalTracks_fn = function() {
  __privateMethod(this, _reload, reload_fn).call(this, __privateGet(this, _player).isPaused, __privateGet(this, _player).currentTime).catch((error) => {
    var _a;
    {
      (_a = __privateGet(this, _ctx2).logger) == null ? void 0 : _a.errorGroup("[vidstack] cast failed to load new local tracks").labelledLog("Error", error).dispatch();
    }
  });
};
export {
  GoogleCastProvider
};
//# sourceMappingURL=vidstack-google-cast-GJ37NAVK.js.map
