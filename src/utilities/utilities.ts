
export default class Utilities {
   constructor() { }

   public static _flatten(arr: Array<any>): Array<any> {
      return arr.reduce((flat, toFlatten) => {
         return flat.concat(Array.isArray(toFlatten) ? this._flatten(toFlatten) : toFlatten);
      }, []);
   }
}


export {
   Utilities
}