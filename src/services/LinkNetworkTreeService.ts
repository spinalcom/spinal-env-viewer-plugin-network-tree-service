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

import { SpinalGraphService, SpinalNodeRef, SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-env-viewer-graph-service';
import { DeviceProfileUtilities } from "../utilities/DeviceProfileUtilities";
import { IResultClassed } from "../data/IResult";
import { INodeRefObj } from "../data/INodeRefObj";
import { NETWORK_BIMOJECT_RELATION, AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION, ATTRIBUTE_CATEGORY } from '../data/constants';
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { LinkBmsDeviceService } from '..';
import { SpinalBmsDevice } from 'spinal-model-bmsnetwork';


export default abstract class LinkNetworkTreeService {


   public static async createMaps(automateBims: Array<INodeRefObj>, profilItems: Array<INodeRefObj>): Promise<Map<string, IResultClassed>> {

      let map = new Map();

      const promises = automateBims.map(async (el) => {
         return {
            key: el.id,
            values: await this._getFormatedValues(el, profilItems)
         }
      })

      const obj = await Promise.all(promises);
      for (const iterator of obj) {
         map.set(iterator.key, iterator.values);
      }

      return map;
   }

   public static linkNodes(resultMaps: Map<string, IResultClassed>, deviceProfilId: string): Promise<Array<boolean>> {
      const promises = [];
      resultMaps.forEach((value, key) => {
         promises.push(this.linkProfilToDevice(key, deviceProfilId, value.valids));
      });

      return Promise.all(promises)
   }

   public static async linkProfilToDevice(automateId: string, deviceProfilId: string, itemsValids: Array<{ automateItem: INodeRefObj, profileItem: INodeRefObj }>): Promise<boolean | Array<boolean>> {
      const profilLinked = await this.getProfilLinked(automateId);
      if (profilLinked) {
         // if(profilLinked === deviceProfilId) return;
         await this.unLinkDeviceToProfil(automateId, profilLinked);
      }

      return this._createRelationBetweenNodes(automateId, deviceProfilId, itemsValids);
   }

   public static async linkAutomateItemToProfilItem(automateItemId: string, profilItemId: string): Promise<boolean> {
      const children = await SpinalGraphService.getChildren(automateItemId, [OBJECT_TO_BACNET_ITEM_RELATION]);

      if (children.length > 0) {
         const itemLinkedId = children[0].id.get();
         if (itemLinkedId === profilItemId) return;
         await this.unLinkAutomateItemToProfilItem(automateItemId, itemLinkedId);
      }

      try {
         return SpinalGraphService.addChild(automateItemId, profilItemId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
      } catch (error) {

      }
   }

   public static async getProfilLinked(automateId: string): Promise<string> {
      const children = await SpinalGraphService.getChildren(automateId, [AUTOMATES_TO_PROFILE_RELATION])
      return children.length > 0 ? children[0].id.get() : undefined;
   }

   ////
   // supprimer un profil d'un automate

   public static async unLinkDeviceToProfil(automateId: string, argProfilId: string): Promise<boolean | Array<boolean>> {
      let profilId = argProfilId;
      if (typeof profilId === "undefined") {
         profilId = await this.getProfilLinked(automateId);
      }
      const itemsValids = await this._getAutomateItems(automateId);
      const promises = itemsValids.map(async (automateItem) => {
         return this.unLinkAutomateItemToProfilItem(automateItem.id);
      })

      return Promise.all(promises).then(async (result) => {
         await SpinalGraphService.removeChild(automateId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
         const bmsDevicesWithTheSameProfil = await this.getBmsDeviceWithTheSameProfil(automateId, argProfilId);
         const prom = bmsDevicesWithTheSameProfil.map(async device => {
            const contextId = this.getBmsDeviceContextId(device);
            return LinkBmsDeviceService.unLinkBmsDeviceToBimDevices(contextId, device.id.get(), automateId);
         })

         await Promise.all(prom);
         return true;
      })
   }

   public static async unLinkAutomateItemToProfilItem(automateItemId: string, profilItemId?: string): Promise<boolean | Array<boolean>> {
      if (typeof profilItemId !== "undefined") {
         return SpinalGraphService.removeChild(automateItemId, profilItemId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
      }

      const children = await SpinalGraphService.getChildren(automateItemId, [OBJECT_TO_BACNET_ITEM_RELATION]);
      return Promise.all(children.map(el => SpinalGraphService.removeChild(automateItemId, el.id.get(), OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)));
   }

   public static async getDeviceAndProfilData(automateId: string): Promise<IResultClassed> {

      const automateInfo = SpinalGraphService.getInfo(automateId)?.get() || {};
      const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo }

      const profilId = await this.getProfilLinked(automateId);

      const automateItems = await this._getAutomateItems(automateId);
      let profilItems = await DeviceProfileUtilities.getItemsList(profilId);



      // const promises = automateItems.map(el => SpinalGraphService.getChildren(el.id,[this.OBJECT_TO_BACNET_ITEM_RELATION]));

      return this._waitForEach(automateItems, profilItems, res).then((result) => {
         res.invalidProfileItems = result;
         return res
      })
   }

   ////////////////////////////////////////////////////////////////////////////////////
   //                              private                                           //
   ////////////////////////////////////////////////////////////////////////////////////



   public static _getFormatedValues(automateInfo: INodeRefObj, virtualAutomates: Array<INodeRefObj>): Promise<IResultClassed> {

      // const devicesModels = await (SpinalGraphService.getChildren(automateId,[NETWORK_BIMOJECT_RELATION]))

      return Promise.all([this._getAutomateItems(automateInfo.id), this._formatVirtualAutomates(virtualAutomates)]).then(([devices, items]) => {


         const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo }

         let remainingItems = JSON.parse(JSON.stringify(items))

         for (const device of devices) {
            let index;
            const found = remainingItems.find((el, i) => {
               if (el.namingConvention && el.namingConvention === device.namingConvention) {
                  index = i;
                  return true;
               }
               return false;
            });

            if (found) {
               remainingItems.splice(index, 1);
               res.valids.push({ automateItem: device, profileItem: found });
            } else {
               res.invalidAutomateItems.push(device)
            }
         }

         res.invalidProfileItems = remainingItems;

         return res;
      })


   }

   public static _getAutomateItems(automateId: string): Promise<Array<INodeRefObj>> {
      return SpinalGraphService.getChildren(automateId, [NETWORK_BIMOJECT_RELATION]).then((bimObjects) => {
         const promises = bimObjects.map(async el => {
            const temp = el.get()
            temp.namingConvention = await this._getNamingConvention(temp.id, ATTRIBUTE_CATEGORY);
            return temp;
         });

         return Promise.all(promises);
      })
   }

   public static _formatVirtualAutomates(profilItems: Array<INodeRefObj>): Promise<INodeRefObj[]> {
      const promises = profilItems.map(async temp => {
         temp.namingConvention = await this._getNamingConvention(temp.id, ATTRIBUTE_CATEGORY);
         return temp;
      })

      return Promise.all(promises);
   }

   public static async _getNamingConvention(nodeId: string, categoryName: string): Promise<string> {
      const realNode = SpinalGraphService.getRealNode(nodeId);
      if (realNode) {
         const attributes = await serviceDocumentation.getAttributesByCategory(realNode, categoryName);

         if (attributes && attributes.length > 0) {
            const attr = attributes.find(el => el.label.get() === "namingConvention");
            if (attr) return attr.value.get();
         }

      }

   }

   public static _createRelationBetweenNodes(automateId: string, deviceProfilId: string, itemsValids: Array<{ automateItem: INodeRefObj, profileItem: INodeRefObj }>): Promise<boolean | Array<boolean>> {
      const promises = itemsValids.map(({ automateItem, profileItem }) => {
         return this.linkAutomateItemToProfilItem(automateItem.id, profileItem.id);
      })

      return Promise.all(promises).then((result) => {
         return SpinalGraphService.addChild(automateId, deviceProfilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
      })
   }

   public static _waitForEach(automateItems: Array<INodeRefObj>, argProfilItems: Array<INodeRefObj>, res: IResultClassed) {

      let profilItems = argProfilItems

      const promises = automateItems.map(async (automateItem) => {

         const children = await SpinalGraphService.getChildren(automateItem.id, [OBJECT_TO_BACNET_ITEM_RELATION]);
         const child = children[0] && children[0].get();

         if (child) {
            res.valids.push({ automateItem, profileItem: child });

            profilItems = profilItems.filter(el => {

               if (el.id !== child.id) {
                  return true
               }
               return false;
            });

         } else {
            res.invalidAutomateItems.push(automateItem);
         }

         return true;
      })

      return Promise.all(promises).then(() => {
         return profilItems;
      })

   }

   public static async getBmsDeviceWithTheSameProfil(bimDeviceId: string, profilId: string): Promise<SpinalNodeRef[]> {
      const bmsDevices = await SpinalGraphService.getChildren(bimDeviceId, [SpinalBmsDevice.relationName]);
      return bmsDevices.filter(device => {
         const ids = SpinalGraphService.getChildrenIds(device.id.get());
         return ids.findIndex(id => id === profilId) !== -1;
      })
   }

   public static getBmsDeviceContextId(nodeRef: SpinalNodeRef): string {
      const contextIds = nodeRef.contextIds.values();
      return Array.from(contextIds).find(id => {
         const realNode = SpinalGraphService.getRealNode(id);
         return realNode.getType().get() === "Network";
      })
   }

}


export {
   LinkNetworkTreeService
}