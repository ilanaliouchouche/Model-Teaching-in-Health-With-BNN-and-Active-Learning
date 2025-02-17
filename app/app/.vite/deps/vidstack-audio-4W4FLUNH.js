import {
  HTMLAirPlayAdapter,
  HTMLMediaProvider
} from "./chunk-OSWRSLMA.js";
import "./chunk-U2LFAP4F.js";
import "./chunk-JLFET46Z.js";
import "./chunk-OPWJPTWG.js";
import "./chunk-K2JGPOHG.js";
import {
  scoped
} from "./chunk-ZOOREORJ.js";
import {
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/providers/vidstack-audio.js
var AudioProvider = class extends HTMLMediaProvider {
  constructor(audio, ctx) {
    super(audio, ctx);
    __publicField(this, "$$PROVIDER_TYPE", "AUDIO");
    __publicField(this, "airPlay");
    scoped(() => {
      this.airPlay = new HTMLAirPlayAdapter(this.media, ctx);
    }, this.scope);
  }
  get type() {
    return "audio";
  }
  setup() {
    super.setup();
    if (this.type === "audio")
      this.ctx.notify("provider-setup", this);
  }
  /**
   * The native HTML `<audio>` element.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement}
   */
  get audio() {
    return this.media;
  }
};
export {
  AudioProvider
};
//# sourceMappingURL=vidstack-audio-4W4FLUNH.js.map
