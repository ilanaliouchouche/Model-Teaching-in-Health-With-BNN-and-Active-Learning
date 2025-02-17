import {
  isNumber,
  isUndefined
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/chunks/vidstack-HSkhaVtP.js
var _id, _callback, _loop, loop_fn;
var RAFLoop = class {
  constructor(callback) {
    __privateAdd(this, _loop);
    __privateAdd(this, _id, void 0);
    __privateAdd(this, _callback, void 0);
    __privateSet(this, _callback, callback);
  }
  start() {
    if (!isUndefined(__privateGet(this, _id)))
      return;
    __privateMethod(this, _loop, loop_fn).call(this);
  }
  stop() {
    if (isNumber(__privateGet(this, _id)))
      window.cancelAnimationFrame(__privateGet(this, _id));
    __privateSet(this, _id, void 0);
  }
};
_id = new WeakMap();
_callback = new WeakMap();
_loop = new WeakSet();
loop_fn = function() {
  __privateSet(this, _id, window.requestAnimationFrame(() => {
    if (isUndefined(__privateGet(this, _id)))
      return;
    __privateGet(this, _callback).call(this);
    __privateMethod(this, _loop, loop_fn).call(this);
  }));
};

export {
  RAFLoop
};
//# sourceMappingURL=chunk-U2LFAP4F.js.map
