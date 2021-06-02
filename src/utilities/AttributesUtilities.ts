import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import Utilities from "./utilities";

const g_win: any = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;

export default class AttributesUtilities {
   constructor() { }

   public static async getRevitAttributes(items: { model: any; selection: Number[] } | Array<{ model: any; selection: Number[] }>): Promise<Array<{ model: any; properties: { [key: string]: any } }>> {
      const data = await bimObjectManagerService.getBimObjectProperties(items);

      return Utilities._flatten(data.map(el => {
         return el.properties;
      }))
   }

   public static async getSpinalAttributes(nodeId: string): Promise<Array<{ [key: string]: any; attributes: Array<{ label: string; value: any }> }>> {
      const realNode = SpinalGraphService.getRealNode(nodeId);
      if (typeof realNode === "undefined") throw new Error("realnode not found");

      const categories = await serviceDocumentation.getCategory(realNode);
      const promises = categories.map(async category => {
         const catInfo = category.node.info.get();
         catInfo.attributes = [];

         const attributes = await category.node.getElement();
         for (let index = 0; index < attributes.length; index++) {
            const element = attributes[index];
            catInfo.attributes.push(element.get());
         }

         return catInfo;
      })

      return Promise.all(promises);
   }

   public static async findRevitAttribute(model: any, dbid: number, attributeName: string): Promise<{ categoryName: string; displayName: string; attributeName: string; displayValue: string; }> {
      const attributes = await this.getRevitAttributes({ model, selection: [dbid] });

      const properties = attributes[0].properties;
      return properties.find(obj => {
         return (obj.displayName.toLowerCase() === attributeName.toLowerCase() || obj.attributeName.toLowerCase() === attributeName.toLowerCase()) && obj.displayValue.toLowerCase() && (obj.displayValue + "").length > 0;
      })
   }

   public static async findSpinalAttribute(model: any, dbid: number, attributeName: string): Promise<{ categoryName: string; categoryId: string; displayName: string; attributeName: string; displayValue: string; }> {
      const bimNode = await bimObjectService.getBIMObject(dbid, model);
      if (typeof bimNode === "undefined") return;

      const nodeId = bimNode.id.get();
      const attributes = await this.getSpinalAttributes(nodeId);

      for (const obj of attributes) {
         const found = obj.attributes.find(el => el.label.toLowerCase() === attributeName.toLowerCase());
         if (found) {
            return {
               categoryName: obj.name,
               categoryId: obj.id,
               displayName: found.label,
               attributeName: found.label,
               displayValue: found.value
            };
         }
      }

   }

   public static async findSpinalAttributeById(nodeId: string, attributeName: string): Promise<{ categoryName: string; categoryId: string; displayName: string; attributeName: string; displayValue: string; }> {
      const bimNode = SpinalGraphService.getInfo(nodeId);
      if (typeof bimNode === "undefined") return;

      // const nodeId = bimNode.id.get();
      const attributes = await this.getSpinalAttributes(nodeId);

      for (const obj of attributes) {
         const found = obj.attributes.find(el => el.label.toLowerCase() === attributeName.toLowerCase());
         if (found) {
            return {
               categoryName: obj.name,
               categoryId: obj.id,
               displayName: found.label,
               attributeName: found.label,
               displayValue: found.value
            };
         }
      }
   }

   public static async findAttribute(model: any, dbid: number, attributeName: string) {
      let attribute = await this.findSpinalAttribute(model, dbid, attributeName);

      if (attribute) return attribute;

      return this.findRevitAttribute(model, dbid, attributeName);
   }

}

export {
   AttributesUtilities
}