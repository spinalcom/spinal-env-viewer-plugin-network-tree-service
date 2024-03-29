/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import { LinkNetworkTreeService } from "./LinkNetworkTreeService";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service"
import { SpinalBmsDevice, SpinalBmsEndpoint } from "spinal-model-bmsnetwork";

import { AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION, ATTRIBUTE_CATEGORY } from "../data/constants";
import { INodeRefObj } from "../data/INodeRefObj";

import DeviceProfileUtilities from "../utilities/DeviceProfileUtilities";
import { IBmsConfig, IBimDeviceConfig, IAttribute } from "../data/IBmsConfig";
import AttributesUtilities from "../utilities/AttributesUtilities";

export default abstract class LinkBmsDeviceService {


   public static async LinkBmsDeviceToBimDevicesUsingAttribute(bmsDeviceOpt: IBmsConfig, bimDeviceOpt: IBimDeviceConfig) {
      const [bmsDeviceMap, bimDevicesMap] = await Promise.all([
         this.getBmsEndpointsMap(bmsDeviceOpt.contextId, bmsDeviceOpt.deviceId, bmsDeviceOpt.attribute),
         this.getBimAutomateMap(bimDeviceOpt.nodeId, bimDeviceOpt.model, bimDeviceOpt.attribute)
      ])

      const bimObj = { key: "id", map: bimDevicesMap };
      const bmsObj = { key: "id", map: bmsDeviceMap };

      return this._linkTwoMaps(bimObj, bmsObj, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
         try {
            return SpinalGraphService.addChild(bimDeviceOpt.nodeId, bmsDeviceOpt.deviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
         } catch (error) { return false }
      }).catch((err) => {
         return false
      });

   }

   public static async LinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void> {
      try {
         const bimProfilId = await this.getBacnetProfilLinked(bimDeviceId);
         const bmsProfilId = await this.getBacnetProfilLinked(bmsDeviceId);

         const profilId = bimProfilId || bmsProfilId;

         if (profilId) {
            if (bmsProfilId && (profilId !== bmsProfilId)) {
               await this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
               await this.linkProfilToBmsDevice(bmsContextId, bmsDeviceId, profilId);
            }

            const [bmsDevicesMap, bimDevicesMap] = await Promise.all([this.getBmsEndpointsMap(bmsContextId, bmsDeviceId), LinkNetworkTreeService._getAutomateItemsMap(bimDeviceId)]);;
            // console.log("bmsDevicesMap", bmsDevicesMap);
            // console.log("bimDevicesMap", bimDevicesMap);

            const bimObj = { key: "parentId", map: bimDevicesMap };
            const bmsObj = { key: "id", map: bmsDevicesMap };



            return this._linkTwoMaps(bimObj, bmsObj, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE).then(async () => {
               // await SpinalGraphService.addChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
               try {
                  await SpinalGraphService.addChild(bimDeviceId, bmsDeviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
               } catch (error) { }
            })
         } else {
            throw new Error("Node profil linked to bim object and bms object");
         }
      } catch (error) {
         throw error;
      }
   }

   public static async unLinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string, argProfilId?: string, bimDeviceMap?: Map<number, any>): Promise<void> {

      const profilId = argProfilId || await this.getBacnetProfilLinked(bimDeviceId);

      if (profilId) {
         const bmsDeviceMapProm = this.getBmsEndpointsMap(bmsContextId, bmsDeviceId);
         const bimDeviceMapProm = bimDeviceMap ? Promise.resolve(bimDeviceMap) : LinkNetworkTreeService._getAutomateItemsMap(bimDeviceId);

         const [bmsDevicesMap, bimDevicesMap] = await Promise.all([bmsDeviceMapProm, bimDeviceMapProm]);

         // console.log("unLinkBmsDeviceToBimDevices", bmsDevicesMap, bimDevicesMap);


         this._unLinkTwoMaps(bimDevicesMap, bmsDevicesMap, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE).then(async () => {
            // await SpinalGraphService.removeChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
            try {
               await SpinalGraphService.removeChild(bimDeviceId, bmsDeviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
            } catch (error) { }
         }).catch((err) => {

         });
      }
   }

   public static async linkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string, profilId: string): Promise<boolean> {
      const bimDeviceId = await this.bmsDevicehasBimDevice(bmsDeviceId);

      // if (bimDeviceId) {
      //    await this.unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId);
      // } else {
      await this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
      // }

      const endpointMapPromise = this.getBmsEndpointsMap(bmsContextId, bmsDeviceId);
      const profilMapPromise = DeviceProfileUtilities.getBacnetValuesMap(profilId);


      const [bmsDevicesMap, profilDeviceMap] = await Promise.all([endpointMapPromise, profilMapPromise]);

      // // const bmsDevicesMap: any = res[0];
      // // const profilDeviceMap: any = res[1];

      // const promises = Array.from(bmsDevicesMap.keys()).map(async key => {
      //    const bmsElement = bmsDevicesMap.get(key);
      //    const profilElement = profilDeviceMap.get(key);

      //    if (bmsElement && profilElement) {
      //       // console.log("inside if", bmsElement.name, profilElement.name);
      //       try {
      //          return SpinalGraphService.addChild(bmsElement.id, profilElement.id, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
      //       } catch (error) { }
      //    }
      //    return;
      // })
      const bmsObj = { key: "id", map: bmsDevicesMap };
      const profilObj = { key: "id", map: profilDeviceMap };

      return this._linkTwoMaps(bmsObj, profilObj, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
         try {
            return SpinalGraphService.addChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
         } catch (error) { return false }
      }).catch((err) => {
         return false
      });

   }


   public static async unLinkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string): Promise<boolean> {
      // const relations = SpinalGraphService.getRelationNames(bmsDeviceId);
      const bmsRealNode = SpinalGraphService.getRealNode(bmsDeviceId);

      if (bmsRealNode.hasRelation(AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
         return SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node): any => {
            if (node.hasRelation(OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
               return node.removeRelation(OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
            }
            return false;
         }).then(async () => {
            // if (node) {
            await bmsRealNode.removeRelation(AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
            return true;
            // }
            // return false;
         })
      }

      return false;
   }

   public static getBmsEndpointsMap(bmsContextId: string, bmsDeviceId: string, attribute?: string | IAttribute): Promise<Map<number, INodeRefObj>> {
      const bmsDeviceMap = new Map();
      const context = SpinalGraphService.getRealNode(bmsContextId);
      const device = SpinalGraphService.getRealNode(bmsDeviceId);
      if (!context || !device) return Promise.resolve(bmsDeviceMap);

      return device.findInContextAsyncPredicate(context, async (node) => {
         if (node.getType().get() === SpinalBmsEndpoint.nodeTypeName) {
            //@ts-ignore
            SpinalGraphService._addNode(node)
            let key;

            if (!attribute) {
               // bmsDeviceMap.set(`${node.info.typeId.get()}_${node.info.idNetwork.get()}`, node.info.get());
               key = `${node.info.typeId.get()}_${node.info.idNetwork.get()}`;
            } else {
               const attr = await AttributesUtilities.findSpinalAttributeById(node.getId().get(), attribute);
               key = attr?.displayValue;
            }

            if (key) {
               let value = bmsDeviceMap.get(key) || [];
               value.push(node.info.get());
               bmsDeviceMap.set(key, value);
            }

            return true;
         }
         return false;
      }).then(() => {
         return bmsDeviceMap;
      })
   }


   public static async getBimAutomateMap(automateId: string, model: any, attribute: string | IAttribute) {
      const automates = await LinkNetworkTreeService._getAutomateItems(automateId);
      const map = new Map();

      await automates.reduce(async (prom: Promise<INodeRefObj[]>, item: INodeRefObj) => {
         const liste = await prom;
         const attr = await AttributesUtilities.findAttribute(model, item.dbid, attribute, item.id);
         if (attr) {
            const value = map.get(attr.displayValue) || [];
            value.push(item);
            map.set(attr.displayValue, value);
         }
         return liste;
      }, Promise.resolve([]))

      return map;
   }


   private static async bmsDevicehasBimDevice(bmsDeviceId: string): Promise<string | void> {
      const children = await SpinalGraphService.getParents(bmsDeviceId, [SpinalBmsDevice.relationName])
      if (children.length > 0) children[0].id ? children[0].id.get() : undefined;
   }

   public static getBacnetProfilLinked(nodeId: string): Promise<string> {
      return SpinalGraphService.getChildren(nodeId, [AUTOMATES_TO_PROFILE_RELATION]).then((children) => {
         if (children.length > 0) return children[0].id.get()
      })
   }

   // private static _getAutomateItems(automateId: string): Promise<Map<number, any>> {
   //    const bimDeviceMap = new Map();

   //    return LinkNetworkTreeService.getDeviceAndProfilData(automateId).then((result) => {

   //       const promises = result.valids.map(async ({ automateItem, profileItem }) => {
   //          const attrs = await DeviceProfileUtilities.getMeasures(profileItem.id);
   //          for (const attr of attrs) {
   //             (<any>attr).parentId = automateItem.id;
   //             bimDeviceMap.set(`${attr.typeId}_${(parseInt((<any>attr).IDX) + 1)}`, attr);
   //          }
   //          return;
   //       })

   //       return Promise.all(promises).then(() => {
   //          return bimDeviceMap;
   //       })

   //    })
   // }

   private static _linkTwoMaps(map1: { key: string, map: Map<number | string, any> }, map2: { key: string, map: Map<number | string, any> }, relationName: string, relationType: string, linkFirstToSecond: boolean = true): Promise<boolean[]> {
      const first = linkFirstToSecond ? map1 : map2;
      const second = linkFirstToSecond ? map2 : map1;

      const keys = Array.from(first.map.keys());

      const promises = keys.map(key => {
         let firstElement = first.map.get(key);
         let secondElement = second.map.get(key);

         if (firstElement && secondElement) {
            if (!Array.isArray(firstElement)) firstElement = [firstElement];
            if (!Array.isArray(secondElement)) secondElement = [secondElement];

            const ids = secondElement.map(el => el[second.key]);

            return firstElement.reduce(async (liste, item) => {
               await this._createOrRemoveRelation(item[first.key], ids, relationName, relationType, true);
               return liste;
            }, Promise.resolve([]))
            // try {
            //    // return Promise.all([
            //    return SpinalGraphService.addChild(firstElement[first.key], secondElement[second.key], relationName, relationType)
            //    // SpinalGraphService.addChild(bmsElement.id, bimElement.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
            //    // ])
            // } catch (error) {

            // }
         }
      })

      return Promise.all(promises);
   }

   private static _unLinkTwoMaps(map1: Map<number | string, any>, map2: Map<number | string, any>, relationName: string, relationType: string, linkFirstToSecond: boolean = true): Promise<boolean[]> {
      const firstMap = linkFirstToSecond ? map1 : map2;
      const secondMap = linkFirstToSecond ? map2 : map1;

      const keys = Array.from(firstMap.keys());

      const promises = keys.map(key => {
         let firstElement = firstMap.get(key);
         let secondElement = secondMap.get(key);

         if (firstElement && secondElement) {
            if (!Array.isArray(firstElement)) firstElement = [firstElement];
            if (!Array.isArray(secondElement)) secondElement = [secondElement];

            const ids = secondElement.map(el => el.id);

            return firstElement.reduce(async (liste, item) => {
               await this._createOrRemoveRelation(item.parentId, ids, relationName, relationType, false);
               return liste;
            }, Promise.resolve([]))
            // try {
            //    // return Promise.all([
            //    return SpinalGraphService.addChild(firstElement[first.key], secondElement[second.key], relationName, relationType)
            //    // SpinalGraphService.addChild(bmsElement.id, bimElement.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
            //    // ])
            // } catch (error) {

            // }
         }
      })

      return Promise.all(promises);
   }


   private static _createOrRemoveRelation(parentId: string, childIds: string | string[], relationName: string, relationType: string, create: boolean) {

      if (!Array.isArray(childIds)) childIds = [childIds];

      const promises = childIds.map(el => {
         try {
            if (create) return SpinalGraphService.addChild(parentId, el, relationName, relationType);
            return SpinalGraphService.removeChild(parentId, el, relationName, relationType)
         } catch (error) {

         }
      })

   }
}


export {
   LinkBmsDeviceService
}