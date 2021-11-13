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

import "spinal-env-viewer-plugin-forge";
import { SpinalContext, SpinalGraphService, SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-env-viewer-graph-service';
import { NETWORK_RELATION, CONTEXT_TYPE, NETWORK_TYPE, NETWORK_BIMOJECT_RELATION, AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION } from '../data/constants';
import { IResultClassed } from "../data/IResult";
import { INodeRefObj } from "../data/INodeRefObj";
import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";
import * as _ from "lodash";
import { Model } from "spinal-core-connectorjs_type";
import { IAggregateSelection } from "../data/IAggregateSelection";


// const spinalForgeViewer = new SpinalForgeViewer();
const g_win: any = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;

export default abstract class NetworkTreeService {

   public static createNetworkContext(name: string): Promise<SpinalContext<any>> {
      return SpinalGraphService.addContext(name, CONTEXT_TYPE);
   }

   public static addNetwork(name: string, parentId: string, contextId: string): Promise<SpinalNode<any>> {
      let network = SpinalGraphService.createNode({
         name,
         type: NETWORK_TYPE
      }, new Model())

      return SpinalGraphService.addChildInContext(parentId, network, contextId,
         NETWORK_RELATION,
         SPINAL_RELATION_PTR_LST_TYPE)

   }

   public static addBimObject(contextId: string, parentId: string, bimObjectList: IAggregateSelection[]): Promise<SpinalNode<any>[]> {

      const promises = [];

      for (let idx = 0; idx < bimObjectList.length; idx++) {
         const { model, selection } = bimObjectList[idx];


         model.getBulkProperties(selection, {
            propFilter: ['name']
         }, (el) => {

            el.forEach(element => {
               bimObjectService.createBIMObject(element.dbId, element.name, model).then(bimObject => {
                  let BimObjectId = bimObject.info ? bimObject.info.id.get() : bimObject.id.get();

                  promises.push(SpinalGraphService.addChildInContext(parentId, BimObjectId, contextId, NETWORK_BIMOJECT_RELATION, SPINAL_RELATION_PTR_LST_TYPE));
               })

            });
         });
      }

      return Promise.all(promises);
   }

   public static getBimObjectsLinked(nodeId: string): Promise<spinal.Model[]> {
      return SpinalGraphService.getChildren(nodeId, [NETWORK_BIMOJECT_RELATION]);
   }

   public static getNetworkTreeBimObjects(contextId: string): Promise<SpinalNode<any>[]> {
      return SpinalGraphService.findNodes(contextId, [NETWORK_RELATION, NETWORK_BIMOJECT_RELATION], (node) => {
         return node.getType().get() === BIM_OBJECT_TYPE;
      })
   }

   public static getNetworkGroups(bimObjectId: string): Promise<Array<INodeRefObj>> {
      let realNode = SpinalGraphService.getRealNode(bimObjectId);
      if (!realNode) return Promise.resolve([]);

      return realNode.getParents().then(parents => {
         parents = parents.filter(el => typeof el !== "undefined");
         let groups = parents.filter(el => {
            return el.getType().get() === NETWORK_TYPE;
         });

         return groups.map(el => el.info.get());
      })
   }

   public static getNetworkBimObjectParents(bimObjectId: string): Promise<Array<INodeRefObj>> {
      let realNode = SpinalGraphService.getRealNode(bimObjectId);
      if (!realNode) return Promise.resolve([]);

      return realNode.getParents([NETWORK_BIMOJECT_RELATION, NETWORK_RELATION]).then(argParents => {

         let promises = argParents.map(async el => {
            if (el && el.getType().get() === BIM_OBJECT_TYPE) return el.info.get();

            let p = await this.getNetworkBimObjectParents(el ? el.info.id.get() : "");

            return p;

         });

         return Promise.all(promises).then(parents => {
            return _.flattenDeep(parents).filter(el => typeof el !== "undefined");
         })
      });

   }

}

export {
   NetworkTreeService
}