import {
  isArray,
  isNumber,
  isUndefined
} from "./chunk-ZOOREORJ.js";
import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-Q6BFB6C2.js";

// node_modules/vidstack/dev/chunks/vidstack-B5ElR9su.js
var _ranges;
var TimeRange = class {
  constructor(start, end) {
    __privateAdd(this, _ranges, void 0);
    if (isArray(start)) {
      __privateSet(this, _ranges, start);
    } else if (!isUndefined(start) && !isUndefined(end)) {
      __privateSet(this, _ranges, [[start, end]]);
    } else {
      __privateSet(this, _ranges, []);
    }
  }
  get length() {
    return __privateGet(this, _ranges).length;
  }
  start(index) {
    throwIfEmpty(__privateGet(this, _ranges).length);
    throwIfOutOfRange("start", index, __privateGet(this, _ranges).length - 1);
    return __privateGet(this, _ranges)[index][0] ?? Infinity;
  }
  end(index) {
    throwIfEmpty(__privateGet(this, _ranges).length);
    throwIfOutOfRange("end", index, __privateGet(this, _ranges).length - 1);
    return __privateGet(this, _ranges)[index][1] ?? Infinity;
  }
};
_ranges = new WeakMap();
function getTimeRangesStart(range) {
  if (!range.length)
    return null;
  let min = range.start(0);
  for (let i = 1; i < range.length; i++) {
    const value = range.start(i);
    if (value < min)
      min = value;
  }
  return min;
}
function getTimeRangesEnd(range) {
  if (!range.length)
    return null;
  let max = range.end(0);
  for (let i = 1; i < range.length; i++) {
    const value = range.end(i);
    if (value > max)
      max = value;
  }
  return max;
}
function throwIfEmpty(length) {
  if (!length)
    throw new Error("`TimeRanges` object is empty.");
}
function throwIfOutOfRange(fnName, index, end) {
  if (!isNumber(index) || index < 0 || index > end) {
    throw new Error(
      `Failed to execute '${fnName}' on 'TimeRanges': The index provided (${index}) is non-numeric or out of bounds (0-${end}).`
    );
  }
}
function normalizeTimeIntervals(intervals) {
  if (intervals.length <= 1) {
    return intervals;
  }
  intervals.sort((a, b) => a[0] - b[0]);
  let normalized = [], current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (current[1] >= next[0] - 1) {
      current = [current[0], Math.max(current[1], next[1])];
    } else {
      normalized.push(current);
      current = next;
    }
  }
  normalized.push(current);
  return normalized;
}
function updateTimeIntervals(intervals, interval, value) {
  let start = interval[0], end = interval[1];
  if (value < start) {
    return [value, -1];
  } else if (value === start) {
    return interval;
  } else if (start === -1) {
    interval[0] = value;
    return interval;
  } else if (value > start) {
    interval[1] = value;
    if (end === -1)
      intervals.push(interval);
  }
  normalizeTimeIntervals(intervals);
  return interval;
}

export {
  TimeRange,
  getTimeRangesStart,
  getTimeRangesEnd,
  updateTimeIntervals
};
//# sourceMappingURL=chunk-QGQ7KI2J.js.map
