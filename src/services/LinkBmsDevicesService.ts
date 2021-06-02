import { LinkNetworkTreeService } from "./LinkNetworkTreeService";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service"
import { SpinalBmsDevice, SpinalBmsEndpoint } from "spinal-model-bmsnetwork";
import { AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION, ATTRIBUTE_CATEGORY } from "../data/constants";
import { INodeInfoOBJ } from "../data/Interfaces";

import DeviceProfileUtilities from "../utilities/DeviceProfileUtilities";
import Utilities from "../utilities/utilities";


export default class LinkBmsDeviceService {


   public static async LinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void> {

      const profilId = await this._getBacnetProfilLinked(bimDeviceId);

      if (profilId) {
         await this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);

         const promises = [this.getEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId)];
         const res = await Promise.all(promises);

         const bmsDevicesMap: any = res[0];
         const bimDevicesMap: any = res[1];

         const promises2 = Array.from(bimDevicesMap.keys()).map(key => {
            const bmsElement = bmsDevicesMap.get(key);
            const value = bimDevicesMap.get(key);
            if (bmsElement && value) {
               return Promise.all([
                  SpinalGraphService.addChild(value.parentId, bmsElement.id, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE),
                  SpinalGraphService.addChild(bmsElement.id, value.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
               ])
            }
            return;
         })

         await Promise.all(promises2);
         await SpinalGraphService.addChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
         await SpinalGraphService.addChild(bimDeviceId, bmsDeviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
         return;

      } else {
         throw new Error(`${bimDeviceId} has no profil linked`);
      }
   }

   public static async unLinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void> {

      const profilId = await this._getBacnetProfilLinked(bimDeviceId);

      if (profilId) {
         const promises = [this.getEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId)];
         const res = await Promise.all(promises);

         const bmsDevicesMap: any = res[0];
         const bimDevicesMap: any = res[1];

         const promises2 = Array.from(bimDevicesMap.keys()).map(key => {
            const bmsElement = bmsDevicesMap.get(key);
            const value = bimDevicesMap.get(key);
            if (bmsElement && value) {
               return Promise.all([
                  SpinalGraphService.removeChild(value.parentId, bmsElement.id, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE),
                  SpinalGraphService.removeChild(bmsElement.id, value.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
               ])
            }
            return;
         })

         await Promise.all(promises2);
         await SpinalGraphService.removeChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
         await SpinalGraphService.removeChild(bimDeviceId, bmsDeviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);

         return;
      }
   }

   public static async linkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string, profilId: string): Promise<boolean> {
      const bimDeviceId = await this.bmsDevicehasBimDevice(bmsDeviceId);
      if (bimDeviceId) {
         await this.unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId);
      } else {
         await this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
      }

      const endpointMapPromise = this.getEndpointsMap(bmsContextId, bmsDeviceId);
      const profilMapPromise = DeviceProfileUtilities.getBacnetValuesMap(profilId);


      const res = await Promise.all([endpointMapPromise, profilMapPromise]);

      const bmsDevicesMap: any = res[0];
      const profilDeviceMap: any = res[1];

      const promises = Array.from(bmsDevicesMap.keys()).map(async key => {
         const bmsElement = bmsDevicesMap.get(key);
         const profilElement = profilDeviceMap.get(key);

         if (bmsElement && profilElement) {
            // console.log("inside if", bmsElement.name, profilElement.name);
            return SpinalGraphService.addChild(bmsElement.id, profilElement.id, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
         }
         return;
      })

      await Promise.all(promises);
      return SpinalGraphService.addChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
   }

   public static async unLinkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string): Promise<boolean> {
      const relations = SpinalGraphService.getRelationNames(bmsDeviceId);

      if (relations.indexOf(AUTOMATES_TO_PROFILE_RELATION) > -1) {
         return SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node): any => {
            if (node.hasRelation(OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
               return node.removeRelation(OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
            }
            return false;
         }).then(async () => {
            const node = SpinalGraphService.getRealNode(bmsDeviceId);
            if (node) {
               await node.removeRelation(AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
               return true;
            }
            return false;
         })
      }

      return false;
   }

   public static getEndpointsMap(bmsContextId: string, bmsDeviceId: string): Promise<Map<number, INodeInfoOBJ>> {
      const bmsDeviceMap = new Map();

      return SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node) => {
         if (node.getType().get() === SpinalBmsEndpoint.nodeTypeName) {
            (<any>SpinalGraphService)._addNode(node)
            bmsDeviceMap.set(node.info.idNetwork.get(), node.info.get());
            return true;
         }
         return false;
      }).then(() => {
         return bmsDeviceMap;
      })
   }

   public static _getBacnetProfilLinked(bimDeviceId: string): Promise<string> {
      return SpinalGraphService.getChildren(bimDeviceId, [AUTOMATES_TO_PROFILE_RELATION]).then((children) => {
         if (children.length > 0) return children[0].id.get()
      })
   }

   private static _getAutomateItems(automateId: string): Promise<Map<number, any>> {
      const bimDeviceMap = new Map();

      return LinkNetworkTreeService.getDeviceAndProfilData(automateId).then((result) => {
         const promises = result.valids.map(async ({ automateItem, profileItem }) => {
            const attrs = await DeviceProfileUtilities.getItemIO(profileItem.id);
            for (const attr of attrs) {
               (<any>attr).parentId = automateItem.id;
               bimDeviceMap.set((parseInt((<any>attr).IDX) + 1), attr);
            }
            return;
         })

         return Promise.all(promises).then((result) => {
            return bimDeviceMap;
         })

      })
   }

   private static async bmsDevicehasBimDevice(bmsDeviceId: string): Promise<string | void> {
      const children = await SpinalGraphService.getParents(bmsDeviceId, [SpinalBmsDevice.relationName])
      if (children.length > 0) children[0].id ? children[0].id.get() : undefined;
   }

}


export {
   LinkBmsDeviceService
}