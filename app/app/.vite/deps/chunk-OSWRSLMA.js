import {
  RAFLoop
} from "./chunk-U2LFAP4F.js";
import {
  getNumberOfDecimalPlaces
} from "./chunk-JLFET46Z.js";
import {
  ListSymbol
} from "./chunk-OPWJPTWG.js";
import {
  IS_IOS,
  IS_SAFARI,
  isHLSSrc,
  isMediaStream
} from "./chunk-K2JGPOHG.js";
import {
  DOMEvent,
  EventsController,
  createScope,
  effect,
  isNil,
  isString,
  listenEvent,
  onDispose,
  peek,
  setAttribute,
  signal
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/providers/vidstack-html.js
var audioContext = null;
var gainNodes = [];
var elAudioSources = [];
function getOrCreateAudioCtx() {
  return audioContext ?? (audioContext = new AudioContext());
}
function createGainNode() {
  const audioCtx = getOrCreateAudioCtx(), gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);
  gainNodes.push(gainNode);
  return gainNode;
}
function createElementSource(el, gainNode) {
  const audioCtx = getOrCreateAudioCtx(), src = audioCtx.createMediaElementSource(el);
  if (gainNode) {
    src.connect(gainNode);
  }
  elAudioSources.push(src);
  return src;
}
function destroyGainNode(node) {
  const idx = gainNodes.indexOf(node);
  if (idx !== -1) {
    gainNodes.splice(idx, 1);
    node.disconnect();
    freeAudioCtxWhenAllResourcesFreed();
  }
}
function destroyElementSource(src) {
  const idx = elAudioSources.indexOf(src);
  if (idx !== -1) {
    elAudioSources.splice(idx, 1);
    src.disconnect();
    freeAudioCtxWhenAllResourcesFreed();
  }
}
function freeAudioCtxWhenAllResourcesFreed() {
  if (audioContext && gainNodes.length === 0 && elAudioSources.length === 0) {
    audioContext.close().then(() => {
      audioContext = null;
    });
  }
}
var _media, _onChange, _gainNode, _srcAudioNode, _destroySrcNode, destroySrcNode_fn, _destroyGainNode, destroyGainNode_fn;
var AudioGain = class {
  constructor(media, onChange) {
    __privateAdd(this, _destroySrcNode);
    __privateAdd(this, _destroyGainNode);
    __privateAdd(this, _media, void 0);
    __privateAdd(this, _onChange, void 0);
    __privateAdd(this, _gainNode, null);
    __privateAdd(this, _srcAudioNode, null);
    __privateSet(this, _media, media);
    __privateSet(this, _onChange, onChange);
  }
  get currentGain() {
    var _a, _b;
    return ((_b = (_a = __privateGet(this, _gainNode)) == null ? void 0 : _a.gain) == null ? void 0 : _b.value) ?? null;
  }
  get supported() {
    return true;
  }
  setGain(gain) {
    const currGain = this.currentGain;
    if (gain === this.currentGain) {
      return;
    }
    if (gain === 1 && currGain !== 1) {
      this.removeGain();
      return;
    }
    if (!__privateGet(this, _gainNode)) {
      __privateSet(this, _gainNode, createGainNode());
      if (__privateGet(this, _srcAudioNode)) {
        __privateGet(this, _srcAudioNode).connect(__privateGet(this, _gainNode));
      }
    }
    if (!__privateGet(this, _srcAudioNode)) {
      __privateSet(this, _srcAudioNode, createElementSource(__privateGet(this, _media), __privateGet(this, _gainNode)));
    }
    __privateGet(this, _gainNode).gain.value = gain;
    __privateGet(this, _onChange).call(this, gain);
  }
  removeGain() {
    if (!__privateGet(this, _gainNode))
      return;
    if (__privateGet(this, _srcAudioNode)) {
      __privateGet(this, _srcAudioNode).connect(getOrCreateAudioCtx().destination);
    }
    __privateMethod(this, _destroyGainNode, destroyGainNode_fn).call(this);
    __privateGet(this, _onChange).call(this, null);
  }
  destroy() {
    __privateMethod(this, _destroySrcNode, destroySrcNode_fn).call(this);
    __privateMethod(this, _destroyGainNode, destroyGainNode_fn).call(this);
  }
};
_media = new WeakMap();
_onChange = new WeakMap();
_gainNode = new WeakMap();
_srcAudioNode = new WeakMap();
_destroySrcNode = new WeakSet();
destroySrcNode_fn = function() {
  if (!__privateGet(this, _srcAudioNode))
    return;
  try {
    destroyElementSource(__privateGet(this, _srcAudioNode));
  } catch (e) {
  } finally {
    __privateSet(this, _srcAudioNode, null);
  }
};
_destroyGainNode = new WeakSet();
destroyGainNode_fn = function() {
  if (!__privateGet(this, _gainNode))
    return;
  try {
    destroyGainNode(__privateGet(this, _gainNode));
  } catch (e) {
  } finally {
    __privateSet(this, _gainNode, null);
  }
};
var PAGE_EVENTS = ["focus", "blur", "visibilitychange", "pageshow", "pagehide"];
var _state, _visibility, _safariBeforeUnloadTimeout, _handlePageEvent, handlePageEvent_fn;
var PageVisibility = class {
  constructor() {
    __privateAdd(this, _handlePageEvent);
    __privateAdd(this, _state, signal(determinePageState()));
    __privateAdd(this, _visibility, signal(document.visibilityState));
    __privateAdd(this, _safariBeforeUnloadTimeout, void 0);
  }
  connect() {
    const events = new EventsController(window), handlePageEvent = __privateMethod(this, _handlePageEvent, handlePageEvent_fn).bind(this);
    for (const eventType of PAGE_EVENTS) {
      events.add(eventType, handlePageEvent);
    }
    if (IS_SAFARI) {
      events.add("beforeunload", (event2) => {
        __privateSet(this, _safariBeforeUnloadTimeout, setTimeout(() => {
          if (!(event2.defaultPrevented || event2.returnValue.length > 0)) {
            __privateGet(this, _state).set("hidden");
            __privateGet(this, _visibility).set("hidden");
          }
        }, 0));
      });
    }
  }
  /**
   * The current page state. Important to note we only account for a subset of page states, as
   * the rest aren't valuable to the player at the moment.
   *
   * - **active:** A page is in the active state if it is visible and has input focus.
   * - **passive:** A page is in the passive state if it is visible and does not have input focus.
   * - **hidden:** A page is in the hidden state if it is not visible.
   *
   * @see https://developers.google.com/web/updates/2018/07/page-lifecycle-api#states
   */
  get pageState() {
    return __privateGet(this, _state).call(this);
  }
  /**
   * The current document visibility state.
   *
   * - **visible:** The page content may be at least partially visible. In practice, this means that
   * the page is the foreground tab of a non-minimized window.
   * - **hidden:** The page content is not visible to the user. In practice this means that the
   * document is either a background tab or part of a minimized window, or the OS screen lock is
   * active.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
   */
  get visibility() {
    return __privateGet(this, _visibility).call(this);
  }
};
_state = new WeakMap();
_visibility = new WeakMap();
_safariBeforeUnloadTimeout = new WeakMap();
_handlePageEvent = new WeakSet();
handlePageEvent_fn = function(event2) {
  if (IS_SAFARI)
    window.clearTimeout(__privateGet(this, _safariBeforeUnloadTimeout));
  if (event2.type !== "blur" || __privateGet(this, _state).call(this) === "active") {
    __privateGet(this, _state).set(determinePageState(event2));
    __privateGet(this, _visibility).set(document.visibilityState == "hidden" ? "hidden" : "visible");
  }
};
function determinePageState(event2) {
  if ((event2 == null ? void 0 : event2.type) === "blur" || document.visibilityState === "hidden")
    return "hidden";
  if (document.hasFocus())
    return "active";
  return "passive";
}
var _provider, _ctx, _waiting, _attachedLoadStart, _attachedCanPlay, _timeRAF, _pageVisibility, _events, _media2, media_get, _onDispose, onDispose_fn, _lastSeenTime, _seekedTo, _onAnimationFrame, onAnimationFrame_fn, _attachInitialListeners, attachInitialListeners_fn, _attachLoadStartListeners, attachLoadStartListeners_fn, _attachCanPlayListeners, attachCanPlayListeners_fn, _devHandlers, _handleDevEvent, _attachEventListener, attachEventListener_fn, _onDevEvent, onDevEvent_fn, _updateCurrentTime, updateCurrentTime_fn, _onLoadStart, onLoadStart_fn, _onAbort, onAbort_fn, _onEmptied, onEmptied_fn, _onLoadedData, onLoadedData_fn, _onLoadedMetadata, onLoadedMetadata_fn, _getCanPlayDetail, getCanPlayDetail_fn, _onPlay, onPlay_fn, _onPause, onPause_fn, _onCanPlay, onCanPlay_fn, _onCanPlayThrough, onCanPlayThrough_fn, _onPlaying, onPlaying_fn, _onStalled, onStalled_fn, _onWaiting, onWaiting_fn, _onEnded, onEnded_fn, _attachTimeUpdate, attachTimeUpdate_fn, _onTimeUpdate, onTimeUpdate_fn, _onDurationChange, onDurationChange_fn, _onVolumeChange, onVolumeChange_fn, _onSeeked, onSeeked_fn, _onSeeking, onSeeking_fn, _onProgress, onProgress_fn, _onSuspend, onSuspend_fn, _onRateChange, onRateChange_fn, _onError, onError_fn;
var HTMLMediaEvents = class {
  constructor(provider, ctx) {
    __privateAdd(this, _media2);
    __privateAdd(this, _onDispose);
    __privateAdd(this, _onAnimationFrame);
    __privateAdd(this, _attachInitialListeners);
    __privateAdd(this, _attachLoadStartListeners);
    __privateAdd(this, _attachCanPlayListeners);
    __privateAdd(this, _attachEventListener);
    __privateAdd(this, _onDevEvent);
    __privateAdd(this, _updateCurrentTime);
    __privateAdd(this, _onLoadStart);
    __privateAdd(this, _onAbort);
    __privateAdd(this, _onEmptied);
    __privateAdd(this, _onLoadedData);
    __privateAdd(this, _onLoadedMetadata);
    __privateAdd(this, _getCanPlayDetail);
    __privateAdd(this, _onPlay);
    __privateAdd(this, _onPause);
    __privateAdd(this, _onCanPlay);
    __privateAdd(this, _onCanPlayThrough);
    __privateAdd(this, _onPlaying);
    __privateAdd(this, _onStalled);
    __privateAdd(this, _onWaiting);
    __privateAdd(this, _onEnded);
    __privateAdd(this, _attachTimeUpdate);
    __privateAdd(this, _onTimeUpdate);
    __privateAdd(this, _onDurationChange);
    __privateAdd(this, _onVolumeChange);
    __privateAdd(this, _onSeeked);
    __privateAdd(this, _onSeeking);
    __privateAdd(this, _onProgress);
    __privateAdd(this, _onSuspend);
    __privateAdd(this, _onRateChange);
    __privateAdd(this, _onError);
    __privateAdd(this, _provider, void 0);
    __privateAdd(this, _ctx, void 0);
    __privateAdd(this, _waiting, false);
    __privateAdd(this, _attachedLoadStart, false);
    __privateAdd(this, _attachedCanPlay, false);
    __privateAdd(this, _timeRAF, new RAFLoop(__privateMethod(this, _onAnimationFrame, onAnimationFrame_fn).bind(this)));
    __privateAdd(this, _pageVisibility, new PageVisibility());
    __privateAdd(this, _events, void 0);
    /**
     * The `timeupdate` event fires surprisingly infrequently during playback, meaning your progress
     * bar (or whatever else is synced to the currentTime) moves in a choppy fashion. This helps
     * resolve that by retrieving time updates in a request animation frame loop.
     */
    __privateAdd(this, _lastSeenTime, 0);
    __privateAdd(this, _seekedTo, -1);
    __privateAdd(this, _devHandlers, /* @__PURE__ */ new Map());
    __privateAdd(this, _handleDevEvent, __privateMethod(this, _onDevEvent, onDevEvent_fn).bind(this));
    __privateSet(this, _provider, provider);
    __privateSet(this, _ctx, ctx);
    __privateSet(this, _events, new EventsController(provider.media));
    __privateMethod(this, _attachInitialListeners, attachInitialListeners_fn).call(this);
    __privateGet(this, _pageVisibility).connect();
    effect(__privateMethod(this, _attachTimeUpdate, attachTimeUpdate_fn).bind(this));
    onDispose(__privateMethod(this, _onDispose, onDispose_fn).bind(this));
  }
};
_provider = new WeakMap();
_ctx = new WeakMap();
_waiting = new WeakMap();
_attachedLoadStart = new WeakMap();
_attachedCanPlay = new WeakMap();
_timeRAF = new WeakMap();
_pageVisibility = new WeakMap();
_events = new WeakMap();
_media2 = new WeakSet();
media_get = function() {
  return __privateGet(this, _provider).media;
};
_onDispose = new WeakSet();
onDispose_fn = function() {
  var _a;
  __privateSet(this, _attachedLoadStart, false);
  __privateSet(this, _attachedCanPlay, false);
  __privateGet(this, _timeRAF).stop();
  __privateGet(this, _events).abort();
  (_a = __privateGet(this, _devHandlers)) == null ? void 0 : _a.clear();
};
_lastSeenTime = new WeakMap();
_seekedTo = new WeakMap();
_onAnimationFrame = new WeakSet();
onAnimationFrame_fn = function() {
  const newTime = __privateGet(this, _media2, media_get).currentTime;
  const didStutter = IS_SAFARI && newTime - __privateGet(this, _seekedTo) < 0.35;
  if (!didStutter && __privateGet(this, _lastSeenTime) !== newTime) {
    __privateMethod(this, _updateCurrentTime, updateCurrentTime_fn).call(this, newTime);
    __privateSet(this, _lastSeenTime, newTime);
  }
};
_attachInitialListeners = new WeakSet();
attachInitialListeners_fn = function() {
  var _a, _b;
  {
    (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.info("attaching initial listeners");
  }
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "loadstart", __privateMethod(this, _onLoadStart, onLoadStart_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "abort", __privateMethod(this, _onAbort, onAbort_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "emptied", __privateMethod(this, _onEmptied, onEmptied_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "error", __privateMethod(this, _onError, onError_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "volumechange", __privateMethod(this, _onVolumeChange, onVolumeChange_fn));
  (_b = __privateGet(this, _ctx).logger) == null ? void 0 : _b.debug("attached initial media event listeners");
};
_attachLoadStartListeners = new WeakSet();
attachLoadStartListeners_fn = function() {
  var _a;
  if (__privateGet(this, _attachedLoadStart))
    return;
  {
    (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.info("attaching load start listeners");
  }
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "loadeddata", __privateMethod(this, _onLoadedData, onLoadedData_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "loadedmetadata", __privateMethod(this, _onLoadedMetadata, onLoadedMetadata_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "canplay", __privateMethod(this, _onCanPlay, onCanPlay_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "canplaythrough", __privateMethod(this, _onCanPlayThrough, onCanPlayThrough_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "durationchange", __privateMethod(this, _onDurationChange, onDurationChange_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "play", __privateMethod(this, _onPlay, onPlay_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "progress", __privateMethod(this, _onProgress, onProgress_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "stalled", __privateMethod(this, _onStalled, onStalled_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "suspend", __privateMethod(this, _onSuspend, onSuspend_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "ratechange", __privateMethod(this, _onRateChange, onRateChange_fn));
  __privateSet(this, _attachedLoadStart, true);
};
_attachCanPlayListeners = new WeakSet();
attachCanPlayListeners_fn = function() {
  var _a;
  if (__privateGet(this, _attachedCanPlay))
    return;
  {
    (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.info("attaching can play listeners");
  }
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "pause", __privateMethod(this, _onPause, onPause_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "playing", __privateMethod(this, _onPlaying, onPlaying_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "seeked", __privateMethod(this, _onSeeked, onSeeked_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "seeking", __privateMethod(this, _onSeeking, onSeeking_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "ended", __privateMethod(this, _onEnded, onEnded_fn));
  __privateMethod(this, _attachEventListener, attachEventListener_fn).call(this, "waiting", __privateMethod(this, _onWaiting, onWaiting_fn));
  __privateSet(this, _attachedCanPlay, true);
};
_devHandlers = new WeakMap();
_handleDevEvent = new WeakMap();
_attachEventListener = new WeakSet();
attachEventListener_fn = function(eventType, handler) {
  __privateGet(this, _devHandlers).set(eventType, handler);
  __privateGet(this, _events).add(eventType, __privateGet(this, _handleDevEvent));
};
_onDevEvent = new WeakSet();
onDevEvent_fn = function(event2) {
  var _a, _b;
  (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.debugGroup(`📺 provider fired \`${event2.type}\``).labelledLog("Provider", __privateGet(this, _provider)).labelledLog("Event", event2).labelledLog("Media Store", { ...__privateGet(this, _ctx).$state }).dispatch();
  (_b = __privateGet(this, _devHandlers).get(event2.type)) == null ? void 0 : _b.call(this, event2);
};
_updateCurrentTime = new WeakSet();
updateCurrentTime_fn = function(time, trigger) {
  const newTime = Math.min(time, __privateGet(this, _ctx).$state.seekableEnd());
  __privateGet(this, _ctx).notify("time-change", newTime, trigger);
};
_onLoadStart = new WeakSet();
onLoadStart_fn = function(event2) {
  if (__privateGet(this, _media2, media_get).networkState === 3) {
    __privateMethod(this, _onAbort, onAbort_fn).call(this, event2);
    return;
  }
  __privateMethod(this, _attachLoadStartListeners, attachLoadStartListeners_fn).call(this);
  __privateGet(this, _ctx).notify("load-start", void 0, event2);
};
_onAbort = new WeakSet();
onAbort_fn = function(event2) {
  __privateGet(this, _ctx).notify("abort", void 0, event2);
};
_onEmptied = new WeakSet();
onEmptied_fn = function() {
  __privateGet(this, _ctx).notify("emptied", void 0, event);
};
_onLoadedData = new WeakSet();
onLoadedData_fn = function(event2) {
  __privateGet(this, _ctx).notify("loaded-data", void 0, event2);
};
_onLoadedMetadata = new WeakSet();
onLoadedMetadata_fn = function(event2) {
  __privateSet(this, _lastSeenTime, 0);
  __privateSet(this, _seekedTo, -1);
  __privateMethod(this, _attachCanPlayListeners, attachCanPlayListeners_fn).call(this);
  __privateGet(this, _ctx).notify("loaded-metadata", void 0, event2);
  if (IS_IOS || IS_SAFARI && isHLSSrc(__privateGet(this, _ctx).$state.source())) {
    __privateGet(this, _ctx).delegate.ready(__privateMethod(this, _getCanPlayDetail, getCanPlayDetail_fn).call(this), event2);
  }
};
_getCanPlayDetail = new WeakSet();
getCanPlayDetail_fn = function() {
  return {
    provider: peek(__privateGet(this, _ctx).$provider),
    duration: __privateGet(this, _media2, media_get).duration,
    buffered: __privateGet(this, _media2, media_get).buffered,
    seekable: __privateGet(this, _media2, media_get).seekable
  };
};
_onPlay = new WeakSet();
onPlay_fn = function(event2) {
  if (!__privateGet(this, _ctx).$state.canPlay)
    return;
  __privateGet(this, _ctx).notify("play", void 0, event2);
};
_onPause = new WeakSet();
onPause_fn = function(event2) {
  if (__privateGet(this, _media2, media_get).readyState === 1 && !__privateGet(this, _waiting))
    return;
  __privateSet(this, _waiting, false);
  __privateGet(this, _timeRAF).stop();
  __privateGet(this, _ctx).notify("pause", void 0, event2);
};
_onCanPlay = new WeakSet();
onCanPlay_fn = function(event2) {
  __privateGet(this, _ctx).delegate.ready(__privateMethod(this, _getCanPlayDetail, getCanPlayDetail_fn).call(this), event2);
};
_onCanPlayThrough = new WeakSet();
onCanPlayThrough_fn = function(event2) {
  if (__privateGet(this, _ctx).$state.started())
    return;
  __privateGet(this, _ctx).notify("can-play-through", __privateMethod(this, _getCanPlayDetail, getCanPlayDetail_fn).call(this), event2);
};
_onPlaying = new WeakSet();
onPlaying_fn = function(event2) {
  if (__privateGet(this, _media2, media_get).paused)
    return;
  __privateSet(this, _waiting, false);
  __privateGet(this, _ctx).notify("playing", void 0, event2);
  __privateGet(this, _timeRAF).start();
};
_onStalled = new WeakSet();
onStalled_fn = function(event2) {
  __privateGet(this, _ctx).notify("stalled", void 0, event2);
  if (__privateGet(this, _media2, media_get).readyState < 3) {
    __privateSet(this, _waiting, true);
    __privateGet(this, _ctx).notify("waiting", void 0, event2);
  }
};
_onWaiting = new WeakSet();
onWaiting_fn = function(event2) {
  if (__privateGet(this, _media2, media_get).readyState < 3) {
    __privateSet(this, _waiting, true);
    __privateGet(this, _ctx).notify("waiting", void 0, event2);
  }
};
_onEnded = new WeakSet();
onEnded_fn = function(event2) {
  __privateGet(this, _timeRAF).stop();
  __privateMethod(this, _updateCurrentTime, updateCurrentTime_fn).call(this, __privateGet(this, _media2, media_get).duration, event2);
  __privateGet(this, _ctx).notify("end", void 0, event2);
  if (__privateGet(this, _ctx).$state.loop()) {
    const hasCustomControls = isNil(__privateGet(this, _media2, media_get).controls);
    if (hasCustomControls)
      __privateGet(this, _media2, media_get).controls = false;
  }
};
_attachTimeUpdate = new WeakSet();
attachTimeUpdate_fn = function() {
  const isPaused = __privateGet(this, _ctx).$state.paused(), isPageHidden = __privateGet(this, _pageVisibility).visibility === "hidden", shouldListenToTimeUpdates = isPaused || isPageHidden;
  if (shouldListenToTimeUpdates) {
    listenEvent(__privateGet(this, _media2, media_get), "timeupdate", __privateMethod(this, _onTimeUpdate, onTimeUpdate_fn).bind(this));
  }
};
_onTimeUpdate = new WeakSet();
onTimeUpdate_fn = function(event2) {
  __privateMethod(this, _updateCurrentTime, updateCurrentTime_fn).call(this, __privateGet(this, _media2, media_get).currentTime, event2);
};
_onDurationChange = new WeakSet();
onDurationChange_fn = function(event2) {
  if (__privateGet(this, _ctx).$state.ended()) {
    __privateMethod(this, _updateCurrentTime, updateCurrentTime_fn).call(this, __privateGet(this, _media2, media_get).duration, event2);
  }
  __privateGet(this, _ctx).notify("duration-change", __privateGet(this, _media2, media_get).duration, event2);
};
_onVolumeChange = new WeakSet();
onVolumeChange_fn = function(event2) {
  const detail = {
    volume: __privateGet(this, _media2, media_get).volume,
    muted: __privateGet(this, _media2, media_get).muted
  };
  __privateGet(this, _ctx).notify("volume-change", detail, event2);
};
_onSeeked = new WeakSet();
onSeeked_fn = function(event2) {
  __privateSet(this, _seekedTo, __privateGet(this, _media2, media_get).currentTime);
  __privateMethod(this, _updateCurrentTime, updateCurrentTime_fn).call(this, __privateGet(this, _media2, media_get).currentTime, event2);
  __privateGet(this, _ctx).notify("seeked", __privateGet(this, _media2, media_get).currentTime, event2);
  if (Math.trunc(__privateGet(this, _media2, media_get).currentTime) === Math.trunc(__privateGet(this, _media2, media_get).duration) && getNumberOfDecimalPlaces(__privateGet(this, _media2, media_get).duration) > getNumberOfDecimalPlaces(__privateGet(this, _media2, media_get).currentTime)) {
    __privateMethod(this, _updateCurrentTime, updateCurrentTime_fn).call(this, __privateGet(this, _media2, media_get).duration, event2);
    if (!__privateGet(this, _media2, media_get).ended) {
      __privateGet(this, _ctx).player.dispatch(
        new DOMEvent("media-play-request", {
          trigger: event2
        })
      );
    }
  }
};
_onSeeking = new WeakSet();
onSeeking_fn = function(event2) {
  __privateGet(this, _ctx).notify("seeking", __privateGet(this, _media2, media_get).currentTime, event2);
};
_onProgress = new WeakSet();
onProgress_fn = function(event2) {
  const detail = {
    buffered: __privateGet(this, _media2, media_get).buffered,
    seekable: __privateGet(this, _media2, media_get).seekable
  };
  __privateGet(this, _ctx).notify("progress", detail, event2);
};
_onSuspend = new WeakSet();
onSuspend_fn = function(event2) {
  __privateGet(this, _ctx).notify("suspend", void 0, event2);
};
_onRateChange = new WeakSet();
onRateChange_fn = function(event2) {
  __privateGet(this, _ctx).notify("rate-change", __privateGet(this, _media2, media_get).playbackRate, event2);
};
_onError = new WeakSet();
onError_fn = function(event2) {
  const error = __privateGet(this, _media2, media_get).error;
  if (!error)
    return;
  const detail = {
    message: error.message,
    code: error.code,
    mediaError: error
  };
  __privateGet(this, _ctx).notify("error", detail, event2);
};
var _provider2, _ctx2, _nativeTracks, nativeTracks_get, _onAddNativeTrack, onAddNativeTrack_fn, _onRemoveNativeTrack, onRemoveNativeTrack_fn, _onChangeNativeTrack, onChangeNativeTrack_fn, _getEnabledNativeTrack, getEnabledNativeTrack_fn, _onChangeTrack, onChangeTrack_fn;
var NativeAudioTracks = class {
  constructor(provider, ctx) {
    __privateAdd(this, _nativeTracks);
    __privateAdd(this, _onAddNativeTrack);
    __privateAdd(this, _onRemoveNativeTrack);
    __privateAdd(this, _onChangeNativeTrack);
    __privateAdd(this, _getEnabledNativeTrack);
    __privateAdd(this, _onChangeTrack);
    __privateAdd(this, _provider2, void 0);
    __privateAdd(this, _ctx2, void 0);
    __privateSet(this, _provider2, provider);
    __privateSet(this, _ctx2, ctx);
    __privateGet(this, _nativeTracks, nativeTracks_get).onaddtrack = __privateMethod(this, _onAddNativeTrack, onAddNativeTrack_fn).bind(this);
    __privateGet(this, _nativeTracks, nativeTracks_get).onremovetrack = __privateMethod(this, _onRemoveNativeTrack, onRemoveNativeTrack_fn).bind(this);
    __privateGet(this, _nativeTracks, nativeTracks_get).onchange = __privateMethod(this, _onChangeNativeTrack, onChangeNativeTrack_fn).bind(this);
    listenEvent(__privateGet(this, _ctx2).audioTracks, "change", __privateMethod(this, _onChangeTrack, onChangeTrack_fn).bind(this));
  }
};
_provider2 = new WeakMap();
_ctx2 = new WeakMap();
_nativeTracks = new WeakSet();
nativeTracks_get = function() {
  return __privateGet(this, _provider2).media.audioTracks;
};
_onAddNativeTrack = new WeakSet();
onAddNativeTrack_fn = function(event2) {
  const nativeTrack = event2.track;
  if (nativeTrack.label === "")
    return;
  const id = nativeTrack.id.toString() || `native-audio-${__privateGet(this, _ctx2).audioTracks.length}`, audioTrack = {
    id,
    label: nativeTrack.label,
    language: nativeTrack.language,
    kind: nativeTrack.kind,
    selected: false
  };
  __privateGet(this, _ctx2).audioTracks[ListSymbol.add](audioTrack, event2);
  if (nativeTrack.enabled)
    audioTrack.selected = true;
};
_onRemoveNativeTrack = new WeakSet();
onRemoveNativeTrack_fn = function(event2) {
  const track = __privateGet(this, _ctx2).audioTracks.getById(event2.track.id);
  if (track)
    __privateGet(this, _ctx2).audioTracks[ListSymbol.remove](track, event2);
};
_onChangeNativeTrack = new WeakSet();
onChangeNativeTrack_fn = function(event2) {
  let enabledTrack = __privateMethod(this, _getEnabledNativeTrack, getEnabledNativeTrack_fn).call(this);
  if (!enabledTrack)
    return;
  const track = __privateGet(this, _ctx2).audioTracks.getById(enabledTrack.id);
  if (track)
    __privateGet(this, _ctx2).audioTracks[ListSymbol.select](track, true, event2);
};
_getEnabledNativeTrack = new WeakSet();
getEnabledNativeTrack_fn = function() {
  return Array.from(__privateGet(this, _nativeTracks, nativeTracks_get)).find((track) => track.enabled);
};
_onChangeTrack = new WeakSet();
onChangeTrack_fn = function(event2) {
  const { current } = event2.detail;
  if (!current)
    return;
  const track = __privateGet(this, _nativeTracks, nativeTracks_get).getTrackById(current.id);
  if (track) {
    const prev = __privateMethod(this, _getEnabledNativeTrack, getEnabledNativeTrack_fn).call(this);
    if (prev)
      prev.enabled = false;
    track.enabled = true;
  }
};
var _appendMediaFragment, appendMediaFragment_fn;
var HTMLMediaProvider = class {
  constructor(media, ctx) {
    __privateAdd(this, _appendMediaFragment);
    __publicField(this, "scope", createScope());
    __publicField(this, "currentSrc", null);
    __publicField(this, "audioGain");
    this.media = media;
    this.ctx = ctx;
    this.audioGain = new AudioGain(media, (gain) => {
      this.ctx.notify("audio-gain-change", gain);
    });
  }
  setup() {
    new HTMLMediaEvents(this, this.ctx);
    if ("audioTracks" in this.media)
      new NativeAudioTracks(this, this.ctx);
    onDispose(() => {
      this.audioGain.destroy();
      this.media.srcObject = null;
      this.media.removeAttribute("src");
      for (const source of this.media.querySelectorAll("source"))
        source.remove();
      this.media.load();
    });
  }
  get type() {
    return "";
  }
  setPlaybackRate(rate) {
    this.media.playbackRate = rate;
  }
  async play() {
    return this.media.play();
  }
  async pause() {
    return this.media.pause();
  }
  setMuted(muted) {
    this.media.muted = muted;
  }
  setVolume(volume) {
    this.media.volume = volume;
  }
  setCurrentTime(time) {
    this.media.currentTime = time;
  }
  setPlaysInline(inline) {
    setAttribute(this.media, "playsinline", inline);
  }
  async loadSource({ src, type }, preload) {
    this.media.preload = preload || "";
    if (isMediaStream(src)) {
      this.removeSource();
      this.media.srcObject = src;
    } else {
      this.media.srcObject = null;
      if (isString(src)) {
        if (type !== "?") {
          this.appendSource({ src, type });
        } else {
          this.removeSource();
          this.media.src = __privateMethod(this, _appendMediaFragment, appendMediaFragment_fn).call(this, src);
        }
      } else {
        this.removeSource();
        this.media.src = window.URL.createObjectURL(src);
      }
    }
    this.media.load();
    this.currentSrc = { src, type };
  }
  /**
   * Append source so it works when requesting AirPlay since hls.js will remove it.
   */
  appendSource(src, defaultType) {
    const prevSource = this.media.querySelector("source[data-vds]"), source = prevSource ?? document.createElement("source");
    setAttribute(source, "src", __privateMethod(this, _appendMediaFragment, appendMediaFragment_fn).call(this, src.src));
    setAttribute(source, "type", src.type !== "?" ? src.type : defaultType);
    setAttribute(source, "data-vds", "");
    if (!prevSource)
      this.media.append(source);
  }
  removeSource() {
    var _a;
    (_a = this.media.querySelector("source[data-vds]")) == null ? void 0 : _a.remove();
  }
};
_appendMediaFragment = new WeakSet();
appendMediaFragment_fn = function(src) {
  const { clipStartTime, clipEndTime } = this.ctx.$state, startTime = clipStartTime(), endTime = clipEndTime();
  if (startTime > 0 && endTime > 0) {
    return `${src}#t=${startTime},${endTime}`;
  } else if (startTime > 0) {
    return `${src}#t=${startTime}`;
  } else if (endTime > 0) {
    return `${src}#t=0,${endTime}`;
  }
  return src;
};

// node_modules/vidstack/dev/chunks/vidstack-clMv7kJL.js
var _media3, _ctx3, _state2, _supported, _setup, setup_fn, _watchSupported, watchSupported_fn, _onStateChange, onStateChange_fn;
var HTMLRemotePlaybackAdapter = class {
  constructor(media, ctx) {
    __privateAdd(this, _setup);
    __privateAdd(this, _watchSupported);
    __privateAdd(this, _onStateChange);
    __privateAdd(this, _media3, void 0);
    __privateAdd(this, _ctx3, void 0);
    __privateAdd(this, _state2, void 0);
    __privateAdd(this, _supported, signal(false));
    __privateSet(this, _media3, media);
    __privateSet(this, _ctx3, ctx);
    __privateMethod(this, _setup, setup_fn).call(this);
  }
  get supported() {
    return __privateGet(this, _supported).call(this);
  }
  async prompt() {
    if (!this.supported)
      throw Error("Not supported on this platform.");
    if (this.type === "airplay" && __privateGet(this, _media3).webkitShowPlaybackTargetPicker) {
      return __privateGet(this, _media3).webkitShowPlaybackTargetPicker();
    }
    return __privateGet(this, _media3).remote.prompt();
  }
};
_media3 = new WeakMap();
_ctx3 = new WeakMap();
_state2 = new WeakMap();
_supported = new WeakMap();
_setup = new WeakSet();
setup_fn = function() {
  var _a;
  if (!((_a = __privateGet(this, _media3)) == null ? void 0 : _a.remote) || !this.canPrompt)
    return;
  __privateGet(this, _media3).remote.watchAvailability((available) => {
    __privateGet(this, _supported).set(available);
  }).catch(() => {
    __privateGet(this, _supported).set(false);
  });
  effect(__privateMethod(this, _watchSupported, watchSupported_fn).bind(this));
};
_watchSupported = new WeakSet();
watchSupported_fn = function() {
  if (!__privateGet(this, _supported).call(this))
    return;
  const events = ["connecting", "connect", "disconnect"], onStateChange = __privateMethod(this, _onStateChange, onStateChange_fn).bind(this);
  onStateChange();
  listenEvent(__privateGet(this, _media3), "playing", onStateChange);
  const remoteEvents = new EventsController(__privateGet(this, _media3).remote);
  for (const type of events) {
    remoteEvents.add(type, onStateChange);
  }
};
_onStateChange = new WeakSet();
onStateChange_fn = function(event2) {
  const state = __privateGet(this, _media3).remote.state;
  if (state === __privateGet(this, _state2))
    return;
  const detail = { type: this.type, state };
  __privateGet(this, _ctx3).notify("remote-playback-change", detail, event2);
  __privateSet(this, _state2, state);
};
var HTMLAirPlayAdapter = class extends HTMLRemotePlaybackAdapter {
  constructor() {
    super(...arguments);
    __publicField(this, "type", "airplay");
  }
  get canPrompt() {
    return "WebKitPlaybackTargetAvailabilityEvent" in window;
  }
};

export {
  HTMLMediaProvider,
  HTMLAirPlayAdapter
};
//# sourceMappingURL=chunk-OSWRSLMA.js.map
