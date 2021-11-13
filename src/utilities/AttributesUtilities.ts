/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */



import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { IAggregateSelection } from "../data/IAggregateSelection";
import { IForgeProperty } from "../data/IForgeProperty";

import * as _ from "lodash";

const g_win: any = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;


export default abstract class AttributesUtilities {

   public static async getRevitAttributes(items: IAggregateSelection | IAggregateSelection[]): Promise<Array<{ model: any; properties: { [key: string]: any } }>> {
      const data = await bimObjectManagerService.getBimObjectProperties(items);

      return _.flattenDeep(data.map(el => {
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

   public static async findRevitAttribute(model: any, dbid: number, attributeName: string): Promise<IForgeProperty> {
      const attributes = await this.getRevitAttributes({ model, selection: [dbid] });

      const properties = attributes[0].properties;
      return properties.find(obj => {
         return (obj.displayName.toLowerCase() === attributeName.toLowerCase() || obj.attributeName.toLowerCase() === attributeName.toLowerCase()) && obj.displayValue.toLowerCase() && (obj.displayValue + "").length > 0;
      })
   }

   public static async findSpinalAttribute(model: any, dbid: number, attributeName: string): Promise<IForgeProperty> {
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

   public static async findSpinalAttributeById(nodeId: string, attributeName: string): Promise<IForgeProperty> {
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

   public static async findAttribute(model: any, dbid: number, attributeName: string): Promise<IForgeProperty> {
      let attribute = await this.findSpinalAttribute(model, dbid, attributeName);

      if (attribute) return attribute;

      return this.findRevitAttribute(model, dbid, attributeName);
   }

}

export {
   AttributesUtilities
}