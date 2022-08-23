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
import { DEVICE_RELATION_NAME, PART_RELATION_NAME } from "../data/device_profile_constants";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { ATTRIBUTE_CATEGORY } from "../data/constants";
import * as bacnet from "bacstack";
import * as _ from "lodash";
import { INodeRefObj } from "../data/INodeRefObj";

export default abstract class DeviceProfileUtilities {

   public static DEVICE_PROFILE_CONTEXT_NAME: string = "deviceProfileContext";
   public static CONTEXT_TO_ITEM_LIST_RELATION: string = "hasItemList";
   public static ITEM_LIST_TO_ITEMS_RELATION: string = "hasItem";

   public static INPUTS_RELATION: string = "hasInputs";
   public static INPUT_RELATION: string = "hasInput";
   public static OUTPUTS_RELATION: string = "hasOutputs";
   public static OUTPUT_RELATION: string = "hasOutput";

   public static GLOBAL_BACNET_VALUES_TYPE: string = "bacnetValues";
   public static PROFIL_TO_BACNET_VALUES_RELATION: string = "hasBacnetValues";

   public static GLOBAL_SUPERVISION_TYPE: string = "globalDeviceSupervison";
   public static PROFIL_TO_GLOBAL_SUPERVISION_RELATION: string = "hasGlobalSupervision";
   public static GLOBAL_MEASURES_RELATION: string = "hasGlobalMeasures";
   public static GLOBAL_ALARMS_RELATION: string = "hasGlobalAlarms";
   public static GLOBAL_COMMANDS_RELATION: string = "hasGlobalCommands";


   public static MULTISTATE_VALUE_RELATION: string = "hasMultiStateValues";
   public static ANALOG_VALUE_RELATION: string = "hasAnalogValues";
   public static BINARY_VALUE_RELATION: string = "hasBinaryValues";

   public static ITEMS_TO_SUPERVISION: string = "hasSupervisionNode";
   public static SUPERVISION_TO_MEASURES: string = "hasMeasures";
   public static MEASURE_TO_ITEMS: string = "hasMeasure";

   public static BACNET_VALUES_TYPES: string[] = ["networkValue", "binaryValue", "analogValue", "multiStateValue"];

   public static SUPERVISION_INTERVAL_TIME_TYPE: string = "supervisionIntervalTime";

   public static profilsMaps: Map<string, Map<string, INodeRefObj>> = new Map();


   public static getDevicesContexts(): INodeRefObj[] {
      const result = SpinalGraphService.getContextWithType(this.DEVICE_PROFILE_CONTEXT_NAME)
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
      return SpinalGraphService.getChildren(deviceId, [this.CONTEXT_TO_ITEM_LIST_RELATION]).then((itemList) => {
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


   public static async getGlobalBacnetValuesNode(profilId: string): Promise<SpinalNodeRef> {
      return SpinalGraphService.getChildren(profilId, [this.PROFIL_TO_BACNET_VALUES_RELATION]).then((result) => {
         return result[0]
      })
   }

   public static async getProfilBacnetValues(profilId: string, profilContextId?: string): Promise<INodeRefObj[]> {
      if (typeof profilContextId === "undefined" || profilContextId.trim().length === 0) {
         profilContextId = this.getProfilContextId(profilId);
      }

      const bacnetValuesNodeRef = await this.getGlobalBacnetValuesNode(profilId);

      if (!profilContextId) return;

      const startId = bacnetValuesNodeRef?.id.get() || profilId;
      const bacnetValues = await SpinalGraphService.findInContext(startId, profilContextId, (node) => {
         if (this.BACNET_VALUES_TYPES.indexOf(node.getType().get()) !== -1) {
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

      if (this.profilsMaps.get(profilId)) {
         return this.profilsMaps.get(profilId);
      }

      const bimDeviceMap: Map<string, INodeRefObj> = new Map();

      const attrs = await this.getProfilBacnetValues(profilId);

      for (const attr of attrs) {
         bimDeviceMap.set(`${attr.typeId}_${(parseInt((<any>attr).IDX) + 1)}`, attr);
      }

      this.profilsMaps.set(profilId, bimDeviceMap);
      return bimDeviceMap;
   }

   public static async getGlobalSupervisionNode(profilId: string): Promise<SpinalNodeRef> {
      return SpinalGraphService.getChildren(profilId, [this.PROFIL_TO_GLOBAL_SUPERVISION_RELATION]).then((result) => {
         return result[0]
      })
   }

   public static async getIntervalNodes(profilId: string, contexId?: string): Promise<SpinalNodeRef[]> {
      if (!contexId) contexId = this.getProfilContextId(profilId);
      const supervisionNode = await this.getGlobalSupervisionNode(profilId);

      if (!supervisionNode) return;

      return SpinalGraphService.findInContext(supervisionNode.id.get(), contexId, (node) => {
         if (node.getType().get() === this.SUPERVISION_INTERVAL_TIME_TYPE) {
            //@ts-ignore
            SpinalGraphService._addNode(node);
            return true;
         }
         return false;
      })
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
         return info && info.type.get() === this.DEVICE_PROFILE_CONTEXT_NAME;
      })
   }



   public static async getGlobalMeasureNode(profileId: string): Promise<SpinalNodeRef> {
      const supervision = await this.getGlobalSupervisionNode(profileId);

      if (!supervision) return;

      const measures = await SpinalGraphService.getChildren(supervision.id.get(), [this.GLOBAL_MEASURES_RELATION]);

      return measures[0];
   }

   public static async getGlobalAlarmNode(profileId: string): Promise<SpinalNodeRef> {
      const supervision = await this.getGlobalSupervisionNode(profileId);
      if (!supervision) return;

      const alarms = await SpinalGraphService.getChildren(supervision.id.get(), [this.GLOBAL_ALARMS_RELATION]);
      return alarms[0];
   }

   public static async getGlobalCommandNode(profileId: string): Promise<SpinalNodeRef> {
      const supervision = await this.getGlobalSupervisionNode(profileId);
      if (!supervision) return;

      const commands = await SpinalGraphService.getChildren(supervision.id.get(), [this.GLOBAL_COMMANDS_RELATION]);
      return commands[0];
   }




   public static async getMeasuresDetails(profileId: string) {
      const node = await this.getGlobalMeasureNode(profileId);
      if (!node) return {};

      return this._getNodeIntervalDetails(node.id.get());
   }

   public static async getAlarmsDetails(profileId: string) {
      const node = await this.getGlobalAlarmNode(profileId);
      if (!node) return {};

      return this._getNodeIntervalDetails(node.id.get());
   }

   public static async getCommandsDetails(profileId: string): Promise<{}>{
      const node = await this.getGlobalMeasureNode(profileId);
      if (!node) return {};

      return {}
   }

   public static async getGlobalSupervisionDetails(profileId: string): Promise<{measures: any; alarms: any; commands: any}> {
      return {
         measures: await this.getMeasuresDetails(profileId),
         alarms: await this.getAlarmsDetails(profileId),
         commands: await this.getCommandsDetails(profileId)
      }
   }



   ////////////////////////////////////////////////////////
   //                            PRIVATES                //
   ////////////////////////////////////////////////////////

   private static async _getNodeIntervalDetails(nodeId: string): Promise<any[] | {
      monitoring: any;
      children: any[];
   }[]> {
      const intervalsNodes = await this._getNodeIntervals(nodeId);
      const promises = intervalsNodes.map(async (el) => {
         return {
            monitoring: await this._getSharedAttribute(el),
            children: await this._getEndpointsObjectIds(el),
         };
      });

      return Promise.all(promises)
         .then((result) => {
            return result;
         })
         .catch((err) => {
            console.error(err);
            return [];
         });
   }

   private static _getNodeIntervals(nodeId: string): Promise<SpinalNodeRef[]> {
      return SpinalGraphService.getChildren(nodeId, [])
   }

   private static async _getSharedAttribute(intervalNode: SpinalNodeRef) {
      const realNode = SpinalGraphService.getRealNode(intervalNode.id.get());
      const attrs = await serviceDocumentation.getAttributesByCategory(realNode, "Supervision");

      const obj = {};
      for (let i = 0; i < attrs.length; i++) {
         const element = attrs[i];
         obj[element.label.get()] = element.value.get();
      }

      return obj;
   }

   private static async _getEndpointsObjectIds(intervalNode: SpinalNodeRef) {
      const nodeId = intervalNode.id.get();
      const profilItems = await SpinalGraphService.getChildren(nodeId, ["hasIntervalTime"]);

      const promises = profilItems.map(async (profilItem) => {
         return {
            instance: await this._getIDX(profilItem.id.get()),
            type: this._getBacnetObjectType(profilItem.type.get()),
         };
      });

      return Promise.all(promises).then((result) => {
         return _.flattenDeep(result);
      });
   }

   private static async _getIDX(nodeId: string): Promise<number> {
      const realNode = SpinalGraphService.getRealNode(nodeId);
      const attrs = await serviceDocumentation.getAttributesByCategory(realNode, "default");

      const found: any = attrs.find((attr) => attr.label.get() === "IDX");
      if (found) return parseInt(found.value.get()) + 1;
   }

}



export {
   DeviceProfileUtilities
}