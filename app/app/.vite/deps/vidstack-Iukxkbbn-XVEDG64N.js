import {
  getCastContext,
  getCastErrorMessage,
  getCastFrameworkURL,
  getCastSession,
  getDefaultCastOptions,
  hasLoadedCastFramework,
  isCastAvailable,
  isCastConnected
} from "./chunk-MAGUOO2H.js";
import {
  loadScript
} from "./chunk-YNKQJVIZ.js";
import {
  IS_CHROME,
  IS_IOS,
  canGoogleCastSrc
} from "./chunk-K2JGPOHG.js";
import {
  peek
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/chunks/vidstack-Iukxkbbn.js
var _player, _loadCastFramework, loadCastFramework_fn, _showPrompt, showPrompt_fn, _setOptions, setOptions_fn, _notifyRemoteStateChange, notifyRemoteStateChange_fn, _createError, createError_fn;
var GoogleCastLoader = class {
  constructor() {
    __privateAdd(this, _loadCastFramework);
    __privateAdd(this, _showPrompt);
    __privateAdd(this, _setOptions);
    __privateAdd(this, _notifyRemoteStateChange);
    __privateAdd(this, _createError);
    __publicField(this, "name", "google-cast");
    __publicField(this, "target");
    __privateAdd(this, _player, void 0);
  }
  /**
   * @see {@link https://developers.google.com/cast/docs/reference/web_sender/cast.framework.CastContext}
   */
  get cast() {
    return getCastContext();
  }
  mediaType() {
    return "video";
  }
  canPlay(src) {
    return IS_CHROME && !IS_IOS && canGoogleCastSrc(src);
  }
  async prompt(ctx) {
    var _a;
    let loadEvent, openEvent, errorEvent;
    try {
      loadEvent = await __privateMethod(this, _loadCastFramework, loadCastFramework_fn).call(this, ctx);
      if (!__privateGet(this, _player)) {
        __privateSet(this, _player, new cast.framework.RemotePlayer());
        new cast.framework.RemotePlayerController(__privateGet(this, _player));
      }
      openEvent = ctx.player.createEvent("google-cast-prompt-open", {
        trigger: loadEvent
      });
      ctx.player.dispatchEvent(openEvent);
      __privateMethod(this, _notifyRemoteStateChange, notifyRemoteStateChange_fn).call(this, ctx, "connecting", openEvent);
      await __privateMethod(this, _showPrompt, showPrompt_fn).call(this, peek(ctx.$props.googleCast));
      ctx.$state.remotePlaybackInfo.set({
        deviceName: (_a = getCastSession()) == null ? void 0 : _a.getCastDevice().friendlyName
      });
      if (isCastConnected())
        __privateMethod(this, _notifyRemoteStateChange, notifyRemoteStateChange_fn).call(this, ctx, "connected", openEvent);
    } catch (code) {
      const error = code instanceof Error ? code : __privateMethod(this, _createError, createError_fn).call(this, (code + "").toUpperCase(), "Prompt failed.");
      errorEvent = ctx.player.createEvent("google-cast-prompt-error", {
        detail: error,
        trigger: openEvent ?? loadEvent,
        cancelable: true
      });
      ctx.player.dispatch(errorEvent);
      __privateMethod(this, _notifyRemoteStateChange, notifyRemoteStateChange_fn).call(this, ctx, isCastConnected() ? "connected" : "disconnected", errorEvent);
      throw error;
    } finally {
      ctx.player.dispatch("google-cast-prompt-close", {
        trigger: errorEvent ?? openEvent ?? loadEvent
      });
    }
  }
  async load(ctx) {
    if (!__privateGet(this, _player)) {
      throw Error("[vidstack] google cast player was not initialized");
    }
    return new (await import("./vidstack-google-cast-GJ37NAVK.js")).GoogleCastProvider(__privateGet(this, _player), ctx);
  }
};
_player = new WeakMap();
_loadCastFramework = new WeakSet();
loadCastFramework_fn = async function(ctx) {
  if (hasLoadedCastFramework())
    return;
  const loadStartEvent = ctx.player.createEvent("google-cast-load-start");
  ctx.player.dispatch(loadStartEvent);
  await loadScript(getCastFrameworkURL());
  await customElements.whenDefined("google-cast-launcher");
  const loadedEvent = ctx.player.createEvent("google-cast-loaded", { trigger: loadStartEvent });
  ctx.player.dispatch(loadedEvent);
  if (!isCastAvailable()) {
    throw __privateMethod(this, _createError, createError_fn).call(this, "CAST_NOT_AVAILABLE", "Google Cast not available on this platform.");
  }
  return loadedEvent;
};
_showPrompt = new WeakSet();
showPrompt_fn = async function(options) {
  __privateMethod(this, _setOptions, setOptions_fn).call(this, options);
  const errorCode = await this.cast.requestSession();
  if (errorCode) {
    throw __privateMethod(this, _createError, createError_fn).call(this, errorCode.toUpperCase(), getCastErrorMessage(errorCode));
  }
};
_setOptions = new WeakSet();
setOptions_fn = function(options) {
  var _a;
  (_a = this.cast) == null ? void 0 : _a.setOptions({
    ...getDefaultCastOptions(),
    ...options
  });
};
_notifyRemoteStateChange = new WeakSet();
notifyRemoteStateChange_fn = function(ctx, state, trigger) {
  const detail = { type: "google-cast", state };
  ctx.notify("remote-playback-change", detail, trigger);
};
_createError = new WeakSet();
createError_fn = function(code, message) {
  const error = Error(message);
  error.code = code;
  return error;
};
export {
  GoogleCastLoader
};
//# sourceMappingURL=vidstack-Iukxkbbn-XVEDG64N.js.map
