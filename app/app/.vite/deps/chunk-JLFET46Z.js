// node_modules/vidstack/dev/chunks/vidstack-Dihypf8P.js
function round(num, decimalPlaces = 2) {
  return Number(num.toFixed(decimalPlaces));
}
function getNumberOfDecimalPlaces(num) {
  var _a;
  return ((_a = String(num).split(".")[1]) == null ? void 0 : _a.length) ?? 0;
}
function clampNumber(min, value, max) {
  return Math.max(min, Math.min(max, value));
}

export {
  round,
  getNumberOfDecimalPlaces,
  clampNumber
};
//# sourceMappingURL=chunk-JLFET46Z.js.map
