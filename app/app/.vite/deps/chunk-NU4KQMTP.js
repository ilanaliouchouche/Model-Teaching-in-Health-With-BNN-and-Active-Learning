import {
  TextTrack,
  TextTrackSymbol
} from "./chunk-EBRHQEUP.js";
import {
  HTMLAirPlayAdapter,
  HTMLMediaProvider
} from "./chunk-OSWRSLMA.js";
import {
  canPlayHLSNatively,
  canUsePictureInPicture,
  canUseVideoPresentation
} from "./chunk-K2JGPOHG.js";
import {
  DOMEvent,
  EventsController,
  listenEvent,
  onDispose,
  scoped
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/providers/vidstack-video.js
var _video, _ctx, _onAddTrack, onAddTrack_fn, _onDispose, onDispose_fn;
var NativeHLSTextTracks = class {
  constructor(video, ctx) {
    __privateAdd(this, _onAddTrack);
    __privateAdd(this, _onDispose);
    __privateAdd(this, _video, void 0);
    __privateAdd(this, _ctx, void 0);
    __privateSet(this, _video, video);
    __privateSet(this, _ctx, ctx);
    video.textTracks.onaddtrack = __privateMethod(this, _onAddTrack, onAddTrack_fn).bind(this);
    onDispose(__privateMethod(this, _onDispose, onDispose_fn).bind(this));
  }
};
_video = new WeakMap();
_ctx = new WeakMap();
_onAddTrack = new WeakSet();
onAddTrack_fn = function(event) {
  const nativeTrack = event.track;
  if (!nativeTrack || findTextTrackElement(__privateGet(this, _video), nativeTrack))
    return;
  const track = new TextTrack({
    id: nativeTrack.id,
    kind: nativeTrack.kind,
    label: nativeTrack.label ?? "",
    language: nativeTrack.language,
    type: "vtt"
  });
  track[TextTrackSymbol.native] = { track: nativeTrack };
  track[TextTrackSymbol.readyState] = 2;
  track[TextTrackSymbol.nativeHLS] = true;
  let lastIndex = 0;
  const onCueChange = (event2) => {
    if (!nativeTrack.cues)
      return;
    for (let i = lastIndex; i < nativeTrack.cues.length; i++) {
      track.addCue(nativeTrack.cues[i], event2);
      lastIndex++;
    }
  };
  onCueChange(event);
  nativeTrack.oncuechange = onCueChange;
  __privateGet(this, _ctx).textTracks.add(track, event);
  track.setMode(nativeTrack.mode, event);
};
_onDispose = new WeakSet();
onDispose_fn = function() {
  var _a;
  __privateGet(this, _video).textTracks.onaddtrack = null;
  for (const track of __privateGet(this, _ctx).textTracks) {
    const nativeTrack = (_a = track[TextTrackSymbol.native]) == null ? void 0 : _a.track;
    if (nativeTrack == null ? void 0 : nativeTrack.oncuechange)
      nativeTrack.oncuechange = null;
  }
};
function findTextTrackElement(video, track) {
  return Array.from(video.children).find((el) => el.track === track);
}
var _video2, _media, _onEnter, onEnter_fn, _onExit, onExit_fn, _onChange;
var VideoPictureInPicture = class {
  constructor(video, media) {
    __privateAdd(this, _onEnter);
    __privateAdd(this, _onExit);
    __privateAdd(this, _video2, void 0);
    __privateAdd(this, _media, void 0);
    __privateAdd(this, _onChange, (active, event) => {
      __privateGet(this, _media).notify("picture-in-picture-change", active, event);
    });
    __privateSet(this, _video2, video);
    __privateSet(this, _media, media);
    new EventsController(video).add("enterpictureinpicture", __privateMethod(this, _onEnter, onEnter_fn).bind(this)).add("leavepictureinpicture", __privateMethod(this, _onExit, onExit_fn).bind(this));
  }
  get active() {
    return document.pictureInPictureElement === __privateGet(this, _video2);
  }
  get supported() {
    return canUsePictureInPicture(__privateGet(this, _video2));
  }
  async enter() {
    return __privateGet(this, _video2).requestPictureInPicture();
  }
  exit() {
    return document.exitPictureInPicture();
  }
};
_video2 = new WeakMap();
_media = new WeakMap();
_onEnter = new WeakSet();
onEnter_fn = function(event) {
  __privateGet(this, _onChange).call(this, true, event);
};
_onExit = new WeakSet();
onExit_fn = function(event) {
  __privateGet(this, _onChange).call(this, false, event);
};
_onChange = new WeakMap();
var _video3, _media2, _mode, _onModeChange, onModeChange_fn;
var VideoPresentation = class {
  constructor(video, media) {
    __privateAdd(this, _onModeChange);
    __privateAdd(this, _video3, void 0);
    __privateAdd(this, _media2, void 0);
    __privateAdd(this, _mode, "inline");
    __privateSet(this, _video3, video);
    __privateSet(this, _media2, media);
    listenEvent(video, "webkitpresentationmodechanged", __privateMethod(this, _onModeChange, onModeChange_fn).bind(this));
  }
  get mode() {
    return __privateGet(this, _mode);
  }
  get supported() {
    return canUseVideoPresentation(__privateGet(this, _video3));
  }
  async setPresentationMode(mode) {
    if (__privateGet(this, _mode) === mode)
      return;
    __privateGet(this, _video3).webkitSetPresentationMode(mode);
  }
};
_video3 = new WeakMap();
_media2 = new WeakMap();
_mode = new WeakMap();
_onModeChange = new WeakSet();
onModeChange_fn = function(event) {
  var _a, _b;
  const prevMode = __privateGet(this, _mode);
  __privateSet(this, _mode, __privateGet(this, _video3).webkitPresentationMode);
  {
    (_a = __privateGet(this, _media2).logger) == null ? void 0 : _a.infoGroup("presentation mode change").labelledLog("Mode", __privateGet(this, _mode)).labelledLog("Event", event).dispatch();
  }
  (_b = __privateGet(this, _media2).player) == null ? void 0 : _b.dispatch(
    new DOMEvent("video-presentation-change", {
      detail: __privateGet(this, _mode),
      trigger: event
    })
  );
  ["fullscreen", "picture-in-picture"].forEach((type) => {
    if (__privateGet(this, _mode) === type || prevMode === type) {
      __privateGet(this, _media2).notify(`${type}-change`, __privateGet(this, _mode) === type, event);
    }
  });
};
var _presentation;
var FullscreenPresentationAdapter = class {
  constructor(presentation) {
    __privateAdd(this, _presentation, void 0);
    __privateSet(this, _presentation, presentation);
  }
  get active() {
    return __privateGet(this, _presentation).mode === "fullscreen";
  }
  get supported() {
    return __privateGet(this, _presentation).supported;
  }
  async enter() {
    __privateGet(this, _presentation).setPresentationMode("fullscreen");
  }
  async exit() {
    __privateGet(this, _presentation).setPresentationMode("inline");
  }
};
_presentation = new WeakMap();
var _presentation2;
var PIPPresentationAdapter = class {
  constructor(presentation) {
    __privateAdd(this, _presentation2, void 0);
    __privateSet(this, _presentation2, presentation);
  }
  get active() {
    return __privateGet(this, _presentation2).mode === "picture-in-picture";
  }
  get supported() {
    return __privateGet(this, _presentation2).supported;
  }
  async enter() {
    __privateGet(this, _presentation2).setPresentationMode("picture-in-picture");
  }
  async exit() {
    __privateGet(this, _presentation2).setPresentationMode("inline");
  }
};
_presentation2 = new WeakMap();
var VideoProvider = class extends HTMLMediaProvider {
  constructor(video, ctx) {
    super(video, ctx);
    __publicField(this, "$$PROVIDER_TYPE", "VIDEO");
    __publicField(this, "airPlay");
    __publicField(this, "fullscreen");
    __publicField(this, "pictureInPicture");
    scoped(() => {
      this.airPlay = new HTMLAirPlayAdapter(video, ctx);
      if (canUseVideoPresentation(video)) {
        const presentation = new VideoPresentation(video, ctx);
        this.fullscreen = new FullscreenPresentationAdapter(presentation);
        this.pictureInPicture = new PIPPresentationAdapter(presentation);
      } else if (canUsePictureInPicture(video)) {
        this.pictureInPicture = new VideoPictureInPicture(video, ctx);
      }
    }, this.scope);
  }
  get type() {
    return "video";
  }
  setup() {
    super.setup();
    if (canPlayHLSNatively(this.video)) {
      new NativeHLSTextTracks(this.video, this.ctx);
    }
    this.ctx.textRenderers.attachVideo(this.video);
    onDispose(() => {
      this.ctx.textRenderers.attachVideo(null);
    });
    if (this.type === "video")
      this.ctx.notify("provider-setup", this);
  }
  /**
   * The native HTML `<video>` element.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement}
   */
  get video() {
    return this.media;
  }
};

export {
  VideoProvider
};
//# sourceMappingURL=chunk-NU4KQMTP.js.map
