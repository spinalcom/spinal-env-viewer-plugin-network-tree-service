
export default class Utilities {
   public static _flatten(arr: Array<any>): Array<any> {
      return arr.reduce(function (flat, toFlatten) {
         return flat.concat(Array.isArray(toFlatten) ? this._flatten(toFlatten) : toFlatten);
      }, []);
   }
}
