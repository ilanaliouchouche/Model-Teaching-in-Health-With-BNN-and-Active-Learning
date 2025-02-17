import {
  VTTBlock,
  VTTCue,
  VTTParser
} from "./chunk-LQQENT2U.js";
import "./chunk-Q6BFB6C2.js";

// node_modules/media-captions/dist/dev/srt-parser.js
var MILLISECOND_SEP_RE = /,/g;
var TIMESTAMP_SEP = "-->";
var SRTParser = class extends VTTParser {
  parse(line, lineCount) {
    var _a, _b;
    if (line === "") {
      if (this._cue) {
        this._cues.push(this._cue);
        (_b = (_a = this._init).onCue) == null ? void 0 : _b.call(_a, this._cue);
        this._cue = null;
      }
      this._block = VTTBlock.None;
    } else if (this._block === VTTBlock.Cue) {
      this._cue.text += (this._cue.text ? "\n" : "") + line;
    } else if (line.includes(TIMESTAMP_SEP)) {
      const result = this._parseTimestamp(line, lineCount);
      if (result) {
        this._cue = new VTTCue(result[0], result[1], result[2].join(" "));
        this._cue.id = this._prevLine;
        this._block = VTTBlock.Cue;
      }
    }
    this._prevLine = line;
  }
  _parseTimestamp(line, lineCount) {
    return super._parseTimestamp(line.replace(MILLISECOND_SEP_RE, "."), lineCount);
  }
};
function createSRTParser() {
  return new SRTParser();
}
export {
  SRTParser,
  createSRTParser as default
};
//# sourceMappingURL=srt-parser-YKI2U6GH.js.map
