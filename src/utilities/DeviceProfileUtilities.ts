import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { DEVICE_RELATION_NAME, PART_RELATION_NAME } from "spinal-env-viewer-plugin-device_profile/constants";
import Utilities from "../utilities/utilities";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { ATTRIBUTE_CATEGORY } from "../data/constants";

export default class DeviceProfileUtilities {

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

   public static BACNET_VALUES_TYPE: string[] = ["networkValue", "binaryValue", "analogValue", "multiStateValue"];


   public static getDevicesContexts(): Array<{ name: string; type: string; id: string }> {
      const result = SpinalGraphService.getContextWithType(this.DEVICE_PROFILE_CONTEXT)
      return result.map(el => el.info.get())
   }

   public static getDeviceProfiles(contextId: string): Promise<Array<{ name: string; type: string; id: string }>> {
      return SpinalGraphService.getChildren(contextId, [DEVICE_RELATION_NAME]).then((result) => {
         return result.map(el => el.get())
      }).catch((err) => {
         return []
      });
   }

   public static getDevices(profilId: string): Promise<Array<{ name: string; type: string; id: string }>> {
      return SpinalGraphService.getChildren(profilId, [PART_RELATION_NAME]).then((result) => {
         return result.map(el => el.get())
      }).catch((err) => {
         return []
      });
   }

   public static getItemsList(deviceId: string): Promise<Array<{ name: string; type: string; id: string }>> {
      return SpinalGraphService.getChildren(deviceId, [this.ITEM_LIST_RELATION]).then((itemList) => {
         const promises = itemList.map(el => SpinalGraphService.getChildren(el.id.get(), [this.ITEM_LIST_TO_ITEMS_RELATION]));
         return Promise.all(promises).then((items) => {
            return Utilities._flatten(items).map(el => el.get())
         })
      }).catch((err) => {
         return []
      });
   }

   public static getItemInputs(itemId: string): Promise<Array<{ name: string; type: string; id: string }>> {
      return SpinalGraphService.getChildren(itemId, [this.INPUTS_RELATION]).then((children) => {
         const promises = children.map(el => SpinalGraphService.getChildren(el.id.get(), [this.INPUT_RELATION]));
         return Promise.all(promises).then((result) => {
            const flattedResult = Utilities._flatten(result);
            return flattedResult.map(el => el.get());
         })
      })
   }

   public static getItemOutputs(itemId: string): Promise<Array<{ name: string; type: string; id: string }>> {
      return SpinalGraphService.getChildren(itemId, [this.OUTPUTS_RELATION]).then((children) => {
         const promises = children.map(el => SpinalGraphService.getChildren(el.id.get(), [this.OUTPUT_RELATION]));
         return Promise.all(promises).then((result) => {
            const flattedResult = Utilities._flatten(result);
            return flattedResult.map(el => el.get());
         })
      })
   }

   public static getDeviceContextTreeStructure(): Promise<Array<{ name: string; type: string; id: string }>> {
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

   public static getItemIO(nodeId: string): Promise<any> {
      const inputsPromises = this.getItemInputs(nodeId);
      const outputsPromises = this.getItemOutputs(nodeId);

      console.log(inputsPromises, outputsPromises);


      return Promise.all([inputsPromises, outputsPromises]).then((result) => {
         // console.log("[input, output]", result);

         const children = Utilities._flatten(result);

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

         return Promise.all(promises).then((res) => {
            return res;
            // return result.flat();
         })
      })
   }


   public static async getProfilBacnetValues(profilId: string, profilContextId?: string) {
      if (typeof profilContextId === "undefined" || profilContextId.trim().length === 0) {
         let realNode = SpinalGraphService.getRealNode(profilId);
         if (!realNode) return;
         const contextIds = realNode.getContextIds();
         profilContextId = contextIds.find(id => {
            let info = SpinalGraphService.getInfo(id);
            return info && info.type.get() === this.DEVICE_PROFILE_CONTEXT;
         })
      }

      if (!profilContextId) return;

      const bacnetValues = await SpinalGraphService.findInContext(profilId, profilContextId, (node) => {
         if (this.BACNET_VALUES_TYPE.indexOf(node.getType().get()) !== -1) {
            (<any>SpinalGraphService)._addNode(node);
            return true;
         }
         return false;
      })

      return bacnetValues.map(el => el.get());
   }

   public static async getBacnetValuesMap(profilId: string): Promise<Map<number, any>> {
      const bimDeviceMap: Map<number, any> = new Map();

      const attrs = await this.getProfilBacnetValues(profilId);

      for (const attr of attrs) {
         bimDeviceMap.set((parseInt((<any>attr).IDX) + 1), attr);
      }

      return bimDeviceMap;
   }
}



export {
   DeviceProfileUtilities
}