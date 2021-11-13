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

import { SpinalGraphService, SpinalNodeRef, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { DEVICE_RELATION_NAME, PART_RELATION_NAME } from "spinal-env-viewer-plugin-device_profile/constants";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { ATTRIBUTE_CATEGORY } from "../data/constants";
import * as bacnet from "bacstack";
import * as _ from "lodash";
import { INodeRefObj } from "../data/INodeRefObj";

export default abstract class DeviceProfileUtilities {

   public static DEVICE_PROFILE_CONTEXT: string = "deviceProfileContext";
   public static ITEM_LIST_RELATION: string = "hasItemList";
   public static ITEM_LIST_TO_ITEMS_RELATION: string = "hasItem";

   public static INPUTS_RELATION: string = "hasInputs";
   public static INPUT_RELATION: string = "hasInput";

   public static OUTPUTS_RELATION: string = "hasOutputs";
   public static OUTPUT_RELATION: string = "hasOutput";

   public static PROFIL_TO_BACNET_RELATION: string = "hasBacnetValues";

   public static ANALOG_VALUE_RELATION: string = "hasAnalogValues";
   public static MULTISTATE_VALUE_RELATION: string = "hasMultiStateValues";
   public static BINARY_VALUE_RELATION: string = "hasBinaryValues";

   public static ITEMS_TO_SUPERVISION: string = "hasSupervisionNode";
   public static SUPERVISION_TO_MEASURES: string = "hasMeasures";
   public static MEASURE_TO_ITEMS: string = "hasMeasure";

   public static BACNET_VALUES_TYPE: string[] = ["networkValue", "binaryValue", "analogValue", "multiStateValue"];


   public static profilsMaps: Map<string, Map<string, INodeRefObj>> = new Map();


   public static getDevicesContexts(): INodeRefObj[] {
      const result = SpinalGraphService.getContextWithType(this.DEVICE_PROFILE_CONTEXT)
      return result.map(el => el.info.get())
   }

   public static getDeviceProfiles(contextId: string): Promise<INodeRefObj[]> {
      return SpinalGraphService.getChildren(contextId, [DEVICE_RELATION_NAME]).then((result) => {
         return result.map(el => el.get())
      }).catch((err) => {
         return []
      });
   }

   public static getDevices(profilId: string): Promise<INodeRefObj[]> {
      return SpinalGraphService.getChildren(profilId, [PART_RELATION_NAME]).then((result) => {
         return result.map(el => el.get())
      }).catch((err) => {
         return []
      });
   }

   public static getItemsList(deviceId: string): Promise<INodeRefObj[]> {
      return SpinalGraphService.getChildren(deviceId, [this.ITEM_LIST_RELATION]).then((itemList) => {
         const promises = itemList.map(el => SpinalGraphService.getChildren(el.id.get(), [this.ITEM_LIST_TO_ITEMS_RELATION]));
         return Promise.all(promises).then((items) => {
            return _.flattenDeep(items).map(el => el.get())
         })
      }).catch((err) => {
         return []
      });
   }

   public static getItemInputs(itemId: string): Promise<INodeRefObj[]> {
      return SpinalGraphService.getChildren(itemId, [this.INPUTS_RELATION]).then((children) => {
         const promises = children.map(el => SpinalGraphService.getChildren(el.id.get(), [this.INPUT_RELATION]));
         return Promise.all(promises).then((result) => {
            const flattedResult = _.flattenDeep(result);
            return flattedResult.map(el => el.get());
         })
      })
   }

   public static getItemOutputs(itemId: string): Promise<INodeRefObj[]> {
      return SpinalGraphService.getChildren(itemId, [this.OUTPUTS_RELATION]).then((children) => {
         const promises = children.map(el => SpinalGraphService.getChildren(el.id.get(), [this.OUTPUT_RELATION]));
         return Promise.all(promises).then((result) => {
            const flattedResult = _.flattenDeep(result);
            return flattedResult.map(el => el.get());
         })
      })
   }

   public static getDeviceContextTreeStructure(): Promise<INodeRefObj[]> {
      const contexts = this.getDevicesContexts()
      const promises = contexts.map(async el => {
         const profils = await this.getDeviceProfiles(el.id);

         const profilPromises = profils.map(async profil => {
            const devices = await this.getDevices(profil.id);

            const itemsPromises = devices.map(async device => {
               device['itemList'] = await this.getItemsList(device.id);
               return device;
            })

            profil['devices'] = await Promise.all(itemsPromises);
            return profil;
         })

         el['profils'] = await Promise.all(profilPromises);
         return el;
      })

      return Promise.all(promises);
   }

   public static getItemIO(nodeId: string): Promise<{ nodeId: string;[key: string]: any }[]> {
      const inputsPromises = this.getItemInputs(nodeId);
      const outputsPromises = this.getItemOutputs(nodeId);

      return Promise.all([inputsPromises, outputsPromises]).then((result) => {
         // console.log("[input, output]", result);

         const children = _.flattenDeep(result);

         const promises = children.map(async child => {
            const realNode = SpinalGraphService.getRealNode(child.id);

            const attributes = await serviceDocumentation.getAttributesByCategory(realNode, ATTRIBUTE_CATEGORY);
            // console.log("attributes", attributes)
            const obj = {
               nodeId: child.id
            };
            attributes.forEach(el => {
               obj[el.label.get()] = el.value.get();
            })

            return obj;
         })

         return Promise.all(promises);
      })
   }


   public static async getMeasures(nodeId: string): Promise<{ nodeId: string; typeId: string | number;[key: string]: any }[]> {
      const supervisions: SpinalNodeRef[] = await SpinalGraphService.getChildren(nodeId, [this.ITEMS_TO_SUPERVISION]);
      const measures: SpinalNodeRef[] = await SpinalGraphService.getChildren(supervisions[0]?.id?.get(), [this.SUPERVISION_TO_MEASURES]);
      const children: SpinalNodeRef[] = await SpinalGraphService.getChildren(measures[0]?.id?.get(), [this.MEASURE_TO_ITEMS]);

      const promises = children.map(async child => {
         const realNode = SpinalGraphService.getRealNode(child.id.get());

         const attributes = await serviceDocumentation.getAttributesByCategory(realNode, ATTRIBUTE_CATEGORY);
         // console.log("attributes", attributes)
         const obj = {
            nodeId: child.id.get(),
            typeId: this._getBacnetObjectType(child.type.get())
         };

         for (const el of attributes) {
            obj[el.label.get()] = el.value.get();
         }
         // attributes.forEach(el => {

         // })

         return obj;
      })

      return Promise.all(promises).then((res) => {
         return res;
         // return result.flat();
      })
   }

   public static async getProfilBacnetValues(profilId: string, profilContextId?: string): Promise<INodeRefObj[]> {
      if (typeof profilContextId === "undefined" || profilContextId.trim().length === 0) {
         profilContextId = this.getProfilContextId(profilId);
      }

      if (!profilContextId) return;

      const bacnetValues = await SpinalGraphService.findInContext(profilId, profilContextId, (node) => {
         if (this.BACNET_VALUES_TYPE.indexOf(node.getType().get()) !== -1) {
            (<any>SpinalGraphService)._addNode(node);
            return true;
         }
         return false;
      })

      return bacnetValues.map(el => {
         const info = el.get();
         info.typeId = this._getBacnetObjectType(el.type.get());
         return info;
      });
   }

   public static async getBacnetValuesMap(profilId: string): Promise<Map<string, INodeRefObj>> {

      // if (this.profilsMaps.get(profilId)) {
      //    return this.profilsMaps.get(profilId);
      // }

      const bimDeviceMap: Map<string, INodeRefObj> = new Map();

      const attrs = await this.getProfilBacnetValues(profilId);

      for (const attr of attrs) {
         bimDeviceMap.set(`${attr.typeId}_${(parseInt((<any>attr).IDX) + 1)}`, attr);
      }

      this.profilsMaps.set(profilId, bimDeviceMap);
      return bimDeviceMap;
   }

   public static _getBacnetObjectType(type): string | number {
      const objectName = ("object_" + type.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).toUpperCase();
      return bacnet.enum.ObjectTypes[objectName];
   }

   public static getProfilContextId(profilId: string): string {
      let realNode = SpinalGraphService.getRealNode(profilId);
      if (!realNode) return;
      const contextIds = realNode.getContextIds();
      return contextIds.find(id => {
         let info = SpinalGraphService.getInfo(id);
         return info && info.type.get() === this.DEVICE_PROFILE_CONTEXT;
      })
   }
}



export {
   DeviceProfileUtilities
}