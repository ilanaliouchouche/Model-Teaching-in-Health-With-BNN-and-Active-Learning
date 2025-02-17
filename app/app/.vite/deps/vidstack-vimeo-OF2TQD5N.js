import {
  getVimeoVideoInfo,
  resolveVimeoVideoId
} from "./chunk-UBIOYAPV.js";
import {
  EmbedProvider
} from "./chunk-OZDDBEUX.js";
import {
  TimeRange
} from "./chunk-QGQ7KI2J.js";
import {
  QualitySymbol
} from "./chunk-2WGAKHRH.js";
import {
  TextTrack
} from "./chunk-EBRHQEUP.js";
import {
  preconnect
} from "./chunk-YNKQJVIZ.js";
import {
  RAFLoop
} from "./chunk-U2LFAP4F.js";
import {
  ListSymbol
} from "./chunk-OPWJPTWG.js";
import "./chunk-K2JGPOHG.js";
import {
  createScope,
  deferredPromise,
  effect,
  isArray,
  isString,
  listenEvent,
  peek,
  signal
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/providers/vidstack-vimeo.js
var trackedVimeoEvents = [
  "bufferend",
  "bufferstart",
  // 'cuechange',
  "durationchange",
  "ended",
  "enterpictureinpicture",
  "error",
  "fullscreenchange",
  "leavepictureinpicture",
  "loaded",
  // 'loadeddata',
  // 'loadedmetadata',
  // 'loadstart',
  "playProgress",
  "loadProgress",
  "pause",
  "play",
  "playbackratechange",
  // 'progress',
  "qualitychange",
  "seeked",
  "seeking",
  // 'texttrackchange',
  "timeupdate",
  "volumechange",
  "waiting"
  // 'adstarted',
  // 'adcompleted',
  // 'aderror',
  // 'adskipped',
  // 'adallcompleted',
  // 'adclicked',
  // 'chapterchange',
  // 'chromecastconnected',
  // 'remoteplaybackavailabilitychange',
  // 'remoteplaybackconnecting',
  // 'remoteplaybackconnect',
  // 'remoteplaybackdisconnect',
  // 'liveeventended',
  // 'liveeventstarted',
  // 'livestreamoffline',
  // 'livestreamonline',
];
var _ctx, _videoId, _pro, _hash, _currentSrc, _fullscreenActive, _seekableRange, _timeRAF, _currentCue, _chaptersTrack, _promises, _videoInfoPromise, _watchVideoId, watchVideoId_fn, _watchVideoInfo, watchVideoInfo_fn, _watchPro, watchPro_fn, _onAnimationFrame, onAnimationFrame_fn, _preventTimeUpdates, _onTimeUpdate, onTimeUpdate_fn, _onSeeked, onSeeked_fn, _onLoaded, onLoaded_fn, _onReady, onReady_fn, _onMethod, onMethod_fn, _attachListeners, attachListeners_fn, _onPause, onPause_fn, _onPlay, onPlay_fn, _onPlayProgress, onPlayProgress_fn, _onLoadProgress, onLoadProgress_fn, _onBufferStart, onBufferStart_fn, _onBufferEnd, onBufferEnd_fn, _onWaiting, onWaiting_fn, _onVolumeChange, onVolumeChange_fn, _onChaptersChange, onChaptersChange_fn, _removeChapters, removeChapters_fn, _onQualitiesChange, onQualitiesChange_fn, _onQualityChange, onQualityChange_fn, _onEvent, onEvent_fn, _onError, onError_fn, _remote, remote_fn, _reset, reset_fn, _getPromise, getPromise_fn;
var VimeoProvider = class extends EmbedProvider {
  constructor(iframe, ctx) {
    super(iframe);
    __privateAdd(this, _watchVideoId);
    __privateAdd(this, _watchVideoInfo);
    __privateAdd(this, _watchPro);
    __privateAdd(this, _onAnimationFrame);
    __privateAdd(this, _onTimeUpdate);
    __privateAdd(this, _onSeeked);
    __privateAdd(this, _onLoaded);
    __privateAdd(this, _onReady);
    __privateAdd(this, _onMethod);
    __privateAdd(this, _attachListeners);
    __privateAdd(this, _onPause);
    __privateAdd(this, _onPlay);
    __privateAdd(this, _onPlayProgress);
    __privateAdd(this, _onLoadProgress);
    __privateAdd(this, _onBufferStart);
    __privateAdd(this, _onBufferEnd);
    __privateAdd(this, _onWaiting);
    __privateAdd(this, _onVolumeChange);
    // #onTextTrackChange(track: VimeoTextTrack, trigger: Event) {
    //   const textTrack = this.#ctx.textTracks.toArray().find((t) => t.language === track.language);
    //   if (textTrack) textTrack.mode = track.mode;
    // }
    // #onTextTracksChange(tracks: VimeoTextTrack[], trigger: Event) {
    //   for (const init of tracks) {
    //     const textTrack = new TextTrack({
    //       ...init,
    //       label: init.label.replace('auto-generated', 'auto'),
    //     });
    //     textTrack[TextTrackSymbol.readyState] = 2;
    //     this.#ctx.textTracks.add(textTrack, trigger);
    //     textTrack.setMode(init.mode, trigger);
    //   }
    // }
    // #onCueChange(cue: VimeoTextCue, trigger: Event) {
    //   const { textTracks, $state } = this.#ctx,
    //     { currentTime } = $state,
    //     track = textTracks.selected;
    //   if (this.#currentCue) track?.removeCue(this.#currentCue, trigger);
    //   this.#currentCue = new window.VTTCue(currentTime(), Number.MAX_SAFE_INTEGER, cue.text);
    //   track?.addCue(this.#currentCue, trigger);
    // }
    __privateAdd(this, _onChaptersChange);
    __privateAdd(this, _removeChapters);
    __privateAdd(this, _onQualitiesChange);
    __privateAdd(this, _onQualityChange);
    __privateAdd(this, _onEvent);
    __privateAdd(this, _onError);
    __privateAdd(this, _remote);
    __privateAdd(this, _reset);
    __privateAdd(this, _getPromise);
    __publicField(this, "$$PROVIDER_TYPE", "VIMEO");
    __publicField(this, "scope", createScope());
    __publicField(this, "fullscreen");
    __privateAdd(this, _ctx, void 0);
    __privateAdd(this, _videoId, signal(""));
    __privateAdd(this, _pro, signal(false));
    __privateAdd(this, _hash, null);
    __privateAdd(this, _currentSrc, null);
    __privateAdd(this, _fullscreenActive, false);
    __privateAdd(this, _seekableRange, new TimeRange(0, 0));
    __privateAdd(this, _timeRAF, new RAFLoop(__privateMethod(this, _onAnimationFrame, onAnimationFrame_fn).bind(this)));
    __privateAdd(this, _currentCue, null);
    __privateAdd(this, _chaptersTrack, null);
    __privateAdd(this, _promises, /* @__PURE__ */ new Map());
    __privateAdd(this, _videoInfoPromise, null);
    /**
     * Whether tracking session data should be enabled on the embed, including cookies and analytics.
     * This is turned off by default to be GDPR-compliant.
     *
     * @defaultValue `false`
     */
    __publicField(this, "cookies", false);
    __publicField(this, "title", true);
    __publicField(this, "byline", true);
    __publicField(this, "portrait", true);
    __publicField(this, "color", "00ADEF");
    // Embed will sometimes dispatch 0 at end of playback.
    __privateAdd(this, _preventTimeUpdates, false);
    __privateSet(this, _ctx, ctx);
    const self = this;
    this.fullscreen = {
      get active() {
        return __privateGet(self, _fullscreenActive);
      },
      supported: true,
      enter: () => __privateMethod(this, _remote, remote_fn).call(this, "requestFullscreen"),
      exit: () => __privateMethod(this, _remote, remote_fn).call(this, "exitFullscreen")
    };
  }
  get type() {
    return "vimeo";
  }
  get currentSrc() {
    return __privateGet(this, _currentSrc);
  }
  get videoId() {
    return __privateGet(this, _videoId).call(this);
  }
  get hash() {
    return __privateGet(this, _hash);
  }
  get isPro() {
    return __privateGet(this, _pro).call(this);
  }
  preconnect() {
    preconnect(this.getOrigin());
  }
  setup() {
    super.setup();
    effect(__privateMethod(this, _watchVideoId, watchVideoId_fn).bind(this));
    effect(__privateMethod(this, _watchVideoInfo, watchVideoInfo_fn).bind(this));
    effect(__privateMethod(this, _watchPro, watchPro_fn).bind(this));
    __privateGet(this, _ctx).notify("provider-setup", this);
  }
  destroy() {
    __privateMethod(this, _reset, reset_fn).call(this);
    this.fullscreen = void 0;
    const message = "provider destroyed";
    for (const promises of __privateGet(this, _promises).values()) {
      for (const { reject } of promises)
        reject(message);
    }
    __privateGet(this, _promises).clear();
    __privateMethod(this, _remote, remote_fn).call(this, "destroy");
  }
  async play() {
    return __privateMethod(this, _remote, remote_fn).call(this, "play");
  }
  async pause() {
    return __privateMethod(this, _remote, remote_fn).call(this, "pause");
  }
  setMuted(muted) {
    __privateMethod(this, _remote, remote_fn).call(this, "setMuted", muted);
  }
  setCurrentTime(time) {
    __privateMethod(this, _remote, remote_fn).call(this, "seekTo", time);
    __privateGet(this, _ctx).notify("seeking", time);
  }
  setVolume(volume) {
    __privateMethod(this, _remote, remote_fn).call(this, "setVolume", volume);
    __privateMethod(this, _remote, remote_fn).call(this, "setMuted", peek(__privateGet(this, _ctx).$state.muted));
  }
  setPlaybackRate(rate) {
    __privateMethod(this, _remote, remote_fn).call(this, "setPlaybackRate", rate);
  }
  async loadSource(src) {
    if (!isString(src.src)) {
      __privateSet(this, _currentSrc, null);
      __privateSet(this, _hash, null);
      __privateGet(this, _videoId).set("");
      return;
    }
    const { videoId, hash } = resolveVimeoVideoId(src.src);
    __privateGet(this, _videoId).set(videoId ?? "");
    __privateSet(this, _hash, hash ?? null);
    __privateSet(this, _currentSrc, src);
  }
  getOrigin() {
    return "https://player.vimeo.com";
  }
  buildParams() {
    const { keyDisabled } = __privateGet(this, _ctx).$props, { playsInline, nativeControls } = __privateGet(this, _ctx).$state, showControls = nativeControls();
    return {
      title: this.title,
      byline: this.byline,
      color: this.color,
      portrait: this.portrait,
      controls: showControls,
      h: this.hash,
      keyboard: showControls && !keyDisabled(),
      transparent: true,
      playsinline: playsInline(),
      dnt: !this.cookies
    };
  }
  onMessage(message, event) {
    if (message.event) {
      __privateMethod(this, _onEvent, onEvent_fn).call(this, message.event, message.data, event);
    } else if (message.method) {
      __privateMethod(this, _onMethod, onMethod_fn).call(this, message.method, message.value, event);
    }
  }
  onLoad() {
  }
};
_ctx = new WeakMap();
_videoId = new WeakMap();
_pro = new WeakMap();
_hash = new WeakMap();
_currentSrc = new WeakMap();
_fullscreenActive = new WeakMap();
_seekableRange = new WeakMap();
_timeRAF = new WeakMap();
_currentCue = new WeakMap();
_chaptersTrack = new WeakMap();
_promises = new WeakMap();
_videoInfoPromise = new WeakMap();
_watchVideoId = new WeakSet();
watchVideoId_fn = function() {
  __privateMethod(this, _reset, reset_fn).call(this);
  const videoId = __privateGet(this, _videoId).call(this);
  if (!videoId) {
    this.src.set("");
    return;
  }
  this.src.set(`${this.getOrigin()}/video/${videoId}`);
  __privateGet(this, _ctx).notify("load-start");
};
_watchVideoInfo = new WeakSet();
watchVideoInfo_fn = function() {
  const videoId = __privateGet(this, _videoId).call(this);
  if (!videoId)
    return;
  const promise = deferredPromise(), abort = new AbortController();
  __privateSet(this, _videoInfoPromise, promise);
  getVimeoVideoInfo(videoId, abort, __privateGet(this, _hash)).then((info) => {
    promise.resolve(info);
  }).catch((e) => {
    var _a;
    promise.reject();
    {
      (_a = __privateGet(this, _ctx).logger) == null ? void 0 : _a.warnGroup(`Failed to fetch vimeo video info for id \`${videoId}\`.`).labelledLog("Error", e).dispatch();
    }
  });
  return () => {
    promise.reject();
    abort.abort();
  };
};
_watchPro = new WeakSet();
watchPro_fn = function() {
  const isPro = __privateGet(this, _pro).call(this), { $state, qualities } = __privateGet(this, _ctx);
  $state.canSetPlaybackRate.set(isPro);
  qualities[ListSymbol.setReadonly](!isPro);
  if (isPro) {
    return listenEvent(qualities, "change", () => {
      var _a;
      if (qualities.auto)
        return;
      const id = (_a = qualities.selected) == null ? void 0 : _a.id;
      if (id)
        __privateMethod(this, _remote, remote_fn).call(this, "setQuality", id);
    });
  }
};
_onAnimationFrame = new WeakSet();
onAnimationFrame_fn = function() {
  __privateMethod(this, _remote, remote_fn).call(this, "getCurrentTime");
};
_preventTimeUpdates = new WeakMap();
_onTimeUpdate = new WeakSet();
onTimeUpdate_fn = function(time, trigger) {
  if (__privateGet(this, _preventTimeUpdates) && time === 0)
    return;
  const { realCurrentTime, paused, bufferedEnd, seekableEnd, live } = __privateGet(this, _ctx).$state;
  if (realCurrentTime() === time)
    return;
  const prevTime = realCurrentTime();
  __privateGet(this, _ctx).notify("time-change", time, trigger);
  if (Math.abs(prevTime - time) > 1.5) {
    __privateGet(this, _ctx).notify("seeking", time, trigger);
    if (!paused() && bufferedEnd() < time) {
      __privateGet(this, _ctx).notify("waiting", void 0, trigger);
    }
  }
  if (!live() && seekableEnd() - time < 0.01) {
    __privateGet(this, _ctx).notify("end", void 0, trigger);
    __privateSet(this, _preventTimeUpdates, true);
    setTimeout(() => {
      __privateSet(this, _preventTimeUpdates, false);
    }, 500);
  }
};
_onSeeked = new WeakSet();
onSeeked_fn = function(time, trigger) {
  __privateGet(this, _ctx).notify("seeked", time, trigger);
};
_onLoaded = new WeakSet();
onLoaded_fn = function(trigger) {
  var _a;
  const videoId = __privateGet(this, _videoId).call(this);
  (_a = __privateGet(this, _videoInfoPromise)) == null ? void 0 : _a.promise.then((info) => {
    if (!info)
      return;
    const { title, poster, duration, pro } = info;
    __privateGet(this, _pro).set(pro);
    __privateGet(this, _ctx).notify("title-change", title, trigger);
    __privateGet(this, _ctx).notify("poster-change", poster, trigger);
    __privateGet(this, _ctx).notify("duration-change", duration, trigger);
    __privateMethod(this, _onReady, onReady_fn).call(this, duration, trigger);
  }).catch(() => {
    if (videoId !== __privateGet(this, _videoId).call(this))
      return;
    __privateMethod(this, _remote, remote_fn).call(this, "getVideoTitle");
    __privateMethod(this, _remote, remote_fn).call(this, "getDuration");
  });
};
_onReady = new WeakSet();
onReady_fn = function(duration, trigger) {
  const { nativeControls } = __privateGet(this, _ctx).$state, showEmbedControls = nativeControls();
  __privateSet(this, _seekableRange, new TimeRange(0, duration));
  const detail = {
    buffered: new TimeRange(0, 0),
    seekable: __privateGet(this, _seekableRange),
    duration
  };
  __privateGet(this, _ctx).delegate.ready(detail, trigger);
  if (!showEmbedControls) {
    __privateMethod(this, _remote, remote_fn).call(this, "_hideOverlay");
  }
  __privateMethod(this, _remote, remote_fn).call(this, "getQualities");
  __privateMethod(this, _remote, remote_fn).call(this, "getChapters");
};
_onMethod = new WeakSet();
onMethod_fn = function(method, data, trigger) {
  var _a;
  switch (method) {
    case "getVideoTitle":
      const videoTitle = data;
      __privateGet(this, _ctx).notify("title-change", videoTitle, trigger);
      break;
    case "getDuration":
      const duration = data;
      if (!__privateGet(this, _ctx).$state.canPlay()) {
        __privateMethod(this, _onReady, onReady_fn).call(this, duration, trigger);
      } else {
        __privateGet(this, _ctx).notify("duration-change", duration, trigger);
      }
      break;
    case "getCurrentTime":
      __privateMethod(this, _onTimeUpdate, onTimeUpdate_fn).call(this, data, trigger);
      break;
    case "getBuffered":
      if (isArray(data) && data.length) {
        __privateMethod(this, _onLoadProgress, onLoadProgress_fn).call(this, data[data.length - 1][1], trigger);
      }
      break;
    case "setMuted":
      __privateMethod(this, _onVolumeChange, onVolumeChange_fn).call(this, peek(__privateGet(this, _ctx).$state.volume), data, trigger);
      break;
    case "getChapters":
      __privateMethod(this, _onChaptersChange, onChaptersChange_fn).call(this, data);
      break;
    case "getQualities":
      __privateMethod(this, _onQualitiesChange, onQualitiesChange_fn).call(this, data, trigger);
      break;
  }
  (_a = __privateMethod(this, _getPromise, getPromise_fn).call(this, method)) == null ? void 0 : _a.resolve();
};
_attachListeners = new WeakSet();
attachListeners_fn = function() {
  for (const type of trackedVimeoEvents) {
    __privateMethod(this, _remote, remote_fn).call(this, "addEventListener", type);
  }
};
_onPause = new WeakSet();
onPause_fn = function(trigger) {
  __privateGet(this, _timeRAF).stop();
  __privateGet(this, _ctx).notify("pause", void 0, trigger);
};
_onPlay = new WeakSet();
onPlay_fn = function(trigger) {
  __privateGet(this, _timeRAF).start();
  __privateGet(this, _ctx).notify("play", void 0, trigger);
};
_onPlayProgress = new WeakSet();
onPlayProgress_fn = function(trigger) {
  const { paused } = __privateGet(this, _ctx).$state;
  if (!paused() && !__privateGet(this, _preventTimeUpdates)) {
    __privateGet(this, _ctx).notify("playing", void 0, trigger);
  }
};
_onLoadProgress = new WeakSet();
onLoadProgress_fn = function(buffered, trigger) {
  const detail = {
    buffered: new TimeRange(0, buffered),
    seekable: __privateGet(this, _seekableRange)
  };
  __privateGet(this, _ctx).notify("progress", detail, trigger);
};
_onBufferStart = new WeakSet();
onBufferStart_fn = function(trigger) {
  __privateGet(this, _ctx).notify("waiting", void 0, trigger);
};
_onBufferEnd = new WeakSet();
onBufferEnd_fn = function(trigger) {
  const { paused } = __privateGet(this, _ctx).$state;
  if (!paused())
    __privateGet(this, _ctx).notify("playing", void 0, trigger);
};
_onWaiting = new WeakSet();
onWaiting_fn = function(trigger) {
  const { paused } = __privateGet(this, _ctx).$state;
  if (paused()) {
    __privateGet(this, _ctx).notify("play", void 0, trigger);
  }
  __privateGet(this, _ctx).notify("waiting", void 0, trigger);
};
_onVolumeChange = new WeakSet();
onVolumeChange_fn = function(volume, muted, trigger) {
  const detail = { volume, muted };
  __privateGet(this, _ctx).notify("volume-change", detail, trigger);
};
_onChaptersChange = new WeakSet();
onChaptersChange_fn = function(chapters) {
  __privateMethod(this, _removeChapters, removeChapters_fn).call(this);
  if (!chapters.length)
    return;
  const track = new TextTrack({
    kind: "chapters",
    default: true
  }), { seekableEnd } = __privateGet(this, _ctx).$state;
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i], nextChapter = chapters[i + 1];
    track.addCue(
      new window.VTTCue(
        chapter.startTime,
        (nextChapter == null ? void 0 : nextChapter.startTime) ?? seekableEnd(),
        chapter.title
      )
    );
  }
  __privateSet(this, _chaptersTrack, track);
  __privateGet(this, _ctx).textTracks.add(track);
};
_removeChapters = new WeakSet();
removeChapters_fn = function() {
  if (!__privateGet(this, _chaptersTrack))
    return;
  __privateGet(this, _ctx).textTracks.remove(__privateGet(this, _chaptersTrack));
  __privateSet(this, _chaptersTrack, null);
};
_onQualitiesChange = new WeakSet();
onQualitiesChange_fn = function(qualities, trigger) {
  __privateGet(this, _ctx).qualities[QualitySymbol.enableAuto] = qualities.some((q) => q.id === "auto") ? () => __privateMethod(this, _remote, remote_fn).call(this, "setQuality", "auto") : void 0;
  for (const quality of qualities) {
    if (quality.id === "auto")
      continue;
    const height = +quality.id.slice(0, -1);
    if (isNaN(height))
      continue;
    __privateGet(this, _ctx).qualities[ListSymbol.add](
      {
        id: quality.id,
        width: height * (16 / 9),
        height,
        codec: "avc1,h.264",
        bitrate: -1
      },
      trigger
    );
  }
  __privateMethod(this, _onQualityChange, onQualityChange_fn).call(this, qualities.find((q) => q.active), trigger);
};
_onQualityChange = new WeakSet();
onQualityChange_fn = function({ id } = {}, trigger) {
  if (!id)
    return;
  const isAuto = id === "auto", newQuality = __privateGet(this, _ctx).qualities.getById(id);
  if (isAuto) {
    __privateGet(this, _ctx).qualities[QualitySymbol.setAuto](isAuto, trigger);
    __privateGet(this, _ctx).qualities[ListSymbol.select](void 0, true, trigger);
  } else {
    __privateGet(this, _ctx).qualities[ListSymbol.select](newQuality ?? void 0, true, trigger);
  }
};
_onEvent = new WeakSet();
onEvent_fn = function(event, payload, trigger) {
  switch (event) {
    case "ready":
      __privateMethod(this, _attachListeners, attachListeners_fn).call(this);
      break;
    case "loaded":
      __privateMethod(this, _onLoaded, onLoaded_fn).call(this, trigger);
      break;
    case "play":
      __privateMethod(this, _onPlay, onPlay_fn).call(this, trigger);
      break;
    case "playProgress":
      __privateMethod(this, _onPlayProgress, onPlayProgress_fn).call(this, trigger);
      break;
    case "pause":
      __privateMethod(this, _onPause, onPause_fn).call(this, trigger);
      break;
    case "loadProgress":
      __privateMethod(this, _onLoadProgress, onLoadProgress_fn).call(this, payload.seconds, trigger);
      break;
    case "waiting":
      __privateMethod(this, _onWaiting, onWaiting_fn).call(this, trigger);
      break;
    case "bufferstart":
      __privateMethod(this, _onBufferStart, onBufferStart_fn).call(this, trigger);
      break;
    case "bufferend":
      __privateMethod(this, _onBufferEnd, onBufferEnd_fn).call(this, trigger);
      break;
    case "volumechange":
      __privateMethod(this, _onVolumeChange, onVolumeChange_fn).call(this, payload.volume, peek(__privateGet(this, _ctx).$state.muted), trigger);
      break;
    case "durationchange":
      __privateSet(this, _seekableRange, new TimeRange(0, payload.duration));
      __privateGet(this, _ctx).notify("duration-change", payload.duration, trigger);
      break;
    case "playbackratechange":
      __privateGet(this, _ctx).notify("rate-change", payload.playbackRate, trigger);
      break;
    case "qualitychange":
      __privateMethod(this, _onQualityChange, onQualityChange_fn).call(this, payload, trigger);
      break;
    case "fullscreenchange":
      __privateSet(this, _fullscreenActive, payload.fullscreen);
      __privateGet(this, _ctx).notify("fullscreen-change", payload.fullscreen, trigger);
      break;
    case "enterpictureinpicture":
      __privateGet(this, _ctx).notify("picture-in-picture-change", true, trigger);
      break;
    case "leavepictureinpicture":
      __privateGet(this, _ctx).notify("picture-in-picture-change", false, trigger);
      break;
    case "ended":
      __privateGet(this, _ctx).notify("end", void 0, trigger);
      break;
    case "error":
      __privateMethod(this, _onError, onError_fn).call(this, payload, trigger);
      break;
    case "seek":
    case "seeked":
      __privateMethod(this, _onSeeked, onSeeked_fn).call(this, payload.seconds, trigger);
      break;
  }
};
_onError = new WeakSet();
onError_fn = function(error, trigger) {
  var _a, _b;
  const { message, method } = error;
  if (method === "setPlaybackRate") {
    __privateGet(this, _pro).set(false);
  }
  if (method) {
    (_a = __privateMethod(this, _getPromise, getPromise_fn).call(this, method)) == null ? void 0 : _a.reject(message);
  }
  {
    (_b = __privateGet(this, _ctx).logger) == null ? void 0 : _b.errorGroup(`[vimeo]: ${message}`).labelledLog("Error", error).labelledLog("Provider", this).labelledLog("Event", trigger).dispatch();
  }
};
_remote = new WeakSet();
remote_fn = async function(command, arg) {
  let promise = deferredPromise(), promises = __privateGet(this, _promises).get(command);
  if (!promises)
    __privateGet(this, _promises).set(command, promises = []);
  promises.push(promise);
  this.postMessage({
    method: command,
    value: arg
  });
  return promise.promise;
};
_reset = new WeakSet();
reset_fn = function() {
  __privateGet(this, _timeRAF).stop();
  __privateSet(this, _seekableRange, new TimeRange(0, 0));
  __privateSet(this, _videoInfoPromise, null);
  __privateSet(this, _currentCue, null);
  __privateGet(this, _pro).set(false);
  __privateMethod(this, _removeChapters, removeChapters_fn).call(this);
};
_getPromise = new WeakSet();
getPromise_fn = function(command) {
  var _a;
  return (_a = __privateGet(this, _promises).get(command)) == null ? void 0 : _a.shift();
};
export {
  VimeoProvider
};
//# sourceMappingURL=vidstack-vimeo-OF2TQD5N.js.map
