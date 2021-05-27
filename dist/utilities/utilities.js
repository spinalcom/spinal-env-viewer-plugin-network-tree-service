"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
class Utilities {
    constructor() { }
    static _flatten(arr) {
        return arr.reduce((flat, toFlatten) => {
            return flat.concat(Array.isArray(toFlatten) ? this._flatten(toFlatten) : toFlatten);
        }, []);
    }
}
exports.default = Utilities;
exports.Utilities = Utilities;
//# sourceMappingURL=utilities.js.map