"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utilities {
    static _flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? this._flatten(toFlatten) : toFlatten);
        }, []);
    }
}
exports.default = Utilities;
//# sourceMappingURL=utilities.js.map