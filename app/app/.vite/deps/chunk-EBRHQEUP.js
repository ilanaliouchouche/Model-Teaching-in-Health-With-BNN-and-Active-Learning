import {
  getRequestCredentials
} from "./chunk-YNKQJVIZ.js";
import {
  DOMEvent,
  EventsTarget,
  getScope,
  isArray,
  isNumber,
  isString,
  listenEvent,
  scoped
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/chunks/vidstack-Cg9baIQC.js
function isCueActive(cue, time) {
  return time >= cue.startTime && time < cue.endTime;
}
function watchActiveTextTrack(tracks, kind, onChange) {
  let currentTrack = null, scope = getScope();
  function onModeChange() {
    const kinds = isString(kind) ? [kind] : kind, track = tracks.toArray().find((track2) => kinds.includes(track2.kind) && track2.mode === "showing");
    if (track === currentTrack)
      return;
    if (!track) {
      onChange(null);
      currentTrack = null;
      return;
    }
    if (track.readyState == 2) {
      onChange(track);
    } else {
      onChange(null);
      scoped(() => {
        const off = listenEvent(
          track,
          "load",
          () => {
            onChange(track);
            off();
          },
          { once: true }
        );
      }, scope);
    }
    currentTrack = track;
  }
  onModeChange();
  return listenEvent(tracks, "mode-change", onModeChange);
}

// node_modules/vidstack/dev/chunks/vidstack-nPuRR80r.js
var CROSS_ORIGIN = Symbol("TEXT_TRACK_CROSS_ORIGIN");
var READY_STATE = Symbol("TEXT_TRACK_READY_STATE");
var UPDATE_ACTIVE_CUES = Symbol("TEXT_TRACK_UPDATE_ACTIVE_CUES");
var CAN_LOAD = Symbol("TEXT_TRACK_CAN_LOAD");
var ON_MODE_CHANGE = Symbol("TEXT_TRACK_ON_MODE_CHANGE");
var NATIVE = Symbol("TEXT_TRACK_NATIVE");
var NATIVE_HLS = Symbol("TEXT_TRACK_NATIVE_HLS");
var TextTrackSymbol = {
  crossOrigin: CROSS_ORIGIN,
  readyState: READY_STATE,
  updateActiveCues: UPDATE_ACTIVE_CUES,
  canLoad: CAN_LOAD,
  onModeChange: ON_MODE_CHANGE,
  native: NATIVE,
  nativeHLS: NATIVE_HLS
};
var _canLoad, _currentTime, _mode, _metadata, _regions, _cues, _activeCues, _a, _b, _c, _d, _parseContent, parseContent_fn, _load, load_fn, _ready, ready_fn, _error, error_fn, _parseJSON, parseJSON_fn, _activeCuesChanged, activeCuesChanged_fn;
var TextTrack = class extends EventsTarget {
  constructor(init) {
    super();
    __privateAdd(this, _parseContent);
    __privateAdd(this, _load);
    __privateAdd(this, _ready);
    __privateAdd(this, _error);
    __privateAdd(this, _parseJSON);
    __privateAdd(this, _activeCuesChanged);
    __publicField(this, "src");
    __publicField(this, "content");
    __publicField(this, "type");
    __publicField(this, "encoding");
    __publicField(this, "id", "");
    __publicField(this, "label", "");
    __publicField(this, "language", "");
    __publicField(this, "kind");
    __publicField(this, "default", false);
    __privateAdd(this, _canLoad, false);
    __privateAdd(this, _currentTime, 0);
    __privateAdd(this, _mode, "disabled");
    __privateAdd(this, _metadata, {});
    __privateAdd(this, _regions, []);
    __privateAdd(this, _cues, []);
    __privateAdd(this, _activeCues, []);
    /** @internal */
    __publicField(this, _a, 0);
    /** @internal */
    __publicField(this, _b);
    /** @internal */
    __publicField(this, _c, null);
    /** @internal */
    __publicField(this, _d, null);
    for (const prop of Object.keys(init))
      this[prop] = init[prop];
    if (!this.type)
      this.type = "vtt";
    if (init.content) {
      __privateMethod(this, _parseContent, parseContent_fn).call(this, init);
    } else if (!init.src) {
      this[TextTrackSymbol.readyState] = 2;
    }
    if (isTrackCaptionKind(this) && !this.label) {
      console.warn(`[vidstack] captions text track created without label: \`${this.src}\``);
    }
  }
  static createId(track) {
    return `vds-${track.type}-${track.kind}-${track.src ?? track.label ?? "?"}`;
  }
  get metadata() {
    return __privateGet(this, _metadata);
  }
  get regions() {
    return __privateGet(this, _regions);
  }
  get cues() {
    return __privateGet(this, _cues);
  }
  get activeCues() {
    return __privateGet(this, _activeCues);
  }
  /**
   * - 0: Not Loading
   * - 1: Loading
   * - 2: Ready
   * - 3: Error
   */
  get readyState() {
    return this[TextTrackSymbol.readyState];
  }
  get mode() {
    return __privateGet(this, _mode);
  }
  set mode(mode) {
    this.setMode(mode);
  }
  addCue(cue, trigger) {
    var _a2;
    let i = 0, length = __privateGet(this, _cues).length;
    for (i = 0; i < length; i++)
      if (cue.endTime <= __privateGet(this, _cues)[i].startTime)
        break;
    if (i === length)
      __privateGet(this, _cues).push(cue);
    else
      __privateGet(this, _cues).splice(i, 0, cue);
    if (!(cue instanceof TextTrackCue)) {
      (_a2 = this[TextTrackSymbol.native]) == null ? void 0 : _a2.track.addCue(cue);
    }
    this.dispatchEvent(new DOMEvent("add-cue", { detail: cue, trigger }));
    if (isCueActive(cue, __privateGet(this, _currentTime))) {
      this[TextTrackSymbol.updateActiveCues](__privateGet(this, _currentTime), trigger);
    }
  }
  removeCue(cue, trigger) {
    var _a2;
    const index = __privateGet(this, _cues).indexOf(cue);
    if (index >= 0) {
      const isActive = __privateGet(this, _activeCues).includes(cue);
      __privateGet(this, _cues).splice(index, 1);
      (_a2 = this[TextTrackSymbol.native]) == null ? void 0 : _a2.track.removeCue(cue);
      this.dispatchEvent(new DOMEvent("remove-cue", { detail: cue, trigger }));
      if (isActive) {
        this[TextTrackSymbol.updateActiveCues](__privateGet(this, _currentTime), trigger);
      }
    }
  }
  setMode(mode, trigger) {
    var _a2;
    if (__privateGet(this, _mode) === mode)
      return;
    __privateSet(this, _mode, mode);
    if (mode === "disabled") {
      __privateSet(this, _activeCues, []);
      __privateMethod(this, _activeCuesChanged, activeCuesChanged_fn).call(this);
    } else if (this.readyState === 2) {
      this[TextTrackSymbol.updateActiveCues](__privateGet(this, _currentTime), trigger);
    } else {
      __privateMethod(this, _load, load_fn).call(this);
    }
    this.dispatchEvent(new DOMEvent("mode-change", { detail: this, trigger }));
    (_a2 = this[TextTrackSymbol.onModeChange]) == null ? void 0 : _a2.call(this);
  }
  /** @internal */
  [(_a = TextTrackSymbol.readyState, _b = TextTrackSymbol.crossOrigin, _c = TextTrackSymbol.onModeChange, _d = TextTrackSymbol.native, TextTrackSymbol.updateActiveCues)](currentTime, trigger) {
    __privateSet(this, _currentTime, currentTime);
    if (this.mode === "disabled" || !__privateGet(this, _cues).length)
      return;
    const activeCues = [];
    for (let i = 0, length = __privateGet(this, _cues).length; i < length; i++) {
      const cue = __privateGet(this, _cues)[i];
      if (isCueActive(cue, currentTime))
        activeCues.push(cue);
    }
    let changed = activeCues.length !== __privateGet(this, _activeCues).length;
    if (!changed) {
      for (let i = 0; i < activeCues.length; i++) {
        if (!__privateGet(this, _activeCues).includes(activeCues[i])) {
          changed = true;
          break;
        }
      }
    }
    __privateSet(this, _activeCues, activeCues);
    if (changed)
      __privateMethod(this, _activeCuesChanged, activeCuesChanged_fn).call(this, trigger);
  }
  /** @internal */
  [TextTrackSymbol.canLoad]() {
    __privateSet(this, _canLoad, true);
    if (__privateGet(this, _mode) !== "disabled")
      __privateMethod(this, _load, load_fn).call(this);
  }
};
_canLoad = new WeakMap();
_currentTime = new WeakMap();
_mode = new WeakMap();
_metadata = new WeakMap();
_regions = new WeakMap();
_cues = new WeakMap();
_activeCues = new WeakMap();
_parseContent = new WeakSet();
parseContent_fn = function(init) {
  import("./dev-6QCD6O3Z.js").then(({ parseText, VTTCue, VTTRegion }) => {
    if (!isString(init.content) || init.type === "json") {
      __privateMethod(this, _parseJSON, parseJSON_fn).call(this, init.content, VTTCue, VTTRegion);
      if (this.readyState !== 3)
        __privateMethod(this, _ready, ready_fn).call(this);
    } else {
      parseText(init.content, { type: init.type }).then(({ cues, regions }) => {
        __privateSet(this, _cues, cues);
        __privateSet(this, _regions, regions);
        __privateMethod(this, _ready, ready_fn).call(this);
      });
    }
  });
};
_load = new WeakSet();
load_fn = async function() {
  var _a2, _b2;
  if (!__privateGet(this, _canLoad) || this[TextTrackSymbol.readyState] > 0)
    return;
  this[TextTrackSymbol.readyState] = 1;
  this.dispatchEvent(new DOMEvent("load-start"));
  if (!this.src) {
    __privateMethod(this, _ready, ready_fn).call(this);
    return;
  }
  try {
    const { parseResponse, VTTCue, VTTRegion } = await import("./dev-6QCD6O3Z.js"), crossOrigin = (_a2 = this[TextTrackSymbol.crossOrigin]) == null ? void 0 : _a2.call(this);
    const response = fetch(this.src, {
      headers: this.type === "json" ? { "Content-Type": "application/json" } : void 0,
      credentials: getRequestCredentials(crossOrigin)
    });
    if (this.type === "json") {
      __privateMethod(this, _parseJSON, parseJSON_fn).call(this, await (await response).text(), VTTCue, VTTRegion);
    } else {
      const { errors, metadata, regions, cues } = await parseResponse(response, {
        type: this.type,
        encoding: this.encoding
      });
      if (((_b2 = errors[0]) == null ? void 0 : _b2.code) === 0) {
        throw errors[0];
      } else {
        __privateSet(this, _metadata, metadata);
        __privateSet(this, _regions, regions);
        __privateSet(this, _cues, cues);
      }
    }
    __privateMethod(this, _ready, ready_fn).call(this);
  } catch (error) {
    __privateMethod(this, _error, error_fn).call(this, error);
  }
};
_ready = new WeakSet();
ready_fn = function() {
  this[TextTrackSymbol.readyState] = 2;
  if (!this.src || this.type !== "vtt") {
    const native = this[TextTrackSymbol.native];
    if (native && !native.managed) {
      for (const cue of __privateGet(this, _cues))
        native.track.addCue(cue);
    }
  }
  const loadEvent = new DOMEvent("load");
  this[TextTrackSymbol.updateActiveCues](__privateGet(this, _currentTime), loadEvent);
  this.dispatchEvent(loadEvent);
};
_error = new WeakSet();
error_fn = function(error) {
  this[TextTrackSymbol.readyState] = 3;
  this.dispatchEvent(new DOMEvent("error", { detail: error }));
};
_parseJSON = new WeakSet();
parseJSON_fn = function(json, VTTCue, VTTRegion) {
  try {
    const { regions, cues } = parseJSONCaptionsFile(json, VTTCue, VTTRegion);
    __privateSet(this, _regions, regions);
    __privateSet(this, _cues, cues);
  } catch (error) {
    {
      console.error(`[vidstack] failed to parse JSON captions at: \`${this.src}\`

`, error);
    }
    __privateMethod(this, _error, error_fn).call(this, error);
  }
};
_activeCuesChanged = new WeakSet();
activeCuesChanged_fn = function(trigger) {
  this.dispatchEvent(new DOMEvent("cue-change", { trigger }));
};
var captionRE = /captions|subtitles/;
function isTrackCaptionKind(track) {
  return captionRE.test(track.kind);
}
function parseJSONCaptionsFile(json, Cue, Region) {
  const content = isString(json) ? JSON.parse(json) : json;
  let regions = [], cues = [];
  if (content.regions && Region) {
    regions = content.regions.map((region) => Object.assign(new Region(), region));
  }
  if (content.cues || isArray(content)) {
    cues = (isArray(content) ? content : content.cues).filter((content2) => isNumber(content2.startTime) && isNumber(content2.endTime)).map((cue) => Object.assign(new Cue(0, 0, ""), cue));
  }
  return { regions, cues };
}

export {
  isCueActive,
  watchActiveTextTrack,
  TextTrackSymbol,
  TextTrack,
  isTrackCaptionKind
};
//# sourceMappingURL=chunk-EBRHQEUP.js.map
