// node_modules/vidstack/dev/chunks/vidstack-DbBJlz7I.js
function coerceToError(error) {
  return error instanceof Error ? error : Error(typeof error === "string" ? error : JSON.stringify(error));
}
function assert(condition, message) {
  if (!condition) {
    throw Error(message || "Assertion failed.");
  }
}

export {
  coerceToError,
  assert
};
//# sourceMappingURL=chunk-NQV4QZM3.js.map
