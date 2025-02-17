import {
  coerceToError
} from "./chunk-NQV4QZM3.js";
import {
  QualitySymbol
} from "./chunk-2WGAKHRH.js";
import {
  VideoProvider
} from "./chunk-NU4KQMTP.js";
import {
  TextTrack,
  TextTrackSymbol
} from "./chunk-EBRHQEUP.js";
import {
  loadScript,
  preconnect
} from "./chunk-YNKQJVIZ.js";
import "./chunk-OSWRSLMA.js";
import {
  RAFLoop
} from "./chunk-U2LFAP4F.js";
import "./chunk-JLFET46Z.js";
import {
  ListSymbol
} from "./chunk-OPWJPTWG.js";
import {
  IS_CHROME,
  canPlayAudioType,
  canPlayVideoType,
  isDASHSupported
} from "./chunk-K2JGPOHG.js";
import {
  DOMEvent,
  camelToKebabCase,
  effect,
  isFunction,
  isNumber,
  isString,
  isUndefined,
  listenEvent,
  peek
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/providers/vidstack-dash.js
function getLangName(langCode) {
  try {
    const displayNames = new Intl.DisplayNames(navigator.languages, { type: "language" });
    const languageName = displayNames.of(langCode);
    return languageName ?? null;
  } catch (err) {
    return null;
  }
}
var toDOMEventType = (type) => `dash-${camelToKebabCase(type)}`;
var _video, _ctx, _instance, _callbacks, _stopLiveSync, _createDOMEvent, createDOMEvent_fn, _liveSync, liveSync_fn, _liveSyncPosition, liveSyncPosition_fn, _dispatchDASHEvent, dispatchDASHEvent_fn, _currentTrack, _cueTracker, _onTextFragmentLoaded, onTextFragmentLoaded_fn, _onTextTracksAdded, onTextTracksAdded_fn, _onTrackChange, onTrackChange_fn, _onQualityChange, onQualityChange_fn, _onManifestLoaded, onManifestLoaded_fn, _onError, onError_fn, _onFragmentLoadStart, onFragmentLoadStart_fn, _onFragmentLoadComplete, onFragmentLoadComplete_fn, _retryLoadingTimer, _onNetworkError, onNetworkError_fn, _clearRetryTimer, clearRetryTimer_fn, _onFatalError, onFatalError_fn, _enableAutoQuality, enableAutoQuality_fn, _switchAutoBitrate, switchAutoBitrate_fn, _onUserQualityChange, onUserQualityChange_fn, _onUserAudioChange, onUserAudioChange_fn, _reset, reset_fn;
var DASHController = class {
  constructor(video, ctx) {
    __privateAdd(this, _createDOMEvent);
    __privateAdd(this, _liveSync);
    __privateAdd(this, _liveSyncPosition);
    __privateAdd(this, _dispatchDASHEvent);
    __privateAdd(this, _onTextFragmentLoaded);
    __privateAdd(this, _onTextTracksAdded);
    __privateAdd(this, _onTrackChange);
    __privateAdd(this, _onQualityChange);
    __privateAdd(this, _onManifestLoaded);
    __privateAdd(this, _onError);
    __privateAdd(this, _onFragmentLoadStart);
    __privateAdd(this, _onFragmentLoadComplete);
    __privateAdd(this, _onNetworkError);
    __privateAdd(this, _clearRetryTimer);
    __privateAdd(this, _onFatalError);
    __privateAdd(this, _enableAutoQuality);
    __privateAdd(this, _switchAutoBitrate);
    __privateAdd(this, _onUserQualityChange);
    __privateAdd(this, _onUserAudioChange);
    __privateAdd(this, _reset);
    __privateAdd(this, _video, void 0);
    __privateAdd(this, _ctx, void 0);
    __privateAdd(this, _instance, null);
    __privateAdd(this, _callbacks, /* @__PURE__ */ new Set());
    __privateAdd(this, _stopLiveSync, null);
    __publicField(this, "config", {});
    __privateAdd(this, _currentTrack, null);
    __privateAdd(this, _cueTracker, {});
    __privateAdd(this, _retryLoadingTimer, -1);
    __privateSet(this, _video, video);
    __privateSet(this, _ctx, ctx);
  }
  get instance() {
    return __privateGet(this, _instance);
  }
  setup(ctor) {
    __privateSet(this, _instance, ctor().create());
    const dispatcher = __privateMethod(this, _dispatchDASHEvent, dispatchDASHEvent_fn).bind(this);
    for (const event of Object.values(ctor.events))
      __privateGet(this, _instance).on(event, dispatcher);
    __privateGet(this, _instance).on(ctor.events.ERROR, __privateMethod(this, _onError, onError_fn).bind(this));
    for (const callback of __privateGet(this, _callbacks))
      callback(__privateGet(this, _instance));
    __privateGet(this, _ctx).player.dispatch("dash-instance", {
      detail: __privateGet(this, _instance)
    });
    __privateGet(this, _instance).initialize(__privateGet(this, _video), void 0, false);
    __privateGet(this, _instance).updateSettings({
      streaming: {
        text: {
          // Disabling text rendering by dash.
          defaultEnabled: false,
          dispatchForManualRendering: true
        },
        buffer: {
          /// Enables buffer replacement when switching bitrates for faster switching.
          fastSwitchEnabled: true
        }
      },
      ...this.config
    });
    __privateGet(this, _instance).on(ctor.events.FRAGMENT_LOADING_STARTED, __privateMethod(this, _onFragmentLoadStart, onFragmentLoadStart_fn).bind(this));
    __privateGet(this, _instance).on(
      ctor.events.FRAGMENT_LOADING_COMPLETED,
      __privateMethod(this, _onFragmentLoadComplete, onFragmentLoadComplete_fn).bind(this)
    );
    __privateGet(this, _instance).on(ctor.events.MANIFEST_LOADED, __privateMethod(this, _onManifestLoaded, onManifestLoaded_fn).bind(this));
    __privateGet(this, _instance).on(ctor.events.QUALITY_CHANGE_RENDERED, __privateMethod(this, _onQualityChange, onQualityChange_fn).bind(this));
    __privateGet(this, _instance).on(ctor.events.TEXT_TRACKS_ADDED, __privateMethod(this, _onTextTracksAdded, onTextTracksAdded_fn).bind(this));
    __privateGet(this, _instance).on(ctor.events.TRACK_CHANGE_RENDERED, __privateMethod(this, _onTrackChange, onTrackChange_fn).bind(this));
    __privateGet(this, _ctx).qualities[QualitySymbol.enableAuto] = __privateMethod(this, _enableAutoQuality, enableAutoQuality_fn).bind(this);
    listenEvent(__privateGet(this, _ctx).qualities, "change", __privateMethod(this, _onUserQualityChange, onUserQualityChange_fn).bind(this));
    listenEvent(__privateGet(this, _ctx).audioTracks, "change", __privateMethod(this, _onUserAudioChange, onUserAudioChange_fn).bind(this));
    __privateSet(this, _stopLiveSync, effect(__privateMethod(this, _liveSync, liveSync_fn).bind(this)));
  }
  onInstance(callback) {
    __privateGet(this, _callbacks).add(callback);
    return () => __privateGet(this, _callbacks).delete(callback);
  }
  loadSource(src) {
    var _a;
    __privateMethod(this, _reset, reset_fn).call(this);
    if (!isString(src.src))
      return;
    (_a = __privateGet(this, _instance)) == null ? void 0 : _a.attachSource(src.src);
  }
  destroy() {
    var _a, _b, _c, _d;
    __privateMethod(this, _reset, reset_fn).call(this);
    (_a = __privateGet(this, _instance)) == null ? void 0 : _a.destroy();
    __privateSet(this, _instance, null);
    (_b = __privateGet(this, _stopLiveSync)) == null ? void 0 : _b.call(this);
    __privateSet(this, _stopLiveSync, null);
    (_d = (_c = __privateGet(this, _ctx)) == null ? void 0 : _c.logger) == null ? void 0 : _d.info("🏗️ Destroyed DASH instance");
  }
};
_video = new WeakMap();
_ctx = new WeakMap();
_instance = new WeakMap();
_callbacks = new WeakMap();
_stopLiveSync = new WeakMap();
_createDOMEvent = new WeakSet();
createDOMEvent_fn = function(event) {
  return new DOMEvent(toDOMEventType(event.type), { detail: event });
};
_liveSync = new WeakSet();
liveSync_fn = function() {
  if (!__privateGet(this, _ctx).$state.live())
    return;
  const raf = new RAFLoop(__privateMethod(this, _liveSyncPosition, liveSyncPosition_fn).bind(this));
  raf.start();
  return raf.stop.bind(raf);
};
_liveSyncPosition = new WeakSet();
liveSyncPosition_fn = function() {
  if (!__privateGet(this, _instance))
    return;
  const position = __privateGet(this, _instance).duration() - __privateGet(this, _instance).time();
  __privateGet(this, _ctx).$state.liveSyncPosition.set(!isNaN(position) ? position : Infinity);
};
_dispatchDASHEvent = new WeakSet();
dispatchDASHEvent_fn = function(event) {
  var _a;
  (_a = __privateGet(this, _ctx).player) == null ? void 0 : _a.dispatch(__privateMethod(this, _createDOMEvent, createDOMEvent_fn).call(this, event));
};
_currentTrack = new WeakMap();
_cueTracker = new WeakMap();
_onTextFragmentLoaded = new WeakSet();
onTextFragmentLoaded_fn = function(event) {
  var _a;
  const native = (_a = __privateGet(this, _currentTrack)) == null ? void 0 : _a[TextTrackSymbol.native], cues = (native == null ? void 0 : native.track).cues;
  if (!native || !cues)
    return;
  const id = __privateGet(this, _currentTrack).id, startIndex = __privateGet(this, _cueTracker)[id] ?? 0, trigger = __privateMethod(this, _createDOMEvent, createDOMEvent_fn).call(this, event);
  for (let i = startIndex; i < cues.length; i++) {
    const cue = cues[i];
    if (!cue.positionAlign)
      cue.positionAlign = "auto";
    __privateGet(this, _currentTrack).addCue(cue, trigger);
  }
  __privateGet(this, _cueTracker)[id] = cues.length;
};
_onTextTracksAdded = new WeakSet();
onTextTracksAdded_fn = function(event) {
  var _a;
  if (!__privateGet(this, _instance))
    return;
  const data = event.tracks, nativeTextTracks = [...__privateGet(this, _video).textTracks].filter((track) => "manualMode" in track), trigger = __privateMethod(this, _createDOMEvent, createDOMEvent_fn).call(this, event);
  for (let i = 0; i < nativeTextTracks.length; i++) {
    const textTrackInfo = data[i], nativeTextTrack = nativeTextTracks[i];
    const id = `dash-${textTrackInfo.kind}-${i}`, track = new TextTrack({
      id,
      label: (textTrackInfo == null ? void 0 : textTrackInfo.label) ?? ((_a = textTrackInfo.labels.find((t) => t.text)) == null ? void 0 : _a.text) ?? ((textTrackInfo == null ? void 0 : textTrackInfo.lang) && getLangName(textTrackInfo.lang)) ?? (textTrackInfo == null ? void 0 : textTrackInfo.lang) ?? void 0,
      language: textTrackInfo.lang ?? void 0,
      kind: textTrackInfo.kind,
      default: textTrackInfo.defaultTrack
    });
    track[TextTrackSymbol.native] = {
      managed: true,
      track: nativeTextTrack
    };
    track[TextTrackSymbol.readyState] = 2;
    track[TextTrackSymbol.onModeChange] = () => {
      if (!__privateGet(this, _instance))
        return;
      if (track.mode === "showing") {
        __privateGet(this, _instance).setTextTrack(i);
        __privateSet(this, _currentTrack, track);
      } else {
        __privateGet(this, _instance).setTextTrack(-1);
        __privateSet(this, _currentTrack, null);
      }
    };
    __privateGet(this, _ctx).textTracks.add(track, trigger);
  }
};
_onTrackChange = new WeakSet();
onTrackChange_fn = function(event) {
  const { mediaType, newMediaInfo } = event;
  if (mediaType === "audio") {
    const track = __privateGet(this, _ctx).audioTracks.getById(`dash-audio-${newMediaInfo.index}`);
    if (track) {
      const trigger = __privateMethod(this, _createDOMEvent, createDOMEvent_fn).call(this, event);
      __privateGet(this, _ctx).audioTracks[ListSymbol.select](track, true, trigger);
    }
  }
};
_onQualityChange = new WeakSet();
onQualityChange_fn = function(event) {
  if (event.mediaType !== "video")
    return;
  const quality = __privateGet(this, _ctx).qualities[event.newQuality];
  if (quality) {
    const trigger = __privateMethod(this, _createDOMEvent, createDOMEvent_fn).call(this, event);
    __privateGet(this, _ctx).qualities[ListSymbol.select](quality, true, trigger);
  }
};
_onManifestLoaded = new WeakSet();
onManifestLoaded_fn = function(event) {
  if (__privateGet(this, _ctx).$state.canPlay() || !__privateGet(this, _instance))
    return;
  const { type, mediaPresentationDuration } = event.data, trigger = __privateMethod(this, _createDOMEvent, createDOMEvent_fn).call(this, event);
  __privateGet(this, _ctx).notify("stream-type-change", type !== "static" ? "live" : "on-demand", trigger);
  __privateGet(this, _ctx).notify("duration-change", mediaPresentationDuration, trigger);
  __privateGet(this, _ctx).qualities[QualitySymbol.setAuto](true, trigger);
  const media = __privateGet(this, _instance).getVideoElement();
  const videoQualities = __privateGet(this, _instance).getTracksForTypeFromManifest(
    "video",
    event.data
  );
  const supportedVideoMimeType = [...new Set(videoQualities.map((e) => e.mimeType))].find(
    (type2) => type2 && canPlayVideoType(media, type2)
  );
  const videoQuality = videoQualities.filter(
    (track) => supportedVideoMimeType === track.mimeType
  )[0];
  let audioTracks = __privateGet(this, _instance).getTracksForTypeFromManifest(
    "audio",
    event.data
  );
  const supportedAudioMimeType = [...new Set(audioTracks.map((e) => e.mimeType))].find(
    (type2) => type2 && canPlayAudioType(media, type2)
  );
  audioTracks = audioTracks.filter((track) => supportedAudioMimeType === track.mimeType);
  videoQuality.bitrateList.forEach((bitrate, index) => {
    var _a;
    const quality = {
      id: ((_a = bitrate.id) == null ? void 0 : _a.toString()) ?? `dash-bitrate-${index}`,
      width: bitrate.width ?? 0,
      height: bitrate.height ?? 0,
      bitrate: bitrate.bandwidth ?? 0,
      codec: videoQuality.codec,
      index
    };
    __privateGet(this, _ctx).qualities[ListSymbol.add](quality, trigger);
  });
  if (isNumber(videoQuality.index)) {
    const quality = __privateGet(this, _ctx).qualities[videoQuality.index];
    if (quality)
      __privateGet(this, _ctx).qualities[ListSymbol.select](quality, true, trigger);
  }
  audioTracks.forEach((audioTrack, index) => {
    const matchingLabel = audioTrack.labels.find((label2) => {
      return navigator.languages.some((language) => {
        return label2.lang && language.toLowerCase().startsWith(label2.lang.toLowerCase());
      });
    });
    const label = matchingLabel || audioTrack.labels[0];
    const localTrack = {
      id: `dash-audio-${audioTrack == null ? void 0 : audioTrack.index}`,
      label: (label == null ? void 0 : label.text) ?? (audioTrack.lang && getLangName(audioTrack.lang)) ?? audioTrack.lang ?? "",
      language: audioTrack.lang ?? "",
      kind: "main",
      mimeType: audioTrack.mimeType,
      codec: audioTrack.codec,
      index
    };
    __privateGet(this, _ctx).audioTracks[ListSymbol.add](localTrack, trigger);
  });
  media.dispatchEvent(new DOMEvent("canplay", { trigger }));
};
_onError = new WeakSet();
onError_fn = function(event) {
  var _a;
  const { type: eventType, error: data } = event;
  {
    (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.errorGroup(`[vidstack] DASH error \`${data.message}\``).labelledLog("Media Element", __privateGet(this, _video)).labelledLog("DASH Instance", __privateGet(this, _instance)).labelledLog("Event Type", eventType).labelledLog("Data", data).labelledLog("Src", peek(__privateGet(this, _ctx).$state.source)).labelledLog("Media Store", { ...__privateGet(this, _ctx).$state }).dispatch();
  }
  switch (data.code) {
    case 27:
      __privateMethod(this, _onNetworkError, onNetworkError_fn).call(this, data);
      break;
    default:
      __privateMethod(this, _onFatalError, onFatalError_fn).call(this, data);
      break;
  }
};
_onFragmentLoadStart = new WeakSet();
onFragmentLoadStart_fn = function() {
  if (__privateGet(this, _retryLoadingTimer) >= 0)
    __privateMethod(this, _clearRetryTimer, clearRetryTimer_fn).call(this);
};
_onFragmentLoadComplete = new WeakSet();
onFragmentLoadComplete_fn = function(event) {
  const mediaType = event.mediaType;
  if (mediaType === "text") {
    requestAnimationFrame(__privateMethod(this, _onTextFragmentLoaded, onTextFragmentLoaded_fn).bind(this, event));
  }
};
_retryLoadingTimer = new WeakMap();
_onNetworkError = new WeakSet();
onNetworkError_fn = function(error) {
  var _a;
  __privateMethod(this, _clearRetryTimer, clearRetryTimer_fn).call(this);
  (_a = __privateGet(this, _instance)) == null ? void 0 : _a.play();
  __privateSet(this, _retryLoadingTimer, window.setTimeout(() => {
    __privateSet(this, _retryLoadingTimer, -1);
    __privateMethod(this, _onFatalError, onFatalError_fn).call(this, error);
  }, 5e3));
};
_clearRetryTimer = new WeakSet();
clearRetryTimer_fn = function() {
  clearTimeout(__privateGet(this, _retryLoadingTimer));
  __privateSet(this, _retryLoadingTimer, -1);
};
_onFatalError = new WeakSet();
onFatalError_fn = function(error) {
  __privateGet(this, _ctx).notify("error", {
    message: error.message ?? "",
    code: 1,
    error
  });
};
_enableAutoQuality = new WeakSet();
enableAutoQuality_fn = function() {
  var _a;
  __privateMethod(this, _switchAutoBitrate, switchAutoBitrate_fn).call(this, "video", true);
  const { qualities } = __privateGet(this, _ctx);
  (_a = __privateGet(this, _instance)) == null ? void 0 : _a.setQualityFor("video", qualities.selectedIndex, true);
};
_switchAutoBitrate = new WeakSet();
switchAutoBitrate_fn = function(type, auto) {
  var _a;
  (_a = __privateGet(this, _instance)) == null ? void 0 : _a.updateSettings({
    streaming: { abr: { autoSwitchBitrate: { [type]: auto } } }
  });
};
_onUserQualityChange = new WeakSet();
onUserQualityChange_fn = function() {
  const { qualities } = __privateGet(this, _ctx);
  if (!__privateGet(this, _instance) || qualities.auto || !qualities.selected)
    return;
  __privateMethod(this, _switchAutoBitrate, switchAutoBitrate_fn).call(this, "video", false);
  __privateGet(this, _instance).setQualityFor("video", qualities.selectedIndex, qualities.switch === "current");
  if (IS_CHROME) {
    __privateGet(this, _video).currentTime = __privateGet(this, _video).currentTime;
  }
};
_onUserAudioChange = new WeakSet();
onUserAudioChange_fn = function() {
  if (!__privateGet(this, _instance))
    return;
  const { audioTracks } = __privateGet(this, _ctx), selectedTrack = __privateGet(this, _instance).getTracksFor("audio").find(
    (track) => audioTracks.selected && audioTracks.selected.id === `dash-audio-${track.index}`
  );
  if (selectedTrack)
    __privateGet(this, _instance).setCurrentTrack(selectedTrack);
};
_reset = new WeakSet();
reset_fn = function() {
  __privateMethod(this, _clearRetryTimer, clearRetryTimer_fn).call(this);
  __privateSet(this, _currentTrack, null);
  __privateSet(this, _cueTracker, {});
};
var _lib, _ctx2, _callback, _startLoading, startLoading_fn, _onLoadStart, onLoadStart_fn, _onLoaded, onLoaded_fn, _onLoadError, onLoadError_fn;
var DASHLibLoader = class {
  constructor(lib, ctx, callback) {
    __privateAdd(this, _startLoading);
    __privateAdd(this, _onLoadStart);
    __privateAdd(this, _onLoaded);
    __privateAdd(this, _onLoadError);
    __privateAdd(this, _lib, void 0);
    __privateAdd(this, _ctx2, void 0);
    __privateAdd(this, _callback, void 0);
    __privateSet(this, _lib, lib);
    __privateSet(this, _ctx2, ctx);
    __privateSet(this, _callback, callback);
    __privateMethod(this, _startLoading, startLoading_fn).call(this);
  }
};
_lib = new WeakMap();
_ctx2 = new WeakMap();
_callback = new WeakMap();
_startLoading = new WeakSet();
startLoading_fn = async function() {
  var _a, _b;
  (_a = __privateGet(this, _ctx2).logger) == null ? void 0 : _a.info("🏗️ Loading DASH Library");
  const callbacks = {
    onLoadStart: __privateMethod(this, _onLoadStart, onLoadStart_fn).bind(this),
    onLoaded: __privateMethod(this, _onLoaded, onLoaded_fn).bind(this),
    onLoadError: __privateMethod(this, _onLoadError, onLoadError_fn).bind(this)
  };
  let ctor = await loadDASHScript(__privateGet(this, _lib), callbacks);
  if (isUndefined(ctor) && !isString(__privateGet(this, _lib)))
    ctor = await importDASH(__privateGet(this, _lib), callbacks);
  if (!ctor)
    return null;
  if (!window.dashjs.supportsMediaSource()) {
    const message = "[vidstack] `dash.js` is not supported in this environment";
    (_b = __privateGet(this, _ctx2).logger) == null ? void 0 : _b.error(message);
    __privateGet(this, _ctx2).player.dispatch(new DOMEvent("dash-unsupported"));
    __privateGet(this, _ctx2).notify("error", { message, code: 4 });
    return null;
  }
  return ctor;
};
_onLoadStart = new WeakSet();
onLoadStart_fn = function() {
  var _a;
  {
    (_a = __privateGet(this, _ctx2).logger) == null ? void 0 : _a.infoGroup("Starting to load `dash.js`").labelledLog("URL", __privateGet(this, _lib)).dispatch();
  }
  __privateGet(this, _ctx2).player.dispatch(new DOMEvent("dash-lib-load-start"));
};
_onLoaded = new WeakSet();
onLoaded_fn = function(ctor) {
  var _a;
  {
    (_a = __privateGet(this, _ctx2).logger) == null ? void 0 : _a.infoGroup("Loaded `dash.js`").labelledLog("Library", __privateGet(this, _lib)).labelledLog("Constructor", ctor).dispatch();
  }
  __privateGet(this, _ctx2).player.dispatch(
    new DOMEvent("dash-lib-loaded", {
      detail: ctor
    })
  );
  __privateGet(this, _callback).call(this, ctor);
};
_onLoadError = new WeakSet();
onLoadError_fn = function(e) {
  var _a;
  const error = coerceToError(e);
  {
    (_a = __privateGet(this, _ctx2).logger) == null ? void 0 : _a.errorGroup("[vidstack] Failed to load `dash.js`").labelledLog("Library", __privateGet(this, _lib)).labelledLog("Error", e).dispatch();
  }
  __privateGet(this, _ctx2).player.dispatch(
    new DOMEvent("dash-lib-load-error", {
      detail: error
    })
  );
  __privateGet(this, _ctx2).notify("error", {
    message: error.message,
    code: 4,
    error
  });
};
async function importDASH(loader, callbacks = {}) {
  var _a, _b, _c, _d, _e, _f, _g;
  if (isUndefined(loader))
    return void 0;
  (_a = callbacks.onLoadStart) == null ? void 0 : _a.call(callbacks);
  if (isDASHConstructor(loader)) {
    (_b = callbacks.onLoaded) == null ? void 0 : _b.call(callbacks, loader);
    return loader;
  }
  if (isDASHNamespace(loader)) {
    const ctor = loader.MediaPlayer;
    (_c = callbacks.onLoaded) == null ? void 0 : _c.call(callbacks, ctor);
    return ctor;
  }
  try {
    const ctor = (_d = await loader()) == null ? void 0 : _d.default;
    if (isDASHNamespace(ctor)) {
      (_e = callbacks.onLoaded) == null ? void 0 : _e.call(callbacks, ctor.MediaPlayer);
      return ctor.MediaPlayer;
    }
    if (ctor) {
      (_f = callbacks.onLoaded) == null ? void 0 : _f.call(callbacks, ctor);
    } else {
      throw Error(
        true ? "[vidstack] failed importing `dash.js`. Dynamic import returned invalid object." : ""
      );
    }
    return ctor;
  } catch (err) {
    (_g = callbacks.onLoadError) == null ? void 0 : _g.call(callbacks, err);
  }
  return void 0;
}
async function loadDASHScript(src, callbacks = {}) {
  var _a, _b, _c;
  if (!isString(src))
    return void 0;
  (_a = callbacks.onLoadStart) == null ? void 0 : _a.call(callbacks);
  try {
    await loadScript(src);
    if (!isFunction(window.dashjs.MediaPlayer)) {
      throw Error(
        true ? "[vidstack] failed loading `dash.js`. Could not find a valid `Dash` constructor on window" : ""
      );
    }
    const ctor = window.dashjs.MediaPlayer;
    (_b = callbacks.onLoaded) == null ? void 0 : _b.call(callbacks, ctor);
    return ctor;
  } catch (err) {
    (_c = callbacks.onLoadError) == null ? void 0 : _c.call(callbacks, err);
  }
  return void 0;
}
function isDASHConstructor(value) {
  return value && value.prototype && value.prototype !== Function;
}
function isDASHNamespace(value) {
  return value && "MediaPlayer" in value;
}
var JS_DELIVR_CDN = "https://cdn.jsdelivr.net";
var _ctor, _controller, _library;
var DASHProvider = class extends VideoProvider {
  constructor() {
    super(...arguments);
    __publicField(this, "$$PROVIDER_TYPE", "DASH");
    __privateAdd(this, _ctor, null);
    __privateAdd(this, _controller, new DASHController(this.video, this.ctx));
    __privateAdd(this, _library, `${JS_DELIVR_CDN}/npm/dashjs@4.7.4/dist/dash${".all.debug.js"}`);
  }
  /**
   * The `dash.js` constructor.
   */
  get ctor() {
    return __privateGet(this, _ctor);
  }
  /**
   * The current `dash.js` instance.
   */
  get instance() {
    return __privateGet(this, _controller).instance;
  }
  get type() {
    return "dash";
  }
  get canLiveSync() {
    return true;
  }
  /**
   * The `dash.js` configuration object.
   *
   * @see {@link https://cdn.dashjs.org/latest/jsdoc/module-Settings.html}
   */
  get config() {
    return __privateGet(this, _controller).config;
  }
  set config(config) {
    __privateGet(this, _controller).config = config;
  }
  /**
   * The `dash.js` constructor (supports dynamic imports) or a URL of where it can be found.
   *
   * @defaultValue `https://cdn.jsdelivr.net/npm/dashjs@4.7.4/dist/dash.all.min.js`
   */
  get library() {
    return __privateGet(this, _library);
  }
  set library(library) {
    __privateSet(this, _library, library);
  }
  preconnect() {
    if (!isString(__privateGet(this, _library)))
      return;
    preconnect(__privateGet(this, _library));
  }
  setup() {
    super.setup();
    new DASHLibLoader(__privateGet(this, _library), this.ctx, (ctor) => {
      __privateSet(this, _ctor, ctor);
      __privateGet(this, _controller).setup(ctor);
      this.ctx.notify("provider-setup", this);
      const src = peek(this.ctx.$state.source);
      if (src)
        this.loadSource(src);
    });
  }
  async loadSource(src, preload) {
    if (!isString(src.src)) {
      this.removeSource();
      return;
    }
    this.media.preload = preload || "";
    this.appendSource(src, "application/x-mpegurl");
    __privateGet(this, _controller).loadSource(src);
    this.currentSrc = src;
  }
  /**
   * The given callback is invoked when a new `dash.js` instance is created and right before it's
   * attached to media.
   */
  onInstance(callback) {
    const instance = __privateGet(this, _controller).instance;
    if (instance)
      callback(instance);
    return __privateGet(this, _controller).onInstance(callback);
  }
  destroy() {
    __privateGet(this, _controller).destroy();
  }
};
_ctor = new WeakMap();
_controller = new WeakMap();
_library = new WeakMap();
/**
 * Whether `dash.js` is supported in this environment.
 */
__publicField(DASHProvider, "supported", isDASHSupported());
export {
  DASHProvider
};
//# sourceMappingURL=vidstack-dash-7VNLNSUJ.js.map
