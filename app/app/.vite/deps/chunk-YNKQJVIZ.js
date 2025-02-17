import {
  deferredPromise,
  isNull,
  isString
} from "./chunk-ZOOREORJ.js";

// node_modules/vidstack/dev/chunks/vidstack-DCY5OwWc.js
function appendParamsToURL(baseUrl, params) {
  const url = new URL(baseUrl);
  for (const key of Object.keys(params)) {
    url.searchParams.set(key, params[key] + "");
  }
  return url.toString();
}
function preconnect(url, rel = "preconnect") {
  const exists = document.querySelector(`link[href="${url}"]`);
  if (!isNull(exists))
    return true;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = url;
  link.crossOrigin = "true";
  document.head.append(link);
  return true;
}
var pendingRequests = {};
function loadScript(src) {
  if (pendingRequests[src])
    return pendingRequests[src].promise;
  const promise = deferredPromise(), exists = document.querySelector(`script[src="${src}"]`);
  if (!isNull(exists)) {
    promise.resolve();
    return promise.promise;
  }
  pendingRequests[src] = promise;
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => {
    promise.resolve();
    delete pendingRequests[src];
  };
  script.onerror = () => {
    promise.reject();
    delete pendingRequests[src];
  };
  setTimeout(() => document.head.append(script), 0);
  return promise.promise;
}
function getRequestCredentials(crossOrigin) {
  return crossOrigin === "use-credentials" ? "include" : isString(crossOrigin) ? "same-origin" : void 0;
}

export {
  appendParamsToURL,
  preconnect,
  loadScript,
  getRequestCredentials
};
//# sourceMappingURL=chunk-YNKQJVIZ.js.map
