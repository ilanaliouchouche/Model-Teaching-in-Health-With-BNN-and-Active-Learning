import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/chunks/vidstack-DVpy0IqK.js
var SCOPE = Symbol("SCOPE");
var scheduledEffects = false;
var runningEffects = false;
var currentScope = null;
var currentObserver = null;
var currentObservers = null;
var currentObserversIndex = 0;
var effects = [];
var defaultContext = {};
var NOOP = () => {
};
var STATE_CLEAN = 0;
var STATE_CHECK = 1;
var STATE_DIRTY = 2;
var STATE_DISPOSED = 3;
function flushEffects() {
  scheduledEffects = true;
  queueMicrotask(runEffects);
}
function runEffects() {
  if (!effects.length) {
    scheduledEffects = false;
    return;
  }
  runningEffects = true;
  for (let i = 0; i < effects.length; i++) {
    if (effects[i]._state !== STATE_CLEAN)
      runTop(effects[i]);
  }
  effects = [];
  scheduledEffects = false;
  runningEffects = false;
}
function runTop(node) {
  let ancestors = [node];
  while (node = node[SCOPE]) {
    if (node._effect && node._state !== STATE_CLEAN)
      ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    updateCheck(ancestors[i]);
  }
}
function peek(fn) {
  return compute(currentScope, fn, null);
}
function untrack(fn) {
  return compute(null, fn, null);
}
function tick() {
  if (!runningEffects)
    runEffects();
}
function getScope() {
  return currentScope;
}
function scoped(run, scope) {
  try {
    return compute(scope, run, null);
  } catch (error) {
    handleError(scope, error);
    return;
  }
}
function getContext(key2, scope = currentScope) {
  return scope == null ? void 0 : scope._context[key2];
}
function setContext(key2, value, scope = currentScope) {
  if (scope)
    scope._context = { ...scope._context, [key2]: value };
}
function onDispose(disposable) {
  if (!disposable || !currentScope)
    return disposable || NOOP;
  const node = currentScope;
  if (!node._disposal) {
    node._disposal = disposable;
  } else if (Array.isArray(node._disposal)) {
    node._disposal.push(disposable);
  } else {
    node._disposal = [node._disposal, disposable];
  }
  return function removeDispose() {
    if (node._state === STATE_DISPOSED)
      return;
    disposable.call(null);
    if (isFunction$1(node._disposal)) {
      node._disposal = null;
    } else if (Array.isArray(node._disposal)) {
      node._disposal.splice(node._disposal.indexOf(disposable), 1);
    }
  };
}
function dispose(self = true) {
  if (this._state === STATE_DISPOSED)
    return;
  if (this._children) {
    if (Array.isArray(this._children)) {
      for (let i = this._children.length - 1; i >= 0; i--) {
        dispose.call(this._children[i]);
      }
    } else {
      dispose.call(this._children);
    }
  }
  if (self) {
    const parent = this[SCOPE];
    if (parent) {
      if (Array.isArray(parent._children)) {
        parent._children.splice(parent._children.indexOf(this), 1);
      } else {
        parent._children = null;
      }
    }
    disposeNode(this);
  }
}
function disposeNode(node) {
  node._state = STATE_DISPOSED;
  if (node._disposal)
    emptyDisposal(node);
  if (node._sources)
    removeSourceObservers(node, 0);
  node[SCOPE] = null;
  node._sources = null;
  node._observers = null;
  node._children = null;
  node._context = defaultContext;
  node._handlers = null;
}
function emptyDisposal(scope) {
  try {
    if (Array.isArray(scope._disposal)) {
      for (let i = scope._disposal.length - 1; i >= 0; i--) {
        const callable = scope._disposal[i];
        callable.call(callable);
      }
    } else {
      scope._disposal.call(scope._disposal);
    }
    scope._disposal = null;
  } catch (error) {
    handleError(scope, error);
  }
}
function compute(scope, compute2, observer) {
  const prevScope = currentScope, prevObserver = currentObserver;
  currentScope = scope;
  currentObserver = observer;
  try {
    return compute2.call(scope);
  } finally {
    currentScope = prevScope;
    currentObserver = prevObserver;
  }
}
function handleError(scope, error) {
  if (!scope || !scope._handlers)
    throw error;
  let i = 0, len = scope._handlers.length, currentError = error;
  for (i = 0; i < len; i++) {
    try {
      scope._handlers[i](currentError);
      break;
    } catch (error2) {
      currentError = error2;
    }
  }
  if (i === len)
    throw currentError;
}
function read() {
  if (this._state === STATE_DISPOSED)
    return this._value;
  if (currentObserver && !this._effect) {
    if (!currentObservers && currentObserver._sources && currentObserver._sources[currentObserversIndex] == this) {
      currentObserversIndex++;
    } else if (!currentObservers)
      currentObservers = [this];
    else
      currentObservers.push(this);
  }
  if (this._compute)
    updateCheck(this);
  return this._value;
}
function write(newValue) {
  const value = isFunction$1(newValue) ? newValue(this._value) : newValue;
  if (this._changed(this._value, value)) {
    this._value = value;
    if (this._observers) {
      for (let i = 0; i < this._observers.length; i++) {
        notify(this._observers[i], STATE_DIRTY);
      }
    }
  }
  return this._value;
}
var ScopeNode = function Scope() {
  this[SCOPE] = null;
  this._children = null;
  if (currentScope)
    currentScope.append(this);
};
var ScopeProto = ScopeNode.prototype;
ScopeProto._context = defaultContext;
ScopeProto._handlers = null;
ScopeProto._compute = null;
ScopeProto._disposal = null;
ScopeProto.append = function(child) {
  child[SCOPE] = this;
  if (!this._children) {
    this._children = child;
  } else if (Array.isArray(this._children)) {
    this._children.push(child);
  } else {
    this._children = [this._children, child];
  }
  child._context = child._context === defaultContext ? this._context : { ...this._context, ...child._context };
  if (this._handlers) {
    child._handlers = !child._handlers ? this._handlers : [...child._handlers, ...this._handlers];
  }
};
ScopeProto.dispose = function() {
  dispose.call(this);
};
function createScope() {
  return new ScopeNode();
}
var ComputeNode = function Computation(initialValue, compute2, options) {
  ScopeNode.call(this);
  this._state = compute2 ? STATE_DIRTY : STATE_CLEAN;
  this._init = false;
  this._effect = false;
  this._sources = null;
  this._observers = null;
  this._value = initialValue;
  this.id = (options == null ? void 0 : options.id) ?? (this._compute ? "computed" : "signal");
  if (compute2)
    this._compute = compute2;
  if (options && options.dirty)
    this._changed = options.dirty;
};
var ComputeProto = ComputeNode.prototype;
Object.setPrototypeOf(ComputeProto, ScopeProto);
ComputeProto._changed = isNotEqual;
ComputeProto.call = read;
function createComputation(initialValue, compute2, options) {
  return new ComputeNode(initialValue, compute2, options);
}
function isNotEqual(a, b) {
  return a !== b;
}
function isFunction$1(value) {
  return typeof value === "function";
}
function updateCheck(node) {
  if (node._state === STATE_CHECK) {
    for (let i = 0; i < node._sources.length; i++) {
      updateCheck(node._sources[i]);
      if (node._state === STATE_DIRTY) {
        break;
      }
    }
  }
  if (node._state === STATE_DIRTY)
    update(node);
  else
    node._state = STATE_CLEAN;
}
function cleanup(node) {
  if (node._children)
    dispose.call(node, false);
  if (node._disposal)
    emptyDisposal(node);
  node._handlers = node[SCOPE] ? node[SCOPE]._handlers : null;
}
function update(node) {
  let prevObservers = currentObservers, prevObserversIndex = currentObserversIndex;
  currentObservers = null;
  currentObserversIndex = 0;
  try {
    cleanup(node);
    const result = compute(node, node._compute, node);
    updateObservers(node);
    if (!node._effect && node._init) {
      write.call(node, result);
    } else {
      node._value = result;
      node._init = true;
    }
  } catch (error) {
    if (!node._init && typeof node._value === "undefined") {
      console.error(
        `computed \`${node.id}\` threw error during first run, this can be fatal.

Solutions:

1. Set the \`initial\` option to silence this error`,
        "\n2. Or, use an `effect` if the return value is not being used",
        "\n\n",
        error
      );
    }
    updateObservers(node);
    handleError(node, error);
  } finally {
    currentObservers = prevObservers;
    currentObserversIndex = prevObserversIndex;
    node._state = STATE_CLEAN;
  }
}
function updateObservers(node) {
  if (currentObservers) {
    if (node._sources)
      removeSourceObservers(node, currentObserversIndex);
    if (node._sources && currentObserversIndex > 0) {
      node._sources.length = currentObserversIndex + currentObservers.length;
      for (let i = 0; i < currentObservers.length; i++) {
        node._sources[currentObserversIndex + i] = currentObservers[i];
      }
    } else {
      node._sources = currentObservers;
    }
    let source;
    for (let i = currentObserversIndex; i < node._sources.length; i++) {
      source = node._sources[i];
      if (!source._observers)
        source._observers = [node];
      else
        source._observers.push(node);
    }
  } else if (node._sources && currentObserversIndex < node._sources.length) {
    removeSourceObservers(node, currentObserversIndex);
    node._sources.length = currentObserversIndex;
  }
}
function notify(node, state) {
  if (node._state >= state)
    return;
  if (node._effect && node._state === STATE_CLEAN) {
    effects.push(node);
    if (!scheduledEffects)
      flushEffects();
  }
  node._state = state;
  if (node._observers) {
    for (let i = 0; i < node._observers.length; i++) {
      notify(node._observers[i], STATE_CHECK);
    }
  }
}
function removeSourceObservers(node, index) {
  let source, swap;
  for (let i = index; i < node._sources.length; i++) {
    source = node._sources[i];
    if (source._observers) {
      swap = source._observers.indexOf(node);
      source._observers[swap] = source._observers[source._observers.length - 1];
      source._observers.pop();
    }
  }
}
function noop(...args) {
}
function isNull(value) {
  return value === null;
}
function isUndefined(value) {
  return typeof value === "undefined";
}
function isNil(value) {
  return isNull(value) || isUndefined(value);
}
function isObject(value) {
  return (value == null ? void 0 : value.constructor) === Object;
}
function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}
function isString(value) {
  return typeof value === "string";
}
function isBoolean(value) {
  return typeof value === "boolean";
}
function isFunction(value) {
  return typeof value === "function";
}
function isArray(value) {
  return Array.isArray(value);
}
var EVENT = Event;
var DOM_EVENT = Symbol("DOM_EVENT");
var _a;
var DOMEvent = class extends EVENT {
  constructor(type, ...init) {
    var _a3, _b;
    super(type, init[0]);
    __publicField(this, _a, true);
    /**
     * The event detail.
     */
    __publicField(this, "detail");
    /**
     * The event trigger chain.
     */
    __publicField(this, "triggers", new EventTriggers());
    this.detail = (_a3 = init[0]) == null ? void 0 : _a3.detail;
    const trigger = (_b = init[0]) == null ? void 0 : _b.trigger;
    if (trigger)
      this.triggers.add(trigger);
  }
  /**
   * The preceding event that was responsible for this event being fired.
   */
  get trigger() {
    return this.triggers.source;
  }
  /**
   * The origin event that lead to this event being fired.
   */
  get originEvent() {
    return this.triggers.origin;
  }
  /**
   * Whether the origin event was triggered by the user.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted}
   */
  get isOriginTrusted() {
    var _a3;
    return ((_a3 = this.triggers.origin) == null ? void 0 : _a3.isTrusted) ?? false;
  }
};
_a = DOM_EVENT;
var EventTriggers = class {
  constructor() {
    __publicField(this, "chain", []);
  }
  get source() {
    return this.chain[0];
  }
  get origin() {
    return this.chain[this.chain.length - 1];
  }
  /**
   * Appends the event to the end of the chain.
   */
  add(event) {
    this.chain.push(event);
    if (isDOMEvent(event)) {
      this.chain.push(...event.triggers);
    }
  }
  /**
   * Removes the event from the chain and returns it (if found).
   */
  remove(event) {
    return this.chain.splice(this.chain.indexOf(event), 1)[0];
  }
  /**
   * Returns whether the chain contains the given `event`.
   */
  has(event) {
    return this.chain.some((e2) => e2 === event);
  }
  /**
   * Returns whether the chain contains the given event type.
   */
  hasType(type) {
    return !!this.findType(type);
  }
  /**
   * Returns the first event with the given `type` found in the chain.
   */
  findType(type) {
    return this.chain.find((e2) => e2.type === type);
  }
  /**
   * Walks an event chain on a given `event`, and invokes the given `callback` for each trigger event.
   */
  walk(callback) {
    for (const event of this.chain) {
      const returnValue = callback(event);
      if (returnValue)
        return [event, returnValue];
    }
  }
  [Symbol.iterator]() {
    return this.chain.values();
  }
};
function isDOMEvent(event) {
  return !!(event == null ? void 0 : event[DOM_EVENT]);
}
var EventsTarget = class extends EventTarget {
  constructor() {
    super(...arguments);
    /** @internal type only */
    __publicField(this, "$ts__events");
  }
  addEventListener(type, callback, options) {
    return super.addEventListener(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    return super.removeEventListener(type, callback, options);
  }
};
function listenEvent(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return onDispose(() => target.removeEventListener(type, handler, options));
}
var _target, _controller;
var EventsController = class {
  constructor(target) {
    __privateAdd(this, _target, void 0);
    __privateAdd(this, _controller, void 0);
    __privateSet(this, _target, target);
    __privateSet(this, _controller, new AbortController());
    onDispose(this.abort.bind(this));
  }
  get signal() {
    return __privateGet(this, _controller).signal;
  }
  add(type, handler, options) {
    if (this.signal.aborted)
      throw Error("aborted");
    __privateGet(this, _target).addEventListener(type, handler, {
      ...options,
      signal: (options == null ? void 0 : options.signal) ? anySignal(this.signal, options.signal) : this.signal
    });
    return this;
  }
  remove(type, handler) {
    __privateGet(this, _target).removeEventListener(type, handler);
    return this;
  }
  abort(reason) {
    __privateGet(this, _controller).abort(reason);
  }
};
_target = new WeakMap();
_controller = new WeakMap();
function anySignal(...signals) {
  const controller = new AbortController(), options = { signal: controller.signal };
  function onAbort(event) {
    controller.abort(event.target.reason);
  }
  for (const signal2 of signals) {
    if (signal2.aborted) {
      controller.abort(signal2.reason);
      break;
    }
    signal2.addEventListener("abort", onAbort, options);
  }
  return controller.signal;
}
function isTouchEvent(event) {
  return !!(event == null ? void 0 : event.type.startsWith("touch"));
}
function isKeyboardEvent(event) {
  return !!(event == null ? void 0 : event.type.startsWith("key"));
}
function wasEnterKeyPressed(event) {
  return isKeyboardEvent(event) && event.key === "Enter";
}
function isKeyboardClick(event) {
  return isKeyboardEvent(event) && (event.key === "Enter" || event.key === " ");
}
function isDOMNode(node) {
  return node instanceof Node;
}
function setAttribute(host, name, value) {
  if (!host)
    return;
  else if (!value && value !== "" && value !== 0) {
    host.removeAttribute(name);
  } else {
    const attrValue = value === true ? "" : value + "";
    if (host.getAttribute(name) !== attrValue) {
      host.setAttribute(name, attrValue);
    }
  }
}
function setStyle(host, property, value) {
  if (!host)
    return;
  else if (!value && value !== 0) {
    host.style.removeProperty(property);
  } else {
    host.style.setProperty(property, value + "");
  }
}
function signal(initialValue, options) {
  const node = createComputation(initialValue, null, options), signal2 = read.bind(node);
  signal2.node = node;
  signal2[SCOPE] = true;
  signal2.set = write.bind(node);
  return signal2;
}
function isReadSignal(fn) {
  return isFunction$1(fn) && SCOPE in fn;
}
function computed(compute2, options) {
  const node = createComputation(
    options == null ? void 0 : options.initial,
    compute2,
    options
  ), signal2 = read.bind(node);
  signal2[SCOPE] = true;
  signal2.node = node;
  return signal2;
}
function effect$1(effect2, options) {
  const signal2 = createComputation(
    null,
    function runEffect() {
      let effectResult = effect2();
      isFunction$1(effectResult) && onDispose(effectResult);
      return null;
    },
    { id: (options == null ? void 0 : options.id) ?? "effect" }
  );
  signal2._effect = true;
  update(signal2);
  {
    return function stopEffect() {
      dispose.call(signal2, true);
    };
  }
}
function isWriteSignal(fn) {
  return isReadSignal(fn) && "set" in fn;
}
var effect = effect$1;
function createContext(provide) {
  return { id: Symbol(), provide };
}
function provideContext(context, value, scope = getScope()) {
  var _a3;
  if (!scope) {
    throw Error("[maverick] attempting to provide context outside root");
  }
  const hasProvidedValue = !isUndefined(value);
  if (!hasProvidedValue && !context.provide) {
    throw Error("[maverick] context can not be provided without a value or `provide` function");
  }
  setContext(context.id, hasProvidedValue ? value : (_a3 = context.provide) == null ? void 0 : _a3.call(context), scope);
}
function useContext(context) {
  const value = getContext(context.id);
  if (isUndefined(value)) {
    throw Error("[maverick] attempting to use context without providing first");
  }
  return value;
}
function hasProvidedContext(context) {
  return !isUndefined(getContext(context.id));
}
var PROPS = Symbol("PROPS");
var METHODS = Symbol("METHODS");
var ON_DISPATCH = Symbol("ON_DISPATCH");
var EMPTY_PROPS = {};
var _a2, _setupCallbacks, _attachCallbacks, _connectCallbacks, _destroyCallbacks, _attachAttrs, attachAttrs_fn, _attachStyles, attachStyles_fn, _setAttr, setAttr_fn, _setStyle, setStyle_fn;
var Instance = class {
  constructor(Component2, scope, init) {
    __privateAdd(this, _attachAttrs);
    __privateAdd(this, _attachStyles);
    __privateAdd(this, _setAttr);
    __privateAdd(this, _setStyle);
    /** @internal type only */
    __publicField(this, "$ts__events");
    /** @internal type only */
    __publicField(this, "$ts__vars");
    /* @internal */
    __publicField(this, _a2, null);
    __publicField(this, "$el", signal(null));
    __publicField(this, "el", null);
    __publicField(this, "scope", null);
    __publicField(this, "attachScope", null);
    __publicField(this, "connectScope", null);
    __publicField(this, "component", null);
    __publicField(this, "destroyed", false);
    __publicField(this, "props", EMPTY_PROPS);
    __publicField(this, "attrs", null);
    __publicField(this, "styles", null);
    __publicField(this, "state");
    __publicField(this, "$state");
    __privateAdd(this, _setupCallbacks, []);
    __privateAdd(this, _attachCallbacks, []);
    __privateAdd(this, _connectCallbacks, []);
    __privateAdd(this, _destroyCallbacks, []);
    var _a3;
    this.scope = scope;
    if (init == null ? void 0 : init.scope)
      init.scope.append(scope);
    let stateFactory = Component2.state, props = Component2.props;
    if (stateFactory) {
      this.$state = stateFactory.create();
      this.state = new Proxy(this.$state, {
        get: (_, prop2) => this.$state[prop2]()
      });
      provideContext(stateFactory, this.$state);
    }
    if (props) {
      this.props = createInstanceProps(props);
      if (init == null ? void 0 : init.props) {
        for (const prop2 of Object.keys(init.props)) {
          (_a3 = this.props[prop2]) == null ? void 0 : _a3.set(init.props[prop2]);
        }
      }
    }
    onDispose(this.destroy.bind(this));
  }
  setup() {
    scoped(() => {
      for (const callback of __privateGet(this, _setupCallbacks))
        callback();
    }, this.scope);
  }
  attach(el) {
    var _a3;
    if (this.el)
      return;
    this.el = el;
    this.$el.set(el);
    {
      el.$$COMPONENT_NAME = (_a3 = this.component) == null ? void 0 : _a3.constructor.name;
    }
    scoped(() => {
      this.attachScope = createScope();
      scoped(() => {
        for (const callback of __privateGet(this, _attachCallbacks))
          callback(this.el);
        __privateMethod(this, _attachAttrs, attachAttrs_fn).call(this);
        __privateMethod(this, _attachStyles, attachStyles_fn).call(this);
      }, this.attachScope);
    }, this.scope);
    el.dispatchEvent(new Event("attached"));
  }
  detach() {
    var _a3;
    (_a3 = this.attachScope) == null ? void 0 : _a3.dispose();
    this.attachScope = null;
    this.connectScope = null;
    if (this.el) {
      this.el.$$COMPONENT_NAME = null;
    }
    this.el = null;
    this.$el.set(null);
  }
  connect() {
    if (!this.el || !this.attachScope || !__privateGet(this, _connectCallbacks).length)
      return;
    scoped(() => {
      this.connectScope = createScope();
      scoped(() => {
        for (const callback of __privateGet(this, _connectCallbacks))
          callback(this.el);
      }, this.connectScope);
    }, this.attachScope);
  }
  disconnect() {
    var _a3;
    (_a3 = this.connectScope) == null ? void 0 : _a3.dispose();
    this.connectScope = null;
  }
  destroy() {
    if (this.destroyed)
      return;
    this.destroyed = true;
    scoped(() => {
      for (const callback of __privateGet(this, _destroyCallbacks))
        callback(this.el);
    }, this.scope);
    const el = this.el;
    this.detach();
    this.scope.dispose();
    __privateGet(this, _setupCallbacks).length = 0;
    __privateGet(this, _attachCallbacks).length = 0;
    __privateGet(this, _connectCallbacks).length = 0;
    __privateGet(this, _destroyCallbacks).length = 0;
    this.component = null;
    this.attrs = null;
    this.styles = null;
    this.props = EMPTY_PROPS;
    this.scope = null;
    this.state = EMPTY_PROPS;
    this.$state = null;
    if (el)
      delete el.$;
  }
  addHooks(target) {
    if (target.onSetup)
      __privateGet(this, _setupCallbacks).push(target.onSetup.bind(target));
    if (target.onAttach)
      __privateGet(this, _attachCallbacks).push(target.onAttach.bind(target));
    if (target.onConnect)
      __privateGet(this, _connectCallbacks).push(target.onConnect.bind(target));
    if (target.onDestroy)
      __privateGet(this, _destroyCallbacks).push(target.onDestroy.bind(target));
  }
};
_a2 = ON_DISPATCH;
_setupCallbacks = new WeakMap();
_attachCallbacks = new WeakMap();
_connectCallbacks = new WeakMap();
_destroyCallbacks = new WeakMap();
_attachAttrs = new WeakSet();
attachAttrs_fn = function() {
  if (!this.attrs)
    return;
  for (const name of Object.keys(this.attrs)) {
    if (isFunction(this.attrs[name])) {
      effect(__privateMethod(this, _setAttr, setAttr_fn).bind(this, name));
    } else {
      setAttribute(this.el, name, this.attrs[name]);
    }
  }
};
_attachStyles = new WeakSet();
attachStyles_fn = function() {
  if (!this.styles)
    return;
  for (const name of Object.keys(this.styles)) {
    if (isFunction(this.styles[name])) {
      effect(__privateMethod(this, _setStyle, setStyle_fn).bind(this, name));
    } else {
      setStyle(this.el, name, this.styles[name]);
    }
  }
};
_setAttr = new WeakSet();
setAttr_fn = function(name) {
  setAttribute(this.el, name, this.attrs[name].call(this.component));
};
_setStyle = new WeakSet();
setStyle_fn = function(name) {
  setStyle(this.el, name, this.styles[name].call(this.component));
};
function createInstanceProps(props) {
  const $props = {};
  for (const name of Object.keys(props)) {
    const def = props[name];
    $props[name] = signal(def, def);
  }
  return $props;
}
var currentInstance = { $$: null };
var ViewController = class extends EventTarget {
  constructor() {
    super();
    /** @internal */
    __publicField(this, "$$");
    if (currentInstance.$$)
      this.attach(currentInstance);
  }
  get el() {
    return this.$$.el;
  }
  get $el() {
    return this.$$.$el();
  }
  get scope() {
    return this.$$.scope;
  }
  get attachScope() {
    return this.$$.attachScope;
  }
  get connectScope() {
    return this.$$.connectScope;
  }
  /** @internal */
  get $props() {
    return this.$$.props;
  }
  /** @internal */
  get $state() {
    return this.$$.$state;
  }
  get state() {
    return this.$$.state;
  }
  attach({ $$ }) {
    this.$$ = $$;
    $$.addHooks(this);
    return this;
  }
  addEventListener(type, callback, options) {
    if (!this.el) {
      const name = this.constructor.name;
      console.warn(`[maverick] adding event listener to \`${name}\` before element is attached`);
    }
    this.listen(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    var _a3;
    (_a3 = this.el) == null ? void 0 : _a3.removeEventListener(type, callback, options);
  }
  /**
   * The given callback is invoked when the component is ready to be set up.
   *
   * - This hook will run once.
   * - This hook is called both client-side and server-side.
   * - It's safe to use context inside this hook.
   * - The host element has not attached yet - wait for `onAttach`.
   */
  /**
   * This method can be used to specify attributes that should be set on the host element. Any
   * attributes that are assigned to a function will be considered a signal and updated accordingly.
   */
  setAttributes(attributes) {
    if (!this.$$.attrs)
      this.$$.attrs = {};
    Object.assign(this.$$.attrs, attributes);
  }
  /**
   * This method can be used to specify styles that should set be set on the host element. Any
   * styles that are assigned to a function will be considered a signal and updated accordingly.
   */
  setStyles(styles) {
    if (!this.$$.styles)
      this.$$.styles = {};
    Object.assign(this.$$.styles, styles);
  }
  /**
   * This method is used to satisfy the CSS variables contract specified on the current
   * component. Other CSS variables can be set via the `setStyles` method.
   */
  setCSSVars(vars) {
    this.setStyles(vars);
  }
  /**
   * Type-safe utility for creating component DOM events.
   */
  createEvent(type, ...init) {
    return new DOMEvent(type, init[0]);
  }
  /**
   * Creates a `DOMEvent` and dispatches it from the host element. This method is typed to
   * match all component events.
   */
  dispatch(type, ...init) {
    if (!this.el)
      return false;
    const event = type instanceof Event ? type : new DOMEvent(type, init[0]);
    Object.defineProperty(event, "target", {
      get: () => this.$$.component
    });
    return untrack(() => {
      var _a3, _b;
      (_b = (_a3 = this.$$)[ON_DISPATCH]) == null ? void 0 : _b.call(_a3, event);
      return this.el.dispatchEvent(event);
    });
  }
  dispatchEvent(event) {
    return this.dispatch(event);
  }
  /**
   * Adds an event listener for the given `type` and returns a function which can be invoked to
   * remove the event listener.
   *
   * - The listener is removed if the current scope is disposed.
   * - This method is safe to use on the server (noop).
   */
  listen(type, handler, options) {
    if (!this.el)
      return noop;
    return listenEvent(this.el, type, handler, options);
  }
};
var Component = class extends ViewController {
  subscribe(callback) {
    if (!this.state) {
      const name = this.constructor.name;
      throw Error(
        `[maverick] component \`${name}\` can not be subscribed to because it has no internal state`
      );
    }
    return scoped(() => effect(() => callback(this.state)), this.$$.scope);
  }
  destroy() {
    this.$$.destroy();
  }
};
function prop(target, propertyKey, descriptor) {
  if (!target[PROPS])
    target[PROPS] = /* @__PURE__ */ new Set();
  target[PROPS].add(propertyKey);
}
function method(target, propertyKey, descriptor) {
  if (!target[METHODS])
    target[METHODS] = /* @__PURE__ */ new Set();
  target[METHODS].add(propertyKey);
}
var _descriptors;
var State = class {
  constructor(record) {
    __publicField(this, "id", Symbol("STATE"));
    __publicField(this, "record");
    __privateAdd(this, _descriptors, void 0);
    this.record = record;
    __privateSet(this, _descriptors, Object.getOwnPropertyDescriptors(record));
  }
  create() {
    const store = {}, state = new Proxy(store, { get: (_, prop2) => store[prop2]() });
    for (const name of Object.keys(this.record)) {
      const getter = __privateGet(this, _descriptors)[name].get;
      store[name] = getter ? computed(getter.bind(state)) : signal(this.record[name]);
    }
    return store;
  }
  reset(record, filter) {
    for (const name of Object.keys(record)) {
      if (!__privateGet(this, _descriptors)[name].get && (!filter || filter(name))) {
        record[name].set(this.record[name]);
      }
    }
  }
};
_descriptors = new WeakMap();
function useState(state) {
  return useContext(state);
}
function camelToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function uppercaseFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function ariaBool(value) {
  return value ? "true" : "false";
}
function keysOf(obj) {
  return Object.keys(obj);
}
function deferredPromise() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function waitTimeout(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
function animationFrameThrottle(func) {
  let id = -1, lastArgs;
  function throttle2(...args) {
    lastArgs = args;
    if (id >= 0)
      return;
    id = window.requestAnimationFrame(() => {
      func.apply(this, lastArgs);
      id = -1;
      lastArgs = void 0;
    });
  }
  return throttle2;
}
var requestIdleCallback = typeof window !== "undefined" ? "requestIdleCallback" in window ? window.requestIdleCallback : (cb) => window.setTimeout(cb, 1) : noop;
function waitIdlePeriod(callback, options) {
  return new Promise((resolve) => {
    requestIdleCallback((deadline) => {
      callback == null ? void 0 : callback(deadline);
      resolve();
    }, options);
  });
}
var key = {
  fullscreenEnabled: 0,
  fullscreenElement: 1,
  requestFullscreen: 2,
  exitFullscreen: 3,
  fullscreenchange: 4,
  fullscreenerror: 5,
  fullscreen: 6
};
var webkit = [
  "webkitFullscreenEnabled",
  "webkitFullscreenElement",
  "webkitRequestFullscreen",
  "webkitExitFullscreen",
  "webkitfullscreenchange",
  "webkitfullscreenerror",
  "-webkit-full-screen"
];
var moz = [
  "mozFullScreenEnabled",
  "mozFullScreenElement",
  "mozRequestFullScreen",
  "mozCancelFullScreen",
  "mozfullscreenchange",
  "mozfullscreenerror",
  "-moz-full-screen"
];
var ms = [
  "msFullscreenEnabled",
  "msFullscreenElement",
  "msRequestFullscreen",
  "msExitFullscreen",
  "MSFullscreenChange",
  "MSFullscreenError",
  "-ms-fullscreen"
];
var document$1 = typeof window !== "undefined" && typeof window.document !== "undefined" ? window.document : {};
var vendor = "fullscreenEnabled" in document$1 && Object.keys(key) || webkit[0] in document$1 && webkit || moz[0] in document$1 && moz || ms[0] in document$1 && ms || [];
var fscreen = {
  requestFullscreen: function(element) {
    return element[vendor[key.requestFullscreen]]();
  },
  requestFullscreenFunction: function(element) {
    return element[vendor[key.requestFullscreen]];
  },
  get exitFullscreen() {
    return document$1[vendor[key.exitFullscreen]].bind(document$1);
  },
  get fullscreenPseudoClass() {
    return ":" + vendor[key.fullscreen];
  },
  addEventListener: function(type, handler, options) {
    return document$1.addEventListener(vendor[key[type]], handler, options);
  },
  removeEventListener: function(type, handler, options) {
    return document$1.removeEventListener(vendor[key[type]], handler, options);
  },
  get fullscreenEnabled() {
    return Boolean(document$1[vendor[key.fullscreenEnabled]]);
  },
  set fullscreenEnabled(val) {
  },
  get fullscreenElement() {
    return document$1[vendor[key.fullscreenElement]];
  },
  set fullscreenElement(val) {
  },
  get onfullscreenchange() {
    return document$1[("on" + vendor[key.fullscreenchange]).toLowerCase()];
  },
  set onfullscreenchange(handler) {
    return document$1[("on" + vendor[key.fullscreenchange]).toLowerCase()] = handler;
  },
  get onfullscreenerror() {
    return document$1[("on" + vendor[key.fullscreenerror]).toLowerCase()];
  },
  set onfullscreenerror(handler) {
    return document$1[("on" + vendor[key.fullscreenerror]).toLowerCase()] = handler;
  }
};
var functionThrottle = throttle;
function throttle(fn, interval, options) {
  var timeoutId = null;
  var throttledFn = null;
  var leading = options && options.leading;
  var trailing = options && options.trailing;
  if (leading == null) {
    leading = true;
  }
  if (trailing == null) {
    trailing = !leading;
  }
  if (leading == true) {
    trailing = false;
  }
  var cancel = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  var flush = function() {
    var call = throttledFn;
    cancel();
    if (call) {
      call();
    }
  };
  var throttleWrapper = function() {
    var callNow = leading && !timeoutId;
    var context = this;
    var args = arguments;
    throttledFn = function() {
      return fn.apply(context, args);
    };
    if (!timeoutId) {
      timeoutId = setTimeout(function() {
        timeoutId = null;
        if (trailing) {
          return throttledFn();
        }
      }, interval);
    }
    if (callNow) {
      callNow = false;
      return throttledFn();
    }
  };
  throttleWrapper.cancel = cancel;
  throttleWrapper.flush = flush;
  return throttleWrapper;
}
var functionDebounce = debounce;
function debounce(fn, wait, callFirst) {
  var timeout = null;
  var debouncedFn = null;
  var clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      debouncedFn = null;
      timeout = null;
    }
  };
  var flush = function() {
    var call = debouncedFn;
    clear();
    if (call) {
      call();
    }
  };
  var debounceWrapper = function() {
    if (!wait) {
      return fn.apply(this, arguments);
    }
    var context = this;
    var args = arguments;
    var callNow = callFirst && !timeout;
    clear();
    debouncedFn = function() {
      fn.apply(context, args);
    };
    timeout = setTimeout(function() {
      timeout = null;
      if (!callNow) {
        var call = debouncedFn;
        debouncedFn = null;
        return call();
      }
    }, wait);
    if (callNow) {
      return debouncedFn();
    }
  };
  debounceWrapper.cancel = clear;
  debounceWrapper.flush = flush;
  return debounceWrapper;
}
var t = (t2) => "object" == typeof t2 && null != t2 && 1 === t2.nodeType;
var e = (t2, e2) => (!e2 || "hidden" !== t2) && ("visible" !== t2 && "clip" !== t2);
var n = (t2, n2) => {
  if (t2.clientHeight < t2.scrollHeight || t2.clientWidth < t2.scrollWidth) {
    const o2 = getComputedStyle(t2, null);
    return e(o2.overflowY, n2) || e(o2.overflowX, n2) || ((t3) => {
      const e2 = ((t4) => {
        if (!t4.ownerDocument || !t4.ownerDocument.defaultView)
          return null;
        try {
          return t4.ownerDocument.defaultView.frameElement;
        } catch (t5) {
          return null;
        }
      })(t3);
      return !!e2 && (e2.clientHeight < t3.scrollHeight || e2.clientWidth < t3.scrollWidth);
    })(t2);
  }
  return false;
};
var o = (t2, e2, n2, o2, l2, r2, i, s) => r2 < t2 && i > e2 || r2 > t2 && i < e2 ? 0 : r2 <= t2 && s <= n2 || i >= e2 && s >= n2 ? r2 - t2 - o2 : i > e2 && s < n2 || r2 < t2 && s > n2 ? i - e2 + l2 : 0;
var l = (t2) => {
  const e2 = t2.parentElement;
  return null == e2 ? t2.getRootNode().host || null : e2;
};
var r = (e2, r2) => {
  var i, s, d, h;
  if ("undefined" == typeof document)
    return [];
  const { scrollMode: c, block: f, inline: u, boundary: a, skipOverflowHiddenElements: g } = r2, p = "function" == typeof a ? a : (t2) => t2 !== a;
  if (!t(e2))
    throw new TypeError("Invalid target");
  const m = document.scrollingElement || document.documentElement, w = [];
  let W = e2;
  for (; t(W) && p(W); ) {
    if (W = l(W), W === m) {
      w.push(W);
      break;
    }
    null != W && W === document.body && n(W) && !n(document.documentElement) || null != W && n(W, g) && w.push(W);
  }
  const b = null != (s = null == (i = window.visualViewport) ? void 0 : i.width) ? s : innerWidth, H = null != (h = null == (d = window.visualViewport) ? void 0 : d.height) ? h : innerHeight, { scrollX: y, scrollY: M } = window, { height: v, width: E, top: x, right: C, bottom: I, left: R } = e2.getBoundingClientRect(), { top: T, right: B, bottom: F, left: V } = ((t2) => {
    const e3 = window.getComputedStyle(t2);
    return { top: parseFloat(e3.scrollMarginTop) || 0, right: parseFloat(e3.scrollMarginRight) || 0, bottom: parseFloat(e3.scrollMarginBottom) || 0, left: parseFloat(e3.scrollMarginLeft) || 0 };
  })(e2);
  let k = "start" === f || "nearest" === f ? x - T : "end" === f ? I + F : x + v / 2 - T + F, D = "center" === u ? R + E / 2 - V + B : "end" === u ? C + B : R - V;
  const L = [];
  for (let t2 = 0; t2 < w.length; t2++) {
    const e3 = w[t2], { height: n2, width: l2, top: r3, right: i2, bottom: s2, left: d2 } = e3.getBoundingClientRect();
    if ("if-needed" === c && x >= 0 && R >= 0 && I <= H && C <= b && x >= r3 && I <= s2 && R >= d2 && C <= i2)
      return L;
    const h2 = getComputedStyle(e3), a2 = parseInt(h2.borderLeftWidth, 10), g2 = parseInt(h2.borderTopWidth, 10), p2 = parseInt(h2.borderRightWidth, 10), W2 = parseInt(h2.borderBottomWidth, 10);
    let T2 = 0, B2 = 0;
    const F2 = "offsetWidth" in e3 ? e3.offsetWidth - e3.clientWidth - a2 - p2 : 0, V2 = "offsetHeight" in e3 ? e3.offsetHeight - e3.clientHeight - g2 - W2 : 0, S = "offsetWidth" in e3 ? 0 === e3.offsetWidth ? 0 : l2 / e3.offsetWidth : 0, X = "offsetHeight" in e3 ? 0 === e3.offsetHeight ? 0 : n2 / e3.offsetHeight : 0;
    if (m === e3)
      T2 = "start" === f ? k : "end" === f ? k - H : "nearest" === f ? o(M, M + H, H, g2, W2, M + k, M + k + v, v) : k - H / 2, B2 = "start" === u ? D : "center" === u ? D - b / 2 : "end" === u ? D - b : o(y, y + b, b, a2, p2, y + D, y + D + E, E), T2 = Math.max(0, T2 + M), B2 = Math.max(0, B2 + y);
    else {
      T2 = "start" === f ? k - r3 - g2 : "end" === f ? k - s2 + W2 + V2 : "nearest" === f ? o(r3, s2, n2, g2, W2 + V2, k, k + v, v) : k - (r3 + n2 / 2) + V2 / 2, B2 = "start" === u ? D - d2 - a2 : "center" === u ? D - (d2 + l2 / 2) + F2 / 2 : "end" === u ? D - i2 + p2 + F2 : o(d2, i2, l2, a2, p2 + F2, D, D + E, E);
      const { scrollLeft: t3, scrollTop: h3 } = e3;
      T2 = 0 === X ? 0 : Math.max(0, Math.min(h3 + T2 / X, e3.scrollHeight - n2 / X + V2)), B2 = 0 === S ? 0 : Math.max(0, Math.min(t3 + B2 / S, e3.scrollWidth - l2 / S + F2)), k += h3 - T2, D += t3 - B2;
    }
    L.push({ el: e3, top: T2, left: B2 });
  }
  return L;
};
var ATTRS = Symbol("ATTRS");
var SETUP = Symbol("SETUP");
var SETUP_STATE = Symbol("SETUP_STATE");
var SETUP_CALLBACKS = Symbol("SETUP_CALLBACKS");
var SetupState;
(function(SetupState2) {
  const Idle = 0;
  SetupState2[SetupState2["Idle"] = Idle] = "Idle";
  const Pending = 1;
  SetupState2[SetupState2["Pending"] = Pending] = "Pending";
  const Ready = 2;
  SetupState2[SetupState2["Ready"] = Ready] = "Ready";
})(SetupState || (SetupState = {}));

export {
  peek,
  untrack,
  tick,
  getScope,
  scoped,
  onDispose,
  createScope,
  noop,
  isNull,
  isUndefined,
  isNil,
  isObject,
  isNumber,
  isString,
  isBoolean,
  isFunction,
  isArray,
  DOMEvent,
  EventsTarget,
  listenEvent,
  EventsController,
  isTouchEvent,
  isKeyboardEvent,
  wasEnterKeyPressed,
  isKeyboardClick,
  isDOMNode,
  setAttribute,
  setStyle,
  signal,
  computed,
  isWriteSignal,
  effect,
  createContext,
  provideContext,
  useContext,
  hasProvidedContext,
  ViewController,
  Component,
  prop,
  method,
  State,
  useState,
  camelToKebabCase,
  uppercaseFirstChar,
  ariaBool,
  keysOf,
  deferredPromise,
  waitTimeout,
  animationFrameThrottle,
  waitIdlePeriod,
  fscreen,
  functionThrottle,
  functionDebounce,
  r
};
//# sourceMappingURL=chunk-ZOOREORJ.js.map
